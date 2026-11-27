import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import Group from './Section';
import Icon from './Icon';
import { color } from '../theme/tokens';
import { type, font } from '../theme/type';

function describeSource(geoTag) {
  if (geoTag.placeName) return geoTag.placeName;
  if (geoTag.source === 'photo-library' || geoTag.source === 'exif') return 'From the photo’s own location';
  const accuracy = geoTag.accuracy != null ? ` · ±${Math.round(geoTag.accuracy)} m` : '';
  return `Current device location${accuracy}`;
}

// Shared by the result and saved-identification screens.
export default function LocationSection({ geoTag, loading }) {
  return (
    <Group label="Location">
      <View style={styles.row}>
        <View style={styles.well}>
          {loading ? <ActivityIndicator size="small" color={color.ink2} /> : <Icon name="pin" size={18} color={color.ink} />}
        </View>
        <View style={{ flex: 1 }}>
          {loading ? (
            <Text style={type.small}>Finding where this was taken…</Text>
          ) : geoTag ? (
            <>
              <Text style={styles.coords}>
                {geoTag.latitude.toFixed(5)}, {geoTag.longitude.toFixed(5)}
              </Text>
              <Text style={[type.small, { color: color.ink3, marginTop: 2 }]}>{describeSource(geoTag)}</Text>
            </>
          ) : (
            <>
              <Text style={type.bodyMedium}>No location</Text>
              <Text style={[type.small, { color: color.ink3, marginTop: 2 }]}>
                Permission was denied or the photo has no location.
              </Text>
            </>
          )}
        </View>
      </View>
    </Group>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  well: { width: 40, height: 40, borderRadius: 12, backgroundColor: color.paper, alignItems: 'center', justifyContent: 'center' },
  coords: { fontFamily: font.sansSemi, fontSize: 16, color: color.ink, fontVariant: ['tabular-nums'], letterSpacing: -0.2 },
});
