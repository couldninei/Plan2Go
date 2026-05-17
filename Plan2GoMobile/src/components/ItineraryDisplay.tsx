import type { Itinerary } from '@/lib/itineraryApi';
import { StyleSheet, Text, View } from 'react-native';

function formatPrice(currency: string, amount: number): string {
  return `${currency} ${amount.toLocaleString('en-US')}`;
}

function HotelCard({ hotel, currency }: { hotel: any; currency: string }) {
  if (!hotel) return null;
  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>Where you&apos;re staying</Text>
      <View style={styles.card}>
        <View style={styles.hotelHead}>
          <Text style={styles.hotelName}>{hotel.name}</Text>
          <View style={styles.hotelMeta}>
            <Text style={styles.rating}>★ {hotel.rating}</Text>
            <View style={styles.tag}>
              <Text style={styles.tagText}>{hotel.type}</Text>
            </View>
          </View>
        </View>
        <Text style={styles.cardDesc}>{hotel.description}</Text>
        {hotel.amenities?.length > 0 && (
          <View style={styles.amenities}>
            {hotel.amenities.map((a: string) => (
              <View key={a} style={styles.amenityTag}>
                <Text style={styles.amenityText}>{a}</Text>
              </View>
            ))}
          </View>
        )}
        <View style={styles.hotelPrice}>
          <Text style={styles.priceStrong}>
            {formatPrice(currency, hotel.price_per_night)}
          </Text>
          <Text style={styles.priceUnit}> / night</Text>
        </View>
      </View>
    </View>
  );
}

function ActivityItem({ item, currency }: { item: any; currency: string }) {
  const price = item.ticket_price ?? item.price_per_person ?? 0;
  const time = item.estimated_time ?? item.duration;
  return (
    <View style={styles.itemCard}>
      <View style={styles.itemHead}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemRating}>★ {item.rating}</Text>
      </View>
      <Text style={styles.itemDesc}>{item.description}</Text>
      <View style={styles.itemMeta}>
        {!!time && <Text style={styles.itemTime}>⏱ {time}</Text>}
        {(item.category || item.type) && (
          <View style={styles.itemTag}>
            <Text style={styles.itemTagText}>{item.category ?? item.type}</Text>
          </View>
        )}
        <Text style={styles.itemPrice}>{formatPrice(currency, price)}</Text>
      </View>
    </View>
  );
}

function RestaurantItem({ item, currency }: { item: any; currency: string }) {
  return (
    <View style={styles.itemCard}>
      <View style={styles.itemHead}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemRating}>★ {item.rating}</Text>
      </View>
      <Text style={styles.itemDesc}>{item.description}</Text>
      {item.must_try?.length > 0 && (
        <Text style={styles.mustTry}>Try: {item.must_try.join(', ')}</Text>
      )}
      <View style={styles.itemMeta}>
        {!!item.cuisine && (
          <View style={styles.itemTag}>
            <Text style={styles.itemTagText}>{item.cuisine}</Text>
          </View>
        )}
        <Text style={styles.itemPrice}>
          {formatPrice(currency, item.average_cost_per_person)}
        </Text>
      </View>
    </View>
  );
}

function DayCard({ day, currency }: { day: any; currency: string }) {
  return (
    <View style={styles.dayCard}>
      <View style={styles.dayHeader}>
        <Text style={styles.dayTitle}>Day {day.day}</Text>
        {!!day.note && <Text style={styles.dayNote}>{day.note}</Text>}
      </View>
      <View style={styles.dayColumn}>
        <Text style={styles.dayColumnTitle}>Activities</Text>
        {(!day.activities || day.activities.length === 0) ? (
          <Text style={styles.empty}>No activities planned for this day.</Text>
        ) : (
          <View style={{ gap: 8 }}>
            {day.activities.map((item: any) => (
              <ActivityItem key={item.id} item={item} currency={currency} />
            ))}
          </View>
        )}
      </View>
      <View style={styles.dayColumn}>
        <Text style={styles.dayColumnTitle}>Restaurants</Text>
        {(!day.restaurants || day.restaurants.length === 0) ? (
          <Text style={styles.empty}>No restaurants planned for this day.</Text>
        ) : (
          <View style={{ gap: 8 }}>
            {day.restaurants.map((item: any) => (
              <RestaurantItem key={item.id} item={item} currency={currency} />
            ))}
          </View>
        )}
      </View>
    </View>
  );
}

