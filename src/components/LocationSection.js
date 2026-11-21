import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import Section from './Section';
import colors from '../theme/colors';
import { numeric } from '../theme/type';

function describeSource(geoTag) {
  if (geoTag.source === 'photo-library' || geoTag.source === 'exif') {
    return 'From photo location (taken earlier)';
  }
  const accuracy = geoTag.accuracy != null ? ` · Accuracy ±${Math.round(geoTag.accuracy)}m` : '';
  return `Current device location${accuracy}`;
}

// Shared by the Result and Saved Identification screens.
export default function LocationSection({ geoTag, loading }) {
  return (
    <Section title="Location">
      {loading ? (
        <View style={styles.row}>
          <ActivityIndicator size="small" color={colors.navy600} />
          <Text style={styles.meta}>Getting location...</Text>
        </View>
      ) : geoTag ? (
        <View>
          <Text style={styles.coords}>
            {geoTag.latitude.toFixed(6)}, {geoTag.longitude.toFixed(6)}
          </Text>
          <Text style={styles.meta}>{describeSource(geoTag)}</Text>
        </View>
      ) : (
        <Text style={styles.meta}>Location not recorded (permission denied or unavailable).</Text>
      )}
    </Section>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  coords: { ...numeric, fontSize: 17, fontWeight: '700', color: colors.ink },
  meta: { fontSize: 13, color: colors.inkMuted, marginTop: 3, lineHeight: 18 },
});
