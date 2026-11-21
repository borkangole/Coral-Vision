// =========================================================================
// LOCAL HISTORY STORAGE
// =========================================================================
// Persists identification records across app restarts using expo-file-system
// only (no @react-native-async-storage/async-storage — that community native
// module kept failing to link inside Expo Go on this project regardless of
// version pinning / clean reinstalls, so history is stored as a plain JSON
// file instead. expo-file-system is a first-party Expo module, bundled
// directly with the Expo SDK itself, so there's no separate native-module
// version to fall out of sync with Expo Go).
//
// Layout inside the app's permanent document directory:
//   history.json        — array of history records (metadata only)
//   history/<id>.<ext>   — the copied image for each record (ImagePicker/
//                          Camera URIs are temporary cache files that can be
//                          cleared by the OS — thumbnails would break
//                          without copying them somewhere permanent)
// =========================================================================

import { File, Directory, Paths } from 'expo-file-system';

const historyDir = new Directory(Paths.document, 'history');
const historyFile = new File(Paths.document, 'history.json');

function ensureHistoryDir() {
  if (!historyDir.exists) {
    historyDir.create({ intermediates: true });
  }
}

function readAllRecords() {
  try {
    if (!historyFile.exists) return [];
    const text = historyFile.textSync();
    return JSON.parse(text);
  } catch (error) {
    console.warn('Could not read history file, starting fresh:', error.message);
    return [];
  }
}

function writeAllRecords(records) {
  if (!historyFile.exists) {
    historyFile.create();
  }
  historyFile.write(JSON.stringify(records));
}

/**
 * Save a new identification to history. Copies the source image into
 * permanent app storage so it survives cache clears/app restarts.
 *
 * @param {object} params
 * @param {string} params.sourceImageUri - the temporary capture/gallery URI
 * @param {Array<{species: object, confidence: number}>} params.predictions - top-3 results
 * @param {{latitude:number, longitude:number, accuracy:number, capturedAt:string}|null} params.geoTag
 * @returns {Promise<object>} the saved record
 */
export async function saveHistoryRecord({ sourceImageUri, predictions, geoTag }) {
  ensureHistoryDir();

  const id = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const extension = sourceImageUri.split('.').pop()?.split('?')[0] || 'jpg';
  const destFile = new File(historyDir, `${id}.${extension}`);

  try {
    const sourceFile = new File(sourceImageUri);
    await sourceFile.copy(destFile);
  } catch (error) {
    console.warn('Could not copy image into permanent storage, keeping original URI:', error.message);
  }

  const savedImageUri = destFile.exists ? destFile.uri : sourceImageUri;
  const top = predictions[0];

  const record = {
    id,
    imageUri: savedImageUri,
    timestamp: new Date().toISOString(),
    predictions: predictions.map((p) => ({
      speciesId: p.species.id,
      commonName: p.species.commonName,
      scientificName: p.species.scientificName,
      conservationStatus: p.species.conservationStatus,
      confidence: p.confidence,
    })),
    topSpeciesId: top?.species.id ?? null,
    topCommonName: top?.species.commonName ?? null,
    topConfidence: top?.confidence ?? null,
    geoTag: geoTag || null,
  };

  const records = readAllRecords();
  records.unshift(record);
  writeAllRecords(records);

  return record;
}

// iOS can move the app's document folder (e.g. after an Expo Go update or
// reinstall), which breaks the absolute file:// paths saved in older records.
// Re-point each saved image at the current history folder by filename.
function resolveImageUri(uri) {
  if (!uri) return uri;
  try {
    const name = uri.split('/').pop();
    const current = new File(historyDir, name);
    if (current.exists) return current.uri;
  } catch (error) {
    // fall through to the stored uri
  }
  return uri;
}

/** Returns all saved history records, most recent first. */
export async function getHistory() {
  return readAllRecords().map((r) => ({ ...r, imageUri: resolveImageUri(r.imageUri) }));
}

/** Deletes one history record (and its stored image file) by id. */
export async function deleteHistoryRecord(id) {
  const records = readAllRecords();
  const target = records.find((r) => r.id === id);
  const remaining = records.filter((r) => r.id !== id);
  writeAllRecords(remaining);

  if (target?.imageUri) {
    try {
      const file = new File(resolveImageUri(target.imageUri));
      if (file.exists) file.delete();
    } catch (error) {
      console.warn('Could not delete history image file:', error.message);
    }
  }
}

/** Clears all history records and their stored images. */
export async function clearHistory() {
  writeAllRecords([]);
  try {
    if (historyDir.exists) historyDir.delete();
  } catch (error) {
    console.warn('Could not clear history directory:', error.message);
  }
}

/**
 * Development helper: wipes all history and writes the given sample records
 * (used by services/sampleData.js for demo screenshots).
 * Each sample: { sourceImageUri, predictions, geoTag, timestamp }.
 */
export async function replaceHistoryWithSamples(samples) {
  await clearHistory();
  ensureHistoryDir();

  const records = [];
  for (let i = 0; i < samples.length; i += 1) {
    const { sourceImageUri, predictions, geoTag, timestamp } = samples[i];
    const id = `${Date.parse(timestamp) || Date.now()}_sample${i}`;
    const extension = sourceImageUri.split('.').pop()?.split('?')[0] || 'jpg';
    const destFile = new File(historyDir, `${id}.${extension}`);
    try {
      await new File(sourceImageUri).copy(destFile);
    } catch (error) {
      console.warn('Could not copy sample image:', error.message);
    }
    const top = predictions[0];
    records.push({
      id,
      imageUri: destFile.exists ? destFile.uri : sourceImageUri,
      timestamp,
      predictions: predictions.map((p) => ({
        speciesId: p.species.id,
        commonName: p.species.commonName,
        scientificName: p.species.scientificName,
        conservationStatus: p.species.conservationStatus,
        confidence: p.confidence,
      })),
      topSpeciesId: top.species.id,
      topCommonName: top.species.commonName,
      topConfidence: top.confidence,
      geoTag,
    });
  }

  // Newest first, same as normal saves.
  records.sort((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp));
  writeAllRecords(records);
  return records;
}
