"""
Generates clean base PDFs for all 4 document types using ReportLab.
Each function returns a bytes object (the PDF content).
"""
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.pdfgen import canvas
from reportlab.lib.units import cm
import io, math

WATERMARK_TEXT = "SAMPLE — NOT A REAL DOCUMENT"
FONT_REGULAR = "Helvetica"
FONT_BOLD    = "Helvetica-Bold"

def _add_watermark(c, width, height):
    c.saveState()
    c.setFont(FONT_BOLD, 40)
    c.setFillColorRGB(0.85, 0.85, 0.85)
    c.setFillAlpha(0.3)
    c.translate(width / 2, height / 2)
    c.rotate(45)
    c.drawCentredString(0, 0, WATERMARK_TEXT)
    c.restoreState()

def _draw_seal(c, x, y, label="SEAL", radius=40):
    """Draws a simple circular seal stamp."""
    c.saveState()
    c.setStrokeColorRGB(0.3, 0.3, 0.6)
    c.setLineWidth(2)
    c.circle(x, y, radius, stroke=1, fill=0)
    c.circle(x, y, radius - 5, stroke=1, fill=0)
    c.setFont(FONT_BOLD, 7)
    c.setFillColorRGB(0.3, 0.3, 0.6)
    c.drawCentredString(x, y, label[:12])
    c.drawCentredString(x, y - 10, "(SAMPLE)")
    c.restoreState()

def _header(c, width, height, title):
    c.setFont(FONT_BOLD, 16)
    c.drawCentredString(width / 2, height - 2*cm, title)
    c.setFont(FONT_REGULAR, 9)
    c.setFillColorRGB(0.5, 0.5, 0.5)
    c.drawCentredString(width / 2, height - 2.6*cm, WATERMARK_TEXT)
    c.setFillColorRGB(0, 0, 0)

def _field(c, x, y, label, value):
    c.setFont(FONT_BOLD, 10)
    c.drawString(x, y, f"{label}:")
    c.setFont(FONT_REGULAR, 10)
    c.drawString(x + 180, y, str(value))

def generate_land_deed(area_sqft=45000) -> bytes:
    buf = io.BytesIO()
    c = canvas.Canvas(buf, pagesize=A4)
    w, h = A4
    _add_watermark(c, w, h)
    _header(c, w, h, "SALE DEED / LAND REGISTRATION DOCUMENT")
    fields = [
        ("Survey Number",      "42/B"),
        ("Area (sq ft)",       str(area_sqft)),
        ("Owner Name",         "SAMPLE EDUCATIONAL TRUST"),
        ("Registration Date",  "2020-03-15"),
        ("Registrar Office",   "Sub-Registrar, Samplepur"),
        ("Location",           "Survey No. 42, Sector 9, Samplepur, XX 000000"),
    ]
    y = h - 4*cm
    for label, value in fields:
        _field(c, 3*cm, y, label, value)
        y -= 1*cm
    _draw_seal(c, w - 4*cm, 4*cm, "REGISTRAR\nOFFICE")
    c.setFont(FONT_REGULAR, 8)
    c.drawString(3*cm, 2*cm, "Document ID: LD-SAMPLE-2020-042B  |  This is a SAMPLE document.")
    c.save()
    return buf.getvalue()

def generate_trust_certificate() -> bytes:
    buf = io.BytesIO()
    c = canvas.Canvas(buf, pagesize=A4)
    w, h = A4
    _add_watermark(c, w, h)
    _header(c, w, h, "TRUST / SOCIETY REGISTRATION CERTIFICATE")
    fields = [
        ("Trust Name",          "SAMPLE EDUCATIONAL TRUST"),
        ("Registration Number", "TRUST/SAMPLE/2019/001"),
        ("Registered On",       "2019-06-01"),
        ("Valid Until",         "2029-06-01"),
        ("Issuing Authority",   "Charity Commissioner, Sample State"),
    ]
    y = h - 4*cm
    for label, value in fields:
        _field(c, 3*cm, y, label, value)
        y -= 1*cm
    _draw_seal(c, w - 4*cm, 4*cm, "CHARITY\nCOMMISSIONER")
    c.setFont(FONT_REGULAR, 8)
    c.drawString(3*cm, 2*cm, "Cert ID: TC-SAMPLE-2019-001  |  This is a SAMPLE document.")
    c.save()
    return buf.getvalue()

