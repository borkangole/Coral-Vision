import { useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import Icon from './Icon';
import { cardStyle } from './Section';
import { color } from '../theme/tokens';
import { type } from '../theme/type';

// Centred on Panay Island when there is nothing to show yet.
const PANAY_REGION = { latitude: 11.15, longitude: 122.55, latitudeDelta: 1.6, longitudeDelta: 1.6 };

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

// Read-only preview of every geo-tagged find; the whole card opens the map.
export default function MiniMap({ records, onPress }) {
  const tagged = useMemo(() => records.filter((r) => r.geoTag), [records]);
  const region = useMemo(() => regionFor(tagged), [tagged]);

  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel="Open full map">
      {({ pressed }) => (
        <View style={[styles.card, pressed && { opacity: 0.9 }]}>
          <View style={styles.map} pointerEvents="none">
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
            <Icon name="pin" size={16} color={color.ink2} />
            <Text style={[type.smallMedium, { flex: 1 }]}>
              {tagged.length} {tagged.length === 1 ? 'location' : 'locations'} around Panay
            </Text>
            <Icon name="arrow" size={16} color={color.ink3} strokeWidth={2} />
          </View>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { ...cardStyle, overflow: 'hidden' },
  map: { height: 176, backgroundColor: color.sunken },
  dot: { width: 12, height: 12, borderRadius: 6, backgroundColor: color.coral, borderWidth: 2, borderColor: color.surface },
  footer: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14, paddingVertical: 12 },
});
