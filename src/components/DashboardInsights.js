import { View, Text, StyleSheet, Pressable } from 'react-native';
import Group from './Section';
import Icon from './Icon';
import SPECIES, { getSpeciesById } from '../config/species';
import { color, radius } from '../theme/tokens';
import { type, font } from '../theme/type';
import { placeLabel } from '../utils/format';

export const THREAT_SPECIES_ID = 'crown_of_thorns_starfish';
export const LOW_CONFIDENCE = 0.8;

// IUCN buckets in severity order; every bucket is labelled in text.
const STATUS_BUCKETS = [
  { key: 'CR', label: 'Critically Endangered', color: '#C0392F', match: 'critically' },
  { key: 'EN', label: 'Endangered', color: '#D2702E', match: 'endangered' },
  { key: 'VU', label: 'Vulnerable', color: '#C9962C', match: 'vulnerable' },
  { key: 'NT', label: 'Near Threatened', color: '#4F93AB', match: 'near threatened' },
  { key: 'LC', label: 'Least Concern', color: '#3A9467', match: 'least concern' },
  { key: 'NE', label: 'Not Evaluated', color: '#B4B9C3', match: null },
];
const THREATENED = ['CR', 'EN', 'VU'];

function bucketFor(status = '') {
  const s = status.toLowerCase();
  return STATUS_BUCKETS.find((b) => b.match && s.includes(b.match)) || STATUS_BUCKETS[5];
}

function statusOf(record) {
  const species = getSpeciesById(record.topSpeciesId);
  return species?.conservationStatus || record.predictions?.[0]?.conservationStatus || '';
}

/** Shown only when crown-of-thorns starfish have been recorded. */
export function ThreatAlert({ records, onPress }) {
  const sightings = records.filter((r) => r.topSpeciesId === THREAT_SPECIES_ID);
  if (sightings.length === 0) return null;
  const sites = [...new Set(sightings.map((r) => placeLabel(r.geoTag)).filter(Boolean))];

  return (
    <Pressable onPress={onPress} accessibilityRole="button" style={{ marginBottom: 28 }}>
      {({ pressed }) => (
        <View style={[styles.alert, pressed && { opacity: 0.85 }]}>
          <Icon name="alert" size={20} color={color.alert} />
          <View style={{ flex: 1 }}>
            <Text style={[type.bodyMedium, { color: '#7E2A25' }]}>
              {sightings.length} crown-of-thorns {sightings.length === 1 ? 'sighting' : 'sightings'}
            </Text>
            <Text style={[type.small, { color: '#8E4440', marginTop: 1 }]} numberOfLines={1}>
              {sites.length ? sites.join(', ') : 'Location not recorded'}
            </Text>
          </View>
          <Icon name="chevron" size={16} color="#B07470" strokeWidth={2} />
        </View>
      )}
    </Pressable>
  );
}

/** Finds by IUCN category: one bar, legend as a list. */
export function ConservationStatus({ records }) {
  if (records.length === 0) return null;
  const counts = {};
  records.forEach((r) => {
    const b = bucketFor(statusOf(r));
    counts[b.key] = (counts[b.key] || 0) + 1;
  });
  const present = STATUS_BUCKETS.filter((b) => counts[b.key]);
  const threatened = THREATENED.reduce((n, k) => n + (counts[k] || 0), 0);

  return (
    <Group label="Conservation status">
      <View style={styles.figureRow}>
        <Text style={styles.figure}>{threatened}</Text>
        <Text style={[type.small, { flex: 1 }]}>
          of {records.length} finds are threatened species{'\n'}
          <Text style={{ color: color.ink3 }}>Vulnerable, Endangered or Critically Endangered</Text>
        </Text>
      </View>
      <View style={styles.stack}>
        {present.map((b) => (
          <View key={b.key} style={{ flex: counts[b.key], backgroundColor: b.color }} />
        ))}
      </View>
      {present.map((b) => (
        <View key={b.key} style={styles.legendRow}>
          <View style={[styles.legendDot, { backgroundColor: b.color }]} />
          <Text style={[type.small, { flex: 1, color: color.ink }]}>{b.label}</Text>
          <Text style={styles.count}>{counts[b.key]}</Text>
        </View>
      ))}
    </Group>
  );
}

