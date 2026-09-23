from reportlab.lib import colors
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet

# ─── Color Palette (Government / Official) ────────────────────────
NAVY = colors.HexColor("#0c1d3f")
DARK_BLUE = colors.HexColor("#1a365d")
GOV_GREEN = colors.HexColor("#065f46")
GREEN_ACCENT = colors.HexColor("#059669")
GOLD_ACCENT = colors.HexColor("#b45309")
GOLD_LIGHT = colors.HexColor("#fef3c7")
SLATE_700 = colors.HexColor("#334155")
SLATE_500 = colors.HexColor("#64748b")
SLATE_300 = colors.HexColor("#cbd5e1")
SLATE_100 = colors.HexColor("#f1f5f9")
SLATE_50 = colors.HexColor("#f8fafc")
WHITE = colors.white


def build_certificate_styles() -> dict:
    """Build all paragraph styles for the statutory legal metrology certificate."""
    styles = getSampleStyleSheet()

    return {
        "gov_header": ParagraphStyle(
            "GovHeader",
            parent=styles["Normal"],
            fontName="Helvetica-Bold",
            fontSize=9,
            leading=12,
            textColor=NAVY,
            alignment=1,
            spaceAfter=2,
        ),
        "cert_title": ParagraphStyle(
            "CertTitle",
            parent=styles["Normal"],
            fontName="Helvetica-Bold",
            fontSize=16,
            leading=20,
            textColor=NAVY,
            alignment=1,
        ),
        "cert_subtitle": ParagraphStyle(
            "CertSubtitle",
            parent=styles["Normal"],
            fontName="Helvetica",
            fontSize=9,
            leading=12,
            textColor=SLATE_500,
            alignment=1,
        ),
        "section_heading": ParagraphStyle(
            "SectionHeading",
            parent=styles["Normal"],
            fontName="Helvetica-Bold",
            fontSize=10,
            leading=13,
            textColor=DARK_BLUE,
            spaceBefore=8,
            spaceAfter=4,
        ),
        "body": ParagraphStyle(
            "CertBody",
            parent=styles["Normal"],
            fontName="Helvetica",
            fontSize=9,
            leading=13,
            textColor=SLATE_700,
        ),
        "label": ParagraphStyle(
            "CertLabel",
            parent=styles["Normal"],
            fontName="Helvetica-Bold",
            fontSize=8.5,
            leading=12,
            textColor=SLATE_500,
        ),
        "value": ParagraphStyle(
            "CertValue",
            parent=styles["Normal"],
            fontName="Helvetica",
            fontSize=9,
            leading=12,
            textColor=NAVY,
        ),
        "value_bold": ParagraphStyle(
            "CertValueBold",
            parent=styles["Normal"],
            fontName="Helvetica-Bold",
            fontSize=9,
            leading=12,
            textColor=NAVY,
        ),
        "hash": ParagraphStyle(
            "CertHash",
            parent=styles["Normal"],
            fontName="Courier",
            fontSize=7,
            leading=9,
            textColor=SLATE_500,
            alignment=1,
        ),
        "footer": ParagraphStyle(
            "CertFooter",
            parent=styles["Normal"],
            fontName="Helvetica",
            fontSize=7.5,
            leading=10,
            textColor=SLATE_500,
            alignment=1,
        ),
        "disclaimer": ParagraphStyle(
            "Disclaimer",
            parent=styles["Normal"],
            fontName="Helvetica-Oblique",
            fontSize=7,
            leading=9,
            textColor=SLATE_500,
            alignment=1,
        ),
        "statute": ParagraphStyle(
            "CertStatute",
            parent=styles["Normal"],
            fontName="Helvetica-Oblique",
            fontSize=8.5,
            leading=12,
            textColor=SLATE_700,
            alignment=4,  # Justified
        ),
    }
