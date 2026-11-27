import { View, Text, StyleSheet, Image, Pressable } from 'react-native';
import Icon from './Icon';
import { color } from '../theme/tokens';
import { type, font } from '../theme/type';
import { placeLabel, shortDate, percent } from '../utils/format';

// One dive-log entry. Rendered inside a grouped card; `last` drops the divider.
export default function LogRow({ record, onPress, onLongPress, last }) {
  const top = record.predictions?.[0];
  const where = placeLabel(record.geoTag);

  return (
    <Pressable onPress={onPress} onLongPress={onLongPress} accessibilityRole="button">
      {({ pressed }) => (
        <View style={[styles.row, pressed && styles.pressed]}>
          {record.imageUri ? (
            <Image source={{ uri: record.imageUri }} style={styles.thumb} />
          ) : (
            <View style={styles.thumb} />
          )}
          <View style={styles.body}>
            <Text style={type.bodyMedium} numberOfLines={1}>
              {record.topCommonName || 'Unknown species'}
            </Text>
            {top?.scientificName ? (
              <Text style={styles.binomial} numberOfLines={1}>
                {top.scientificName}
              </Text>
            ) : null}
            <Text style={styles.meta} numberOfLines={1}>
              {shortDate(record.timestamp)}
              {where ? `  ·  ${where}` : ''}
            </Text>
          </View>
          {record.topConfidence != null ? (
            <Text style={styles.pct}>{percent(record.topConfidence, 0)}</Text>
          ) : null}
          <Icon name="chevron" size={16} color={color.ink4} strokeWidth={2} />
          {!last ? <View style={styles.divider} /> : null}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 14, gap: 12 },
  pressed: { backgroundColor: color.paper },
  thumb: { width: 52, height: 52, borderRadius: 10, backgroundColor: color.sunken },
  body: { flex: 1 },
  binomial: { ...type.binomial, fontSize: 15, lineHeight: 19 },
  meta: { ...type.small, fontSize: 12, color: color.ink3, marginTop: 2 },
  pct: { fontFamily: font.sansMedium, fontSize: 14, color: color.ink2, fontVariant: ['tabular-nums'] },
  divider: { position: 'absolute', left: 78, right: 0, bottom: 0, height: StyleSheet.hairlineWidth, backgroundColor: color.hairStrong },
});
