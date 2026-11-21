import { useCallback, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Alert, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { getHistory } from '../services/storage';
import { loadSampleData } from '../services/sampleData';
import HistoryCard from '../components/HistoryCard';
import MiniMap from '../components/MiniMap';
import {
  ThreatAlert,
  ConservationStatus,
  SpeciesBreakdown,
  ConfidenceCheck,
  THREAT_SPECIES_ID,
  LOW_CONFIDENCE,
} from '../components/DashboardInsights';
import ScreenHeader from '../components/ScreenHeader';
import Button from '../components/Button';
import colors from '../theme/colors';
import { numeric } from '../theme/type';

const RECENT_COUNT = 3;

function Stat({ value, label, divider }) {
  return (
    <View style={[styles.stat, divider && styles.statDivider]}>
      <Text style={[styles.statValue, numeric]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export default function DashboardScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [records, setRecords] = useState([]);
  const [loaded, setLoaded] = useState(false);

  const loadHistory = useCallback(async () => {
    const history = await getHistory();
    setRecords(history);
    setLoaded(true);
  }, []);

  // Reload whenever the screen regains focus (e.g. after saving a result)
  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [loadHistory])
  );

  const totalCount = records.length;
  const uniqueSpeciesCount = new Set(records.map((r) => r.topSpeciesId).filter(Boolean)).size;
  const geoTaggedCount = records.filter((r) => r.geoTag).length;
  const recentRecords = records.slice(0, RECENT_COUNT);

  const confirmLoadSamples = () => {
    Alert.alert(
      'Load sample data?',
      'This deletes all saved identifications and replaces them with samples from photos you pick (up to 8), placed at reef sites around Panay.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Pick photos',
          style: 'destructive',
          onPress: async () => {
            try {
              const count = await loadSampleData();
              if (count > 0) loadHistory();
            } catch (err) {
              Alert.alert('Could not load samples', err.message || 'Something went wrong.');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.root}>
      <ScreenHeader
        title="Coral Vision"
        subtitle="Your identifications at a glance"
        leading={<Image source={require('../../assets/logo.png')} style={styles.logo} />}
      />

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}>
        <Button
          label="Capture Now"
          onPress={() => navigation.navigate('Capture')}
          style={styles.capture}
        />

        <View style={styles.stats}>
          <Stat value={totalCount} label="Identifications" />
          <Stat value={uniqueSpeciesCount} label="Species" divider />
          <Stat value={geoTaggedCount} label="Geo-tagged" divider />
        </View>

        <ThreatAlert
          records={records}
          onPress={() =>
            navigation.navigate('History', {
              speciesId: THREAT_SPECIES_ID,
              filterLabel: 'Crown-of-thorns sightings',
            })
          }
        />

        <MiniMap records={records} onPress={() => navigation.navigate('Map')} />

        <ConservationStatus records={records} />

        <SpeciesBreakdown
          records={records}
          onSelect={(row) =>
            navigation.navigate('History', { speciesId: row.id, filterLabel: row.name })
          }
        />

        <ConfidenceCheck
          records={records}
          onReview={() =>
            navigation.navigate('History', {
              maxConfidence: LOW_CONFIDENCE,
              filterLabel: `Below ${LOW_CONFIDENCE * 100}% confidence`,
            })
          }
        />


        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Recent activity</Text>
          <Pressable onPress={() => navigation.navigate('History')} hitSlop={8}>
            <Text style={styles.viewAll}>View all →</Text>
          </Pressable>
        </View>

        {loaded && recentRecords.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No identifications yet</Text>
            <Text style={styles.emptyText}>Identify a coral and save it to see it here.</Text>
          </View>
        ) : (
          recentRecords.map((record) => (
            <HistoryCard
              key={record.id}
              record={record}
              onPress={() => navigation.navigate('HistoryDetail', { record })}
            />
          ))
        )}

        <View style={styles.actions}>
          <Button style={styles.flex} variant="navy" label="History" onPress={() => navigation.navigate('History')} />
          <Button style={styles.flex} variant="outline" label="View Map" onPress={() => navigation.navigate('Map')} />
        </View>

        {__DEV__ && (
          <Pressable onPress={confirmLoadSamples} hitSlop={8} style={styles.devLink}>
            <Text style={styles.devLinkText}>Load sample data</Text>
          </Pressable>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.mist },
  content: { padding: 16 },
  logo: { width: 40, height: 40, borderRadius: 10 },
  capture: { marginBottom: 16 },
  stats: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.line,
    paddingVertical: 18,
    marginBottom: 12,
  },
  stat: { flex: 1, alignItems: 'center' },
  statDivider: { borderLeftWidth: 1, borderLeftColor: colors.line },
  statValue: { color: colors.navy700, fontSize: 28, fontWeight: '700' },
  statLabel: { color: colors.inkMuted, fontSize: 12, marginTop: 2 },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, marginBottom: 12 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: colors.ink },
  viewAll: { fontSize: 13, fontWeight: '700', color: colors.coral600 },
  empty: {
    alignItems: 'center',
    padding: 28,
    backgroundColor: colors.white,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.line,
  },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: colors.ink },
  emptyText: { fontSize: 13, color: colors.inkMuted, marginTop: 4, textAlign: 'center' },
  actions: { flexDirection: 'row', gap: 12, marginTop: 18 },
  flex: { flex: 1 },
  devLink: { alignSelf: 'center', marginTop: 20, padding: 6 },
  devLinkText: { fontSize: 13, color: colors.inkMuted, textDecorationLine: 'underline' },
});
