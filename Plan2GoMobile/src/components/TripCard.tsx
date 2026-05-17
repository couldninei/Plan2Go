import type { Trip } from '@/lib/storage';
import { Pressable, StyleSheet, Text, View } from 'react-native';

interface Props {
  trip: Trip;
  onPress: () => void;
}

const STATUS_COLORS: Record<Trip['status'], { bg: string; fg: string }> = {
  unfinished: { bg: '#f2ebe0', fg: '#6b5e51' },
  planned: { bg: '#dcecd2', fg: '#d1d871' },
  past: { bg: '#e6dccf', fg: '#6b5e51' },
};

export default function TripCard({ trip, onPress }: Props) {
  const { itinerary, savedAt, status } = trip;
  const destination = itinerary?.destination ?? 'Trip';
  const days = itinerary?.days ?? [];
  const currency = itinerary?.currency ?? 'THB';
  const total = itinerary?.total_estimated_cost ?? 0;

  const date = new Date(savedAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

  const statusColor = STATUS_COLORS[status];

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.85 }]}
    >
      <View style={styles.head}>
        <View
          style={[styles.statusPill, { backgroundColor: statusColor.bg }]}
        >
          <Text style={[styles.statusText, { color: statusColor.fg }]}>
            {status}
          </Text>
        </View>
        <Text style={styles.date}>{date}</Text>
      </View>
      <Text style={styles.destination} numberOfLines={1}>
        {destination}
      </Text>
      <Text style={styles.meta}>
        {days.length} {days.length === 1 ? 'day' : 'days'} · {currency}{' '}
        {total.toLocaleString()}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 200,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ababab',
    padding: 14,
  },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  statusPill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 },
  statusText: {
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontWeight: '600',
  },
  date: { fontSize: 11, color: '#6b5e51' },
  destination: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1f1b16',
    marginBottom: 4,
  },
  meta: { fontSize: 12, color: '#6b5e51' },
});
