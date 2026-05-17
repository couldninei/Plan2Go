import type { ExploreItem } from '@/lib/exploreApi';
import { Pressable, StyleSheet, Text, View } from 'react-native';

interface Props {
  item: ExploreItem;
  currency?: string;
  bookmarked: boolean;
  onToggleBookmark: (id: string) => void;
}

const TYPE_INFO: Record<string, { label: string; badge: string }> = {
  hotel: { label: 'Hotel', badge: '🏨' },
  restaurant: { label: 'Restaurant', badge: '🍴' },
  attraction: { label: 'Attraction', badge: '📍' },
  activity: { label: 'Activity', badge: '🎟' },
  transport: { label: 'Transport', badge: '🚆' },
};

function getMetaLine(item: ExploreItem): string {
  const m = item.meta ?? {};
  switch (item.type) {
    case 'hotel':
      return m.hotelType
        ? `${m.hotelType} · ${(m.amenities ?? []).slice(0, 2).join(', ')}`
        : '';
    case 'restaurant':
      return m.cuisine ?? '';
    case 'attraction':
      return [m.category, m.estimatedTime].filter(Boolean).join(' · ');
    case 'activity':
      return [m.activityType, m.duration].filter(Boolean).join(' · ');
    case 'transport':
      return [m.transportType, m.availability].filter(Boolean).join(' · ');
    default:
      return '';
  }
}

export default function ExploreCard({
  item,
  currency = 'THB',
  bookmarked,
  onToggleBookmark,
}: Props) {
  const typeInfo = TYPE_INFO[item.type] ?? { label: item.type, badge: '•' };
  const metaLine = getMetaLine(item);

  return (
    <View style={styles.card}>
      <View style={styles.top}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {typeInfo.badge} {typeInfo.label}
          </Text>
        </View>
        <Pressable
          onPress={() => onToggleBookmark(item.id)}
          hitSlop={10}
          style={({ pressed }) => [pressed && { opacity: 0.6 }]}
        >
          <Text
            style={[
              styles.bookmark,
              bookmarked && styles.bookmarkActive,
            ]}
          >
            {bookmarked ? '★' : '☆'}
          </Text>
        </Pressable>
      </View>

      <Text style={styles.name}>{item.name}</Text>
      <Text style={styles.location}>
        {item.city}, {item.country}
      </Text>

      <Text style={styles.desc} numberOfLines={3}>
        {item.description}
      </Text>

      {!!metaLine && <Text style={styles.meta}>{metaLine}</Text>}

      <View style={styles.foot}>
        <Text style={styles.rating}>★ {item.rating}</Text>
        <Text style={styles.price}>
          {item.price === 0
            ? 'Free'
            : `${currency} ${item.price.toLocaleString()}`}
          {item.price !== 0 && item.priceUnit && (
            <Text style={styles.priceUnit}> {item.priceUnit}</Text>
          )}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ababab',
    padding: 16,
  },
  top: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  badge: {
    backgroundColor: '#e5eef5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  badgeText: { fontSize: 11, color: '#13233d' },
  bookmark: { fontSize: 22, color: '#a89e8d' },
  bookmarkActive: { color: '#d1d871' },
  name: { fontSize: 16, fontWeight: '600', color: '#13233d', marginBottom: 2 },
  location: { fontSize: 12, color: '#474747', marginBottom: 8 },
  desc: { fontSize: 13, color: '#1f1b16', lineHeight: 18, marginBottom: 6 },
  meta: { fontSize: 12, color: '#474747', fontStyle: 'italic', marginBottom: 8 },
  foot: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#ababab',
    paddingTop: 10,
  },
  rating: { fontSize: 13, color: '#13233d' },
  price: { fontSize: 13, color: '#13233d', fontWeight: '600' },
  priceUnit: { fontSize: 11, color: '#474747', fontWeight: '400' },
});
