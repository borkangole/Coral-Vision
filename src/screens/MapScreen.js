import { useCallback, useMemo, useState } from 'react';
import { View, Text, StyleSheet, Image, Pressable } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useFocusEffect } from '@react-navigation/native';
import { getHistory } from '../services/storage';
import ScreenHeader from '../components/ScreenHeader';
import colors from '../theme/colors';

// Fallback region centered roughly on Panay Island / Capiz.
const FALLBACK_REGION = {
  latitude: 11.35,
  longitude: 122.75,
  latitudeDelta: 1.2,
  longitudeDelta: 1.2,
};

export default function MapScreen({ navigation }) {
  const [records, setRecords] = useState([]);
  const [loaded, setLoaded] = useState(false);

  const loadHistory = useCallback(async () => {
    const history = await getHistory();
    setRecords(history);
    setLoaded(true);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [loadHistory])
  );

  const geoTaggedRecords = useMemo(() => records.filter((r) => r.geoTag), [records]);

  const initialRegion = useMemo(() => {
    if (geoTaggedRecords.length === 0) return FALLBACK_REGION;
    const lats = geoTaggedRecords.map((r) => r.geoTag.latitude);
    const lngs = geoTaggedRecords.map((r) => r.geoTag.longitude);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    return {
      latitude: (minLat + maxLat) / 2,
      longitude: (minLng + maxLng) / 2,
      latitudeDelta: Math.max(maxLat - minLat, 0.02) * 1.8,
      longitudeDelta: Math.max(maxLng - minLng, 0.02) * 1.8,
    };
  }, [geoTaggedRecords]);

  const n = geoTaggedRecords.length;

  return (
    <View style={styles.root}>
      <ScreenHeader
        title="Map"
        subtitle={`${n} geo-tagged ${n === 1 ? 'find' : 'finds'}`}
        onBack={() => navigation.goBack()}
      />

      {loaded && n === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>No geo-tagged finds yet</Text>
          <Text style={styles.emptyText}>
            Identify a coral with location enabled and save it to see it plotted here.
          </Text>
        </View>
      ) : (
        <MapView style={styles.map} initialRegion={initialRegion}>
          {geoTaggedRecords.map((record) => (
            <Marker
              key={record.id}
              coordinate={{
                latitude: record.geoTag.latitude,
                longitude: record.geoTag.longitude,
              }}
              onPress={() => navigation.navigate('HistoryDetail', { record })}
              title={record.topCommonName || 'Unknown species'}
            >
              <Pressable
                style={styles.markerWrap}
                onPress={() => navigation.navigate('HistoryDetail', { record })}
              >
                {record.imageUri ? (
                  <Image source={{ uri: record.imageUri }} style={styles.markerImage} />
                ) : (
                  <View style={[styles.markerImage, styles.markerImagePlaceholder]} />
                )}
              </Pressable>
            </Marker>
          ))}
        </MapView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.mist },
  map: { flex: 1 },
  markerWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 3,
    borderColor: colors.coral500,
    backgroundColor: colors.white,
    overflow: 'hidden',
  },
  markerImage: { width: '100%', height: '100%' },
  markerImagePlaceholder: { backgroundColor: colors.line },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: colors.ink, marginBottom: 8 },
  emptyText: { fontSize: 14, color: colors.inkMuted, textAlign: 'center' },
});
