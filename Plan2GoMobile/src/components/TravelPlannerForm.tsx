import type { GenerateItineraryPayload } from '@/lib/itineraryApi';
import { useState } from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

const INTEREST_OPTIONS = [
  { id: 'food', label: 'Food', icon: require('@/assets/icons/Food.png') },
  { id: 'adventure', label: 'Adventure', icon: require('@/assets/icons/Adventure.png') },
  { id: 'culture', label: 'Culture', icon: require('@/assets/icons/Culture.png') },
  { id: 'shopping', label: 'Shopping', icon: require('@/assets/icons/Shopping.png') },
  { id: 'nature', label: 'Nature', icon: require('@/assets/icons/Nature.png') },
  { id: 'nightlife', label: 'Nightlife', icon: require('@/assets/icons/NightLife.png') },
];

type FormState = {
  destination: string;
  budget: string;
  days: string;
  interests: string[];
};

const INITIAL: FormState = { destination: '', budget: '', days: '', interests: [] };

function validate(data: FormState): Partial<Record<keyof FormState, string>> {
  const errors: Partial<Record<keyof FormState, string>> = {};
  if (!data.destination.trim()) errors.destination = 'Where are you headed?';
  if (!data.budget || Number(data.budget) <= 0) {
    errors.budget = 'Enter a budget greater than 0';
  }
  if (!data.days || Number(data.days) <= 0) {
    errors.days = 'Trip must be at least 1 day';
  }
  if (data.interests.length === 0) {
    errors.interests = 'Pick at least one interest';
  }
  return errors;
}

interface Props {
  onSubmit: (payload: GenerateItineraryPayload) => Promise<any>;
}

export default function TravelPlannerForm({ onSubmit }: Props) {
  const [form, setForm] = useState<FormState>(INITIAL);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>(
    {}
  );
  const [submitting, setSubmitting] = useState(false);

  const setField = (key: keyof FormState, value: any) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const toggleInterest = (id: string) => {
    setForm((f) => ({
      ...f,
      interests: f.interests.includes(id)
        ? f.interests.filter((i) => i !== id)
        : [...f.interests, id],
    }));
    if (errors.interests) setErrors((e) => ({ ...e, interests: undefined }));
  };

  const handleSubmit = async () => {
    const nextErrors = validate(form);
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit({
        destination: form.destination,
        budget: Number(form.budget),
        days: Number(form.days),
        interests: form.interests,
      });
    } catch {
      // parent handles the error banner
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setForm(INITIAL);
    setErrors({});
  };

  const selectedLabels = form.interests
    .map((id) => INTEREST_OPTIONS.find((o) => o.id === id)?.label)
    .filter(Boolean);

  return (
    <View style={styles.card}>
      <Text style={styles.eyebrow}>Plan2Go</Text>
      <Text style={styles.title}>Where to next?</Text>
      <Text style={styles.subtitle}>
        Tell us a little about your dream trip and we&apos;ll start the itinerary.
      </Text>

      <View style={styles.field}>
        <Text style={styles.label}>Destination</Text>
        <TextInput
          value={form.destination}
          onChangeText={(v) => setField('destination', v)}
          placeholder="Bangkok, Thailand"
          placeholderTextColor="#a89e8d"
          style={[styles.input, errors.destination && styles.inputError]}
        />
        {errors.destination && (
          <Text style={styles.errorText}>{errors.destination}</Text>
        )}
      </View>

      <View style={styles.row}>
        <View style={[styles.field, { flex: 1 }]}>
          <Text style={styles.label}>Budget (THB)</Text>
          <TextInput
            value={form.budget}
            onChangeText={(v) => setField('budget', v.replace(/[^0-9]/g, ''))}
            placeholder="2000"
            placeholderTextColor="#a89e8d"
            keyboardType="numeric"
            style={[styles.input, errors.budget && styles.inputError]}
          />
          {errors.budget && <Text style={styles.errorText}>{errors.budget}</Text>}
        </View>
        <View style={[styles.field, { flex: 1 }]}>
          <Text style={styles.label}>Days</Text>
          <TextInput
            value={form.days}
            onChangeText={(v) => setField('days', v.replace(/[^0-9]/g, ''))}
            placeholder="7"
            placeholderTextColor="#a89e8d"
            keyboardType="numeric"
            style={[styles.input, errors.days && styles.inputError]}
          />
          {errors.days && <Text style={styles.errorText}>{errors.days}</Text>}
        </View>
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Interests</Text>
        <View style={styles.chipGroup}>
          {INTEREST_OPTIONS.map((opt) => {
            const active = form.interests.includes(opt.id);
            return (
              <Pressable
                key={opt.id}
                onPress={() => toggleInterest(opt.id)}
                style={[styles.chip, active && styles.chipActive]}
              >
                <Image source={opt.icon} style={styles.chipIcon} resizeMode="contain" />
                <Text style={[styles.chipText, active && styles.chipTextActive]}>
                  {opt.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
        {errors.interests && (
          <Text style={styles.errorText}>{errors.interests}</Text>
        )}
        {selectedLabels.length > 0 && (
          <Text style={styles.selectedSummary}>
            You&apos;re packing for: <Text style={{ fontWeight: '600' }}>{selectedLabels.join(', ')}</Text>
          </Text>
        )}
      </View>

      <View style={styles.actions}>
        <Pressable
          onPress={handleReset}
          style={({ pressed }) => [styles.btnGhost, pressed && { opacity: 0.7 }]}
        >
          <Text style={styles.btnGhostText}>Clear</Text>
        </Pressable>
        <Pressable
          onPress={handleSubmit}
          disabled={submitting}
          style={({ pressed }) => [
            styles.btnPrimary,
            pressed && { opacity: 0.85 },
            submitting && { opacity: 0.6 },
          ]}
        >
          <Text style={styles.btnPrimaryText}>
            {submitting ? 'Planning…' : 'Plan my trip →'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ababab',
    padding: 20,
  },
  eyebrow: {
    fontSize: 11,
    color: '#afb65c',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 4,
  },
  title: { fontSize: 24, fontWeight: '600', color: '#13233d', marginBottom: 4 },
  subtitle: { fontSize: 13, color: '#474747', marginBottom: 20 },
  row: { flexDirection: 'row', gap: 12 },
  field: { marginBottom: 16 },
  label: { fontSize: 13, color: '#13233d', marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: '#ababab',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#fff',
    color: '#1f1b16',
    fontSize: 14,
  },
  inputError: { borderColor: '#a6362c' },
  errorText: { color: '#a6362c', fontSize: 12, marginTop: 4 },
  chipGroup: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#ababab',
    backgroundColor: '#fff',
  },
  chipActive: { backgroundColor: '#13233d', borderColor: '#13233d' },
  chipIcon: { width: 18, height: 18 },
  chipText: { fontSize: 12, color: '#13233d' },
  chipTextActive: { color: '#fff' },
  selectedSummary: { fontSize: 12, color: '#6b5e51', marginTop: 8 },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 8,
  },
  btnGhost: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ababab',
  },
  btnGhostText: { color: '#13233d' },
  btnPrimary: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#13233d',
  },
  btnPrimaryText: { color: '#fff', fontWeight: '600' },
});
