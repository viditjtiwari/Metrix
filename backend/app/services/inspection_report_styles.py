"""Styles and helper functions for government-standard inspection report PDF."""
import json
from typing import Any, Dict, Optional
from reportlab.lib import colors
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.platypus import Paragraph, TableStyle

# ── Colour palette (matches certificate PDF styling) ──
NAVY = colors.HexColor("#0c1d3f")
DARK_BLUE = colors.HexColor("#1a365d")
SLATE_700 = colors.HexColor("#334155")
SLATE_500 = colors.HexColor("#64748b")
SLATE_300 = colors.HexColor("#cbd5e1")
SLATE_100 = colors.HexColor("#f1f5f9")
SLATE_50 = colors.HexColor("#f8fafc")
WHITE = colors.HexColor("#ffffff")
GREEN = colors.HexColor("#059669")
RED = colors.HexColor("#dc2626")
GOLD = colors.HexColor("#b8860b")
PASS_BG = colors.HexColor("#ecfdf5")
FAIL_BG = colors.HexColor("#fef2f2")


def build_styles() -> Dict[str, ParagraphStyle]:
    """Build paragraph styles for the inspection report."""
    base = getSampleStyleSheet()
    return {
        "gov_header": ParagraphStyle(
            "GovHeader", parent=base["Normal"],
            fontName="Helvetica-Bold", fontSize=11,
            alignment=1, textColor=NAVY, leading=14,
        ),
        "report_title": ParagraphStyle(
            "ReportTitle", parent=base["Normal"],
            fontName="Helvetica-Bold", fontSize=13,
            alignment=1, textColor=DARK_BLUE, leading=16,
        ),
        "subtitle": ParagraphStyle(
            "Subtitle", parent=base["Normal"],
            fontName="Helvetica", fontSize=8.5,
            alignment=1, textColor=SLATE_500, leading=11,
        ),
        "section": ParagraphStyle(
            "Section", parent=base["Normal"],
            fontName="Helvetica-Bold", fontSize=10,
            textColor=DARK_BLUE, leading=14,
            spaceBefore=6, spaceAfter=3,
        ),
        "label": ParagraphStyle(
            "Label", parent=base["Normal"],
            fontName="Helvetica", fontSize=8,
            textColor=SLATE_500, leading=10,
        ),
        "value": ParagraphStyle(
            "Value", parent=base["Normal"],
            fontName="Helvetica", fontSize=8.5,
            textColor=SLATE_700, leading=11,
        ),
        "value_bold": ParagraphStyle(
            "ValueBold", parent=base["Normal"],
            fontName="Helvetica-Bold", fontSize=8.5,
            textColor=SLATE_700, leading=11,
        ),
        "pass": ParagraphStyle(
            "Pass", parent=base["Normal"],
            fontName="Helvetica-Bold", fontSize=9,
            textColor=GREEN, leading=12,
        ),
        "fail": ParagraphStyle(
            "Fail", parent=base["Normal"],
            fontName="Helvetica-Bold", fontSize=9,
            textColor=RED, leading=12,
        ),
        "footer": ParagraphStyle(
            "Footer", parent=base["Normal"],
            fontName="Helvetica", fontSize=7,
            textColor=SLATE_500, leading=9, alignment=1,
        ),
        "declaration": ParagraphStyle(
            "Declaration", parent=base["Normal"],
            fontName="Helvetica-Oblique", fontSize=7.5,
            textColor=SLATE_700, leading=10,
        ),
    }


# Standard 4-column table style
TABLE_STYLE = TableStyle([
    ("VALIGN", (0, 0), (-1, -1), "TOP"),
    ("GRID", (0, 0), (-1, -1), 0.4, SLATE_300),
    ("BACKGROUND", (0, 0), (-1, 0), SLATE_100),
    ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
    ("FONTSIZE", (0, 0), (-1, -1), 8),
    ("TOPPADDING", (0, 0), (-1, -1), 4),
    ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
    ("LEFTPADDING", (0, 0), (-1, -1), 4),
    ("RIGHTPADDING", (0, 0), (-1, -1), 4),
])


def parse_json_safe(text: Optional[str]) -> Dict[str, Any]:
    """Parse JSON string safely, returning empty dict on failure."""
    if not text:
        return {}
    try:
        return json.loads(text)
    except (json.JSONDecodeError, TypeError):
        return {}


def yes_no(val: Any) -> str:
    """Convert boolean/string to Yes/No display."""
    if isinstance(val, bool):
        return "Yes" if val else "No"
    if isinstance(val, str):
        return val.capitalize()
    return "N/A"


def pass_fail_cell(passed: bool, s: dict) -> Paragraph:
    """Return a styled PASS/FAIL paragraph."""
    if passed:
        return Paragraph("<b>PASS</b>", s["pass"])
    return Paragraph("<b>FAIL</b>", s["fail"])


_build_styles = build_styles
_TABLE_STYLE = TABLE_STYLE
_parse_json_safe = parse_json_safe
_yes_no = yes_no
_pass_fail_cell = pass_fail_cell

