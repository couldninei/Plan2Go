import {
  createFolder,
  deleteFolder,
  getBookmarks,
  removeBookmark,
  type Bookmarks,
} from '@/lib/storage';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

export default function Bookmark() {
  const [bookmarks, setBookmarks] = useState<Bookmarks>({});
  const [search, setSearch] = useState('');
  const [activeFolder, setActiveFolder] = useState<string | null>(null);
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  const refresh = useCallback(() => {
    getBookmarks().then(setBookmarks);
  }, []);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  const handleCreateFolder = async () => {
    const name = newFolderName.trim();
    if (!name) return;
    await createFolder(name);
    setNewFolderName('');
    setShowNewFolder(false);
    refresh();
  };

  const handleRemove = async (folder: string, itemKey: string) => {
    await removeBookmark(folder, itemKey);
    refresh();
  };

  const handleDeleteFolder = (folder: string) => {
    const count = bookmarks[folder]?.length ?? 0;
    const msg =
      count > 0
        ? `Delete "${folder}" and its ${count} ${count === 1 ? 'item' : 'items'}? This cannot be undone.`
        : `Delete the empty folder "${folder}"?`;

    Alert.alert('Delete folder', msg, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteFolder(folder);
          setActiveFolder(null);
          refresh();
        },
      },
    ]);
  };

  if (activeFolder) {
    const items = bookmarks[activeFolder] ?? [];
    return (
      <View style={styles.screen}>
        <View style={styles.detailHeader}>
          <Pressable
            onPress={() => setActiveFolder(null)}
            style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.7 }]}
          >
            <Text style={styles.backBtnText}>← Back to folders</Text>
          </Pressable>
          <View style={styles.detailTitleRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.detailTitle}>{activeFolder}</Text>
              <Text style={styles.detailCount}>
                {items.length} {items.length === 1 ? 'item' : 'items'}
              </Text>
            </View>
            <Pressable
              onPress={() => handleDeleteFolder(activeFolder)}
              style={({ pressed }) => [
                styles.deleteFolderBtn,
                pressed && { opacity: 0.7 },
              ]}
            >
              <Text style={styles.deleteFolderText}>Delete folder</Text>
            </Pressable>
          </View>
        </View>

        {items.length === 0 ? (
          <Text style={styles.empty}>
            No bookmarks here yet. Tap the star on a card in Explore to save it
            to &quot;Want to go&quot;.
          </Text>
        ) : (
          <FlatList
            data={items}
            keyExtractor={(it) => (it.id ?? it.name) as string}
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
            ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
            renderItem={({ item }) => (
              <View style={styles.itemRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  {item.city && (
                    <Text style={styles.itemSub}>
                      {item.city}
                      {item.country ? `, ${item.country}` : ''}
                    </Text>
                  )}
                  {item.type && <Text style={styles.itemType}>{item.type}</Text>}
                </View>
                <Pressable
                  onPress={() =>
                    handleRemove(activeFolder, (item.id ?? item.name) as string)
                  }
                  style={({ pressed }) => [
                    styles.removeBtn,
                    pressed && { opacity: 0.6 },
                  ]}
                  hitSlop={8}
                >
                  <Text style={styles.removeBtnText}>✕</Text>
                </Pressable>
              </View>
            )}
          />
        )}
      </View>
    );
  }

  const folderNames = Object.keys(bookmarks);
  const filtered = search
    ? folderNames.filter((f) => f.toLowerCase().includes(search.toLowerCase()))
    : folderNames;

  return (
    <View style={styles.screen}>
      <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
        <Text style={styles.heading}>Bookmarks</Text>
        <TextInput
          style={styles.search}
          value={search}
          onChangeText={setSearch}
          placeholder="Search folders…"
          placeholderTextColor="#474747"
        />
      </View>

      <FlatList
        key="folder-detail"
        data={filtered}
        keyExtractor={(f) => f}
        numColumns={2}
        columnWrapperStyle={{ gap: 12, paddingHorizontal: 16 }}
        contentContainerStyle={{ gap: 12, paddingBottom: 32 }}
        ListFooterComponent={
          showNewFolder ? (
            <View style={[styles.folderCard, styles.newFolderCard, { marginHorizontal: 16 }]}>
              <TextInput
                autoFocus
                value={newFolderName}
                onChangeText={setNewFolderName}
                placeholder="Folder name"
                placeholderTextColor="#474747"
                style={styles.newFolderInput}
                onSubmitEditing={handleCreateFolder}
              />
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
                <Pressable
                  onPress={handleCreateFolder}
                  style={({ pressed }) => [
                    styles.newFolderBtn,
                    { backgroundColor: '#1f1b16' },
                    pressed && { opacity: 0.85 },
                  ]}
                >
                  <Text style={{ color: '#fff', fontSize: 12 }}>Add</Text>
                </Pressable>
                <Pressable
                  onPress={() => {
                    setShowNewFolder(false);
                    setNewFolderName('');
                  }}
                  style={({ pressed }) => [
                    styles.newFolderBtn,
                    { borderWidth: 1, borderColor: '#ababab' },
                    pressed && { opacity: 0.7 },
                  ]}
                >
                  <Text style={{ color: '#1f1b16', fontSize: 12 }}>Cancel</Text>
                </Pressable>
              </View>
            </View>
          ) : (
            <Pressable
              onPress={() => setShowNewFolder(true)}
              style={({ pressed }) => [
                styles.folderCard,
                styles.addFolderCard,
                { marginHorizontal: 16 },
                pressed && { opacity: 0.85 },
              ]}
            >
              <Text style={styles.folderIcon}>＋</Text>
              <Text style={styles.folderName}>New folder</Text>
            </Pressable>
          )
        }
        renderItem={({ item: name }) => (
          <Pressable
            onPress={() => setActiveFolder(name)}
            style={({ pressed }) => [
              styles.folderCard,
              { flex: 1 },
              pressed && { opacity: 0.85 },
            ]}
          >
            <Text style={styles.folderIcon}>📁</Text>
            <Text style={styles.folderName} numberOfLines={1}>
              {name}
            </Text>
            <Text style={styles.folderCount}>
              {bookmarks[name].length}{' '}
              {bookmarks[name].length === 1 ? 'item' : 'items'}
            </Text>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#b3cde1' },
  heading: { fontSize: 28, fontWeight: '600', color: '#13233d', marginBottom: 12 },
  search: {
    borderWidth: 1,
    borderColor: '#ababab',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#fff',
    color: '#13233d',
    marginBottom: 16,
  },
  folderCard: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ababab',
    borderRadius: 12,
    padding: 16,
    minHeight: 110,
    justifyContent: 'center',
  },
  addFolderCard: { alignItems: 'center', borderStyle: 'dashed' },
  newFolderCard: { },
  newFolderInput: {
    borderWidth: 1,
    borderColor: '#ababab',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: '#fff',
    color: '#13233d',
  },
  newFolderBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  folderIcon: { fontSize: 28, marginBottom: 8 },
  folderName: { fontSize: 15, fontWeight: '600', color: '#13233d', marginBottom: 4 },
  folderCount: { fontSize: 11, color: '#6b5e51' },
  detailHeader: { padding: 16, paddingBottom: 8 },
  backBtn: { alignSelf: 'flex-start', marginBottom: 12 },
  backBtnText: { color: '#13233d', fontSize: 14 },
  detailTitleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  detailTitle: { fontSize: 22, fontWeight: '600', color: '#13233d' },
  detailCount: { fontSize: 12, color: '#474747', marginTop: 2 },
  deleteFolderBtn: {
    borderWidth: 1,
    borderColor: '#a6362c',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  deleteFolderText: { color: '#a6362c', fontSize: 12 },
  empty: { padding: 16, color: '#474747', fontStyle: 'italic' },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ababab',
    gap: 12,
  },
  itemName: { fontSize: 15, fontWeight: '600', color: '#13233d' },
  itemSub: { fontSize: 12, color: '#474747', marginTop: 2 },
  itemType: { fontSize: 11, color: '#474747', marginTop: 4, textTransform: 'uppercase', letterSpacing: 1 },
  removeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeBtnText: { fontSize: 14, color: '#474747' },
});
