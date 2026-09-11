# Cat Sound Decoder

Cat Sound Decoder is a mobile-first web app that helps cat owners interpret a
vocalization in context. It combines an audio classifier with observed ear and
tail positions, then explains whether the two signals reinforce each other or
point in different directions.

The app is designed as an educational field guide, not as a veterinary
diagnostic tool.

## Why I built it

I foster kittens, and the honest version of interpreting a cat is that you're reading two channels
at once. The sound tells you one thing, the ears and tail tell you another, and the interesting
moments are when they disagree. Most "cat translator" apps flatten that into a single confident
answer, which is both wrong and less useful than the disagreement itself.

So the design decision that shapes everything here: the audio prediction and the body-language
reading are computed separately and kept separate. When they conflict, the app shows both readings
instead of picking one. The conflict is the information.

The second decision was to be honest about the model's limits in the interface rather than in a
footnote. Two of the five contexts are trained on synthetic feature vectors because the source
dataset doesn't contain them, and the UI labels those results experimental wherever they appear.

## What it does

- Records a cat vocalization in the browser with the MediaRecorder API.
- Accepts an uploaded audio file instead of a live recording.
- Extracts acoustic features from the audio:
  - 13 MFCC means
  - 13 MFCC standard deviations
  - mean and standard deviation of estimated pitch
  - vocalization duration
- Predicts one of five contexts:
  - **Being Brushed**
  - **Waiting for Food**
  - **Isolation / Stress**
  - **Play / Excitement**
  - **Pain / Distress**
- Shows a confidence score and the probability breakdown across contexts.
- Collects optional body-language observations:
  - six ear positions
  - nine tail positions
- Fuses the audio prediction and body language into one of three outcomes:
  - **Signals agree** — body language reinforces the audio prediction.
  - **Mixed signals** — audio and posture point in different directions.
  - **Audio signal** — no body-language data was provided.
- Provides a **No sound** path for a body-language-only reading.
- Lets users confirm or correct a prediction and save the labeled recording as
  a contribution for future dataset work.
- Includes an in-app Sources page and a standalone methodology document.

## Architecture

This repository is a pnpm workspace with separate frontend and Python API
artifacts:

```text
artifacts/
├── pet-decoder/                 # React + Vite frontend
│   ├── src/
│   │   ├── components/          # Reusable UI components
│   │   ├── hooks/               # Audio recorder and baseline hooks
│   │   ├── lib/                 # Body language, meanings, and signal fusion
│   │   └── pages/               # Home, baseline, and sources pages
│   └── public/                  # Ear, tail, and other static assets
└── api-server/                  # FastAPI + scikit-learn backend
    ├── server/
    │   ├── main.py              # HTTP API and application lifecycle
    │   ├── db.py                # SQLite contributions database
    │   └── ml/
    │       ├── dataset.py       # Dataset download and training data assembly
    │       ├── features.py      # librosa feature extraction
    │       └── model.py         # SVM training, persistence, and prediction
    ├── data/                    # Runtime model, dataset, and SQLite files
    └── start.sh                 # Dependency install and Uvicorn startup
```

### Frontend

- React 19
- TypeScript
- Vite
- Tailwind CSS
- Wouter for lightweight routing
- TanStack React Query through generated API hooks
- `lucide-react` for interface icons

### Backend

- Python 3.11+
- FastAPI
- Uvicorn
- librosa and SoundFile for audio loading and feature extraction
- scikit-learn for the classifier
- joblib for the saved model
- SQLite for user contributions and approved labels

## Machine-learning model

The audio model is a `StandardScaler` + scikit-learn `SVC` pipeline with:

- RBF kernel
- `C=10`
- `gamma="scale"`
- `probability=True`
- `class_weight="balanced"`
- `random_state=42`

