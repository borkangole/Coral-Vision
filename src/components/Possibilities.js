import { View, Text, StyleSheet } from 'react-native';
import Group from './Section';
import { color } from '../theme/tokens';
import { type, font } from '../theme/type';

// Runner-up matches as a quiet list with thin bars.
// rows: [{ key, name, scientificName, confidence }]
export default function Possibilities({ rows }) {
  if (!rows.length) return null;
  return (
    <Group label="Other possibilities" flush>
      {rows.map((r, i) => (
        <View key={r.key} style={[styles.row, i > 0 && styles.rule]}>
          <View style={styles.top}>
            <View style={{ flex: 1 }}>
              <Text style={type.bodyMedium}>{r.name}</Text>
              {r.scientificName ? <Text style={styles.binomial}>{r.scientificName}</Text> : null}
            </View>
            <Text style={styles.pct}>{(r.confidence * 100).toFixed(1)}%</Text>
          </View>
          <View style={styles.track}>
            <View style={[styles.fill, { width: `${Math.max(1.5, r.confidence * 100)}%` }]} />
          </View>
        </View>
      ))}
    </Group>
  );
}

const styles = StyleSheet.create({
  row: { paddingHorizontal: 16, paddingVertical: 14 },
  rule: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: color.hairStrong },
  top: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  binomial: { ...type.binomial, fontSize: 15, lineHeight: 19 },
  pct: { fontFamily: font.sansMedium, fontSize: 14, color: color.ink2, fontVariant: ['tabular-nums'] },
  track: { height: 4, borderRadius: 2, backgroundColor: color.sunken, marginTop: 10, overflow: 'hidden' },
  fill: { height: 4, borderRadius: 2, backgroundColor: color.ink3 },
});
