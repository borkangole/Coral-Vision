import { View, Text, StyleSheet } from 'react-native';
import { color } from '../theme/tokens';
import { type, font } from '../theme/type';

// The answer: common name, binomial, and the confidence as the hero figure.
export default function MatchHeader({ eyebrow, name, scientificName, confidence, confidenceLabel = 'Model confidence' }) {
  const pct = confidence != null ? confidence * 100 : null;
  return (
    <View style={styles.wrap}>
      <Text style={type.label}>{eyebrow}</Text>
      <Text style={styles.name}>{name}</Text>
      {scientificName ? <Text style={styles.binomial}>{scientificName}</Text> : null}

      {pct != null ? (
        <View style={styles.confidence}>
          <View style={styles.figureRow}>
            <Text style={styles.figure}>{pct.toFixed(1)}</Text>
            <Text style={styles.unit}>%</Text>
            <Text style={[type.small, { color: color.ink3, marginLeft: 10, marginBottom: 6 }]}>{confidenceLabel}</Text>
          </View>
          <View style={styles.track}>
            <View style={[styles.fill, { width: `${Math.min(100, pct)}%` }]} />
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 28 },
  name: { ...type.title, fontSize: 30, lineHeight: 34, marginTop: 8 },
  binomial: { fontFamily: font.serifItalic, fontSize: 22, lineHeight: 26, color: color.ink2, marginTop: 2 },
  confidence: { marginTop: 22 },
  figureRow: { flexDirection: 'row', alignItems: 'flex-end' },
  figure: { fontFamily: font.sansSemi, fontSize: 44, lineHeight: 46, letterSpacing: -1.6, color: color.ink, fontVariant: ['tabular-nums'] },
  unit: { fontFamily: font.sansSemi, fontSize: 22, color: color.ink, marginBottom: 6, marginLeft: 2 },
  track: { height: 4, borderRadius: 2, backgroundColor: color.sunken, marginTop: 12, overflow: 'hidden' },
  fill: { height: 4, borderRadius: 2, backgroundColor: color.coral },
});
