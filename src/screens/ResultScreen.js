import { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, Animated, Easing } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { identifyImage } from '../services/inference';
import { getCurrentGeoTag, extractGeoTagFromExif, getGeoTagFromLibraryAsset } from '../services/location';
import { saveHistoryRecord } from '../services/storage';
import PhotoHero, { HERO_HEIGHT } from '../components/PhotoHero';
import MatchHeader from '../components/MatchHeader';
import Possibilities from '../components/Possibilities';
import SpeciesProfile from '../components/SpeciesProfile';
import LocationSection from '../components/LocationSection';
import LogoLoader from '../components/LogoLoader';
import Button from '../components/Button';
import Group from '../components/Section';
import { color, gutter, radius } from '../theme/tokens';
import { type } from '../theme/type';

const MIN_LOADING_MS = 2200; // let the loader play even when the model is instant
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

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

  // Scanning line over the photo while the model runs
  const scan = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!loading) return undefined;
    scan.setValue(0);
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(scan, { toValue: 1, duration: 1500, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(scan, { toValue: 0, duration: 1500, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [loading, scan]);
  const scanY = scan.interpolate({ inputRange: [0, 1], outputRange: [110, HERO_HEIGHT - 60] });

  const top = predictions[0];

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
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 32 }} showsVerticalScrollIndicator={false}>
        <PhotoHero uri={imageUri} onBack={() => navigation.goBack()}>
          {loading ? (
            <>
              <View style={styles.dim} pointerEvents="none" />
              <Animated.View pointerEvents="none" style={[styles.scanLine, { transform: [{ translateY: scanY }] }]} />
            </>
          ) : null}
        </PhotoHero>

        <View style={styles.sheet}>
          {loading ? <LogoLoader /> : null}

          {!loading && error ? (
            <Group label="Something went wrong">
              <Text style={[type.body, { color: color.alert }]}>{error}</Text>
            </Group>
          ) : null}

          {!loading && !error && top ? (
            <>
              <MatchHeader
                eyebrow={top.confidence >= 0.99 ? 'Top match · best guess' : 'Top match'}
                name={top.species.commonName}
                scientificName={top.species.scientificName}
                confidence={top.confidence}
              />

              <Possibilities
                rows={predictions.slice(1).map((p) => ({
                  key: p.species.id,
                  name: p.species.commonName,
                  scientificName: p.species.scientificName,
                  confidence: p.confidence,
                }))}
              />

              <Group label="Species profile" bare>
                <SpeciesProfile species={top.species} />
              </Group>

              <LocationSection geoTag={geoTag} loading={geoLoading} />

              <Button
                label={saved ? 'Saved to reef log' : 'Save to reef log'}
                icon={saved ? 'check' : undefined}
                variant={saved ? 'quiet' : 'primary'}
                loading={saving}
                disabled={geoLoading && !saved}
                onPress={saved ? () => navigation.navigate('Dashboard') : handleSave}
              />
              {saved ? (
                <Text style={[type.small, styles.savedNote]}>Tap again to return to your reef log.</Text>
              ) : null}
            </>
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: color.paper },
  dim: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(10,24,48,0.32)' },
  scanLine: {
    position: 'absolute',
    left: 20,
    right: 20,
    top: 0,
    height: 2,
    borderRadius: 1,
    backgroundColor: color.coral,
    shadowColor: color.coral,
    shadowOpacity: 0.9,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
  },
  sheet: {
    marginTop: -radius.lg,
    backgroundColor: color.paper,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    paddingHorizontal: gutter,
    paddingTop: 28,
    minHeight: 400,
  },
  savedNote: { textAlign: 'center', color: color.ink3, marginTop: 10 },
});
