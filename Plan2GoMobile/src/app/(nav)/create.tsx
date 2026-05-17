import ItineraryDisplay from '@/components/ItineraryDisplay';
import TravelPlannerForm from '@/components/TravelPlannerForm';
import {
  generateItinerary,
  type GenerateItineraryPayload,
  type Itinerary,
} from '@/lib/itineraryApi';
import { saveTrip, type TripStatus } from '@/lib/storage';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

export default function Create() {
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);

  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const handleTripSubmit = async (payload: GenerateItineraryPayload) => {
    setLoading(true);
    setError(null);
    setItinerary(null);
    setSaved(false);
    try {
      const data = await generateItinerary(payload);
      setItinerary(data);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
      return data;
    } catch (err: any) {
      setError(err.message ?? 'Something went wrong');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTrip = async (status: TripStatus) => {
    if (!itinerary) return;
    const trip = await saveTrip(itinerary, status);
    setSaved(true);
    setTimeout(() => router.push(`/trips/${trip.id}`), 600);
  };

  return (
    <ScrollView
      ref={scrollRef}
      style={styles.screen}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <TravelPlannerForm onSubmit={handleTripSubmit} />

      {loading && (
        <View style={[styles.banner, styles.loadingBanner]}>
          <ActivityIndicator />
          <Text style={styles.bannerText}>Generating your itinerary…</Text>
        </View>
      )}

      {error && !loading && (
        <View style={[styles.banner, styles.errorBanner]}>
          <Text style={[styles.bannerText, { color: '#a6362c' }]}>✗ {error}</Text>
        </View>
      )}

      {itinerary && !loading && (
        <>
          <ItineraryDisplay itinerary={itinerary} />

          <View style={styles.saveSection}>
            {saved ? (
              <Text style={styles.savedText}>
                ✓ Saved! Taking you to your trip…
              </Text>
            ) : (
              <>
                <Text style={styles.prompt}>Like this plan?</Text>
                <View style={styles.saveButtons}>
                  <Pressable
                    style={({ pressed }) => [
                      styles.saveBtn,
                      styles.saveBtnSecondary,
                      pressed && { opacity: 0.85 },
                    ]}
                    onPress={() => handleSaveTrip('unfinished')}
                  >
                    <Text style={styles.saveBtnSecondaryText}>Save as draft</Text>
                  </Pressable>
                  <Pressable
                    style={({ pressed }) => [
                      styles.saveBtn,
                      styles.saveBtnPrimary,
                      pressed && { opacity: 0.85 },
                    ]}
                    onPress={() => handleSaveTrip('planned')}
                  >
                    <Text style={styles.saveBtnPrimaryText}>Save to my trips</Text>
                  </Pressable>
                </View>
              </>
            )}
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#b3cde1' },
  content: { padding: 16, paddingBottom: 48 },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    borderRadius: 10,
    marginTop: 16,
  },
  loadingBanner: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ababab' },
  errorBanner: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e6b7b1' },
  bannerText: { color: '#1f1b16', fontSize: 14 },
  saveSection: {
    marginTop: 20,
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ababab',
  },
  prompt: { fontSize: 14, color: '#1f1b16', marginBottom: 12 },
  saveButtons: { flexDirection: 'row', gap: 12, flexWrap: 'wrap', justifyContent: 'center' },
  saveBtn: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 10,
  },
  saveBtnPrimary: { backgroundColor: '#1f1b16' },
  saveBtnPrimaryText: { color: '#fff', fontWeight: '600' },
  saveBtnSecondary: { borderWidth: 1, borderColor: '#1f1b16', backgroundColor: 'white' },
  saveBtnSecondaryText: { color: '#1f1b16', fontWeight: '600' },
  savedText: { color: '#d1d871', fontWeight: '600' },
});
