import { View, Text, StyleSheet, Image, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import SpeciesProfile from '../components/SpeciesProfile';
import ScreenHeader from '../components/ScreenHeader';
import Section from '../components/Section';
import Brackets from '../components/Brackets';
import LocationSection from '../components/LocationSection';
import { getSpeciesById } from '../config/species';
import colors from '../theme/colors';
import { numeric } from '../theme/type';

export default function HistoryDetailScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const { record } = route.params || {};
  const species = record ? getSpeciesById(record.topSpeciesId) : null;

  if (!record) {
    return (
      <View style={styles.root}>
        <ScreenHeader title="Saved Identification" onBack={() => navigation.goBack()} />
        <Text style={styles.missing}>Record not found.</Text>
      </View>
    );
  }

  const date = new Date(record.timestamp);

  return (
    <View style={styles.root}>
      <ScreenHeader
        title={record.topCommonName || 'Unknown species'}
        subtitle={species ? species.scientificName : undefined}
        subtitleItalic
        onBack={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}>
        {record.imageUri && (
          <View style={styles.imageWrap}>
            <Image source={{ uri: record.imageUri }} style={styles.image} resizeMode="cover" />
            <Brackets color={colors.white} />
          </View>
        )}

        <Section title="Saved On">
          <Text style={styles.meta}>
            {date.toLocaleDateString()} at{' '}
            {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </Section>

        {record.predictions?.length > 0 && (
          <Section title="Predictions">
            {record.predictions.map((p, index) => (
              <View key={p.speciesId} style={[styles.predRow, index > 0 && styles.predRowBorder]}>
                <Text style={styles.predName}>{p.commonName}</Text>
                <Text style={[styles.predPct, numeric, index === 0 && styles.predPctTop]}>
                  {(p.confidence * 100).toFixed(2)}%
                </Text>
              </View>
            ))}
          </Section>
        )}

        {species ? (
          <Section title="Species Profile">
            <SpeciesProfile species={species} />
          </Section>
        ) : (
          <Section>
            <Text style={styles.meta}>Full species profile unavailable for this record.</Text>
          </Section>
        )}

        <LocationSection geoTag={record.geoTag} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.mist },
  content: { padding: 16 },
  missing: { padding: 24, color: colors.inkMuted },
  imageWrap: { height: 260, borderRadius: 24, overflow: 'hidden', marginBottom: 16, backgroundColor: colors.navy800 },
  image: { width: '100%', height: '100%' },
  meta: { fontSize: 14, color: colors.ink },
  predRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10 },
  predRowBorder: { borderTopWidth: 1, borderTopColor: colors.line },
  predName: { fontSize: 15, fontWeight: '600', color: colors.ink },
  predPct: { fontSize: 14, fontWeight: '700', color: colors.navy600 },
  predPctTop: { color: colors.coral600 },
});
