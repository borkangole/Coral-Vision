// =========================================================================
// SAMPLE DATA (development / screenshots only)
// =========================================================================
// Replaces the whole history with demo identifications so the Dashboard,
// History and Map screens can be shown with realistic content. The user
// picks the photos from their own gallery; species, confidence, dates and
// locations are filled in from the tables below. Every location is a coastal
// reef spot around Panay Island (Capiz, Iloilo, Antique).
// =========================================================================

import * as ImagePicker from 'expo-image-picker';
import SPECIES from '../config/species';
import { replaceHistoryWithSamples } from './storage';

const PANAY_SITES = [
  { name: 'Olotayan Island, Roxas City, Capiz', latitude: 11.6395, longitude: 122.799 },
  { name: 'Baybay reef, Roxas City, Capiz', latitude: 11.602, longitude: 122.746 },
  { name: 'Basiao, Ivisan, Capiz', latitude: 11.556, longitude: 122.668 },
  { name: 'Pilar Bay, Pilar, Capiz', latitude: 11.499, longitude: 123.005 },
  { name: 'Sicogon Island, Carles, Iloilo', latitude: 11.457, longitude: 123.256 },
  { name: 'Pan de Azucar, Concepcion, Iloilo', latitude: 11.239, longitude: 123.125 },
  { name: 'Nogas Island, Anini-y, Antique', latitude: 10.423, longitude: 121.927 },
  { name: 'Pandan Bay, Pandan, Antique', latitude: 11.733, longitude: 122.062 },
];

const TOP_CONFIDENCE = [0.931, 0.874, 0.962, 0.818, 0.905, 0.887, 0.948, 0.792];

function buildPredictions(index) {
  const top = SPECIES[index % SPECIES.length];
  const second = SPECIES[(index + 3) % SPECIES.length];
  const third = SPECIES[(index + 5) % SPECIES.length];
  const c1 = TOP_CONFIDENCE[index % TOP_CONFIDENCE.length];
  const rest = 1 - c1;
  return [
    { species: top, confidence: c1 },
    { species: second, confidence: +(rest * 0.68).toFixed(3) },
    { species: third, confidence: +(rest * 0.22).toFixed(3) },
  ];
}

function buildTimestamp(index) {
  // Spread over the last few weeks, newest first, daytime dive hours.
  const d = new Date();
  d.setDate(d.getDate() - index * 3 - 1);
  d.setHours(8 + ((index * 3) % 8), (index * 17) % 60, 0, 0);
  return d.toISOString();
}

/**
 * Lets the user pick up to 8 photos, then replaces all history with sample
 * records built from them. Returns the number of records created (0 if the
 * user cancelled).
 */
export async function loadSampleData() {
  const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!perm.granted) throw new Error('Photo library permission is needed to pick sample photos.');

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsMultipleSelection: true,
    selectionLimit: PANAY_SITES.length,
    orderedSelection: true,
    quality: 0.85,
  });
  if (result.canceled || !result.assets?.length) return 0;

  const samples = result.assets.slice(0, PANAY_SITES.length).map((asset, i) => {
    const site = PANAY_SITES[i];
    const timestamp = buildTimestamp(i);
    return {
      sourceImageUri: asset.uri,
      predictions: buildPredictions(i),
      timestamp,
      geoTag: {
        latitude: site.latitude,
        longitude: site.longitude,
        accuracy: 8 + i,
        capturedAt: timestamp,
        source: 'device',
        placeName: site.name,
      },
    };
  });

  await replaceHistoryWithSamples(samples);
  return samples.length;
}
