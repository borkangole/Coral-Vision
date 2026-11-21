"""
Converts the trained Keras model into a TensorFlow Lite (.tflite) file the
mobile app can actually run, plus a labels.txt the app can bundle alongside
it.

Uses float16 post-training quantization: roughly halves the model's file
size and speeds up inference on-device, with a negligible accuracy hit —
a good default for a phone app. (Full int8 quantization would shrink it
further but needs a representative calibration dataset and is more fiddly;
not necessary unless the float16 model turns out too large/slow in
practice.)

Prerequisite: train.py has produced models/coral_vision_final.keras.

Usage:
    python export_tflite.py
"""

import json

import tensorflow as tf

from config import EXPORT_DIR, MODELS_DIR, SPECIES_IDS


def load_class_names() -> list[str]:
    class_names_path = MODELS_DIR / "class_names.json"
    if class_names_path.exists():
        with open(class_names_path) as f:
            return json.load(f)
    return SPECIES_IDS


def main() -> None:
    EXPORT_DIR.mkdir(parents=True, exist_ok=True)

    model_path = MODELS_DIR / "coral_vision_final.keras"
    if not model_path.exists():
        raise SystemExit(f"Expected {model_path} to exist — run train.py first.")

    print(f"Loading {model_path}")
    model = tf.keras.models.load_model(model_path)

    converter = tf.lite.TFLiteConverter.from_keras_model(model)
    converter.optimizations = [tf.lite.Optimize.DEFAULT]
    converter.target_spec.supported_types = [tf.float16]
    tflite_model = converter.convert()

    tflite_path = EXPORT_DIR / "coral_vision_efficientnet_b0.tflite"
    tflite_path.write_bytes(tflite_model)

    class_names = load_class_names()
    labels_path = EXPORT_DIR / "labels.txt"
    labels_path.write_text("\n".join(class_names) + "\n")

    size_mb = tflite_path.stat().st_size / (1024 * 1024)
    print(f"\nWrote {tflite_path} ({size_mb:.1f} MB)")
    print(f"Wrote {labels_path}")
    print(
        "\nNext step: copy both files into the mobile app (e.g. "
        "coral-vision-mobile/assets/model/) and wire them into "
        "src/services/inference.js in place of the mock predictor — see the "
        "commented-out real-model section already in that file. Running an "
        "on-device .tflite model needs a custom dev client / EAS build, "
        "since react-native-fast-tflite isn't available in plain Expo Go."
    )


if __name__ == "__main__":
    main()
