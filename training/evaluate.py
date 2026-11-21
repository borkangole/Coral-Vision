"""
Evaluates the trained model against the held-out test set: overall accuracy,
per-species precision/recall/F1, and a confusion matrix. This is the
"Accuracy test" evaluation deliverable for the thesis.

Prerequisite: train.py has produced models/coral_vision_final.keras (or
models/best_model.keras) and data/processed/test/ exists.

Usage:
    python evaluate.py
    python evaluate.py --model models/best_model.keras
"""

import argparse
import json

import matplotlib.pyplot as plt
import numpy as np
import tensorflow as tf
from sklearn.metrics import classification_report, confusion_matrix
from tensorflow.keras.applications.efficientnet import preprocess_input

from config import BATCH_SIZE, IMG_SIZE, MODELS_DIR, PROCESSED_DATA_DIR, REPORTS_DIR, SPECIES_IDS


def load_class_names() -> list[str]:
    class_names_path = MODELS_DIR / "class_names.json"
    if class_names_path.exists():
        with open(class_names_path) as f:
            return json.load(f)
    return SPECIES_IDS


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--model",
        default=str(MODELS_DIR / "coral_vision_final.keras"),
        help="Path to a trained .keras model (default: models/coral_vision_final.keras)",
    )
    args = parser.parse_args()

    REPORTS_DIR.mkdir(parents=True, exist_ok=True)
    class_names = load_class_names()

    test_dir = PROCESSED_DATA_DIR / "test"
    if not test_dir.exists():
        raise SystemExit(f"Expected {test_dir} to exist — run prepare_dataset.py first.")

    test_ds = tf.keras.utils.image_dataset_from_directory(
        test_dir,
        labels="inferred",
        label_mode="categorical",
        class_names=class_names,
        image_size=IMG_SIZE,
        batch_size=BATCH_SIZE,
        shuffle=False,
    )

    y_true = np.concatenate([np.argmax(y, axis=1) for _, y in test_ds], axis=0)

    test_ds = test_ds.map(
        lambda x, y: (preprocess_input(x), y), num_parallel_calls=tf.data.AUTOTUNE
    )

    print(f"Loading model from {args.model}")
    model = tf.keras.models.load_model(args.model)

    probs = model.predict(test_ds)
    y_pred = np.argmax(probs, axis=1)

    overall_accuracy = float(np.mean(y_true == y_pred))
    print(f"\nOverall test accuracy: {overall_accuracy:.4f}\n")

    report_text = classification_report(y_true, y_pred, target_names=class_names, digits=4)
    print(report_text)

    report_dict = classification_report(
        y_true, y_pred, target_names=class_names, digits=4, output_dict=True
    )
    with open(REPORTS_DIR / "classification_report.json", "w") as f:
        json.dump({"overall_accuracy": overall_accuracy, **report_dict}, f, indent=2)
    with open(REPORTS_DIR / "classification_report.txt", "w") as f:
        f.write(f"Overall test accuracy: {overall_accuracy:.4f}\n\n")
        f.write(report_text)

    cm = confusion_matrix(y_true, y_pred)
    fig, ax = plt.subplots(figsize=(8, 7))
    im = ax.imshow(cm, cmap="Blues")
    ax.set_xticks(range(len(class_names)))
    ax.set_yticks(range(len(class_names)))
    ax.set_xticklabels(class_names, rotation=45, ha="right")
    ax.set_yticklabels(class_names)
    ax.set_xlabel("Predicted")
    ax.set_ylabel("Actual")
    ax.set_title(f"Confusion Matrix (accuracy: {overall_accuracy:.2%})")
    for i in range(cm.shape[0]):
        for j in range(cm.shape[1]):
            ax.text(j, i, str(cm[i, j]), ha="center", va="center", color="black")
    fig.colorbar(im, ax=ax)
    fig.tight_layout()
    fig.savefig(REPORTS_DIR / "confusion_matrix.png", dpi=150)

    print(f"\nSaved report + confusion matrix to {REPORTS_DIR}")


if __name__ == "__main__":
    main()
