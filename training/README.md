# Coral Vision — Training Pipeline

Trains the EfficientNet-B0 coral species classifier by transfer learning,
evaluates its accuracy, and exports a mobile-ready `.tflite` model. This is
a **separate step from the app** — it runs on a computer (ideally with a
GPU, though it'll run slower on CPU too), not on the phone. You bring the
dataset and run these scripts; the app only ever loads the *result*
(`export/coral_vision_efficientnet_b0.tflite`).

**Status: scaffolded, not yet run.** This is all built and ready to go —
what's missing is the actual dataset. As soon as PENRO confirms the 5–10
species and you have images for each, drop them in and run the pipeline
top to bottom.

## 1. Set up the environment

```
cd training
python -m venv venv
venv\Scripts\activate          (Windows)   or   source venv/bin/activate   (Mac/Linux)
pip install -r requirements.txt
```

## 2. Add your dataset

Create one folder per species inside `data/raw/`, named to match the
species `id`s in `config.py` (which mirror the app's
`src/config/species.js`) — for example:

```
data/raw/
  bean_coral/
    img001.jpg
    img002.jpg
    ...
  brain_coral/
    ...
  bubble_coral/
    ...
```

Rough guidance: aim for at least 50–100 photos per species if you can — a
CNN like EfficientNet-B0 fine-tunes reasonably well on datasets that size
thanks to transfer learning + augmentation, but fewer than ~20–30 per
species will likely hurt accuracy noticeably. If your real PENRO dataset
ends up smaller than that, it's still worth training — just expect (and
report) lower accuracy, and lean on the augmentation already built into
`train.py`.

**When the real PENRO species list arrives**, update `SPECIES_IDS` in
`config.py` to match it — same species, same order as `src/config/species.js`
— before adding images. The folder names in `data/raw/` must match those ids
exactly.

## 3. Run the pipeline

```
python prepare_dataset.py    # splits data/raw into train/val/test (70/15/15)
python train.py              # two-stage transfer learning on EfficientNet-B0
python evaluate.py           # accuracy, per-species precision/recall, confusion matrix
python export_tflite.py      # converts the trained model to .tflite for the app
```

Each step reads the previous step's output, so just run them in order.
`train.py` will take a while — longer with more images, longer still on
CPU-only machines. Progress bars and per-epoch accuracy print as it goes.

## 4. What comes out of it

- `models/coral_vision_final.keras` — the trained model (Keras format,
  for retraining/inspection later).
- `reports/classification_report.txt` / `.json` — per-species precision,
  recall, F1, and overall accuracy. This is the raw material for the
  thesis's accuracy-evaluation chapter.
- `reports/confusion_matrix.png` — which species get confused with which.
- `export/coral_vision_efficientnet_b0.tflite` + `export/labels.txt` — the
  files that actually go into the mobile app.

## 5. Wiring the trained model into the app

`src/services/inference.js` currently uses a mock predictor
(`USE_MOCK_MODEL = true`) so the app's UI/UX could be built before a real
model existed. Once you have `export/coral_vision_efficientnet_b0.tflite`:

1. Copy it (and `labels.txt`) into the mobile app, e.g.
   `coral-vision-mobile/assets/model/`.
2. Follow the commented-out "real model" section already in
   `inference.js` to load it with `react-native-fast-tflite`.
3. Important: running an on-device `.tflite` model requires a **custom dev
   client / EAS build** — it will NOT work in plain Expo Go, because
   `react-native-fast-tflite` is a native module Expo Go doesn't bundle.
   This is a bigger step (an EAS account, a native build) — happy to walk
   through it when you're ready for it.

## Re-training for a different species set

If the species list changes (e.g. PENRO's confirmed list differs from the
placeholders), don't try to fine-tune the old model on top — the output
layer's shape depends on the number of classes, so a changed class list
needs a fresh run of the whole pipeline from `prepare_dataset.py` onward,
after updating `SPECIES_IDS` in `config.py`.
