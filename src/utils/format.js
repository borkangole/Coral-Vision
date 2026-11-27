// Shared display helpers for records.

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function catalogNumber(record) {
  const tail = String(record?.id || '').replace(/[^a-z0-9]/gi, '').slice(-4).toUpperCase();
  return `CV-${tail || '0000'}`;
}

export function placeLabel(geoTag) {
  if (!geoTag) return null;
  if (geoTag.placeName) return geoTag.placeName.split(',')[0];
  return `${geoTag.latitude.toFixed(3)}, ${geoTag.longitude.toFixed(3)}`;
}

export function shortDate(iso) {
  const d = new Date(iso);
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

export function longDate(iso) {
  const d = new Date(iso);
  const time = d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()} · ${time}`;
}

export function monthKey(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString([], { month: 'long', year: 'numeric' });
}

export function percent(confidence, digits = 1) {
  return `${(confidence * 100).toFixed(digits)}%`;
}
