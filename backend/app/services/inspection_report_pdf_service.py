"""Government-standard Inspection Report PDF generator.

Generates a multi-page A4 PDF following the Legal Metrology (General)
Rules, 2011 format with physical checklist, metrological test table,
seal details, inspector declaration, and QR code.
"""
import io
import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional

import qrcode
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
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
from app.services.inspection_report_styles import (
    DARK_BLUE,
    FAIL_BG,
    GOLD,
    NAVY,
    PASS_BG,
    SLATE_50,
    SLATE_100,
    SLATE_300,
    SLATE_500,
    SLATE_700,
    TABLE_STYLE,
    WHITE,
    _TABLE_STYLE,
    _build_styles,
    _parse_json_safe,
    _pass_fail_cell,
    _yes_no,
    build_styles,
    parse_json_safe,
    pass_fail_cell,
    yes_no,
)


class InspectionReportPDFService:
    """Generates government-standard inspection report PDFs."""

    def __init__(self) -> None:
        self.storage_dir = (
            Path(settings.CERTIFICATE_STORAGE_DIR).parent / "inspection_reports"
        )
        self.storage_dir.mkdir(parents=True, exist_ok=True)

    def _generate_qr(self, data: str) -> io.BytesIO:
        """Generate QR code image for report verification."""
        qr = qrcode.QRCode(
            version=1, error_correction=qrcode.constants.ERROR_CORRECT_M,
            box_size=4, border=2,
        )
        qr.add_data(data)
        qr.make(fit=True)
        img = qr.make_image(fill_color="#0c1d3f", back_color="#ffffff")
        buf = io.BytesIO()
        img.save(buf, format="PNG")
        buf.seek(0)
        return buf

    def generate_report_pdf(
        self,
        *,
        application_number: str,
        instrument_registration_number: str,
        instrument_type: str,
        manufacturer: str,
        model_name: str,
        serial_number: str,
        capacity: str,
        division: str,
        manufacturing_year: Optional[int],
        location: str,
        owner_name: str,
        owner_business: str,
        owner_address: str,
        inspection_date: str,
        inspection_mode: str,
        inspector_name: str,
        inspector_designation: str,
        physical_inspection_data: Optional[str],
        metrological_test_data: Optional[str],
        observations: List[Dict[str, Any]],
        overall_result: str,
        seal_number: Optional[str],
        stamp_quarter: Optional[str],
        result_remarks: Optional[str],
        issuing_officer_name: Optional[str] = None,
    ) -> bytes:
        """Generate a complete inspection report PDF and return bytes."""
        s = _build_styles()
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            buffer, pagesize=A4,
            rightMargin=20 * mm, leftMargin=20 * mm,
            topMargin=18 * mm, bottomMargin=18 * mm,
        )
        elements = []
        page_w = A4[0] - 40 * mm

        # ═══════════════════════════════════════
        # 1. GOVERNMENT HEADER
        # ═══════════════════════════════════════
        elements.append(Paragraph(
            "भारत सरकार / GOVERNMENT OF INDIA", s["gov_header"]
        ))
        elements.append(Paragraph(
            "DEPARTMENT OF LEGAL METROLOGY", s["gov_header"]
        ))
        elements.append(Spacer(1, 2 * mm))
        elements.append(HRFlowable(
            width="100%", thickness=1.5, color=GOLD, spaceAfter=1
        ))
        elements.append(HRFlowable(
            width="100%", thickness=0.5, color=GOLD, spaceAfter=2 * mm
        ))
        elements.append(Paragraph(
            "INSPECTION REPORT", s["report_title"]
        ))
        elements.append(Paragraph(
            "(Under Section 24, Legal Metrology Act, 2009 &amp; "
            "Legal Metrology (General) Rules, 2011)",
            s["subtitle"],
        ))
        elements.append(Spacer(1, 2 * mm))
        elements.append(HRFlowable(
            width="100%", thickness=0.5, color=GOLD, spaceAfter=1
        ))
        elements.append(HRFlowable(
            width="100%", thickness=1.5, color=GOLD, spaceAfter=3 * mm
        ))

        # ═══════════════════════════════════════
        # 2. REPORT META + QR
        # ═══════════════════════════════════════
        qr_url = (
            f"{settings.PUBLIC_VERIFICATION_BASE_URL}"
            f"/inspection/{application_number}"
        )
        qr_stream = self._generate_qr(qr_url)
        qr_img = Image(qr_stream, width=22 * mm, height=22 * mm)

        meta_rows = [
            [Paragraph("Application ID", s["label"]),
             Paragraph(f"<b>{application_number}</b>", s["value_bold"]),
             qr_img],
            [Paragraph("Inspection Date", s["label"]),
             Paragraph(inspection_date, s["value"]), ""],
            [Paragraph("Inspection Type", s["label"]),
             Paragraph(inspection_mode.replace("_", " ").title(), s["value"]),
             ""],
            [Paragraph("Overall Result", s["label"]),
             Paragraph(
                 f"<b>{overall_result}</b>",
                 s["pass"] if overall_result == "VERIFIED" else s["fail"]
             ), ""],
        ]
        meta_tbl = Table(
            meta_rows,
            colWidths=[page_w * 0.22, page_w * 0.48, page_w * 0.30],
            style=[
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("SPAN", (2, 0), (2, 3)),
                ("ALIGN", (2, 0), (2, 3), "CENTER"),
                ("VALIGN", (2, 0), (2, 3), "MIDDLE"),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
            ],
        )
        elements.append(meta_tbl)
        elements.append(Spacer(1, 3 * mm))
        elements.append(HRFlowable(
            width="100%", thickness=0.5, color=SLATE_300
        ))
        elements.append(Spacer(1, 3 * mm))

        # ═══════════════════════════════════════
        # 3. INSTRUMENT DETAILS
        # ═══════════════════════════════════════
        elements.append(Paragraph(
            "SECTION 1 — INSTRUMENT DETAILS", s["section"]
        ))
        col_w = page_w / 4
        inst_rows = [
            [Paragraph("Registration No.", s["label"]),
             Paragraph(
                 f"<b>{instrument_registration_number}</b>", s["value"]
             ),
             Paragraph("Type", s["label"]),
             Paragraph(
                 instrument_type.replace("_", " ").title(), s["value"]
             )],
            [Paragraph("Manufacturer", s["label"]),
             Paragraph(manufacturer, s["value"]),
             Paragraph("Model", s["label"]),
             Paragraph(model_name, s["value"])],
            [Paragraph("Serial Number", s["label"]),
             Paragraph(serial_number, s["value"]),
             Paragraph("Capacity / Division", s["label"]),
             Paragraph(f"{capacity} / {division}", s["value"])],
            [Paragraph("Mfg. Year", s["label"]),
             Paragraph(str(manufacturing_year or "N/A"), s["value"]),
             Paragraph("Location", s["label"]),
             Paragraph(location, s["value"])],
        ]
        elements.append(Table(
            inst_rows, colWidths=[col_w] * 4, style=_TABLE_STYLE
        ))
        elements.append(Spacer(1, 3 * mm))

        # ═══════════════════════════════════════
        # 4. OWNER DETAILS
        # ═══════════════════════════════════════
        elements.append(Paragraph(
            "SECTION 2 — OWNER DETAILS", s["section"]
        ))
        owner_rows = [
            [Paragraph("Owner Name", s["label"]),
             Paragraph(owner_name, s["value"]),
             Paragraph("Business Name", s["label"]),
             Paragraph(owner_business, s["value"])],
            [Paragraph("Address", s["label"]),
             Paragraph(owner_address, s["value"]), "", ""],
        ]
        elements.append(Table(
            owner_rows, colWidths=[col_w] * 4, style=_TABLE_STYLE
        ))
        elements.append(Spacer(1, 3 * mm))

        # ═══════════════════════════════════════
        # 5. PHYSICAL INSPECTION CHECKLIST
        # ═══════════════════════════════════════
        elements.append(Paragraph(
            "SECTION 3 — PHYSICAL INSPECTION CHECKLIST", s["section"]
        ))
        phys = _parse_json_safe(physical_inspection_data)
        checklist_items = [
            ("Manufacturer's Seal Intact", phys.get("seal_intact")),
            ("Display Readability", phys.get("display_readable")),
            ("Leveling (Platform Scales)", phys.get("leveling_ok")),
            ("Power Supply Stability", phys.get("power_stable")),
            ("Overall Condition", phys.get("overall_condition", "N/A")),
        ]
        phys_rows = [
            [Paragraph("<b>Check Item</b>", s["value_bold"]),
             Paragraph("<b>Status</b>", s["value_bold"]),
             Paragraph("<b>Remarks</b>", s["value_bold"])],
        ]
        for item_name, item_val in checklist_items:
            phys_rows.append([
                Paragraph(item_name, s["value"]),
                Paragraph(_yes_no(item_val), s["value"]),
                Paragraph("", s["value"]),
            ])
        if phys.get("remarks"):
            phys_rows.append([
                Paragraph("Inspector Remarks", s["label"]),
                Paragraph(str(phys["remarks"]), s["value"]),
                "",
            ])
        elements.append(Table(
            phys_rows,
            colWidths=[page_w * 0.40, page_w * 0.25, page_w * 0.35],
            style=_TABLE_STYLE,
        ))
        elements.append(Spacer(1, 3 * mm))

        # ═══════════════════════════════════════
        # 6. METROLOGICAL TEST RESULTS TABLE
        # ═══════════════════════════════════════
        elements.append(Paragraph(
            "SECTION 4 — METROLOGICAL TEST RESULTS (OIML R76)",
            s["section"],
        ))
        if observations:
            test_header = [
                Paragraph("<b>Test Parameter</b>", s["value_bold"]),
                Paragraph("<b>Standard</b>", s["value_bold"]),
                Paragraph("<b>Observed</b>", s["value_bold"]),
                Paragraph("<b>Unit</b>", s["value_bold"]),
                Paragraph("<b>Result</b>", s["value_bold"]),
            ]
            test_rows = [test_header]
            for obs in observations:
                is_pass = obs.get("is_passed", True)
                test_rows.append([
                    Paragraph(
                        str(obs.get("parameter_name", "")), s["value"]
                    ),
                    Paragraph(
                        str(obs.get("standard_value", "N/A")), s["value"]
                    ),
                    Paragraph(
                        str(obs.get("observed_value", "")), s["value"]
                    ),
                    Paragraph(str(obs.get("unit", "")), s["value"]),
                    _pass_fail_cell(is_pass, s),
                ])
            test_cmds = list(_TABLE_STYLE.getCommands())
            for i, obs in enumerate(observations, start=1):
                bg = PASS_BG if obs.get("is_passed", True) else FAIL_BG
                test_cmds.append(("BACKGROUND", (0, i), (-1, i), bg))
            elements.append(Table(
                test_rows,
                colWidths=[
                    page_w * 0.30, page_w * 0.18, page_w * 0.20,
                    page_w * 0.12, page_w * 0.20,
                ],
                style=TableStyle(test_cmds),
            ))
        else:
            elements.append(Paragraph(
                "<i>No metrological observations recorded.</i>",
                s["value"],
            ))
        elements.append(Spacer(1, 3 * mm))

        # ═══════════════════════════════════════
        # 7. SEAL & RESULT
        # ═══════════════════════════════════════
        elements.append(Paragraph(
            "SECTION 5 — RESULT &amp; SEAL DETAILS", s["section"]
        ))
        result_bg = (
            PASS_BG if overall_result == "VERIFIED" else FAIL_BG
        )
        result_rows = [
            [Paragraph("Overall Result", s["label"]),
             Paragraph(
                 f"<b>{overall_result}</b>",
                 s["pass"] if overall_result == "VERIFIED" else s["fail"]
             ),
             Paragraph("Seal Number", s["label"]),
             Paragraph(seal_number or "N/A", s["value_bold"])],
            [Paragraph("Stamp Quarter", s["label"]),
             Paragraph(stamp_quarter or "N/A", s["value"]),
             Paragraph("Remarks", s["label"]),
             Paragraph(result_remarks or "None", s["value"])],
        ]
        r_cmds = list(_TABLE_STYLE.getCommands())
        r_cmds.append(("BACKGROUND", (0, 0), (-1, -1), result_bg))
        elements.append(Table(
            result_rows, colWidths=[col_w] * 4,
            style=TableStyle(r_cmds),
        ))
        elements.append(Spacer(1, 4 * mm))

        # ═══════════════════════════════════════
        # 8. INSPECTOR & ISSUING OFFICER
        # ═══════════════════════════════════════
        elements.append(Paragraph(
            "SECTION 6 — OFFICER DETAILS", s["section"]
        ))
        officer_rows = [
            [Paragraph("Inspected By", s["label"]),
             Paragraph(
                 f"<b>{inspector_name}</b>", s["value_bold"]
             ),
             Paragraph("Designation", s["label"]),
             Paragraph(inspector_designation, s["value"])],
        ]
        if issuing_officer_name:
            officer_rows.append([
                Paragraph("Certificate Issued By", s["label"]),
                Paragraph(
                    f"<b>{issuing_officer_name}</b>", s["value_bold"]
                ),
                Paragraph("Designation", s["label"]),
                Paragraph(
                    "Legal Metrology Officer / Admin", s["value"]
                ),
            ])
        elements.append(Table(
            officer_rows, colWidths=[col_w] * 4, style=_TABLE_STYLE
        ))
        elements.append(Spacer(1, 4 * mm))

        # ═══════════════════════════════════════
        # 9. DECLARATION
        # ═══════════════════════════════════════
        elements.append(Paragraph("DECLARATION", s["section"]))
        elements.append(Paragraph(
            f"I, <b>{inspector_name}</b>, hereby declare that the "
            "inspection was conducted as per Legal Metrology "
            "(General) Rules, 2011 and OIML R76 standards. All test "
            "results recorded above are accurate and true to the "
            "best of my knowledge.",
            s["declaration"],
        ))
        elements.append(Spacer(1, 8 * mm))
        elements.append(Paragraph(
            f"[Digital Signature Placeholder]<br/>"
            f"<b>{inspector_name}</b><br/>"
            f"{inspector_designation}<br/>"
            f"Date: {inspection_date}",
            s["value"],
        ))
        elements.append(Spacer(1, 6 * mm))

        # ═══════════════════════════════════════
        # 10. FOOTER
        # ═══════════════════════════════════════
        elements.append(HRFlowable(
            width="100%", thickness=0.5, color=SLATE_300,
            spaceAfter=2 * mm,
        ))
        elements.append(Paragraph(
            "This report is auto-generated from system data. "
            "For queries: support-lm@emaap.gov.in | "
            f"Verify: {settings.PUBLIC_VERIFICATION_BASE_URL}",
            s["footer"],
        ))
        now_str = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")
        elements.append(Paragraph(
            f"Report generated: {now_str} | "
            f"Report ID: RPT-{application_number}",
            s["footer"],
        ))

        doc.build(elements)
        return buffer.getvalue()

    def generate_and_save(
        self, *, application_number: str, **kwargs
    ) -> str:
        """Generate report PDF, save to disk, return file path."""
        pdf_bytes = self.generate_report_pdf(
            application_number=application_number, **kwargs
        )
        filename = f"RPT-{application_number}.pdf"
        file_path = self.storage_dir / filename
        file_path.write_bytes(pdf_bytes)
        return str(file_path)


inspection_report_pdf_service = InspectionReportPDFService()
