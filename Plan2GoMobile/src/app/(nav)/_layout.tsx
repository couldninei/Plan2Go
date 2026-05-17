import { Tabs } from 'expo-router';
import { Drawer } from 'expo-router/drawer';
import { Platform, Text } from 'react-native';

const tabIcon = (glyph: string) => ({ focused }: { focused: boolean }) => (
  <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.55 }}>{glyph}</Text>
);

const screenOptions = {
  headerStyle: { backgroundColor: '#b3cde1' },
  headerTitleStyle: { color: '#1f1b16', fontWeight: '600' as const },
};

export default function NavLayout() {
  console.log('NavLayout rendering, Platform.OS =', Platform.OS);
  if (Platform.OS === 'web') {
    return (
      <>
        <Drawer
          screenOptions={{
            ...screenOptions,
            drawerType: 'permanent',
            drawerStyle: {
              backgroundColor: '#fff',
              width: 220,
              borderRightColor: '#ababab',
              borderRightWidth: 1,
            },
            drawerActiveTintColor: '#1f1b16',
            drawerInactiveTintColor: '#6b5e51',
          }}
        >
          <Drawer.Screen name="index"    options={{ title: 'Home' }} />
          <Drawer.Screen name="explore"  options={{ title: 'Explore' }} />
          <Drawer.Screen name="create"   options={{ title: 'Create' }} />
          <Drawer.Screen name="bookmark" options={{ title: 'Saved' }} />
          <Drawer.Screen name="profile"  options={{ title: 'Profile' }} />
        </Drawer>
      </>
    );
  }

  return (
    <Tabs
      screenOptions={{
        ...screenOptions,
        tabBarStyle: { backgroundColor: '#fff', borderTopColor: '#b3cde1' },
        tabBarActiveTintColor: '#1f1b16',
        tabBarInactiveTintColor: '#6b5e51',
      }}
    >
      <Tabs.Screen name="index"    options={{ title: 'Home',    tabBarIcon: tabIcon('🏠') }} />
      <Tabs.Screen name="explore"  options={{ title: 'Explore', tabBarIcon: tabIcon('🧭') }} />
      <Tabs.Screen name="create"   options={{ title: 'Create',  tabBarIcon: tabIcon('➕') }} />
      <Tabs.Screen name="bookmark" options={{ title: 'Saved',   tabBarIcon: tabIcon('🔖') }} />
      <Tabs.Screen name="profile"  options={{ title: 'Profile', tabBarIcon: tabIcon('👤') }} />
    </Tabs>
  );
}