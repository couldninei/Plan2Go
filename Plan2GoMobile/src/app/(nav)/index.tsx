import TripCard from '@/components/TripCard';
import { useSession } from '@/lib/session';
import { getTrips, type Trip } from '@/lib/storage';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const QUOTES = [
  'If not now, when?',
  'The world is a book, and those who do not travel read only a page.',
  'Adventure is worthwhile.',
  'Travel far enough, you meet yourself.',
  'Once a year, go somewhere you have never been before.',
];

function randomQuote() {
  return QUOTES[Math.floor(Math.random() * QUOTES.length)];
}

export default function Home() {
  const router = useRouter();
  const { user } = useSession();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [quote] = useState(randomQuote);
  useFocusEffect(
    useCallback(() => {
      let active = true;
      getTrips().then((t) => {
        if (active) setTrips(t);
      });
      return () => {
        active = false;
      };
    }, [])
  );

  const unfinished = trips.filter((t) => t.status === 'unfinished');
  const planned = trips.filter((t) => t.status === 'planned');
  const past = trips.filter((t) => t.status === 'past');

  const hour = new Date().getHours();
  const timeGreeting =
    hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const firstName = user?.name?.split(' ')[0] ?? 'traveller';

  const goToTrip = (id: string) => router.push(`/trips/${id}`);

  const renderSection = (label: string, list: Trip[], empty: string) => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{label}</Text>
        <Text style={styles.sectionCount}>{list.length}</Text>
      </View>
      {list.length === 0 ? (
        <Text style={styles.empty}>{empty}</Text>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.row}
        >
          {list.map((t) => (
            <TripCard key={t.id} trip={t} onPress={() => goToTrip(t.id)} />
          ))}
        </ScrollView>
      )}
    </View>
  );

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.quoteCard}>
        <Text style={styles.quoteEyebrow}>
          {timeGreeting}, {firstName}
        </Text>
        <Text style={styles.quoteText}>{quote}</Text>
      </View>

      {renderSection(
        'Adventure loading…',
        unfinished,
        'No plans in progress. Start one in Create.'
      )}
      {renderSection(
        'Ready to take off!',
        planned,
        'No plans saved yet. Generate one and tap "Save trip".'
      )}
      {renderSection('Your memories', past, 'Past trips will appear here.')}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#b3cde1' },
  content: { padding: 16, paddingBottom: 32 },
  quoteCard: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ababab',
    borderRadius: 14,
    padding: 18,
    marginBottom: 24,
  },
  quoteEyebrow: {
    fontSize: 11,
    color: '#afb65c',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  quoteText: { fontSize: 18, color: '#13233d', fontWeight: '500', lineHeight: 26 },
  section: { marginBottom: 24 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#13233d' },
  sectionCount: { fontSize: 12, color: '#474747' },
  row: { gap: 12, paddingRight: 16 },
  empty: { color: '#474747', fontSize: 13, fontStyle: 'italic' },
});
