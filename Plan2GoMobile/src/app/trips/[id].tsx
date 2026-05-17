import ItineraryDisplay from '@/components/ItineraryDisplay';
import {
  deleteTrip,
  getTripById,
  updateTripStatus,
  type Trip,
  type TripStatus,
} from '@/lib/storage';
import { Picker } from '@react-native-picker/picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

export default function TripDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [trip, setTrip] = useState<Trip | null | undefined>(undefined);

  useEffect(() => {
    if (!id) return;
    getTripById(id).then(setTrip);
  }, [id]);

  if (trip === undefined) {
    return (
      <View style={[styles.screen, styles.center]}>
        <Text style={{ color: '#6b5e51' }}>Loading…</Text>
      </View>
    );
  }

  if (trip === null) {
    return (
      <View style={[styles.screen, styles.center]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← Back</Text>
        </Pressable>
        <Text style={{ color: '#6b5e51', marginTop: 20 }}>Trip not found.</Text>
      </View>
    );
  }

  const handleStatusChange = async (status: TripStatus) => {
    await updateTripStatus(trip.id, status);
    setTrip({ ...trip, status });
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete trip',
      'Delete this trip? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteTrip(trip.id);
            router.back();
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.7 }]}
        >
          <Text style={styles.backBtnText}>← Back</Text>
        </Pressable>
        <View style={styles.actions}>
          <View style={styles.pickerWrap}>
            <Picker
              selectedValue={trip.status}
              onValueChange={(v) => handleStatusChange(v as TripStatus)}
              style={styles.picker}
              dropdownIconColor="#474747"
              mode="dropdown"
            >
              <Picker.Item label="Unfinished" value="unfinished" />
              <Picker.Item label="Planned" value="planned" />
              <Picker.Item label="Past" value="past" />
            </Picker>
          </View>
          <Pressable
            onPress={handleDelete}
            style={({ pressed }) => [styles.deleteBtn, pressed && { opacity: 0.7 }]}
          >
            <Text style={styles.deleteBtnText}>Delete</Text>
          </Pressable>
        </View>
      </View>

      <ItineraryDisplay itinerary={trip.itinerary} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#b3cde1' },
  center: { alignItems: 'center', justifyContent: 'center', padding: 24 },
  content: { padding: 16, paddingBottom: 40 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 8,
  },
  backBtn: { paddingVertical: 8 },
  backBtnText: { color: '#13233d', fontSize: 14 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  pickerWrap: {
    borderWidth: 1,
    borderColor: '#ababab',
    borderRadius: 8,
    backgroundColor: '#fff',
    minWidth: 140,
    overflow: 'hidden',
  },
  picker: { color: '#13233d' },
  deleteBtn: {
    borderWidth: 1,
    borderColor: '#a6362c',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  deleteBtnText: { color: '#a6362c', fontSize: 13 },
});
