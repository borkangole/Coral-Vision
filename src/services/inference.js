// =========================================================================
// INFERENCE SERVICE
// =========================================================================
// Today (no trained model yet): runs in MOCK MODE, returning randomized-but-
// plausible top-3 predictions so the rest of the app (capture -> result ->
// history -> dashboard) is fully buildable and demoable before the real
// EfficientNet-B0 model exists.
//
// Once /training/train_efficientnet_b0.py has produced a trained model:
//   1. Convert it to TensorFlow Lite (the training script already does this
//      — outputs coral_efficientnet_b0.tflite)
//   2. Drop that file into assets/model/coral_efficientnet_b0.tflite
//   3. Run: npx expo install react-native-fast-tflite
//      (NOTE: this is a native module — it will NOT run inside plain Expo Go.
//      You need a custom dev client / EAS build: `eas build --profile development`,
//      matching the eas.json already in this project.)
//   4. Set USE_MOCK_MODEL = false below and uncomment the real-model code path.
// =========================================================================

import SPECIES from '../config/species';

export const USE_MOCK_MODEL = true;

// ---- MOCK PREDICTION (default, works in plain Expo Go) --------------------
async function mockPredict() {
  // Simulate model latency
  await new Promise((resolve) => setTimeout(resolve, 900));

  // Pick a random "true" class, then generate a plausible confidence spread
  const shuffled = [...SPECIES].sort(() => Math.random() - 0.5);
  const top = shuffled.slice(0, 3);

  const primary = 0.72 + Math.random() * 0.27; // 72–99%
  const remainder = 1 - primary;
  const second = remainder * (0.5 + Math.random() * 0.3);
  const third = remainder - second;

  const raw = [primary, second, third];

  return top.map((species, i) => ({
    species,
    confidence: raw[i],
  }));
}

// ---- REAL MODEL PREDICTION (enable once you have a trained .tflite) -------
// import { loadTensorflowModel } from 'react-native-fast-tflite';
//
// let cachedModel = null;
// const MODEL_INPUT_SIZE = 224; // EfficientNet-B0 default input resolution
//
// async function loadModel() {
//   if (!cachedModel) {
//     cachedModel = await loadTensorflowModel(
//       require('../../assets/model/coral_efficientnet_b0.tflite')
//     );
//   }
//   return cachedModel;
// }
//
// async function realPredict(imageUri) {
//   const model = await loadModel();
//   // Preprocess imageUri into a Float32Array [1, 224, 224, 3], normalized 0–1
//   // (use e.g. expo-image-manipulator to resize, then a decode step to get
//   // raw RGB pixel data — see training script's preprocessing for exact
//   // normalization to match, e.g. rescale=1/255 vs EfficientNet's own
//   // preprocess_input).
//   const inputTensor = await preprocessImageForModel(imageUri, MODEL_INPUT_SIZE);
//   const outputs = model.runSync([inputTensor]);
//   const probabilities = outputs[0]; // Float32Array of length SPECIES.length
//
//   return Array.from(probabilities)
//     .map((confidence, index) => ({ species: SPECIES[index], confidence }))
//     .sort((a, b) => b.confidence - a.confidence)
//     .slice(0, 3);
// }

/**
 * Identify a coral image. Returns top-3 predictions sorted by confidence.
 * @param {string} imageUri - local file URI of the captured/selected photo
 * @returns {Promise<Array<{species: object, confidence: number}>>}
 */
export async function identifyImage(imageUri) {
  if (USE_MOCK_MODEL) {
    return mockPredict();
  }
  // return realPredict(imageUri);
  throw new Error(
    'Real model path not wired up yet — set USE_MOCK_MODEL = true, or follow the steps in inference.js to enable it.'
  );
}