/** Finds per species, ranked, with target-species coverage. */
export function SpeciesBreakdown({ records, onSelect }) {
  if (records.length === 0) return null;
  const counts = {};
  records.forEach((r) => {
    if (r.topSpeciesId) counts[r.topSpeciesId] = (counts[r.topSpeciesId] || 0) + 1;
  });
  const rows = Object.entries(counts)
    .map(([id, count]) => ({ id, count, name: getSpeciesById(id)?.commonName || id }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
  const max = rows[0]?.count || 1;

  return (
    <Group label="Finds by species" note={`${rows.length} of ${SPECIES.length} recorded`}>
      {rows.map((row, i) => (
        <Pressable key={row.id} onPress={() => onSelect(row)} accessibilityRole="button">
          {({ pressed }) => (
            <View style={[styles.speciesRow, i > 0 && { marginTop: 12 }, pressed && { opacity: 0.55 }]}>
              <View style={styles.speciesTop}>
                <Text style={[type.small, { color: color.ink, flex: 1 }]} numberOfLines={1}>
                  {row.name}
                </Text>
                <Text style={styles.count}>{row.count}</Text>
              </View>
              <View style={styles.track}>
                <View
                  style={[
                    styles.fill,
                    {
                      width: `${(row.count / max) * 100}%`,
                      backgroundColor: row.id === THREAT_SPECIES_ID ? color.alert : color.ink,
                    },
                  ]}
                />
              </View>
            </View>
          )}
        </Pressable>
      ))}
    </Group>
  );
}

/** Average model confidence and how many finds deserve a second look. */
export function ConfidenceCheck({ records, onReview }) {
  const scored = records.filter((r) => r.topConfidence != null);
  if (scored.length === 0) return null;
  const avg = scored.reduce((s, r) => s + r.topConfidence, 0) / scored.length;
  const low = scored.filter((r) => r.topConfidence < LOW_CONFIDENCE).length;

  return (
    <Group label="Model confidence">
      <View style={styles.confRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.figure}>{(avg * 100).toFixed(1)}%</Text>
          <Text style={[type.small, { color: color.ink3 }]}>Average top match</Text>
        </View>
        <View style={styles.vRule} />
        <View style={{ flex: 1 }}>
          <Text style={[styles.figure, low > 0 && { color: color.amber }]}>{low}</Text>
          <Text style={[type.small, { color: color.ink3 }]}>Below {LOW_CONFIDENCE * 100}%</Text>
        </View>
      </View>
      {low > 0 ? (
        <Pressable onPress={onReview} accessibilityRole="button">
          {({ pressed }) => (
            <View style={[styles.reviewRow, pressed && { opacity: 0.6 }]}>
              <Text style={[type.smallMedium, { flex: 1, color: color.ink }]}>
                Review {low} {low === 1 ? 'find' : 'finds'} against a field guide
              </Text>
              <Icon name="chevron" size={16} color={color.ink3} strokeWidth={2} />
            </View>
          )}
        </Pressable>
      ) : null}
    </Group>
  );
}

const styles = StyleSheet.create({
  alert: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: color.alertSoft,
    borderRadius: radius.md,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  figureRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  figure: { fontFamily: font.sansSemi, fontSize: 30, lineHeight: 34, letterSpacing: -0.8, color: color.ink, fontVariant: ['tabular-nums'] },
  stack: { flexDirection: 'row', height: 8, borderRadius: 4, overflow: 'hidden', gap: 2, marginBottom: 8 },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingTop: 8 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  count: { fontFamily: font.sansSemi, fontSize: 13, color: color.ink, fontVariant: ['tabular-nums'] },
  speciesRow: {},
  speciesTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  track: { height: 5, borderRadius: 3, backgroundColor: color.sunken, overflow: 'hidden' },
  fill: { height: 5, borderRadius: 3 },
  confRow: { flexDirection: 'row', alignItems: 'center' },
  vRule: { width: StyleSheet.hairlineWidth, alignSelf: 'stretch', backgroundColor: color.hairStrong, marginHorizontal: 16 },
  reviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: color.hairStrong,
  },
});
