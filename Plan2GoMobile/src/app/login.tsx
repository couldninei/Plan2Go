import { useSession } from '@/lib/session';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

export default function Login() {
  const { signIn } = useSession();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    const next: typeof errors = {};
    if (!name.trim()) next.name = 'Please enter your name';
    if (!email.trim()) {
      next.email = 'Please enter your email';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      next.email = 'Please enter a valid email';
    }
    if (Object.keys(next).length) {
      setErrors(next);
      return;
    }

    setSubmitting(true);
    try {
      await signIn({ name, email });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#b3cde1' }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <Text style={styles.eyebrow}>Plan2Go</Text>
          <Text style={styles.title}>Welcome aboard.</Text>
          <Text style={styles.subtitle}>
            Tell us who you are and we&apos;ll start planning your next trip.
          </Text>

          <View style={styles.field}>
            <Text style={styles.label}>Name</Text>
            <TextInput
              value={name}
              onChangeText={(v) => {
                setName(v);
                if (errors.name) setErrors((e) => ({ ...e, name: undefined }));
              }}
              placeholder="Somsri J"
              placeholderTextColor="#a89e8d"
              autoComplete="name"
              style={[styles.input, errors.name && styles.inputError]}
            />
            {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              value={email}
              onChangeText={(v) => {
                setEmail(v);
                if (errors.email) setErrors((e) => ({ ...e, email: undefined }));
              }}
              placeholder="somsrijaidee@gmail.com"
              placeholderTextColor="#a89e8d"
              autoComplete="email"
              keyboardType="email-address"
              autoCapitalize="none"
              style={[styles.input, errors.email && styles.inputError]}
            />
            {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
          </View>

          <Pressable
            onPress={handleSubmit}
            disabled={submitting}
            style={({ pressed }) => [
              styles.submit,
              pressed && styles.submitPressed,
              submitting && styles.submitDisabled,
            ]}
          >
            <Text style={styles.submitText}>
              {submitting ? 'Signing in…' : 'Start exploring →'}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 20 },
  card: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ababab',
  },
  eyebrow: {
    fontSize: 12,
    color: '#afb65c',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 4,
  },
  title: { fontSize: 28, fontWeight: '600', color: '#13233d', marginBottom: 6 },
  subtitle: { fontSize: 14, color: '#696969', marginBottom: 24 },
  field: { marginBottom: 16 },
  label: { fontSize: 13, color: '#1f1b16', marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: '#ababab',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: '#1f1b16',
    backgroundColor: '#fff',
  },
  inputError: { borderColor: '#a6362c' },
  errorText: { color: '#a6362c', fontSize: 12, marginTop: 4 },
  submit: {
    backgroundColor: '#13233d',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  submitPressed: { opacity: 0.85 },
  submitDisabled: { opacity: 0.5 },
  submitText: { color: '#fbf7f0', fontSize: 15, fontWeight: '600' },
});
