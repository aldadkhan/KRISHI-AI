# KRISHI AI – SIH25076
AI-Based Farmer Query Support and Advisory System for Kerala.

## Stack
- Frontend: React + Vite + CSS
- Backend: Node.js + Express
- Database: PostgreSQL
- AI: Python FastAPI (demo advisory engine; replace with a real LLM/RAG provider)
- Authentication: Email and password (passwords are hashed with bcrypt)
- Languages: English, Malayalam, Kannada

## Requirements
Node.js 20+, PostgreSQL 15+, Python 3.11+

## 1. Database
Create a PostgreSQL database named `krishi_ai`, then run:
```sql
psql -U postgres -d krishi_ai -f database/schema.sql
psql -U postgres -d krishi_ai -f database/seed.sql
```

## 2. Backend
```bash
cd backend
copy .env.example .env
npm install
npm run dev
```
Linux/macOS:
```bash
cp .env.example .env
```

Set a unique, long `JWT_SECRET` in `.env` before exposing the backend outside your local machine. Without PostgreSQL, this demo stores registered accounts and query history in `backend/data/demo-store.json`; this local store is not a production database and has no multi-user concurrency guarantees. Profile endpoints that depend on PostgreSQL require the database.

### NGO reporting demo

For a reporting demo, set `DEMO_MODE=true` in `backend/.env` and configure `ADMIN_EMAIL` and `ADMIN_PASSWORD` there. On first startup, the local demo store is populated with synthetic farmer accounts and advisory reports for the admin analytics screen. Demo data is clearly fictional and uses reserved `.invalid` email addresses.

Keep demo credentials in the ignored local `.env` file. Change `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_REGISTRATION_KEY` and `JWT_SECRET` before deployment; never use demo credentials in a public deployment. Reports can be searched by farmer, crop, district or report text and exported as CSV from the admin screen.

## 3. AI engine
```bash
cd ai-engine
python -m venv .venv
# Windows:
.venv\Scripts\activate
# Linux/macOS:
# source .venv/bin/activate
pip install -r requirements.txt
uvicorn app:app --reload --port 8000
```

## 4. Frontend
```bash
cd frontend
npm install
npm run dev
```

Open the URL shown by Vite, normally http://localhost:5173. Create a farmer account with your name, email and a password of at least eight characters.

### Update the PostgreSQL data

After updating the schema or scheme catalogue, apply both SQL files from the repository root:
```bash
psql -U postgres -d krishi_ai -f database/schema.sql
psql -U postgres -d krishi_ai -f database/seed.sql
```
The scheme seed uses stable keys and can be run again to refresh the listed programme details.

## Weather and scheme information
- Five-day, district-centre forecasts are retrieved live from [Open-Meteo](https://open-meteo.com/); no API key is required.
- The scheme directory links to official Kerala and Central Government programme portals including [Kerala AIMS](https://aims.kerala.gov.in/), [PM-KISAN](https://pmkisan.gov.in/), [PMFBY](https://pmfby.gov.in/), [PMKSY](https://pmksy.gov.in/) and [PM-KUSUM](https://pmkusum.mnre.gov.in/).
- The settings page lists the Government of India's Kisan Call Centre at `1800-180-1551`. The dashboard count is registered accounts on this platform, not a Kerala-wide farmer census figure.
- Scheme eligibility, covered crops and application windows change. Check the linked official source or local Agriculture Office before applying.

## Important
The included AI engine is a safe demonstration layer, not a certified agricultural diagnosis system. Replace the demo knowledge base with verified Kerala Agriculture Department / Kerala Agricultural University material before real deployment.
