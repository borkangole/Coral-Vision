import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import PhotoHero from '../components/PhotoHero';
import MatchHeader from '../components/MatchHeader';
import Possibilities from '../components/Possibilities';
import SpeciesProfile from '../components/SpeciesProfile';
import LocationSection from '../components/LocationSection';
import ScreenHeader from '../components/ScreenHeader';
import Group from '../components/Section';
import { getSpeciesById } from '../config/species';
import { color, gutter, radius } from '../theme/tokens';
import { type } from '../theme/type';
import { catalogNumber, longDate } from '../utils/format';

export default function HistoryDetailScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const { record } = route.params || {};
  const species = record ? getSpeciesById(record.topSpeciesId) : null;

  if (!record) {
    return (
      <View style={styles.root}>
        <StatusBar style="dark" />
        <ScreenHeader title="Not found" subtitle="This record no longer exists." onBack={() => navigation.goBack()} />
      </View>
    );
  }

  const top = record.predictions?.[0];

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 32 }} showsVerticalScrollIndicator={false}>
        <PhotoHero uri={record.imageUri} onBack={() => navigation.goBack()} />

        <View style={styles.sheet}>
          <MatchHeader
            eyebrow={`${catalogNumber(record)} · ${longDate(record.timestamp)}`}
            name={record.topCommonName || 'Unknown species'}
            scientificName={top?.scientificName || species?.scientificName}
            confidence={record.topConfidence}
            confidenceLabel="Confidence when saved"
          />

          <Possibilities
            rows={(record.predictions || []).slice(1).map((p) => ({
              key: p.speciesId,
              name: p.commonName,
              scientificName: p.scientificName,
              confidence: p.confidence,
            }))}
          />

          <Group label="Species profile" bare>
            {species ? (
              <SpeciesProfile species={species} catalog={catalogNumber(record)} />
            ) : (
              <View style={styles.missing}>
                <Text style={type.small}>The full profile for this species is no longer available.</Text>
              </View>
            )}
          </Group>

          <LocationSection geoTag={record.geoTag} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: color.paper },
  sheet: {
    marginTop: -radius.lg,
    backgroundColor: color.paper,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    paddingHorizontal: gutter,
    paddingTop: 28,
  },
  missing: { padding: 16, borderRadius: radius.md, backgroundColor: color.surface },
});
