import { View, Text, StyleSheet } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import colors from '../theme/colors';

// Builds the text payload encoded into each species' QR code. Kept compact
// (core ID facts only) so the QR stays easy to scan. Since the app is meant
// to work at dive sites with no signal, this encodes the info directly
// rather than a URL — it's readable offline with any QR scanner, not just
// inside this app. If a public species-profile web page exists later, swap
// this for that page's URL instead.
function buildQrPayload(species) {
  return [
    `Coral Vision — Species Profile`,
    `Scientific name: ${species.scientificName}`,
    `Common name: ${species.commonName}`,
    `Family: ${species.familyName}`,
    `Genus: ${species.genus}`,
    `IUCN status: ${species.conservationStatus}`,
    `Distribution: ${species.distribution}`,
    `Ref: Corals of the World (coralsoftheworld.org)`,
  ].join('\n');
}

// IUCN category -> badge colours (tinted background, dark text, so it reads
// at a glance without relying on colour alone: the label is always shown).
function statusColors(status = '') {
  const s = status.toLowerCase();
  if (s.includes('critically')) return { bg: '#FADCDC', fg: '#8A1F1F' };
  if (s.includes('endangered')) return { bg: '#FCE5D6', fg: '#8A3B10' };
  if (s.includes('vulnerable')) return { bg: '#FBF0D9', fg: '#7A5410' };
  if (s.includes('near threatened')) return { bg: '#E1F0F5', fg: '#1F5F73' };
  if (s.includes('least concern')) return { bg: '#E0F3E8', fg: '#1E6B45' };
  return { bg: '#E9ECF3', fg: '#46526E' }; // Not Evaluated / unknown
}

function Field({ label, value, italic }) {
  if (!value) return null;
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Text style={[styles.fieldValue, italic && styles.italic]}>{value}</Text>
    </View>
  );
}

function GroupTitle({ children }) {
  return (
    <View style={styles.groupTitleRow}>
      <Text style={styles.groupTitle}>{children}</Text>
      <View style={styles.groupRule} />
    </View>
  );
}

export default function SpeciesProfile({ species }) {
  if (!species) return null;
  const badge = statusColors(species.conservationStatus);

  return (
    <View>
      <View style={styles.titleRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.commonName}>{species.commonName}</Text>
          <Text style={styles.scientificName}>{species.scientificName}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: badge.bg }]}>
          <Text style={[styles.statusBadgeText, { color: badge.fg }]}>{species.conservationStatus}</Text>
        </View>
      </View>

      <View style={styles.taxonomyRow}>
        <View style={styles.taxCell}>
          <Text style={styles.fieldLabel}>Family</Text>
          <Text style={styles.taxValue}>{species.familyName}</Text>
        </View>
        <View style={styles.taxCell}>
          <Text style={styles.fieldLabel}>Genus</Text>
          <Text style={styles.taxValue}>{species.genus}</Text>
        </View>
        <View style={styles.taxCell}>
          <Text style={styles.fieldLabel}>Species</Text>
          <Text style={[styles.taxValue, styles.italic]}>{species.speciesEpithet}</Text>
        </View>
      </View>

      <Field label="Local / Common Name" value={species.localName || species.commonName} />

      <GroupTitle>Identification</GroupTitle>
      <Field label="Characters" value={species.characters} />
      <Field label="Colors" value={species.colors} />
      <Field
        label="Similar Species"
        value={species.similarSpecies && species.similarSpecies.join(', ')}
      />

      <GroupTitle>Ecology and status</GroupTitle>
      <Field label="Habitat" value={species.habitat} />
      <Field label="Abundance" value={species.abundance} />
      <Field label="Distribution" value={species.distribution} />
      <Field label="Present Health Condition" value={species.healthCondition} />
      <Field label="Threats" value={species.threats} />

      <GroupTitle>References</GroupTitle>
      <Field label="Taxonomic Reference" value={species.taxonomicReference} />
      <Field label="Identification Guides" value={species.identificationGuides} />

      <View style={styles.qrSection}>
        <Text style={styles.fieldLabel}>Scan for species info</Text>
        <View style={styles.qrBox}>
          <QRCode value={buildQrPayload(species)} size={140} />
                  </View>
        <Text style={styles.qrHint}>Works offline — encodes the key facts above.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  titleRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 14, gap: 10 },
  commonName: { fontSize: 20, fontWeight: '700', color: colors.ink },
  scientificName: { fontSize: 14, fontStyle: 'italic', color: colors.inkMuted, marginTop: 2 },
  statusBadge: { borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5, maxWidth: 140 },
  statusBadgeText: { fontSize: 12, fontWeight: '700', textAlign: 'center' },
  taxonomyRow: {
    flexDirection: 'row',
    backgroundColor: colors.mist,
    borderRadius: 14,
    padding: 12,
    gap: 10,
  },
  taxCell: { flex: 1 },
  taxValue: { fontSize: 14, fontWeight: '600', color: colors.ink, marginTop: 3 },
  italic: { fontStyle: 'italic' },
  groupTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 22 },
  groupTitle: { fontSize: 14, fontWeight: '700', color: colors.navy700 },
  groupRule: { flex: 1, height: 1, backgroundColor: colors.line },
  field: { marginTop: 12 },
  fieldLabel: { fontSize: 12, fontWeight: '600', color: colors.inkMuted },
  fieldValue: { fontSize: 15, color: colors.ink, marginTop: 2, lineHeight: 21 },
  qrSection: { alignItems: 'center', marginTop: 24, paddingTop: 20, borderTopWidth: 1, borderTopColor: colors.line },
  qrBox: { marginTop: 12, padding: 14, backgroundColor: colors.white, borderRadius: 14, borderWidth: 1, borderColor: colors.line },
  qrHint: { fontSize: 12, color: colors.inkMuted, marginTop: 10 },
});
