import hashlib
import io
import os
from pathlib import Path

# Python 3.8 compatibility shim for reportlab md5(usedforsecurity=False)
try:
    hashlib.md5(usedforsecurity=False)
except TypeError:
    _orig_md5 = hashlib.md5

    def _safe_md5(*args, **kwargs):
        kwargs.pop("usedforsecurity", None)
        return _orig_md5(*args, **kwargs)

    hashlib.md5 = _safe_md5

import qrcode
import reportlab.pdfbase.pdfdoc as _pdfdoc
_pdfdoc.md5 = hashlib.md5
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm, cm
from reportlab.platypus import (
    HRFlowable,
    Image,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)
from app.core.config import settings
from app.services.pdf_styles import (
    DARK_BLUE,
    GOLD_ACCENT,
    GOLD_LIGHT,
    GOV_GREEN,
    GREEN_ACCENT,
    NAVY,
    SLATE_100,
    SLATE_300,
    SLATE_50,
    SLATE_500,
    SLATE_700,
    WHITE,
    build_certificate_styles,
)


class PDFService:
    """Service generating official legal metrology verification certificates
    with embedded QR codes following government document standards."""

    def __init__(self) -> None:
        self.storage_dir = Path(settings.CERTIFICATE_STORAGE_DIR)
        self.storage_dir.mkdir(parents=True, exist_ok=True)

    def _generate_qr_image(self, verification_url: str) -> io.BytesIO:
        """Generate high-contrast QR code image stream for the verification URL."""
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_H,
            box_size=5,
            border=2,
        )
        qr.add_data(verification_url)
        qr.make(fit=True)
        img = qr.make_image(fill_color="#0c1d3f", back_color="#ffffff")
        qr_buffer = io.BytesIO()
        img.save(qr_buffer, format="PNG")
        qr_buffer.seek(0)
        return qr_buffer

    def _build_styles(self):
        """Build all paragraph styles for the certificate."""
        return build_certificate_styles()

    def generate_certificate_pdf(
        self,
        *,
        certificate_number: str,
        application_number: str,
        instrument_registration_number: str,
        instrument_type: str,
        manufacturer: str,
        model_name: str,
        serial_number: str,
        capacity: str,
        location: str,
        owner_name: str,
        issued_at: str,
        valid_from: str,
        valid_until: str,
        integrity_hash: str,
        verification_token: str,
        inspecting_officer_name: str = "Legal Metrology Officer",
        issuing_officer_name: str = "Authorized Officer",
    ) -> str:
        """Generate PDF certificate, write to disk, and return file path."""
        file_path = self.storage_dir / f"{certificate_number}.pdf"
        verification_url = f"{settings.PUBLIC_VERIFICATION_BASE_URL}/{verification_token}"

        buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=A4,
            rightMargin=25 * mm,
            leftMargin=25 * mm,
            topMargin=20 * mm,
            bottomMargin=20 * mm,
        )

        s = self._build_styles()
        elements = []

        # ═══════════════════════════════════════════════
        # 1. GOVERNMENT HEADER BLOCK
        # ═══════════════════════════════════════════════
        elements.append(Paragraph(
            "भारत सरकार / GOVERNMENT OF INDIA", s["gov_header"]
        ))
        elements.append(Paragraph(
            "Ministry of Consumer Affairs, Food & Public Distribution", s["gov_header"]
        ))
        elements.append(Paragraph(
            "Department of Consumer Affairs — Legal Metrology Division", s["cert_subtitle"]
        ))
        elements.append(Spacer(1, 4 * mm))

        # Gold decorative double line
        elements.append(HRFlowable(
            width="100%", thickness=2, color=GOLD_ACCENT, spaceAfter=1
        ))
        elements.append(HRFlowable(
            width="100%", thickness=0.5, color=GOLD_ACCENT, spaceAfter=2 * mm
        ))

        # Certificate Title
        elements.append(Paragraph(
            "CERTIFICATE OF VERIFICATION", s["cert_title"]
        ))
        elements.append(Paragraph(
            "(Under Section 24, Legal Metrology Act, 2009 &amp; "
            "Standards of Weights &amp; Measures Rules)",
            s["cert_subtitle"],
        ))
        elements.append(Spacer(1, 2 * mm))

        # Gold decorative double line
        elements.append(HRFlowable(
            width="100%", thickness=0.5, color=GOLD_ACCENT, spaceAfter=1
        ))
        elements.append(HRFlowable(
            width="100%", thickness=2, color=GOLD_ACCENT, spaceAfter=3 * mm
        ))

        # ═══════════════════════════════════════════════
        # 2. CERTIFICATE META & QR CODE
        # ═══════════════════════════════════════════════
        qr_stream = self._generate_qr_image(verification_url)
        qr_img = Image(qr_stream, width=28 * mm, height=28 * mm)

        meta_rows = [
            [
                Paragraph("Certificate No.", s["label"]),
                Paragraph(f"<b>{certificate_number}</b>", s["value_bold"]),
                qr_img,
            ],
            [
                Paragraph("Application No.", s["label"]),
                Paragraph(application_number, s["value"]),
                "",
            ],
            [
                Paragraph("Date of Issue", s["label"]),
                Paragraph(issued_at, s["value"]),
                "",
            ],
            [
                Paragraph("Validity Period", s["label"]),
                Paragraph(f"{valid_from}  to  <b>{valid_until}</b>", s["value"]),
                "",
            ],
            [
                Paragraph("Status", s["label"]),
                Paragraph(
                    "<font color='#059669'><b>VERIFIED & ACTIVE</b></font>",
                    s["value"],
                ),
                "",
            ],
        ]

        page_w = A4[0] - 50 * mm  # usable width
        meta_table = Table(
            meta_rows,
            colWidths=[page_w * 0.22, page_w * 0.48, page_w * 0.30],
            style=[
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("SPAN", (2, 0), (2, 4)),
                ("ALIGN", (2, 0), (2, 4), "CENTER"),
                ("VALIGN", (2, 0), (2, 4), "MIDDLE"),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
                ("TOPPADDING", (0, 0), (-1, -1), 3),
            ],
        )
        elements.append(meta_table)
        elements.append(Spacer(1, 3 * mm))
        elements.append(HRFlowable(width="100%", thickness=0.5, color=SLATE_300))
        elements.append(Spacer(1, 3 * mm))

        # ═══════════════════════════════════════════════
        # 3. INSTRUMENT PARTICULARS
        # ═══════════════════════════════════════════════
        elements.append(Paragraph(
            "SECTION 1 — INSTRUMENT PARTICULARS", s["section_heading"]
        ))

        inst_data = [
            [
                Paragraph("Registration Number", s["label"]),
                Paragraph(f"<b>{instrument_registration_number}</b>", s["value"]),
                Paragraph("Instrument Category", s["label"]),
                Paragraph(instrument_type.replace("_", " ").title(), s["value"]),
            ],
            [
                Paragraph("Manufacturer", s["label"]),
                Paragraph(manufacturer, s["value"]),
                Paragraph("Model", s["label"]),
                Paragraph(model_name, s["value"]),
            ],
            [
                Paragraph("Serial Number", s["label"]),
                Paragraph(serial_number, s["value"]),
                Paragraph("Capacity / Range", s["label"]),
                Paragraph(capacity or "N/A", s["value"]),
            ],
            [
                Paragraph("Owner / Enterprise", s["label"]),
                Paragraph(f"<b>{owner_name}</b>", s["value"]),
                Paragraph("Verified Location", s["label"]),
                Paragraph(location, s["value"]),
            ],
        ]

        col_w = page_w / 4
        inst_table = Table(
            inst_data,
            colWidths=[col_w] * 4,
            style=[
                ("BACKGROUND", (0, 0), (0, -1), SLATE_50),
                ("BACKGROUND", (2, 0), (2, -1), SLATE_50),
                ("GRID", (0, 0), (-1, -1), 0.5, SLATE_300),
                ("TOPPADDING", (0, 0), (-1, -1), 5),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
                ("LEFTPADDING", (0, 0), (-1, -1), 6),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ],
        )
        elements.append(inst_table)
        elements.append(Spacer(1, 4 * mm))

        # ═══════════════════════════════════════════════
        # 4. STATUTORY CERTIFICATION STATEMENT
        # ═══════════════════════════════════════════════
        elements.append(Paragraph(
            "SECTION 2 — STATUTORY CERTIFICATION", s["section_heading"]
        ))
        statement = (
            "This is to certify that the weighing/measuring instrument described above "
            "has been duly inspected, tested, and verified by an authorized Legal Metrology "
            "Officer/Government Approved Test Centre in accordance with the Legal Metrology "
            "Act, 2009 and rules framed thereunder. The instrument conforms to the maximum "
            "permissible errors prescribed under the applicable Indian Standards and is "
            "hereby stamped/certified fit for commercial use through the validity "
            "expiration date stated above."
        )
        elements.append(Paragraph(statement, s["body"]))
        elements.append(Spacer(1, 4 * mm))

        # ═══════════════════════════════════════════════
        # 5. AUTHORITY SIGNATURES
        # ═══════════════════════════════════════════════
        elements.append(Paragraph(
            "SECTION 3 — AUTHORIZED SIGNATURES", s["section_heading"]
        ))

        sig_data = [
            [
                Paragraph(
                    f"<b>Inspected By</b><br/>"
                    f"<b>{inspecting_officer_name}</b><br/>"
                    "Legal Metrology Officer / GATC<br/>"
                    "<font color='#64748b' size='7'>Authorized under LM Act, 2009</font>",
                    s["value"],
                ),
                Paragraph(
                    f"<b>Certificate Issued By</b><br/>"
                    f"<b>{issuing_officer_name}</b><br/>"
                    "Legal Metrology Division<br/>"
                    "<font color='#64748b' size='7'>Department of Consumer Affairs</font>",
                    s["value"],
                ),
            ],
        ]
        sig_table = Table(
            sig_data,
            colWidths=[page_w * 0.5, page_w * 0.5],
            style=[
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("TOPPADDING", (0, 0), (-1, -1), 16),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
                ("LINEABOVE", (0, 0), (0, 0), 0.5, NAVY),
                ("LINEABOVE", (1, 0), (1, 0), 0.5, NAVY),
                ("LEFTPADDING", (0, 0), (-1, -1), 8),
            ],
        )
        elements.append(sig_table)
        elements.append(Spacer(1, 4 * mm))
        elements.append(HRFlowable(width="100%", thickness=0.5, color=SLATE_300))
        elements.append(Spacer(1, 3 * mm))

        # ═══════════════════════════════════════════════
        # 6. DIGITAL INTEGRITY & QR VERIFICATION
        # ═══════════════════════════════════════════════
        elements.append(Paragraph(
            "SECTION 4 — DIGITAL INTEGRITY & AUTHENTICITY", s["section_heading"]
        ))
        elements.append(Paragraph(
            "Scan the QR code above or visit the METRIX portal to verify this "
            "certificate online. Any alteration to this document will invalidate the "
            "integrity hash below.",
            s["body"],
        ))
        elements.append(Spacer(1, 2 * mm))

        # Hash box with background
        hash_box_data = [
            [
                Paragraph("<b>SHA-256 Tamper-Evident Integrity Digest</b>", s["label"]),
            ],
            [
                Paragraph(integrity_hash, s["hash"]),
            ],
            [
                Paragraph(
                    f"Verify online: {verification_url}",
                    s["hash"],
                ),
            ],
        ]
        hash_table = Table(
            hash_box_data,
            colWidths=[page_w],
            style=[
                ("BACKGROUND", (0, 0), (-1, -1), SLATE_50),
                ("BOX", (0, 0), (-1, -1), 0.5, SLATE_300),
                ("TOPPADDING", (0, 0), (-1, -1), 4),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
                ("LEFTPADDING", (0, 0), (-1, -1), 8),
                ("ALIGN", (0, 0), (-1, -1), "CENTER"),
            ],
        )
        elements.append(hash_table)
        elements.append(Spacer(1, 5 * mm))

        # ═══════════════════════════════════════════════
        # 7. FOOTER
        # ═══════════════════════════════════════════════
        elements.append(HRFlowable(
            width="100%", thickness=0.5, color=GOLD_ACCENT, spaceAfter=1
        ))
        elements.append(HRFlowable(
            width="100%", thickness=2, color=GOLD_ACCENT, spaceAfter=2 * mm
        ))
        elements.append(Paragraph(
            "This is a computer-generated digital certificate. "
            "No physical signature is required.",
            s["disclaimer"],
        ))
        elements.append(Paragraph(
            "<b>Penalty for non-compliance:</b> Up to ₹10,000 "
            "(Section 30, Legal Metrology Act, 2009).",
            s["disclaimer"],
        ))
        elements.append(Paragraph(
            "METRIX — Online Verification System for Weighing &amp; "
            "Measuring Instruments (SIH26036)",
            s["footer"],
        ))

        doc.build(
            elements,
            onFirstPage=self._draw_watermark,
            onLaterPages=self._draw_watermark,
        )
        pdf_bytes = buffer.getvalue()

        # Write to storage
        with open(file_path, "wb") as f:
            f.write(pdf_bytes)

        return str(file_path)

    @staticmethod
    def _draw_watermark(canvas, doc) -> None:
        """Draw an official, subtle semi-transparent anti-copy watermark diagonally across the page."""
        canvas.saveState()
        canvas.setFont("Helvetica-Bold", 34)
        canvas.setFillColor(colors.HexColor("#0c1d3f"), alpha=0.045)
        canvas.translate(A4[0] / 2.0, A4[1] / 2.0)
        canvas.rotate(45)
        canvas.drawCentredString(0, 35, "LEGAL METROLOGY DIGITAL CERTIFICATE")
        canvas.setFont("Helvetica", 17)
        canvas.setFillColor(colors.HexColor("#0c1d3f"), alpha=0.04)
        canvas.drawCentredString(0, 0, "GOVERNMENT OF INDIA • STATUTORY VERIFICATION")
        canvas.setFont("Helvetica-Bold", 11)
        canvas.setFillColor(colors.HexColor("#b45309"), alpha=0.05)
        canvas.drawCentredString(0, -30, "OFFICIAL DIGITAL COPY • SECURED WITH SHA-256")
        canvas.restoreState()

    def get_pdf_bytes(self, pdf_path: str) -> bytes:
        """Read certificate PDF bytes from storage."""
        path = Path(pdf_path)
        if not path.exists():
            raise FileNotFoundError(f"Certificate PDF file not found at {pdf_path}")
        with open(path, "rb") as f:
            return f.read()


pdf_service = PDFService()
