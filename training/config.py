"""
Central configuration for the Coral Vision training pipeline.

IMPORTANT — keep this in sync with the app:
`SPECIES_IDS` below MUST list the same species, in the SAME ORDER, as the
`SPECIES` array in `../src/config/species.js`. The trained model's output
layer has one neuron per entry here, in this order (index 0 = first class,
etc.), and the app's `inference.js` maps a predicted index straight back to
`species.js` by position. If the two ever drift out of sync, predictions
will be labeled as the wrong species.

Currently this lists the 8 PLACEHOLDER species used for UI development.
Once Capiz PENRO confirms the real 5–10 species for the thesis, update this
list AND `src/config/species.js` together, in the same order, then re-run
the full pipeline (prepare_dataset.py -> train.py -> evaluate.py ->
export_tflite.py) from scratch — the model has to be retrained for a
different class set, not fine-tuned on top of the old one.
"""

from pathlib import Path

# ---------------------------------------------------------------------------
# Species / classes
# ---------------------------------------------------------------------------

SPECIES_IDS = [
    "bean_coral",
    "brain_coral",
    "bubble_coral",
    "cauliflower_coral",
    "favia_coral",
    "lettuce_coral",
    "mushroom_coral",
    "crown_of_thorns_starfish",
]

NUM_CLASSES = len(SPECIES_IDS)

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------

TRAINING_DIR = Path(__file__).resolve().parent

# Raw, unprocessed images go here, organized as:
#   data/raw/<species_id>/*.jpg
# One sub-folder per entry in SPECIES_IDS, named exactly the same.
RAW_DATA_DIR = TRAINING_DIR / "data" / "raw"

# prepare_dataset.py writes the train/val/test split here as:
#   data/processed/{train,val,test}/<species_id>/*.jpg
PROCESSED_DATA_DIR = TRAINING_DIR / "data" / "processed"

# train.py writes checkpoints + the final SavedModel/.keras file here.
MODELS_DIR = TRAINING_DIR / "models"

# evaluate.py writes accuracy reports, confusion matrices, plots here.
REPORTS_DIR = TRAINING_DIR / "reports"

# export_tflite.py writes the final mobile-ready model + labels file here.
EXPORT_DIR = TRAINING_DIR / "export"

# ---------------------------------------------------------------------------
# Image / model settings
# ---------------------------------------------------------------------------

# EfficientNet-B0's native input resolution.
IMG_SIZE = (224, 224)
IMG_CHANNELS = 3

# ---------------------------------------------------------------------------
# Dataset split
# ---------------------------------------------------------------------------

# A confirmed-species coral dataset from a single PENRO area will likely be
# small (tens to a few hundred images per species, not thousands), so the
# split leans toward keeping more data in training and uses heavy
# augmentation (see train.py) rather than sacrificing large val/test slices.
TRAIN_SPLIT = 0.70
VAL_SPLIT = 0.15
TEST_SPLIT = 0.15  # must sum to 1.0 with the two above

RANDOM_SEED = 42

# ---------------------------------------------------------------------------
# Training hyperparameters
# ---------------------------------------------------------------------------

BATCH_SIZE = 16  # small on purpose — small datasets don't need large batches

# Two-stage transfer learning (see train.py for details):
#   Stage 1 — freeze the EfficientNet-B0 base, train only the new
#             classification head. Fast, prevents wrecking the pretrained
#             ImageNet features with a tiny dataset.
#   Stage 2 — unfreeze the top block(s) of the base and fine-tune the whole
#             thing at a much lower learning rate.
STAGE1_EPOCHS = 15
STAGE1_LEARNING_RATE = 1e-3

STAGE2_EPOCHS = 20
STAGE2_LEARNING_RATE = 1e-5
STAGE2_UNFREEZE_FROM_LAYER = 200  # unfreeze base layers from this index onward

EARLY_STOPPING_PATIENCE = 5
