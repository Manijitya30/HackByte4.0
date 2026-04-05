# TensorCourt - an AI Enchanced Judicial System

A comprehensive courtroom-focused AI platform that revolutionizes legal proceedings through advanced evidence authentication, intelligent legal debate simulation, and automated court support.

Made by Team Tensor at Hackbyte 4.0 -
i. KolliKesav (Kesav)
ii. Manijitya30 (Manijitya)
iii. suryakrishnakishore (Kishore)
iv. BlazeGaming456 (Ajin)

## Features

1. **Evidence Authentication Engine**
Deals with the authentication of files of different file formats.
For images -
   - Detects AI-generated images using a fine-tuned EfficientNet-B3 model trained on Flickr and Synthbuster datasets.
   - Detects tampered images using a U-Net with EfficientNet-B0 backbone fine-tuned on the DF2023 dataset.
   - Produces heatmaps and overlay visualizations so reviewers can verify tampering decisions.
   - Detects deepfakes with a Hugging Face pretrained ViT-based image processor.
   - Extracts metadata via `exiftool`.

For videos -
   - Analyzes videos frame-by-frame for deepfake detection.
   - Extracts metadata via `exiftool`.
   - Performs splice detection using structural similarity and pixel-density logic between frames.
   - Validates audio/video sync with MFCC analysis.
   
For audio -
   - Uses MFCC-based analysis and speaker verification to flag suspected audio manipulation and generate a forensic report.

2. **AI Debate & Cross-Examination Simulator**
The idea is to allow a lawyer to come in with a stronger case with the help of court room simulations and cross-questionings.
   - Simulates a Prosecutor, Defense Lawyer, and Judge with independent reasoning styles.
   - Conducts structured, multi-round argumentation instead of single responses.
   - Grounds arguments in legal sections and past case judgments for explainability.
   - Judge agent evaluates both sides and issues a reasoned verdict based on evidence strength.

3. **Legal Research Chatbot**
Legal documents are expansie and direct use of LLMs may lead to incorrect data or hallucinations.
We instead create a RAG model grounded previous cases, statutes and sections which are embeddded in the database.
This makes it so that data retrieved and worked on is relevant to the case and context specified by the user, whether it be the judge, lawyers or citizens.
   - Retrieves relevant BNS, BNSS, and BSA sections and court precedents on demand.
   - Provides different response styles for judges, lawyers, and citizens.

## What is included

- `backend/` — FastAPI service, AI models, metadata extraction, tamper/deepfake detection, report generation.
- `frontend/` — React + Vite user interface.
- `ImageAuthentication/` — image authentication datasets and scripts.

## Chatbot Architecture

┌─────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  User asks  │────▶│  Vector Database │────▶│  Retrieve top   │
│  a question │     │  (Chroma/Pinecone)│     │  K relevant     │
└─────────────┘     └──────────────────┘     │  chunks/sections│
                                             └────────┬────────┘
                                                      │
                                                      ▼
┌─────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  LLM gives  │◀────│  LLM generates   │◀────│  Prompt with    │
│  answer with│     │  answer from     │     │  context +      │
│  citations  │     │  retrieved text  │     │  user question  │
└─────────────┘     └──────────────────┘     └─────────────────┘

## Quick start

### Backend

1. Create and activate a virtual environment.

```bash
cd backend
python -m venv .venv
.\.venv\Scripts\activate
```

2. Install Python dependencies.

```bash
pip install -r requirements.txt
```

3. Install `exiftool` on your system.

4. Start the backend server.

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The backend listens on `http://127.0.0.1:8000` and exposes:

- `GET /` — health check
- `POST /analyze/` — image upload analysis endpoint
- `GET /download-report` — generated report PDF

### Frontend

1. Install Node dependencies.

```bash
cd frontend
npm install
```

2. Start the frontend.

```bash
npm run dev
```

3. Open the app in the browser.

- Default Vite URL: `http://127.0.0.1:5173`

### Recommended image folder

- `docs/images/README-screenshot-1.png`
- `docs/images/README-screenshot-2.png`

Then reference them in this README with relative paths.

## Project structure

- `backend/main.py` — FastAPI entrypoint
- `backend/routers/` — backend router modules
- `backend/ai_model.py` — AI detection model logic
- `backend/tamper_model.py` — tampering detection model logic
- `backend/deepfakedetect.py` — deepfake image analysis
- `frontend/src/` — React components and pages
- `frontend/src/assets/` — imported asset files
- `frontend/public/` — static public assets

## Notes

- The backend loads AI models on startup, so the first run may take longer.
- Keep the backend running while using the frontend.
