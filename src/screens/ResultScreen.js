import { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, Alert, Animated, Easing } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { identifyImage } from '../services/inference';
import {
  getCurrentGeoTag,
  extractGeoTagFromExif,
  getGeoTagFromLibraryAsset,
} from '../services/location';
import { saveHistoryRecord } from '../services/storage';
import SpeciesProfile from '../components/SpeciesProfile';
import ScreenHeader from '../components/ScreenHeader';
import Section from '../components/Section';
import Button from '../components/Button';
import Brackets from '../components/Brackets';
import LocationSection from '../components/LocationSection';
import LogoLoader from '../components/LogoLoader';

const IMAGE_HEIGHT = 260;
const MIN_LOADING_MS = 2200; // let the loader play even when the model is instant
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
import colors from '../theme/colors';
import { numeric } from '../theme/type';

export default function ResultScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const { imageUri, exif, assetId } = route.params || {};

  const [loading, setLoading] = useState(true);
  const [predictions, setPredictions] = useState([]);
  const [error, setError] = useState(null);
  const [geoTag, setGeoTag] = useState(null);
  const [geoLoading, setGeoLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function runIdentification() {
      setLoading(true);
      setError(null);
      try {
        const [results] = await Promise.all([identifyImage(imageUri), wait(MIN_LOADING_MS)]);
        if (!cancelled) setPredictions(results);
      } catch (err) {
        if (!cancelled) setError(err.message || 'Identification failed.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    async function runGeoTag() {
      setGeoLoading(true);
      // 1. Photos library record (best for photos taken earlier, esp. iOS)
      const libraryTag = await getGeoTagFromLibraryAsset(assetId);
      if (libraryTag) {
        if (!cancelled) {
          setGeoTag(libraryTag);
          setGeoLoading(false);
        }
        return;
      }
      // 2. GPS tags still in the file's EXIF (mainly Android)
      const exifTag = extractGeoTagFromExif(exif);
      if (exifTag) {
        if (!cancelled) {
          setGeoTag(exifTag);
          setGeoLoading(false);
        }
        return;
      }
      // 3. Last resort: the device's current live location
      const tag = await getCurrentGeoTag();
      if (!cancelled) {
        setGeoTag(tag);
        setGeoLoading(false);
      }
    }

    if (imageUri) {
      runIdentification();
      runGeoTag();
    }
    return () => {
      cancelled = true;
    };
  }, [imageUri, exif, assetId]);

  const scan = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!loading) return undefined;
    scan.setValue(0);
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(scan, { toValue: 1, duration: 1300, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(scan, { toValue: 0, duration: 1300, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [loading, scan]);
  const scanY = scan.interpolate({ inputRange: [0, 1], outputRange: [0, IMAGE_HEIGHT - 3] });

  const topResult = predictions[0];

  const handleSave = async () => {
    if (saving || saved || predictions.length === 0) return;
    setSaving(true);
    try {
      await saveHistoryRecord({ sourceImageUri: imageUri, predictions, geoTag });
      setSaved(true);
    } catch (err) {
      Alert.alert('Could not save', err.message || 'Something went wrong saving this identification.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.root}>
      <ScreenHeader
        title={topResult ? topResult.species.commonName : loading ? 'Analyzing…' : 'Result'}
        subtitle={topResult ? topResult.species.scientificName : undefined}
        subtitleItalic
        onBack={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}>
        {imageUri && (
          <View style={styles.imageWrap}>
            <Image source={{ uri: imageUri }} style={styles.image} resizeMode="cover" />
            {loading && (
              <>
                <View style={styles.scanTint} pointerEvents="none" />
                <Animated.View
                  pointerEvents="none"
                  style={[styles.scanLine, { transform: [{ translateY: scanY }] }]}
                />
              </>
            )}
            <Brackets color={colors.white} />
          </View>
        )}

        {loading && <LogoLoader />}


        {!loading && error && (
          <View style={styles.centerBlock}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {!loading && !error && predictions.length > 0 && (
          <>
            <Section title="Predictions">
              {predictions.map((p, index) => {
                const pct = p.confidence * 100;
                const isTop = index === 0;
                const isBest = isTop && pct >= 99;
                return (
                  <View key={p.species.id} style={[styles.predRow, index > 0 && styles.predRowGap]}>
                    <View style={styles.predTop}>
                      <Text style={styles.rank}>{index + 1}</Text>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.predName}>
                          {p.species.commonName}
                          {isBest ? '  · Best guess' : ''}
                        </Text>
                        <Text style={styles.predSci}>{p.species.scientificName}</Text>
                      </View>
                      <Text style={[styles.predPct, numeric, isTop && styles.predPctTop]}>
                        {pct.toFixed(2)}%
                      </Text>
                    </View>
                    <View style={styles.barTrack}>
                      <View
                        style={[
                          styles.barFill,
                          {
                            width: `${Math.max(2, Math.min(100, pct))}%`,
                            backgroundColor: isTop ? colors.coral500 : colors.navy500,
                          },
                        ]}
                      />
                    </View>
                  </View>
                );
              })}
            </Section>

            {topResult && (
              <Section title="Species Profile">
                <SpeciesProfile species={topResult.species} />
              </Section>
            )}

            <LocationSection geoTag={geoTag} loading={geoLoading} />

            <Button
              label={saved ? '✓ Saved to History' : 'Save to History'}
              variant={saved ? 'navy' : 'primary'}
              loading={saving}
              disabled={saved}
              onPress={handleSave}
            />
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.mist },
  content: { padding: 16 },
  imageWrap: { height: IMAGE_HEIGHT, borderRadius: 24, overflow: 'hidden', marginBottom: 16, backgroundColor: colors.navy800 },
  image: { width: '100%', height: '100%' },
  scanTint: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(10,26,58,0.25)' },
  scanLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 3,
    backgroundColor: colors.coral500,
    shadowColor: colors.coral500,
    shadowOpacity: 0.9,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
  },
  centerBlock: { alignItems: 'center', paddingVertical: 40 },
  loadingText: { marginTop: 12, color: colors.inkMuted },
  errorText: { color: colors.danger, textAlign: 'center' },
  predRow: {},
  predRowGap: { marginTop: 14 },
  predTop: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  rank: { width: 22, fontSize: 13, fontWeight: '800', color: colors.navy600 },
  predName: { fontSize: 15, fontWeight: '700', color: colors.ink },
  predSci: { fontSize: 12, fontStyle: 'italic', color: colors.inkMuted, marginTop: 1 },
  predPct: { fontSize: 14, fontWeight: '700', color: colors.navy600 },
  predPctTop: { color: colors.coral600 },
  barTrack: { height: 6, borderRadius: 3, backgroundColor: colors.mist, marginTop: 8, overflow: 'hidden' },
  barFill: { height: 6, borderRadius: 3 },
});