interface Props {
  itinerary: Itinerary;
}

export default function ItineraryDisplay({ itinerary }: Props) {
  const {
    destination,
    budget,
    currency = 'THB',
    hotel,
    total_estimated_cost,
    days,
  } = itinerary;

  const withinBudget = total_estimated_cost <= budget;
  const remaining = budget - total_estimated_cost;

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>Your itinerary</Text>
        <Text style={styles.heading}>
          {days.length} {days.length === 1 ? 'day' : 'days'} in {destination}
        </Text>
        <View style={styles.summary}>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Estimated cost</Text>
            <Text style={styles.statValue}>
              {formatPrice(currency, total_estimated_cost)}
            </Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Your budget</Text>
            <Text style={styles.statValue}>{formatPrice(currency, budget)}</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>
              {withinBudget ? 'Remaining' : 'Over budget'}
            </Text>
            <Text
              style={[
                styles.statValue,
                withinBudget ? styles.positive : styles.negative,
              ]}
            >
              {formatPrice(currency, Math.abs(remaining))}
            </Text>
          </View>
        </View>
      </View>

      <HotelCard hotel={hotel} currency={currency} />

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Day by day</Text>
        <View style={{ gap: 12 }}>
          {days.map((day: any) => (
            <DayCard key={day.day} day={day} currency={currency} />
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: 20, gap: 16 },
  header: { padding: 16, backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#ababab' },
  eyebrow: {
    fontSize: 11,
    color: '#afb65c',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 4,
  },
  heading: { fontSize: 20, fontWeight: '600', color: '#13233d', marginBottom: 12 },
  summary: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 8,
  },
  stat: { flex: 1, minWidth: 90 },
  statLabel: { fontSize: 11, color: '#474747', marginBottom: 2 },
  statValue: { fontSize: 14, fontWeight: '600', color: '#1f1b16' },
  positive: { color: '#d1d871' },
  negative: { color: '#a6362c' },
  section: { gap: 8 },
  sectionLabel: {
    fontSize: 11,
    color: '#474747',
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  card: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ababab',
    borderRadius: 12,
    padding: 14,
  },
  hotelHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    flexWrap: 'wrap',
    gap: 6,
  },
  hotelName: { fontSize: 16, fontWeight: '600', color: '#13233d', flexShrink: 1 },
  hotelMeta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  rating: { color: '#a6362c' },
  tag: { backgroundColor: '#fff', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  tagText: { fontSize: 11, color: '#13233d' },
  cardDesc: { fontSize: 13, color: '#13233d', marginBottom: 8 },
  amenities: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 10 },
  amenityTag: {
    backgroundColor: '#fff',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  amenityText: { fontSize: 11, color: '#13233d' },
  hotelPrice: { flexDirection: 'row', alignItems: 'baseline' },
  priceStrong: { fontSize: 16, fontWeight: '600', color: '#13233d' },
  priceUnit: { fontSize: 12, color: '#474747' },
  dayCard: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ababab',
    borderRadius: 12,
    padding: 14,
    gap: 12,
  },
  dayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 6,
  },
  dayTitle: { fontSize: 16, fontWeight: '600', color: '#13233d' },
  dayNote: { fontSize: 12, color: '#474747', fontStyle: 'italic' },
  dayColumn: { gap: 8 },
  dayColumnTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#d1d871',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  itemCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
  },
  itemHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
    gap: 6,
  },
  itemName: { fontSize: 14, fontWeight: '600', color: '#13233d', flexShrink: 1 },
  itemRating: { fontSize: 12, color: '#a6362c' },
  itemDesc: { fontSize: 12, color: '#13233d', marginBottom: 6, lineHeight: 16 },
  mustTry: { fontSize: 12, fontStyle: 'italic', color: '#474747', marginBottom: 6 },
  itemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  itemTime: { fontSize: 11, color: '#474747' },
  itemTag: { backgroundColor: '#fff', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  itemTagText: { fontSize: 10, color: '#13233d' },
  itemPrice: { fontSize: 12, fontWeight: '600', color: '#13233d', marginLeft: 'auto' },
  empty: { fontStyle: 'italic', color: '#474747', fontSize: 12 },
});
