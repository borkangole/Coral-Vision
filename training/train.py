"""
Trains a coral-species classifier by transfer learning on EfficientNet-B0.

Two-stage approach (deliberately conservative — a PENRO-confirmed species
dataset will likely be small, and EfficientNet-B0's ImageNet features are
too valuable to risk wrecking with aggressive fine-tuning on little data):

  Stage 1 (feature extraction): the EfficientNet-B0 base is frozen. Only a
  new classification head is trained on top of it. This adapts the model to
  coral photos quickly without touching the pretrained weights.

  Stage 2 (fine-tuning): the top block(s) of the base are unfrozen and
  trained together with the head, at a much lower learning rate, to adapt
  the higher-level features specifically to coral texture/shape.

Prerequisite: run `prepare_dataset.py` first so data/processed/{train,val}
exist.

Usage:
    python train.py
"""

import json
from pathlib import Path

import tensorflow as tf
from tensorflow.keras import layers, models
from tensorflow.keras.applications.efficientnet import preprocess_input

from config import (
    BATCH_SIZE,
    EARLY_STOPPING_PATIENCE,
    IMG_SIZE,
    MODELS_DIR,
    NUM_CLASSES,
    PROCESSED_DATA_DIR,
    RANDOM_SEED,
    SPECIES_IDS,
    STAGE1_EPOCHS,
    STAGE1_LEARNING_RATE,
    STAGE2_EPOCHS,
    STAGE2_LEARNING_RATE,
    STAGE2_UNFREEZE_FROM_LAYER,
)

tf.random.set_seed(RANDOM_SEED)


def build_datasets():
    """Loads train/val images from data/processed and applies augmentation.

    Augmentation is applied only to the training set, as Keras preprocessing
    layers (so it runs on-GPU/accelerator and only during training — val/test
    always see the unmodified image). This matters a lot with a small
    dataset: it's the main defense against overfitting to a handful of
    photos per species.
    """
    train_dir = PROCESSED_DATA_DIR / "train"
    val_dir = PROCESSED_DATA_DIR / "val"
    if not train_dir.exists() or not val_dir.exists():
        raise SystemExit(
            f"Expected {train_dir} and {val_dir} to exist — run "
            f"prepare_dataset.py first."
        )

    train_ds = tf.keras.utils.image_dataset_from_directory(
        train_dir,
        labels="inferred",
        label_mode="categorical",
        class_names=SPECIES_IDS,
        image_size=IMG_SIZE,
        batch_size=BATCH_SIZE,
        seed=RANDOM_SEED,
        shuffle=True,
    )
    val_ds = tf.keras.utils.image_dataset_from_directory(
        val_dir,
        labels="inferred",
        label_mode="categorical",
        class_names=SPECIES_IDS,
        image_size=IMG_SIZE,
        batch_size=BATCH_SIZE,
        seed=RANDOM_SEED,
        shuffle=False,
    )

    augmentation = models.Sequential(
        [
            layers.RandomFlip("horizontal"),
            layers.RandomRotation(0.15),
            layers.RandomZoom(0.15),
            layers.RandomContrast(0.15),
            layers.RandomBrightness(0.15),
        ],
        name="augmentation",
    )

    def prep_train(image, label):
        image = augmentation(image, training=True)
        image = preprocess_input(image)
        return image, label

    def prep_eval(image, label):
        image = preprocess_input(image)
        return image, label

    train_ds = train_ds.map(prep_train, num_parallel_calls=tf.data.AUTOTUNE)
    val_ds = val_ds.map(prep_eval, num_parallel_calls=tf.data.AUTOTUNE)

    train_ds = train_ds.prefetch(tf.data.AUTOTUNE)
    val_ds = val_ds.prefetch(tf.data.AUTOTUNE)

    return train_ds, val_ds


def build_model() -> tf.keras.Model:
    base = tf.keras.applications.EfficientNetB0(
        include_top=False,
        weights="imagenet",
        input_shape=(*IMG_SIZE, 3),
        pooling="avg",
    )
    base.trainable = False  # Stage 1: frozen

    inputs = layers.Input(shape=(*IMG_SIZE, 3))
    x = base(inputs, training=False)
    x = layers.Dropout(0.3)(x)
    outputs = layers.Dense(NUM_CLASSES, activation="softmax", name="predictions")(x)
    model = models.Model(inputs, outputs, name="coral_vision_efficientnet_b0")
    return model


def compile_model(model: tf.keras.Model, learning_rate: float) -> None:
    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=learning_rate),
        loss="categorical_crossentropy",
        metrics=["accuracy"],
    )


def main() -> None:
    MODELS_DIR.mkdir(parents=True, exist_ok=True)

    train_ds, val_ds = build_datasets()

    model = build_model()
    compile_model(model, STAGE1_LEARNING_RATE)
    model.summary()

    checkpoint_path = MODELS_DIR / "best_model.keras"
    callbacks = [
        tf.keras.callbacks.ModelCheckpoint(
            str(checkpoint_path), monitor="val_accuracy", save_best_only=True, verbose=1
        ),
        tf.keras.callbacks.EarlyStopping(
            monitor="val_accuracy", patience=EARLY_STOPPING_PATIENCE, restore_best_weights=True
        ),
    ]

    print("\n=== Stage 1: training classification head (base frozen) ===\n")
    model.fit(
        train_ds,
        validation_data=val_ds,
        epochs=STAGE1_EPOCHS,
        callbacks=callbacks,
    )

    print("\n=== Stage 2: fine-tuning top of EfficientNet-B0 base ===\n")
    base = model.layers[1]  # the EfficientNetB0 sub-model
    base.trainable = True
    for layer in base.layers[:STAGE2_UNFREEZE_FROM_LAYER]:
        layer.trainable = False

    compile_model(model, STAGE2_LEARNING_RATE)
    model.fit(
        train_ds,
        validation_data=val_ds,
        epochs=STAGE2_EPOCHS,
        callbacks=callbacks,
    )

    final_path = MODELS_DIR / "coral_vision_final.keras"
    model.save(final_path)

    # Save the class order alongside the model — export_tflite.py and
    # evaluate.py both read this rather than re-deriving it, so the label
    # order can never silently drift from what the model was trained on.
    with open(MODELS_DIR / "class_names.json", "w") as f:
        json.dump(SPECIES_IDS, f, indent=2)

    print(f"\nDone. Best checkpoint: {checkpoint_path}")
    print(f"Final model: {final_path}")


if __name__ == "__main__":
    main()
