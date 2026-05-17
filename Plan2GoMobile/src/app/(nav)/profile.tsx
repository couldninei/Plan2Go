import { useSession } from '@/lib/session';
import {
  getProfile,
  updateProfile,
  type Profile as ProfilePrefs,
} from '@/lib/storage';
import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';

type MenuItemId =
  | 'edit'
  | 'preferences'
  | 'notifications'
  | 'privacy'
  | 'display'
  | 'language'
  | 'help';

const MENU_ITEMS: Array<{ id: MenuItemId; icon: string; label: string }> = [
  { id: 'edit', icon: '✎', label: 'Edit profile' },
  { id: 'preferences', icon: '♡', label: 'Preferences' },
  { id: 'notifications', icon: '🔔', label: 'Notifications' },
  { id: 'privacy', icon: '🔒', label: 'Privacy' },
  { id: 'display', icon: '🖥', label: 'Display' },
  { id: 'language', icon: 'A', label: 'Language' },
  { id: 'help', icon: '?', label: 'Help & support' },
];

const DEFAULT_PROFILE: ProfilePrefs = {
  name: 'Traveller',
  displayMode: 'light',
  language: 'English',
  notifications: true,
};

export default function Profile() {
  const { user, signOut } = useSession();
  const [profile, setProfile] = useState<ProfilePrefs>(DEFAULT_PROFILE);
  const [openPanel, setOpenPanel] = useState<MenuItemId | null>(null);
  const [nameDraft, setNameDraft] = useState<string>('');

  useFocusEffect(
    useCallback(() => {
      getProfile().then(setProfile);
    }, [])
  );

  useEffect(() => {
    setNameDraft(user?.name ?? profile.name);
  }, [user?.name, profile.name]);

  const displayName = user?.name ?? profile.name;
  const displayEmail = user?.email;

  const handleSelectItem = (id: MenuItemId) => {
    setOpenPanel((prev) => (prev === id ? null : id));
  };

  const handleSaveName = async () => {
    const updated = await updateProfile({
      name: nameDraft.trim() || 'Traveller',
    });
    setProfile(updated);
    setOpenPanel(null);
  };

  const handleDisplayChange = async (mode: 'light' | 'dark') => {
    setProfile(await updateProfile({ displayMode: mode }));
  };

  const handleLanguageChange = async (lang: string) => {
    setProfile(await updateProfile({ language: lang }));
  };

  const handleNotificationToggle = async () => {
    setProfile(await updateProfile({ notifications: !profile.notifications }));
  };

  const handleSignOut = () => {
    Alert.alert('Sign out', 'Sign out of Plan2Go?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: signOut },
    ]);
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarLetter}>
            {(displayName[0] ?? 'T').toUpperCase()}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{displayName}</Text>
          {displayEmail && <Text style={styles.email}>{displayEmail}</Text>}
          <Text style={styles.meta}>
            {profile.language} · {profile.displayMode} mode
          </Text>
        </View>
      </View>

      <View style={styles.menuList}>
        {MENU_ITEMS.map((item, idx) => {
          const isOpen = openPanel === item.id;
          return (
            <View
              key={item.id}
              style={[
                idx < MENU_ITEMS.length - 1 && styles.menuItemBorder,
              ]}
            >
              <Pressable
                onPress={() => handleSelectItem(item.id)}
                style={({ pressed }) => [
                  styles.menuItem,
                  pressed && styles.menuItemPressed,
                ]}
              >
                <Text style={styles.menuIcon}>{item.icon}</Text>
                <Text style={styles.menuLabel}>{item.label}</Text>
                <Text style={styles.menuChevron}>{isOpen ? '⌃' : '⌄'}</Text>
              </Pressable>

              {isOpen && (
                <View style={styles.panel}>
                  {item.id === 'edit' && (
                    <View>
                      <Text style={styles.panelLabel}>Display name</Text>
                      <TextInput
                        value={nameDraft}
                        onChangeText={setNameDraft}
                        maxLength={40}
                        style={styles.panelInput}
                      />
                      <Pressable
                        onPress={handleSaveName}
                        style={({ pressed }) => [
                          styles.panelSave,
                          pressed && { opacity: 0.85 },
                        ]}
                      >
                        <Text style={{ color: '#fff' }}>Save</Text>
                      </Pressable>
                    </View>
                  )}

                  {item.id === 'display' && (
                    <View style={styles.toggleRow}>
                      {(['light', 'dark'] as const).map((m) => {
                        const active = profile.displayMode === m;
                        return (
                          <Pressable
                            key={m}
                            onPress={() => handleDisplayChange(m)}
                            style={[styles.toggleBtn, active && styles.toggleBtnActive]}
                          >
                            <Text
                              style={[
                                styles.toggleText,
                                active && styles.toggleTextActive,
                              ]}
                            >
                              {m === 'light' ? 'Light' : 'Dark'}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  )}

                  {item.id === 'language' && (
                    <View style={styles.toggleRow}>
                      {['English', 'ภาษาไทย', '日本語'].map((lang) => {
                        const active = profile.language === lang;
                        return (
                          <Pressable
                            key={lang}
                            onPress={() => handleLanguageChange(lang)}
                            style={[styles.toggleBtn, active && styles.toggleBtnActive]}
                          >
                            <Text
                              style={[
                                styles.toggleText,
                                active && styles.toggleTextActive,
                              ]}
                            >
                              {lang}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  )}

                  {item.id === 'notifications' && (
                    <View style={styles.switchRow}>
                      <Text style={styles.panelLabel}>Push notifications</Text>
                      <Switch
                        value={profile.notifications}
                        onValueChange={handleNotificationToggle}
                      />
                    </View>
                  )}

                  {['preferences', 'privacy', 'help'].includes(item.id) && (
                    <Text style={styles.comingSoon}>Coming soon.</Text>
                  )}
                </View>
              )}
            </View>
          );
        })}
      </View>

      <Pressable
        onPress={handleSignOut}
        style={({ pressed }) => [styles.signOut, pressed && { opacity: 0.7 }]}
      >
        <Text style={styles.signOutText}>Sign out</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#b3cde1' },
  content: { padding: 20, paddingBottom: 40 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#ababab',
    marginBottom: 24,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#13233d',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: { color: '#fff', fontSize: 24, fontWeight: '600' },
  name: { fontSize: 22, fontWeight: '600', color: '#13233d', marginBottom: 2 },
  email: { fontSize: 12, color: '#474747', marginBottom: 4 },
  meta: { fontSize: 11, color: '#474747' },
  menuList: {
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#ababab',
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 12,
  },
  menuItemBorder: { borderBottomWidth: 1, borderBottomColor: '#ababab' },
  menuItemPressed: { backgroundColor: '#e5eef5' },
  menuIcon: { fontSize: 16, width: 20, textAlign: 'center', color: '#474747' },
  menuLabel: { flex: 1, fontSize: 15, color: '#13233d' },
  menuChevron: { fontSize: 18, color: '#474747' },
  panel: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 4,
    gap: 8,
  },
  panelLabel: { fontSize: 13, color: '#13233d' },
  panelInput: {
    borderWidth: 1,
    borderColor: '#ababab',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: '#fff',
    color: '#13233d',
    marginVertical: 8,
  },
  panelSave: {
    alignSelf: 'flex-start',
    backgroundColor: '#13233d',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  toggleRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  toggleBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#ababab',
    backgroundColor: '#fff',
  },
  toggleBtnActive: { backgroundColor: '#13233d', borderColor: '#13233d' },
  toggleText: { fontSize: 13, color: '#13233d' },
  toggleTextActive: { color: '#fff' },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  comingSoon: { fontStyle: 'italic', color: '#474747', fontSize: 13 },
  signOut: {
    alignSelf: 'center',
    marginTop: 32,
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: '#ababab',
    borderRadius: 8,
    backgroundColor: '#fff'
  },
  signOutText: { fontSize: 13, color: '#474747' },
});
