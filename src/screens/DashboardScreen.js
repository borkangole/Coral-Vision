import { useCallback, useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Alert, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { getHistory } from '../services/storage';
import { loadSampleData } from '../services/sampleData';
import LogRow from '../components/HistoryCard';
import MiniMap from '../components/MiniMap';
import Group from '../components/Section';
import Button from '../components/Button';
import IconButton from '../components/IconButton';
import Brackets from '../components/Brackets';
import {
  ThreatAlert,
  ConservationStatus,
  SpeciesBreakdown,
  ConfidenceCheck,
  THREAT_SPECIES_ID,
  LOW_CONFIDENCE,
} from '../components/DashboardInsights';
import { color, gutter, radius } from '../theme/tokens';
import { type, font } from '../theme/type';
import { placeLabel } from '../utils/format';

const RECENT_COUNT = 3;

function todayLabel() {
  return new Date().toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'long' });
}

function Stat({ value, label, rule }) {
  return (
    <View style={[styles.stat, rule && styles.statRule]}>
      <Text style={styles.statValue}>{value}</Text>
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

  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [loadHistory])
  );

  const totalCount = records.length;
  const speciesCount = new Set(records.map((r) => r.topSpeciesId).filter(Boolean)).size;
  const taggedCount = records.filter((r) => r.geoTag).length;
  const siteCount = useMemo(
    () => new Set(records.map((r) => placeLabel(r.geoTag)).filter(Boolean)).size,
    [records]
  );
  const recent = records.slice(0, RECENT_COUNT);

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
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={{ paddingTop: insets.top + 8, paddingBottom: insets.bottom + 40, paddingHorizontal: gutter }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topBar}>
          <View style={styles.brand}>
            <Image source={require('../../assets/logo.png')} style={styles.brandLogo} />
            <Text style={styles.brandName}>Coral Vision</Text>
          </View>
          <IconButton name="map" label="Open map" onPress={() => navigation.navigate('Map')} />
        </View>

        <Text style={[type.label, { marginTop: 28 }]}>{todayLabel()}</Text>
        <Text style={[type.display, { marginTop: 6 }]}>Reef log</Text>
        <Text style={[type.small, { marginTop: 6 }]}>
          {totalCount === 0
            ? 'Your identifications will collect here.'
            : `${totalCount} ${totalCount === 1 ? 'identification' : 'identifications'} across ${siteCount} ${siteCount === 1 ? 'site' : 'sites'}`}
        </Text>

        {/* Focal point: start an identification */}
        <View style={styles.hero}>
          <Brackets color="rgba(255,255,255,0.16)" size={18} inset={12} />
          <Text style={[type.label, { color: color.onAbyss3 }]}>New identification</Text>
          <Text style={styles.heroTitle}>Identify a coral</Text>
          <Text style={styles.heroBody}>Photograph it underwater, analyse it on the boat. Location is saved with every find.</Text>
          <Button
            variant="accent"
            icon="scan"
            label="Start"
            onPress={() => navigation.navigate('Capture')}
            style={{ marginTop: 20 }}
          />
        </View>

        <View style={styles.stats}>
          <Stat value={totalCount} label="Finds" />
          <Stat value={speciesCount} label="Species" rule />
          <Stat value={taggedCount} label="Geo-tagged" rule />
        </View>

        <ThreatAlert
          records={records}
          onPress={() =>
            navigation.navigate('History', { speciesId: THREAT_SPECIES_ID, filterLabel: 'Crown-of-thorns' })
          }
        />

        <Group label="Map" action={{ label: 'Open', onPress: () => navigation.navigate('Map') }} bare>
          <MiniMap records={records} onPress={() => navigation.navigate('Map')} />
        </Group>

        <ConservationStatus records={records} />

        <SpeciesBreakdown
          records={records}
          onSelect={(row) => navigation.navigate('History', { speciesId: row.id, filterLabel: row.name })}
        />

        <ConfidenceCheck
          records={records}
          onReview={() =>
            navigation.navigate('History', {
              maxConfidence: LOW_CONFIDENCE,
              filterLabel: 'Low confidence',
            })
          }
        />

        <Group
          label="Recent"
          action={records.length > 0 ? { label: 'See all', onPress: () => navigation.navigate('History') } : undefined}
          flush
        >
          {loaded && recent.length === 0 ? (
            <View style={styles.empty}>
              <Text style={type.bodyMedium}>No finds yet</Text>
              <Text style={[type.small, { color: color.ink3, marginTop: 2, textAlign: 'center' }]}>
                Identify a coral and save it to start your log.
              </Text>
            </View>
          ) : (
            recent.map((record, i) => (
              <LogRow
                key={record.id}
                record={record}
                last={i === recent.length - 1}
                onPress={() => navigation.navigate('HistoryDetail', { record })}
              />
            ))
          )}
        </Group>

        {__DEV__ && (
          <Pressable onPress={confirmLoadSamples} hitSlop={8} style={styles.devLink}>
            <Text style={[type.small, { color: color.ink4 }]}>Load sample data</Text>
          </Pressable>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: color.paper },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 40 },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  brandLogo: { width: 30, height: 30, borderRadius: 8 },
  brandName: { fontFamily: font.sansSemi, fontSize: 15, letterSpacing: -0.2, color: color.ink },
  hero: {
    marginTop: 24,
    backgroundColor: color.abyss,
    borderRadius: radius.lg,
    padding: 24,
    paddingTop: 28,
    paddingBottom: 28,
  },
  heroTitle: { fontFamily: font.serif, fontSize: 32, lineHeight: 36, color: color.onAbyss, marginTop: 8, letterSpacing: -0.3 },
  heroBody: { ...type.small, color: color.onAbyss2, marginTop: 6, maxWidth: 280 },
  stats: { flexDirection: 'row', marginTop: 28, marginBottom: 28 },
  stat: { flex: 1, paddingHorizontal: 4 },
  statRule: { borderLeftWidth: StyleSheet.hairlineWidth, borderLeftColor: color.hairStrong, paddingLeft: 16 },
  statValue: { fontFamily: font.sansSemi, fontSize: 30, lineHeight: 34, letterSpacing: -0.8, color: color.ink, fontVariant: ['tabular-nums'] },
  statLabel: { ...type.small, color: color.ink3, marginTop: 2 },
  empty: { alignItems: 'center', paddingVertical: 28, paddingHorizontal: 24 },
  devLink: { alignSelf: 'center', padding: 8 },
});
