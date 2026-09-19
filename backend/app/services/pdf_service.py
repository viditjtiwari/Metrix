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
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
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


class PDFService:
    """Service generating official legal metrology verification certificates with embedded QR codes."""

    def __init__(self) -> None:
        self.storage_dir = Path(settings.CERTIFICATE_STORAGE_DIR)
        self.storage_dir.mkdir(parents=True, exist_ok=True)

    def _generate_qr_image(self, verification_url: str) -> io.BytesIO:
        """Generate high-contrast QR code image stream for the verification URL."""
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_M,
            box_size=4,
            border=2,
        )
        qr.add_data(verification_url)
        qr.make(fit=True)
        img = qr.make_image(fill_color="#0f172a", back_color="#ffffff")
        qr_buffer = io.BytesIO()
        img.save(qr_buffer, format="PNG")
        qr_buffer.seek(0)
        return qr_buffer

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
    ) -> str:
        """Generate PDF certificate, write to disk, and return file path."""
        file_path = self.storage_dir / f"{certificate_number}.pdf"
        verification_url = f"{settings.PUBLIC_VERIFICATION_BASE_URL}/{verification_token}"

        buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=letter,
            rightMargin=36,
            leftMargin=36,
            topMargin=36,
            bottomMargin=36,
        )

        styles = getSampleStyleSheet()
        title_style = ParagraphStyle(
            "CertTitle",
            parent=styles["Normal"],
            fontName="Helvetica-Bold",
            fontSize=16,
            leading=20,
            textColor=colors.HexColor("#065f46"),
            alignment=1,
        )
        subtitle_style = ParagraphStyle(
            "CertSubtitle",
            parent=styles["Normal"],
            fontName="Helvetica",
            fontSize=10,
            leading=14,
            textColor=colors.HexColor("#334155"),
            alignment=1,
        )
        section_heading = ParagraphStyle(
            "SectionHeading",
            parent=styles["Normal"],
            fontName="Helvetica-Bold",
            fontSize=11,
            leading=14,
            textColor=colors.HexColor("#0f172a"),
        )
        body_style = ParagraphStyle(
            "CertBody",
            parent=styles["Normal"],
            fontName="Helvetica",
            fontSize=9,
            leading=13,
            textColor=colors.HexColor("#1e293b"),
        )
        bold_label = ParagraphStyle(
            "CertLabel",
            parent=styles["Normal"],
            fontName="Helvetica-Bold",
            fontSize=9,
            leading=13,
            textColor=colors.HexColor("#334155"),
        )
        hash_style = ParagraphStyle(
            "CertHash",
            parent=styles["Normal"],
            fontName="Courier",
            fontSize=7,
            leading=9,
            textColor=colors.HexColor("#475569"),
            alignment=1,
        )

        elements = []

        # 1. Header Banner
        elements.append(Paragraph("GOVERNMENT LEGAL METROLOGY DEPARTMENT", title_style))
        elements.append(Paragraph("DIGITAL VERIFICATION CERTIFICATE", subtitle_style))
        elements.append(
            Paragraph(
                "Issued under the Legal Metrology Act and Standard Verification Rules (SIH26036)",
                subtitle_style,
            )
        )
        elements.append(Spacer(1, 10))
        elements.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor("#059669")))
        elements.append(Spacer(1, 10))

        # 2. Certificate Meta & QR Code Box
        qr_stream = self._generate_qr_image(verification_url)
        qr_img = Image(qr_stream, width=100, height=100)

        meta_table_data = [
            [
                Paragraph("<b>Certificate Number:</b>", bold_label),
                Paragraph(f"<font color='#065f46'><b>{certificate_number}</b></font>", body_style),
                qr_img,
            ],
            [
                Paragraph("<b>Application Number:</b>", bold_label),
                Paragraph(application_number, body_style),
                "",
            ],
            [
                Paragraph("<b>Issue Date:</b>", bold_label),
                Paragraph(issued_at, body_style),
                "",
            ],
            [
                Paragraph("<b>Validity Period:</b>", bold_label),
                Paragraph(f"{valid_from} to <b>{valid_until}</b>", body_style),
                "",
            ],
            [
                Paragraph("<b>Status:</b>", bold_label),
                Paragraph("<font color='#059669'><b>VERIFIED & ACTIVE</b></font>", body_style),
                "",
            ],
        ]

        meta_table = Table(
            meta_table_data,
            colWidths=[140, 260, 140],
            style=[
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("SPAN", (2, 0), (2, 4)),
                ("ALIGN", (2, 0), (2, 4), "CENTER"),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
                ("TOPPADDING", (0, 0), (-1, -1), 4),
            ],
        )
        elements.append(meta_table)
        elements.append(Spacer(1, 12))
        elements.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#cbd5e1")))
        elements.append(Spacer(1, 10))

        # 3. Instrument Particulars Table
        elements.append(Paragraph("1. INSTRUMENT PARTICULARS", section_heading))
        elements.append(Spacer(1, 6))

        inst_data = [
            [
                Paragraph("Registration Number", bold_label),
                Paragraph(instrument_registration_number, body_style),
                Paragraph("Instrument Type", bold_label),
                Paragraph(instrument_type, body_style),
            ],
            [
                Paragraph("Manufacturer", bold_label),
                Paragraph(manufacturer, body_style),
                Paragraph("Model", bold_label),
                Paragraph(model_name, body_style),
            ],
            [
                Paragraph("Serial Number", bold_label),
                Paragraph(serial_number, body_style),
                Paragraph("Capacity / Range", bold_label),
                Paragraph(capacity or "N/A", body_style),
            ],
            [
                Paragraph("Owner / Enterprise", bold_label),
                Paragraph(owner_name, body_style),
                Paragraph("Verified Location", bold_label),
                Paragraph(location, body_style),
            ],
        ]

        inst_table = Table(
            inst_data,
            colWidths=[130, 140, 130, 140],
            style=[
                ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#f8fafc")),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
                ("TOPPADDING", (0, 0), (-1, -1), 5),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ],
        )
        elements.append(inst_table)
        elements.append(Spacer(1, 14))

        # 4. Statutory Certification Statement
        elements.append(Paragraph("2. STATUTORY CERTIFICATION", section_heading))
        elements.append(Spacer(1, 6))
        statement = (
            "This is to certify that the weighing / measuring instrument described above has been "
            "duly inspected, tested, and verified by an authorized Legal Metrology Verifier. "
            "The instrument conforms to the maximum permissible errors and statutory specifications "
            "prescribed under the Legal Metrology Rules. It is stamped/certified fit for commercial "
            "use through the validity expiration date."
        )
        elements.append(Paragraph(statement, body_style))
        elements.append(Spacer(1, 14))

        # 5. Anti-Tamper Integrity Block
        elements.append(Paragraph("3. DIGITAL INTEGRITY & AUTHENTICITY", section_heading))
        elements.append(Spacer(1, 6))
        elements.append(
            Paragraph(
                "Scan the QR code or verify online at the official portal to confirm authenticity. "
                "Any alteration invalidates this digital certificate.",
                body_style,
            )
        )
        elements.append(Spacer(1, 4))
        elements.append(Paragraph(f"<b>SHA-256 Integrity Digest:</b>", bold_label))
        elements.append(Paragraph(integrity_hash, hash_style))
        elements.append(Spacer(1, 10))
        elements.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#cbd5e1")))
        elements.append(Spacer(1, 6))
        elements.append(
            Paragraph(
                "METRIX Digital Verification System • Tamper-Evident Legal Metrology Registry",
                ParagraphStyle(
                    "Footer",
                    parent=styles["Normal"],
                    fontName="Helvetica-Oblique",
                    fontSize=8,
                    textColor=colors.HexColor("#94a3b8"),
                    alignment=1,
                ),
            )
        )

        doc.build(elements)
        pdf_bytes = buffer.getvalue()

        # Write to storage
        with open(file_path, "wb") as f:
            f.write(pdf_bytes)

        return str(file_path)

    def get_pdf_bytes(self, pdf_path: str) -> bytes:
        """Read certificate PDF bytes from storage."""
        path = Path(pdf_path)
        if not path.exists():
            raise FileNotFoundError(f"Certificate PDF file not found at {pdf_path}")
        with open(path, "rb") as f:
            return f.read()


pdf_service = PDFService()
