import { View, Text, StyleSheet, Pressable } from 'react-native';
import Section from './Section';
import SPECIES, { getSpeciesById } from '../config/species';
import colors from '../theme/colors';
import { numeric } from '../theme/type';

export const THREAT_SPECIES_ID = 'crown_of_thorns_starfish';
export const LOW_CONFIDENCE = 0.8;

// IUCN buckets in severity order. Colours are solid versions of the badge
// colours in SpeciesProfile; every bucket is also labelled in text.
const STATUS_BUCKETS = [
  { key: 'CR', label: 'Critically Endangered', color: '#C9413E', match: 'critically' },
  { key: 'EN', label: 'Endangered', color: '#E07A3F', match: 'endangered' },
  { key: 'VU', label: 'Vulnerable', color: '#E0A53B', match: 'vulnerable' },
  { key: 'NT', label: 'Near Threatened', color: '#5FA3BF', match: 'near threatened' },
  { key: 'LC', label: 'Least Concern', color: '#3E9E70', match: 'least concern' },
  { key: 'NE', label: 'Not Evaluated', color: '#B8C2D6', match: null },
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

function siteLabel(record) {
  const g = record.geoTag;
  if (!g) return null;
  if (g.placeName) return g.placeName.split(',')[0];
  return `${g.latitude.toFixed(3)}, ${g.longitude.toFixed(3)}`;
}

function Link({ label, onPress }) {
  return (
    <Pressable onPress={onPress} hitSlop={8}>
      <Text style={styles.link}>{label}</Text>
    </Pressable>
  );
}

/** Red card, only rendered when crown-of-thorns starfish have been recorded. */
export function ThreatAlert({ records, onPress }) {
  const sightings = records.filter((r) => r.topSpeciesId === THREAT_SPECIES_ID);
  if (sightings.length === 0) return null;
  const sites = [...new Set(sightings.map(siteLabel).filter(Boolean))];

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.alert, pressed && { opacity: 0.85 }]}
      accessibilityRole="button"
    >
      <View style={styles.alertMark}>
        <Text style={styles.alertMarkText}>!</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.alertTitle}>
          {sightings.length} crown-of-thorns {sightings.length === 1 ? 'sighting' : 'sightings'}
        </Text>
        <Text style={styles.alertText} numberOfLines={2}>
          {sites.length ? sites.join(' · ') : 'Location not recorded'}
        </Text>
      </View>
      <Text style={styles.alertChevron}>›</Text>
    </Pressable>
  );
}

/** One stacked bar of finds by IUCN category, with a labelled legend. */
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
    <Section title="Conservation status">
      <Text style={styles.headline}>
        <Text style={[styles.headlineNum, numeric]}>{threatened}</Text> of {records.length} finds are
        threatened species
      </Text>
      <View style={styles.stackBar}>
        {present.map((b) => (
          <View key={b.key} style={{ flex: counts[b.key], backgroundColor: b.color }} />
        ))}
      </View>
      <View style={styles.legend}>
        {present.map((b) => (
          <View key={b.key} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: b.color }]} />
            <Text style={styles.legendText}>
              {b.label} <Text style={[styles.legendCount, numeric]}>{counts[b.key]}</Text>
            </Text>
          </View>
        ))}
      </View>
      <Text style={styles.footnote}>Threatened = Vulnerable, Endangered or Critically Endangered (IUCN).</Text>
    </Section>
  );
}

/** Ranked list of finds per species plus target-species coverage. */
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
    <Section title="Finds per species">
      <Text style={styles.headline}>
        <Text style={[styles.headlineNum, numeric]}>{rows.length}</Text> of {SPECIES.length} target
        species recorded
      </Text>
      {rows.map((row) => (
        <Pressable
          key={row.id}
          onPress={() => onSelect(row)}
          style={({ pressed }) => [styles.speciesRow, pressed && { opacity: 0.6 }]}
          accessibilityRole="button"
        >
          <Text style={styles.speciesName} numberOfLines={1}>
            {row.name}
          </Text>
          <View style={styles.track}>
            <View
              style={[
                styles.fill,
                {
                  width: `${(row.count / max) * 100}%`,
                  backgroundColor: row.id === THREAT_SPECIES_ID ? colors.danger : colors.navy500,
                },
              ]}
            />
          </View>
          <Text style={[styles.speciesCount, numeric]}>{row.count}</Text>
        </Pressable>
      ))}
    </Section>
  );
}

