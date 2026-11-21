import { useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import colors from '../theme/colors';

// Centered on Panay Island when there is nothing to show yet.
const PANAY_REGION = {
  latitude: 11.15,
  longitude: 122.55,
  latitudeDelta: 1.6,
  longitudeDelta: 1.6,
};

function regionFor(records) {
  if (records.length === 0) return PANAY_REGION;
  const lats = records.map((r) => r.geoTag.latitude);
  const lngs = records.map((r) => r.geoTag.longitude);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  return {
    latitude: (minLat + maxLat) / 2,
    longitude: (minLng + maxLng) / 2,
    latitudeDelta: Math.max(maxLat - minLat, 0.05) * 1.5,
    longitudeDelta: Math.max(maxLng - minLng, 0.05) * 1.5,
  };
}

// Read-only preview of every geo-tagged find. The map itself ignores touches;
// tapping the card opens the full Map screen.
export default function MiniMap({ records, onPress }) {
  const tagged = useMemo(() => records.filter((r) => r.geoTag), [records]);
  const region = useMemo(() => regionFor(tagged), [tagged]);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel="Open full map"
    >
      <View style={styles.mapWrap} pointerEvents="none">
        <MapView
          style={StyleSheet.absoluteFill}
          region={region}
          scrollEnabled={false}
          zoomEnabled={false}
          rotateEnabled={false}
          pitchEnabled={false}
          toolbarEnabled={false}
          showsCompass={false}
          liteMode={Platform.OS === 'android'}
        >
          {tagged.map((r) => (
            <Marker
              key={r.id}
              coordinate={{ latitude: r.geoTag.latitude, longitude: r.geoTag.longitude }}
              anchor={{ x: 0.5, y: 0.5 }}
              tracksViewChanges={false}
            >
              <View style={styles.dot} />
            </Marker>
          ))}
        </MapView>
      </View>
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          {tagged.length} {tagged.length === 1 ? 'location' : 'locations'}
        </Text>
        <Text style={styles.footerLink}>Open map →</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.line,
    overflow: 'hidden',
    marginBottom: 24,
  },
  pressed: { opacity: 0.85 },
  mapWrap: { height: 170, backgroundColor: colors.line },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.coral500,
    borderWidth: 2.5,
    borderColor: colors.white,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  footerText: { fontSize: 13, color: colors.inkMuted },
  footerLink: { fontSize: 13, fontWeight: '700', color: colors.coral600 },
});
