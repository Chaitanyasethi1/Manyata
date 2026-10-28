# AICTE Validator — SIH26261

**AI-Powered Application Validation, Document Authentication
and Regulatory Compliance Verification**

> Smart India Hackathon 2026 | Problem Statement SIH26261 | AICTE
> All data is SYNTHETIC and marked SAMPLE. No real institutions or IDs.

---

## Team

| Member | Role | Parts |
|--------|------|-------|
| Member A | AI Engine | P3, P4, P5, P6, P7 |
| Member B | Web Platform | P2, P8, P9, P10, P11, P12, P13 |
| Both | Scaffold + Integration | P1, P14 |

---

## Quick Start (Development)

### Prerequisites
- Python 3.11+
- Node.js 20+
- tesseract-ocr + poppler-utils

```bash
# Ubuntu
sudo apt install tesseract-ocr poppler-utils \
  libpango-1.0-0 libpangoft2-1.0-0

# Mac
brew install tesseract poppler pango
```

### Backend
```bash
cd aicte-validator
pip install -r backend/requirements.txt -r engine/requirements.txt
PYTHONPATH=. uvicorn backend.main:app --reload --port 8000
# API docs: http://localhost:8000/docs
```

### Frontend
```bash
cd frontend
npm install
npm run dev
# App: http://localhost:3000
```

### Generate Demo Dataset
```bash
# From repo root
PYTHONPATH=. python -m dataset.generator.run
# Creates dataset/apps/app_01 to app_05 + labels.csv
```

---

## Docker (Production Demo)

```bash
# From repo root
docker compose up --build
# App:    http://localhost:3000
# API:    http://localhost:8000
# Docs:   http://localhost:8000/docs
```

---

## Demo Bundles

Run these in order to demonstrate all 5 scenarios:

| Bundle | Scenario | Expected Result |
|--------|----------|-----------------|
| app_01 | Clean — all docs valid | CLEARED (score ≥ 75) |
| app_02 | Land area edited in doc | UNDER_REVIEW (AUTH_002 high flag) |
| app_03 | Fire NOC expired | DEFICIENT (AUTH_003 critical flag) |
| app_04 | Faculty count mismatch | UNDER_REVIEW (AUTH_004 high flag) |
| app_05 | Seal copy-pasted | DEFICIENT (FORG_001 critical flag) |

### Demo Script (curl)
```bash
# Submit app_01 (clean)
curl -X POST http://localhost:8000/api/v1/applications \
  -F "institution_name=Greenfield Institute (SAMPLE)" \
  -F "contact_email=demo@sample.edu" \
  -F "documents=@dataset/apps/app_01/land_deed.pdf" \
  -F "documents=@dataset/apps/app_01/trust_certificate.pdf" \
  -F "documents=@dataset/apps/app_01/faculty_list.pdf" \
  -F "documents=@dataset/apps/app_01/fire_noc.pdf"

# Trigger pipeline (replace ID)
curl -X POST http://localhost:8000/api/v1/applications/AICTE-2026-0001/trigger

# Check result (2-3 sec baad)
curl http://localhost:8000/api/v1/applications/AICTE-2026-0001/result
```

---

## Architecture
- **Backend**: FastAPI with SQLAlchemy, SQLite, Pydantic, WeasyPrint, Alembic
- **Engine**: Modular Python architecture: OCR Extraction (pytesseract, pdf2image), Document Classification, Authenticity Verification, Forgery Detection, and Regulatory Compliance
- **Frontend**: Vite + React 18 SPA with Tailwind CSS v4, Lucide icons, Recharts visualization, and multi-role views (Institution Portal, Officer Console, Admin Dashboard)
- **Containerization**: Multi-stage Docker builds with Nginx reverse proxy and Docker Compose
