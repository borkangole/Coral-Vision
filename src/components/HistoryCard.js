import { View, Text, StyleSheet, Image, Pressable } from 'react-native';
import colors from '../theme/colors';
import { numeric } from '../theme/type';

export default function HistoryCard({ record, onPress, onLongPress }) {
  const date = new Date(record.timestamp);
  const confidencePct = record.topConfidence != null ? (record.topConfidence * 100).toFixed(1) : null;

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={onPress}
      onLongPress={onLongPress}
      accessibilityRole="button"
    >
      {record.imageUri ? (
        <Image source={{ uri: record.imageUri }} style={styles.thumbnail} />
      ) : (
        <View style={styles.thumbnail} />
      )}
      <View style={styles.cardBody}>
        <Text style={styles.speciesName} numberOfLines={1}>
          {record.topCommonName || 'Unknown species'}
        </Text>
        <Text style={styles.cardMeta}>
          {date.toLocaleDateString()} · {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
        {record.geoTag ? (
          <Text style={[styles.cardMeta, numeric]}>
            {record.geoTag.latitude.toFixed(4)}, {record.geoTag.longitude.toFixed(4)}
          </Text>
        ) : (
          <Text style={styles.cardMetaMuted}>No location recorded</Text>
        )}
      </View>
      {confidencePct && (
        <View style={styles.confidenceBadge}>
          <Text style={[styles.confidenceBadgeText, numeric]}>{confidencePct}%</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 10,
    marginBottom: 10,
    alignItems: 'center',
  },
  cardPressed: { backgroundColor: colors.mist },
  thumbnail: { width: 66, height: 66, borderRadius: 13, backgroundColor: colors.line },
  cardBody: { flex: 1, marginLeft: 12 },
  speciesName: { fontSize: 16, fontWeight: '700', color: colors.ink },
  cardMeta: { fontSize: 12, color: colors.inkMuted, marginTop: 2 },
  cardMetaMuted: { fontSize: 12, color: colors.inkMuted, marginTop: 2, fontStyle: 'italic' },
  confidenceBadge: {
    backgroundColor: colors.mist,
    borderRadius: 10,
    paddingHorizontal: 9,
    paddingVertical: 5,
    marginLeft: 8,
  },
  confidenceBadgeText: { color: colors.navy700, fontSize: 12, fontWeight: '700' },
});
