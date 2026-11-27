import { View, Text, StyleSheet } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { cardStyle } from './Section';
import { color, radius } from '../theme/tokens';
import { type, font } from '../theme/type';

// The specimen plate: the species presented like a museum label, followed by
// the adviser's 15 conservation fields and an offline QR code.

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

// IUCN category -> tinted chip (always labelled, never colour alone).
export function statusTone(status = '') {
  const s = status.toLowerCase();
  if (s.includes('critically')) return { bg: '#F8DEDC', fg: '#8E2620', dot: '#C0392F' };
  if (s.includes('endangered')) return { bg: '#FBE7DA', fg: '#8A4114', dot: '#D2702E' };
  if (s.includes('vulnerable')) return { bg: '#F7ECD8', fg: '#7A5512', dot: '#C9962C' };
  if (s.includes('near threatened')) return { bg: '#E2EEF2', fg: '#245A6C', dot: '#4F93AB' };
  if (s.includes('least concern')) return { bg: '#E2F0E8', fg: '#22603F', dot: '#3A9467' };
  return { bg: '#ECEAE5', fg: '#4E5568', dot: '#9AA1AF' };
}

export function StatusChip({ status }) {
  const t = statusTone(status);
  return (
    <View style={[styles.chip, { backgroundColor: t.bg }]}>
      <View style={[styles.chipDot, { backgroundColor: t.dot }]} />
      <Text style={[styles.chipText, { color: t.fg }]}>{status}</Text>
    </View>
  );
}

function Field({ label, value }) {
  if (!value) return null;
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Text style={styles.fieldValue}>{value}</Text>
    </View>
  );
}

function Chapter({ title, children }) {
  return (
    <View style={styles.chapter}>
      <Text style={styles.chapterTitle}>{title}</Text>
      {children}
    </View>
  );
}

export default function SpeciesProfile({ species, catalog }) {
  if (!species) return null;

  return (
    <View style={styles.plate}>
      <View style={styles.labelHead}>
        <Text style={type.label}>Specimen</Text>
        {catalog ? <Text style={styles.catalog}>{catalog}</Text> : null}
      </View>

      <Text style={styles.binomial}>{species.scientificName}</Text>
      <Text style={styles.common}>{species.commonName}</Text>
      <View style={{ flexDirection: 'row', marginTop: 12 }}>
        <StatusChip status={species.conservationStatus} />
      </View>

      <View style={styles.taxa}>
        <View style={styles.taxon}>
          <Text style={styles.fieldLabel}>Family</Text>
          <Text style={styles.taxonValue} numberOfLines={1} adjustsFontSizeToFit>
            {species.familyName}
          </Text>
        </View>
        <View style={[styles.taxon, styles.taxonRule]}>
          <Text style={styles.fieldLabel}>Genus</Text>
          <Text style={[styles.taxonValue, styles.italic]} numberOfLines={1}>
            {species.genus}
          </Text>
        </View>
        <View style={[styles.taxon, styles.taxonRule]}>
          <Text style={styles.fieldLabel}>Species</Text>
          <Text style={[styles.taxonValue, styles.italic]} numberOfLines={1}>
            {species.speciesEpithet}
          </Text>
        </View>
      </View>

      <Field label="Local name" value={species.localName} />

      <Chapter title="Identification">
        <Field label="Characters" value={species.characters} />
        <Field label="Colors" value={species.colors} />
        <Field label="Similar species" value={species.similarSpecies && species.similarSpecies.join(', ')} />
      </Chapter>

      <Chapter title="Ecology and status">
        <Field label="Habitat" value={species.habitat} />
        <Field label="Abundance" value={species.abundance} />
        <Field label="Distribution" value={species.distribution} />
        <Field label="Present health condition" value={species.healthCondition} />
        <Field label="Threats" value={species.threats} />
      </Chapter>

      <Chapter title="References">
        <Field label="Taxonomic reference" value={species.taxonomicReference} />
        <Field label="Identification guides" value={species.identificationGuides} />
      </Chapter>

      <View style={styles.qrRow}>
        <View style={styles.qrWell}>
          <QRCode value={buildQrPayload(species)} size={84} color={color.ink} backgroundColor={color.surface} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={type.bodyMedium}>Offline species card</Text>
          <Text style={[type.small, { marginTop: 3 }]}>
            Scan with any camera to read the key facts, no signal needed.
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  plate: { ...cardStyle, padding: 20 },
  labelHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  catalog: { ...type.label, color: color.ink2, fontVariant: ['tabular-nums'] },
  binomial: { fontFamily: font.serifItalic, fontSize: 32, lineHeight: 36, letterSpacing: -0.3, color: color.ink },
  common: { ...type.bodyMedium, color: color.ink2, marginTop: 4 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 5 },
  chipDot: { width: 6, height: 6, borderRadius: 3 },
  chipText: { fontFamily: font.sansSemi, fontSize: 12, letterSpacing: 0.1 },
  taxa: {
    flexDirection: 'row',
    marginTop: 20,
    paddingVertical: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: color.hairStrong,
  },
  taxon: { flex: 1, paddingRight: 8 },
  taxonRule: { paddingLeft: 12, borderLeftWidth: StyleSheet.hairlineWidth, borderLeftColor: color.hairStrong },
  taxonValue: { ...type.bodyMedium, marginTop: 4 },
  italic: { fontFamily: font.serifItalic, fontSize: 18 },
  chapter: { marginTop: 26 },
  chapterTitle: { fontFamily: font.serif, fontSize: 22, lineHeight: 26, color: color.ink, marginBottom: 2 },
  field: { marginTop: 14 },
  fieldLabel: { ...type.label, fontSize: 10, letterSpacing: 1.1 },
  fieldValue: { ...type.body, color: color.ink2, marginTop: 4 },
  qrRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginTop: 26,
    paddingTop: 20,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: color.hairStrong,
  },
  qrWell: { padding: 8, borderRadius: 12, borderWidth: StyleSheet.hairlineWidth, borderColor: color.hairStrong, backgroundColor: color.surface },
});
