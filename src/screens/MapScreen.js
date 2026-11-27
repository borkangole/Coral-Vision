import { useCallback, useMemo, useState } from 'react';
import { View, Text, StyleSheet, Image, Pressable } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { getHistory } from '../services/storage';
import IconButton from '../components/IconButton';
import ScreenHeader from '../components/ScreenHeader';
import { color, radius } from '../theme/tokens';
import { type, font } from '../theme/type';

// Fallback region centred roughly on Panay Island / Capiz
const FALLBACK_REGION = { latitude: 11.35, longitude: 122.75, latitudeDelta: 1.2, longitudeDelta: 1.2 };

export default function MapScreen({ navigation }) {
  const insets = useSafeAreaInsets();
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

  const tagged = useMemo(() => records.filter((r) => r.geoTag), [records]);

  const initialRegion = useMemo(() => {
    if (tagged.length === 0) return FALLBACK_REGION;
    const lats = tagged.map((r) => r.geoTag.latitude);
    const lngs = tagged.map((r) => r.geoTag.longitude);
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
  }, [tagged]);

  if (loaded && tagged.length === 0) {
    return (
      <View style={styles.root}>
        <StatusBar style="dark" />
        <ScreenHeader
          title="Map"
          subtitle="Finds with a location will be pinned here."
          onBack={() => navigation.goBack()}
        />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <MapView style={StyleSheet.absoluteFill} initialRegion={initialRegion}>
        {tagged.map((record) => (
          <Marker
            key={record.id}
            coordinate={{ latitude: record.geoTag.latitude, longitude: record.geoTag.longitude }}
            onPress={() => navigation.navigate('HistoryDetail', { record })}
            title={record.topCommonName || 'Unknown species'}
          >
            <Pressable style={styles.marker} onPress={() => navigation.navigate('HistoryDetail', { record })}>
              {record.imageUri ? (
                <Image source={{ uri: record.imageUri }} style={styles.markerImage} />
              ) : (
                <View style={[styles.markerImage, { backgroundColor: color.sunken }]} />
              )}
            </Pressable>
          </Marker>
        ))}
      </MapView>

      <View style={[styles.overlay, { top: insets.top + 8 }]} pointerEvents="box-none">
        <IconButton name="back" label="Go back" onPress={() => navigation.goBack()} />
        <View style={styles.pill}>
          <Text style={styles.pillText}>
            {tagged.length} {tagged.length === 1 ? 'find' : 'finds'}
          </Text>
        </View>
      </View>
    </View>
  );
}

const shadow = {
  shadowColor: '#0B1B33',
  shadowOpacity: 0.14,
  shadowRadius: 10,
  shadowOffset: { width: 0, height: 3 },
  elevation: 3,
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: color.paper },
  overlay: { position: 'absolute', left: 16, right: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  pill: {
    ...shadow,
    backgroundColor: color.surface,
    borderRadius: radius.pill,
    paddingHorizontal: 14,
    height: 40,
    justifyContent: 'center',
  },
  pillText: { fontFamily: font.sansSemi, fontSize: 14, color: color.ink, fontVariant: ['tabular-nums'] },
  marker: { ...shadow, width: 46, height: 46, borderRadius: 23, borderWidth: 2.5, borderColor: color.surface, backgroundColor: color.surface, overflow: 'hidden' },
  markerImage: { width: '100%', height: '100%' },
});