/** Average model confidence and how many finds should be double-checked. */
export function ConfidenceCheck({ records, onReview }) {
  const scored = records.filter((r) => r.topConfidence != null);
  if (scored.length === 0) return null;
  const avg = scored.reduce((s, r) => s + r.topConfidence, 0) / scored.length;
  const low = scored.filter((r) => r.topConfidence < LOW_CONFIDENCE).length;

  return (
    <Section title="Identification confidence">
      <View style={styles.confRow}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.confValue, numeric]}>{(avg * 100).toFixed(1)}%</Text>
          <Text style={styles.confLabel}>Average top-match confidence</Text>
        </View>
        <View style={styles.confDivider} />
        <View style={{ flex: 1 }}>
          <Text style={[styles.confValue, numeric, low > 0 && { color: colors.warning }]}>{low}</Text>
          <Text style={styles.confLabel}>Below {LOW_CONFIDENCE * 100}%</Text>
        </View>
      </View>
      {low > 0 ? (
        <View style={styles.confFooter}>
          <Text style={styles.footnoteInline}>Worth checking against a field guide.</Text>
          <Link label={`Review ${low} →`} onPress={onReview} />
        </View>
      ) : (
        <Text style={styles.footnote}>All saved finds are at or above {LOW_CONFIDENCE * 100}%.</Text>
      )}
    </Section>
  );
}

const styles = StyleSheet.create({
  link: { fontSize: 13, fontWeight: '700', color: colors.coral600 },

  alert: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FDECEC',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#F3C4C4',
    padding: 14,
    marginBottom: 12,
  },
  alertMark: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertMarkText: { color: colors.white, fontSize: 17, fontWeight: '800' },
  alertTitle: { fontSize: 15, fontWeight: '700', color: '#8A1F1F' },
  alertText: { fontSize: 13, color: '#8A1F1F', marginTop: 2, opacity: 0.8 },
  alertChevron: { fontSize: 24, color: '#8A1F1F', opacity: 0.6 },

  headline: { fontSize: 14, color: colors.inkMuted, marginBottom: 12 },
  headlineNum: { fontSize: 15, fontWeight: '700', color: colors.ink },
  stackBar: { flexDirection: 'row', height: 12, borderRadius: 6, overflow: 'hidden', gap: 2 },
  legend: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 12, columnGap: 16, rowGap: 6 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 9, height: 9, borderRadius: 5 },
  legendText: { fontSize: 13, color: colors.ink },
  legendCount: { fontWeight: '700' },
  footnote: { fontSize: 12, color: colors.inkMuted, marginTop: 12 },

  speciesRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 6 },
  speciesName: { width: 118, fontSize: 13.5, color: colors.ink },
  track: { flex: 1, height: 8, borderRadius: 4, backgroundColor: colors.mist, overflow: 'hidden' },
  fill: { height: 8, borderRadius: 4 },
  speciesCount: { width: 20, textAlign: 'right', fontSize: 13.5, fontWeight: '700', color: colors.ink },

  confRow: { flexDirection: 'row', alignItems: 'center' },
  confDivider: { width: 1, alignSelf: 'stretch', backgroundColor: colors.line, marginHorizontal: 14 },
  confValue: { fontSize: 24, fontWeight: '700', color: colors.navy700 },
  confLabel: { fontSize: 12, color: colors.inkMuted, marginTop: 2 },
  confFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  footnoteInline: { fontSize: 12, color: colors.inkMuted, flex: 1 },
});
