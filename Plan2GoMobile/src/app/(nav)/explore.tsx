import ExploreCard from '@/components/ExploreCard';
import {
  getExploreFilters,
  getExploreItems,
  type ExploreItem,
} from '@/lib/exploreApi';
import {
  getAllBookmarkedIds,
  toggleBookmarkItem,
} from '@/lib/storage';
import { Picker } from '@react-native-picker/picker';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

const TYPE_TABS = [
  { key: 'all', label: 'All' },
  { key: 'hotel', label: 'Hotels' },
  { key: 'restaurant', label: 'Restaurants' },
  { key: 'attraction', label: 'Attractions' },
  { key: 'activity', label: 'Activities' },
  { key: 'transport', label: 'Transport' },
];

export default function Explore() {
  const [items, setItems] = useState<ExploreItem[]>([]);
  const [currency, setCurrency] = useState('THB');
  const [cities, setCities] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [type, setType] = useState('all');
  const [city, setCity] = useState('all');
  const [search, setSearch] = useState('');

  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);

  useEffect(() => {
    getAllBookmarkedIds().then(setBookmarkedIds);
    getExploreFilters()
      .then((data) => setCities(data.cities ?? []))
      .catch(() => setCities([]));
  }, []);

  useEffect(() => {
    setLoading(true);
    setError(null);
    const t = setTimeout(() => {
      getExploreItems({ type, city, search })
        .then((data) => {
          setItems(data.items);
          setCurrency(data.currency);
        })
        .catch((err: Error) => setError(err.message))
        .finally(() => setLoading(false));
    }, 250);
    return () => clearTimeout(t);
  }, [type, city, search]);

  const handleToggleBookmark = async (itemId: string) => {
    const item = items.find((i) => i.id === itemId);
    if (!item) return;
    const nowBookmarked = await toggleBookmarkItem(item);
    setBookmarkedIds((prev) =>
      nowBookmarked ? [...prev, item.id] : prev.filter((id) => id !== item.id)
    );
  };

  return (
    <View style={styles.screen}>
      <FlatList
        data={loading || error ? [] : items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ExploreCard
            item={item}
            currency={currency}
            bookmarked={bookmarkedIds.includes(item.id)}
            onToggleBookmark={handleToggleBookmark}
          />
        )}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View>
            <Text style={styles.heading}>Explore</Text>
            <Text style={styles.subtitle}>
              Browse every stay, bite, sight, and ride across all destinations.
            </Text>

            <TextInput
              style={styles.search}
              placeholder="Search by name, city, or keyword…"
              placeholderTextColor="#474747"
              value={search}
              onChangeText={setSearch}
              autoCapitalize="none"
            />

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.tabsRow}
            >
              {TYPE_TABS.map((tab) => {
                const active = type === tab.key;
                return (
                  <Pressable
                    key={tab.key}
                    onPress={() => setType(tab.key)}
                    style={[styles.tab, active && styles.tabActive]}
                  >
                    <Text
                      style={[styles.tabText, active && styles.tabTextActive]}
                    >
                      {tab.label}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            <View style={styles.cityRow}>
              <Text style={styles.cityLabel}>City</Text>
              <View style={styles.pickerWrap}>
                <Picker
                  selectedValue={city}
                  onValueChange={(v) => setCity(v)}
                  style={styles.picker}
                  dropdownIconColor="#474747"
                >
                  <Picker.Item label="All cities" value="all" />
                  {cities.map((c) => (
                    <Picker.Item key={c} label={c} value={c} />
                  ))}
                </Picker>
              </View>
              {!loading && !error && (
                <Text style={styles.count}>{items.length} results</Text>
              )}
            </View>

            {loading && (
              <View style={styles.status}>
                <ActivityIndicator />
                <Text style={styles.statusText}>Loading…</Text>
              </View>
            )}
            {error && (
              <Text style={[styles.statusText, styles.errorText]}>✗ {error}</Text>
            )}
            {!loading && !error && items.length === 0 && (
              <Text style={styles.statusText}>
                No results. Try a different filter.
              </Text>
            )}
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#b3cde1' },
  list: { padding: 16, paddingBottom: 32 },
  heading: { fontSize: 28, fontWeight: '600', color: '#1f1b16', marginBottom: 4 },
  subtitle: { fontSize: 13, color: '474747', marginBottom: 16 },
  search: {
    borderWidth: 1,
    borderColor: '#ababab',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#fff',
    color: '#13233d',
    marginBottom: 12,
  },
  tabsRow: { gap: 8, paddingBottom: 4 },
  tab: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#ababab',
    backgroundColor: '#fff',
  },
  tabActive: { backgroundColor: '#13233d', borderColor: '#13233d' },
  tabText: { fontSize: 13, color: '#474747' },
  tabTextActive: { color: '#fff' },
  cityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 8,
    gap: 8,
  },
  cityLabel: { fontSize: 13, color: '#474747' },
  pickerWrap: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ababab',
    borderRadius: 8,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  picker: { color: '#474747' },
  count: { fontSize: 12, color: '#474747' },
  status: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12 },
  statusText: { fontSize: 13, color: '#474747', marginTop: 12 },
  errorText: { color: '#a6362c' },
});
