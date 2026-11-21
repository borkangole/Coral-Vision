"""
Splits the raw, per-species image folders into train/val/test sets.

Expects images laid out like this (one folder per SPECIES_IDS entry):

    data/raw/
      bean_coral/
        img001.jpg
        img002.jpg
        ...
      brain_coral/
        ...

Writes a stratified split (same class proportions in each split) to:

    data/processed/
      train/<species_id>/*.jpg
      val/<species_id>/*.jpg
      test/<species_id>/*.jpg

Images are COPIED, not moved, so re-running this is always safe — it just
rebuilds data/processed from data/raw. Run this once after the PENRO
dataset is in data/raw/, and again any time raw images are added/changed.

Usage:
    python prepare_dataset.py
"""

import shutil
import sys
from pathlib import Path

from sklearn.model_selection import train_test_split

from config import (
    PROCESSED_DATA_DIR,
    RANDOM_SEED,
    RAW_DATA_DIR,
    SPECIES_IDS,
    TEST_SPLIT,
    TRAIN_SPLIT,
    VAL_SPLIT,
)

IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".heic", ".webp"}


def find_images(folder: Path) -> list[Path]:
    return sorted(p for p in folder.iterdir() if p.suffix.lower() in IMAGE_EXTENSIONS)


def main() -> None:
    assert abs(TRAIN_SPLIT + VAL_SPLIT + TEST_SPLIT - 1.0) < 1e-9, (
        "TRAIN_SPLIT + VAL_SPLIT + TEST_SPLIT must sum to 1.0 — check config.py"
    )

    if not RAW_DATA_DIR.exists():
        sys.exit(
            f"No raw data found at {RAW_DATA_DIR}.\n"
            f"Create one sub-folder per species (named exactly like the ids in "
            f"config.SPECIES_IDS) and put that species' images inside it, e.g.\n"
            f"  {RAW_DATA_DIR}/bean_coral/photo1.jpg"
        )

    missing = [s for s in SPECIES_IDS if not (RAW_DATA_DIR / s).is_dir()]
    if missing:
        print(
            "WARNING: no raw folder found for these species (they will be "
            f"skipped): {missing}"
        )

    if PROCESSED_DATA_DIR.exists():
        shutil.rmtree(PROCESSED_DATA_DIR)

    total_counts = {}

    for species_id in SPECIES_IDS:
        species_dir = RAW_DATA_DIR / species_id
        if not species_dir.is_dir():
            continue

        images = find_images(species_dir)
        if len(images) < 10:
            print(
                f"WARNING: '{species_id}' has only {len(images)} image(s). "
                f"EfficientNet-B0 transfer learning typically needs at least "
                f"~50-100 images per class for a usable result — consider "
                f"collecting more before training."
            )
        if not images:
            continue

        # First peel off the test set, then split the remainder into train/val,
        # so the effective proportions match TRAIN/VAL/TEST_SPLIT exactly.
        train_val, test = train_test_split(
            images, test_size=TEST_SPLIT, random_state=RANDOM_SEED
        )
        relative_val_size = VAL_SPLIT / (TRAIN_SPLIT + VAL_SPLIT)
        train, val = train_test_split(
            train_val, test_size=relative_val_size, random_state=RANDOM_SEED
        )

        for split_name, split_images in (("train", train), ("val", val), ("test", test)):
            dest_dir = PROCESSED_DATA_DIR / split_name / species_id
            dest_dir.mkdir(parents=True, exist_ok=True)
            for src in split_images:
                shutil.copy2(src, dest_dir / src.name)

        total_counts[species_id] = (len(train), len(val), len(test))
        print(f"{species_id}: {len(train)} train / {len(val)} val / {len(test)} test")

    if not total_counts:
        sys.exit("No images found for any configured species — nothing to split.")

    print(f"\nDone. Processed dataset written to {PROCESSED_DATA_DIR}")


if __name__ == "__main__":
    main()
