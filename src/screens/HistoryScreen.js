import { useCallback, useMemo, useState } from 'react';
import { View, Text, StyleSheet, SectionList, Alert, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { getHistory, deleteHistoryRecord } from '../services/storage';
import LogRow from '../components/HistoryCard';
import ScreenHeader from '../components/ScreenHeader';
import { color, gutter, radius } from '../theme/tokens';
import { type } from '../theme/type';
import { monthKey } from '../utils/format';

export default function HistoryScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  // Optional filters passed from the dashboard insight cards
  const { speciesId, maxConfidence, filterLabel } = route?.params || {};
  const [records, setRecords] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
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

  const visible = useMemo(
    () =>
      records.filter(
        (r) =>
          (!speciesId || r.topSpeciesId === speciesId) &&
          (maxConfidence == null || (r.topConfidence != null && r.topConfidence < maxConfidence))
      ),
    [records, speciesId, maxConfidence]
  );

  // Dive-log grouping: one section per month, newest first
  const sections = useMemo(() => {
    const map = new Map();
    visible.forEach((r) => {
      const key = monthKey(r.timestamp);
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(r);
    });
    return [...map.entries()].map(([title, data]) => ({ title, data }));
  }, [visible]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadHistory();
    setRefreshing(false);
  };

  const confirmDelete = (record) => {
    Alert.alert('Delete this find?', record.topCommonName || 'This identification', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteHistoryRecord(record.id);
          loadHistory();
        },
      },
    ]);
  };

  const subtitle = filterLabel
    ? `${visible.length} of ${records.length} finds`
    : `${records.length} ${records.length === 1 ? 'find' : 'finds'} · hold a row to delete`;

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        stickySectionHeadersEnabled={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={color.ink3} />}
        ListHeaderComponent={
          <ScreenHeader
            eyebrow={filterLabel ? 'Filtered' : undefined}
            title={filterLabel || 'All finds'}
            subtitle={subtitle}
            onBack={() => navigation.goBack()}
          />
        }
        ListEmptyComponent={
          loaded ? (
            <View style={styles.empty}>
              <Text style={type.heading}>{filterLabel ? 'Nothing here' : 'No finds yet'}</Text>
              <Text style={[type.small, { color: color.ink3, marginTop: 4, textAlign: 'center' }]}>
                {filterLabel
                  ? 'No saved identifications match this filter.'
                  : 'Identify a coral and save it to start your reef log.'}
              </Text>
            </View>
          ) : null
        }
        renderSectionHeader={({ section }) => <Text style={styles.sectionLabel}>{section.title}</Text>}
        renderItem={({ item, index, section }) => {
          const first = index === 0;
          const last = index === section.data.length - 1;
          return (
            <View style={[styles.cell, first && styles.cellFirst, last && styles.cellLast]}>
              <LogRow
                record={item}
                last={last}
                onPress={() => navigation.navigate('HistoryDetail', { record: item })}
                onLongPress={() => confirmDelete(item)}
              />
            </View>
          );
        }}
        SectionSeparatorComponent={() => <View style={{ height: 6 }} />}
      />
    </View>
  );
}

const hair = StyleSheet.hairlineWidth;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: color.paper },
  sectionLabel: { ...type.label, paddingHorizontal: gutter + 4, marginTop: 12, marginBottom: 4 },
  // Rows of one month read as a single grouped card
  cell: {
    marginHorizontal: gutter,
    backgroundColor: color.surface,
    borderLeftWidth: hair,
    borderRightWidth: hair,
    borderColor: color.hairStrong,
    overflow: 'hidden',
  },
  cellFirst: { borderTopWidth: hair, borderTopLeftRadius: radius.md, borderTopRightRadius: radius.md },
  cellLast: { borderBottomWidth: hair, borderBottomLeftRadius: radius.md, borderBottomRightRadius: radius.md },
  empty: { alignItems: 'center', paddingHorizontal: 40, paddingTop: 60 },
});
