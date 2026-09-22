# StayPlus (ChurnGuard AI)

Full-stack AI-powered churn intelligence and customer retention platform.

## Architecture

```
StayPlus/
├── frontend/               # React 19 + TypeScript + Vite + TailwindCSS
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.ts
└── backend/                # FastAPI + XGBoost/Scikit-learn + SHAP ML Service
    ├── app/
    ├── scripts/
    ├── model/
    ├── requirements.txt
    └── Dockerfile
```

---

## Quickstart

### 1. Frontend Setup (Port 5173)

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

### 2. Backend Setup (Port 8000)

```bash
cd backend
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000
```

- **Health check**: [http://localhost:8000/health](http://localhost:8000/health)
- **Interactive API Docs (Swagger)**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **Run tests**: `pytest tests/test_ml_service.py -v`