The three original contexts come from the
[CatMeows dataset](https://zenodo.org/records/4008297) by S. Ntalampiras
(Zenodo record 4008297). The dataset contains approximately 440 labeled WAV
recordings covering brushing, food, and isolation contexts.

Play and pain are currently represented by acoustically modeled synthetic
feature vectors because the CatMeows dataset does not contain those labels.
When the real CatMeows dataset is available, the default training set is
approximately 600 samples: 440 real samples plus 80 synthetic play samples and
80 synthetic pain samples. If the dataset cannot be downloaded, the backend
falls back to synthetic feature data for all five contexts so the application
can still start.

The UI labels play and pain results as experimental. Model confidence is a
statistical pattern-match score, not a probability that a cat is definitely
experiencing a particular emotional or physical state.

## Signal fusion

Audio classification and body language are intentionally kept as separate
signals before being combined:

1. The API returns the predicted audio context, confidence, all class
   probabilities, and extracted feature summaries.
2. The frontend interprets the selected ear and tail positions.
3. `fuseSignals()` scores whether those posture signals support or contradict
   the audio prediction.
4. The result view explains the relationship:
   - corroborating posture can increase the displayed confidence;
   - conflicting posture displays both readings rather than hiding one;
   - missing posture leaves the audio result unchanged.

The body-language mappings are informed by the
[Feline Grimace Scale](https://www.felinegrimacescale.com), the
[Cornell Feline Health Center](https://www.vet.cornell.edu/departments-centers-and-institutes/cornell-feline-health-center),
and the
[ASPCA cat body-language guide](https://www.aspca.org/pet-care/cat-care/common-cat-behavior-issues/reading-your-cats-body-language).

## Prerequisites

- Node.js with pnpm enabled
- Python 3.11 or newer
- A browser with microphone support for live recording

The workspace uses pnpm and includes the required JavaScript dependencies in
the lockfile. The API startup script installs Python dependencies from
`artifacts/api-server/requirements.txt`.

## Run locally

Install JavaScript dependencies from the repository root:

```bash
pnpm install
```

Start the API server in one terminal:

```bash
bash artifacts/api-server/start.sh
```

The API listens on port `8080` by default. To use another port:

```bash
PORT=8080 bash artifacts/api-server/start.sh
```

Start the frontend in a second terminal:

```bash
pnpm --filter @workspace/pet-decoder run dev
```

The frontend uses Vite and prints its local preview URL when it starts. In
Replit, the configured web workflow is:

```bash
pnpm --filter @workspace/pet-decoder run dev
```

The API workflow is:

```bash
bash /home/runner/workspace/artifacts/api-server/start.sh
```

The first API startup may take longer because it downloads the CatMeows
dataset, extracts features, and trains the model. The frontend polls
`/api/model/status` and shows a model-training status while this is happening.

## Useful commands

Run the frontend typecheck:

```bash
pnpm --filter @workspace/pet-decoder run typecheck
```

Build the frontend:

```bash
pnpm --filter @workspace/pet-decoder run build
```

Run the workspace-wide typecheck:

```bash
pnpm run typecheck
```

Build all buildable workspace packages:

```bash
pnpm run build
```

## API endpoints

The FastAPI service exposes these routes:

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/api/healthz` | Health check |
| `POST` | `/api/analyze` | Analyze an uploaded vocalization |
| `POST` | `/api/contribute` | Save a labeled recording contribution |
| `GET` | `/api/model/status` | Return model readiness and training metadata |
| `GET` | `/api/contributions/stats` | Return contribution and moderation counts |
| `GET` | `/api/labels` | Return base and approved context labels |

### Analyze audio with curl

```bash
curl -X POST \
  -F "audio=@path/to/cat-recording.wav" \
  http://localhost:8080/api/analyze
```

The response includes:

- `prediction`
- `confidence`
- `all_probabilities`
- `features`
- `disclaimer`

Supported audio formats depend on the installed librosa/SoundFile backends,
and include WAV, MP3, OGG, M4A, and browser-generated WebM recordings.

## Contributions and moderation

After an analysis, a user can confirm the prediction, select another base
context, or enter a custom context. Contributions are stored in:

```text
artifacts/api-server/data/contributions.db
```

New custom contexts require five matching user labels before they are marked
approved. Base contexts bypass this moderation threshold.

At present, contributions are persisted and counted for moderation, but
`load_dataset()` does not yet include approved contribution audio in model
retraining. Treat the contribution flow as collection infrastructure until
that training-data pipeline is completed.

## Runtime data

The following files are generated at runtime and should not be treated as
source files:

```text
artifacts/api-server/data/
├── catmeows/        # Downloaded CatMeows audio
├── model.pkl        # Joblib-persisted trained pipeline
└── contributions.db # SQLite contribution database
```

The model is cached after training. Delete `model.pkl` when you need to force
a retrain:

```bash
rm artifacts/api-server/data/model.pkl
```

Do not delete the contributions database unless you intentionally want to
remove collected labels and recordings.

## Methodology

The full methodology, including feature engineering, model configuration,
moderation rationale, quality-control gaps, and the retraining roadmap, is
available at:

```text
docs/pet-decoder-methodology.html
```

Open the file directly in a browser or serve it with any static file server.

## Limitations and safety

- This is an educational interpretation tool, not a veterinary diagnostic
  instrument.
- Individual cats vary widely in their vocalizations and body language.
- The base audio dataset is small and covers only three real-world recording
  contexts.
- Play and pain predictions are experimental because their current training
  examples are synthetic.
- Body-language selections are self-reported and may not match the cat's
  actual posture.
- A pain-related result or concerning behavior should be discussed with a
  licensed veterinarian. Do not use the app to delay urgent care.
- Audio upload validation, contribution rate limiting, and per-IP
  deduplication are not yet implemented.

## Further reading

- [CatMeows dataset on Zenodo](https://zenodo.org/records/4008297)
- [Feline Grimace Scale](https://www.felinegrimacescale.com)
- [Cornell Feline Health Center](https://www.vet.cornell.edu/departments-centers-and-institutes/cornell-feline-health-center)
- [ASPCA cat body language guide](https://www.aspca.org/pet-care/cat-care/common-cat-behavior-issues/reading-your-cats-body-language)
