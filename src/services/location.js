import * as Location from 'expo-location';
import { Asset, requestPermissionsAsync as requestMediaLibraryPermissionsAsync } from 'expo-media-library';

/**
 * Requests permission (if needed) and returns the device's current GPS
 * coordinates. Returns null if permission is denied or location can't be
 * determined (e.g. GPS off) — callers should treat a null geoTag as
 * "not recorded" rather than fail the whole identification.
 */
export async function getCurrentGeoTag() {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      return null;
    }

    const position = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    return {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy,
      capturedAt: safeIsoDate(position.timestamp),
      source: 'device',
    };
  } catch (error) {
    console.warn('Could not get geo-tag:', error.message);
    return null;
  }
}

// Safely converts a timestamp (a Date, a millisecond number, an ISO string,
// or an EXIF-style "YYYY:MM:DD HH:MM:SS" string) into an ISO string. EXIF
// dates use colons instead of dashes in the date portion, which `Date`
// can't parse directly — feeding that straight into `.toISOString()` throws
// a "Date value out of bounds" RangeError instead of just failing quietly.
// Returns null instead of throwing for anything unparseable.
function safeIsoDate(raw) {
  if (!raw) return null;
  try {
    let normalized = raw;
    if (typeof raw === 'string') {
      normalized = raw.replace(/^(\d{4}):(\d{2}):(\d{2})/, '$1-$2-$3');
    }
    const date = new Date(normalized);
    if (Number.isNaN(date.getTime())) return null;
    return date.toISOString();
  } catch (error) {
    return null;
  }
}

// Some EXIF readers (and some photo sources) give latitude/longitude as
// already-signed decimal degrees; others give an unsigned magnitude plus a
// separate hemisphere reference ('N'/'S'/'E'/'W'). This normalizes both.
function applyHemisphere(value, ref) {
  if (value == null) return null;
  const magnitude = Math.abs(value);
  if (ref === 'S' || ref === 'W') return -magnitude;
  if (ref === 'N' || ref === 'E') return magnitude;
  // No ref given — trust the sign already on the value.
  return value;
}

/**
 * Extracts a GPS geo-tag from an image's EXIF data (as returned by
 * expo-image-picker when `exif: true` is passed). This is how the app
 * supports "a photo taken before" — a gallery-picked photo that already has
 * a location embedded in it from when it was originally taken, rather than
 * the device's current live position.
 *
 * Returns null if the EXIF has no usable GPS tags. Note: iOS never includes
 * GPS EXIF for photos taken directly with the Camera app (Apple strips it),
 * so this will mainly find results on Android photos or images that were
 * already saved/shared with location data intact. It also won't find GPS on
 * genuinely underwater shots, since GPS signals don't reach underwater —
 * this is only useful for above-water / gallery photos.
 */
export function extractGeoTagFromExif(exif) {
  if (!exif) return null;

  const rawLat = exif.GPSLatitude ?? exif.gpsLatitude;
  const rawLng = exif.GPSLongitude ?? exif.gpsLongitude;
  if (rawLat == null || rawLng == null) return null;

  const latitude = applyHemisphere(rawLat, exif.GPSLatitudeRef ?? exif.gpsLatitudeRef);
  const longitude = applyHemisphere(rawLng, exif.GPSLongitudeRef ?? exif.gpsLongitudeRef);

  if (
    typeof latitude !== 'number' ||
    typeof longitude !== 'number' ||
    Number.isNaN(latitude) ||
    Number.isNaN(longitude) ||
    (latitude === 0 && longitude === 0)
  ) {
    return null;
  }

  const timestamp = exif.GPSDateStamp || exif.DateTimeOriginal || exif.DateTime;

  return {
    latitude,
    longitude,
    accuracy: null,
    capturedAt: safeIsoDate(timestamp),
    source: 'exif',
  };
}

/**
 * Looks up the location of a photo already in the device's photo library,
 * using its media-library asset ID (expo-image-picker returns this as
 * `assetId` for gallery picks). This is the *reliable* way to recover a
 * "photo taken before"'s location on iOS: the Photos library keeps the
 * location as part of the asset's own record, separate from the image file.
 * iOS strips GPS out of the actual image data handed to the picker as a
 * privacy measure, which is why reading it straight from EXIF (see
 * `extractGeoTagFromExif` above) comes back empty even for photos that
 * clearly have a location pin in the Photos app.
 *
 * Requires photo-library permission (prompted here if not already granted).
 * Returns null if there's no assetId, permission is denied, the asset has
 * no location, or the media-library module isn't available.
 */
export async function getGeoTagFromLibraryAsset(assetId) {
  if (!assetId) return null;

  try {
    const permission = await requestMediaLibraryPermissionsAsync();
    if (!permission.granted && permission.accessPrivileges === 'none') {
      return null;
    }

    const asset = new Asset(assetId);
    const location = await asset.getLocation();
    if (!location || (location.latitude === 0 && location.longitude === 0)) {
      return null;
    }

    return {
      latitude: location.latitude,
      longitude: location.longitude,
      accuracy: null,
      capturedAt: null,
      source: 'photo-library',
    };
  } catch (error) {
    console.warn('Could not get geo-tag from photo library asset:', error.message);
    return null;
  }
}