def generate_faculty_list(total_faculty=45) -> bytes:
    buf = io.BytesIO()
    c = canvas.Canvas(buf, pagesize=A4)
    w, h = A4
    _add_watermark(c, w, h)
    _header(c, w, h, "FACULTY LIST")
    c.setFont(FONT_REGULAR, 10)
    y = h - 4*cm
    _field(c, 3*cm, y, "Institution", "Greenfield Institute of Technology (SAMPLE)")
    y -= 1*cm
    _field(c, 3*cm, y, "Prepared Date", "2026-01-10")
    y -= 1*cm
    _field(c, 3*cm, y, "Total Faculty", str(total_faculty))
    y -= 1.5*cm
    headers = ["Name", "Qualification", "Designation", "Joining Date"]
    col_x = [3*cm, 8*cm, 13*cm, 17*cm]
    c.setFont(FONT_BOLD, 9)
    for i, h_text in enumerate(headers):
        c.drawString(col_x[i], y, h_text)
    y -= 0.7*cm
    rows = [
        ("Dr. A. SAMPLE",   "Ph.D",  "Professor",        "2015-07-01"),
        ("Prof. B. SAMPLE",  "M.Tech","Assoc. Professor", "2016-08-15"),
        ("Dr. C. SAMPLE",   "Ph.D",  "Professor",        "2014-03-10"),
        ("Mr. D. SAMPLE",   "M.E",   "Asst. Professor",  "2018-01-05"),
        ("Ms. E. SAMPLE",   "M.Sc",  "Lecturer",         "2019-06-20"),
        ("Dr. F. SAMPLE",   "Ph.D",  "Professor",        "2013-11-01"),
        ("Prof. G. SAMPLE", "M.Tech","Assoc. Professor", "2017-04-12"),
        ("Mr. H. SAMPLE",   "M.E",   "Asst. Professor",  "2020-09-01"),
        ("Ms. I. SAMPLE",   "MBA",   "Lecturer",         "2021-01-15"),
        ("Dr. J. SAMPLE",   "Ph.D",  "HoD",              "2012-06-01"),
    ]
    c.setFont(FONT_REGULAR, 8)
    for row in rows:
        for i, cell in enumerate(row):
            c.drawString(col_x[i], y, cell)
        y -= 0.6*cm
    c.setFont(FONT_REGULAR, 8)
    c.drawString(3*cm, 2*cm, "FL-SAMPLE-2026  |  This is a SAMPLE document.")
    c.save()
    return buf.getvalue()

def generate_fire_noc(valid_until="2026-11-01") -> bytes:
    buf = io.BytesIO()
    c = canvas.Canvas(buf, pagesize=A4)
    w, h = A4
    _add_watermark(c, w, h)
    _header(c, w, h, "FIRE & SAFETY NO OBJECTION CERTIFICATE")
    fields = [
        ("NOC Number",        "FNOC/SAMPLE/2024/789"),
        ("Issued To",         "Greenfield Institute of Technology (SAMPLE)"),
        ("Premises",          "Survey No. 42, Sector 9, Samplepur"),
        ("Issued Date",       "2024-11-01"),
        ("Valid Until",       valid_until),
        ("Issuing Authority", "Fire & Emergency Services, Sample District"),
    ]
    y = h - 4*cm
    for label, value in fields:
        _field(c, 3*cm, y, label, value)
        y -= 1*cm
    _draw_seal(c, w - 4*cm, 4*cm, "FIRE DEPT")
    c.setFont(FONT_REGULAR, 8)
    c.drawString(3*cm, 2*cm, "NOC-SAMPLE-2024-789  |  This is a SAMPLE document.")
    c.save()
    return buf.getvalue()
