import { useCallback, useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Alert, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { getHistory, deleteHistoryRecord } from '../services/storage';
import HistoryCard from '../components/HistoryCard';
import ScreenHeader from '../components/ScreenHeader';
import colors from '../theme/colors';

export default function HistoryScreen({ navigation, route }) {
  // Optional filters passed from the Dashboard insight cards.
  const { speciesId, maxConfidence, filterLabel } = route?.params || {};
  const insets = useSafeAreaInsets();
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

  const onRefresh = async () => {
    setRefreshing(true);
    await loadHistory();
    setRefreshing(false);
  };

  const confirmDelete = (record) => {
    Alert.alert('Delete this record?', record.topCommonName || 'This identification', [
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

  return (
    <View style={styles.root}>
      <ScreenHeader
        title={filterLabel || 'History'}
        subtitle={
          filterLabel
            ? `${visible.length} of ${records.length} saved · Long-press to delete`
            : `${records.length} saved · Tap to view · Long-press to delete`
        }
        onBack={() => navigation.goBack()}
      />

      {loaded && visible.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>{filterLabel ? 'Nothing here' : 'No history yet'}</Text>
          <Text style={styles.emptyText}>
            Identify a coral and tap "Save to History" to see it here.
          </Text>
        </View>
      ) : (
        <FlatList
          data={visible}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <HistoryCard
              record={item}
              onPress={() => navigation.navigate('HistoryDetail', { record: item })}
              onLongPress={() => confirmDelete(item)}
            />
          )}
          contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 24 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.coral500} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.mist },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: colors.ink, marginBottom: 8 },
  emptyText: { fontSize: 14, color: colors.inkMuted, textAlign: 'center' },
});
