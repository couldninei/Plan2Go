// src/app/_layout.tsx
//
// Root layout. Renders the SessionProvider, then a Stack with two protected
// branches: the (nav) group when signed in, the login screen when not.
// Stack.Protected automatically redirects the user when the guard flips —
// no manual router.push() needed.
import { SessionProvider, useSession } from '@/lib/session';
import { Stack } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import 'react-native-reanimated';

function RootNavigator() {
  const { user, isLoading } = useSession();

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={!!user}>
        <Stack.Screen name="(nav)" />
        <Stack.Screen name="trips/[id]" options={{ headerShown: true, title: 'Trip' }} />
      </Stack.Protected>
      <Stack.Protected guard={!user}>
        <Stack.Screen name="login" />
      </Stack.Protected>
    </Stack>
  );
}  {/* ← this closing brace was missing */}

export default function RootLayout() {
  return (
    <SessionProvider>
      <RootNavigator />
    </SessionProvider>
  );
}