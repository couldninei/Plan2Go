import AsyncStorage from '@react-native-async-storage/async-storage';

export type TripStatus = 'unfinished' | 'planned' | 'past';

export interface BookmarkItem {
  id?: string;
  name?: string;
  city?: string;
  country?: string;
  type?: string;
  bookmarkedAt?: string;
  [key: string]: any;
}

export interface Bookmarks {
  [folder: string]: BookmarkItem[];
}

export interface Trip {
  id: string;
  status: TripStatus;
  savedAt: string;
  tripDate: string | null;
  itinerary: any;
}

export interface Profile {
  name: string;
  displayMode: 'light' | 'dark';
  language: string;
  notifications: boolean;
}

const TRIPS_KEY = 'plan2go.trips';
const BOOKMARKS_KEY = 'plan2go.bookmarks';
const PROFILE_KEY = 'plan2go.profile';

const DEFAULT_FOLDERS = ['Want to go', 'Inspiration', 'Saved trips'];
const DEFAULT_BOOKMARK_FOLDER = 'Want to go';

const DEFAULT_PROFILE: Profile = {
  name: 'Traveller',
  displayMode: 'light',
  language: 'English',
  notifications: true,
};

export async function getTrips(): Promise<Trip[]> {
  try {
    const raw = await AsyncStorage.getItem(TRIPS_KEY);
    return raw ? (JSON.parse(raw) as Trip[]) : [];
  } catch {
    return [];
  }
}

export async function saveTrip(
  itinerary: any,
  status: TripStatus = 'planned',
  tripDate: string | null = null
): Promise<Trip> {
  const trips = await getTrips();
  const trip: Trip = {
    id: `trip_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    status,
    savedAt: new Date().toISOString(),
    tripDate,
    itinerary,
  };
  trips.unshift(trip);
  await AsyncStorage.setItem(TRIPS_KEY, JSON.stringify(trips));
  return trip;
}

export async function getTripById(id: string): Promise<Trip | null> {
  const trips = await getTrips();
  return trips.find((t) => t.id === id) ?? null;
}

export async function updateTripStatus(
  id: string,
  status: TripStatus
): Promise<void> {
  const trips = await getTrips();
  const updated = trips.map((t) => (t.id === id ? { ...t, status } : t));
  await AsyncStorage.setItem(TRIPS_KEY, JSON.stringify(updated));
}

export async function deleteTrip(id: string): Promise<void> {
  const trips = await getTrips();
  const filtered = trips.filter((t) => t.id !== id);
  await AsyncStorage.setItem(TRIPS_KEY, JSON.stringify(filtered));
}

function makeDefaultBookmarks(): Bookmarks {
  return Object.fromEntries(DEFAULT_FOLDERS.map((f) => [f, []]));
}

export async function getBookmarks(): Promise<Bookmarks> {
  try {
    const stored = await AsyncStorage.getItem(BOOKMARKS_KEY);
    if (!stored) {
      const init = makeDefaultBookmarks();
      await AsyncStorage.setItem(BOOKMARKS_KEY, JSON.stringify(init));
      return init;
    }
    return JSON.parse(stored) as Bookmarks;
  } catch {
    return makeDefaultBookmarks();
  }
}

async function saveBookmarks(bookmarks: Bookmarks): Promise<void> {
  await AsyncStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
}

export async function addBookmark(
  folder: string,
  item: BookmarkItem
): Promise<void> {
  const bookmarks = await getBookmarks();
  if (!bookmarks[folder]) bookmarks[folder] = [];
  const key = item.id ?? item.name;
  if (!bookmarks[folder].some((b) => (b.id ?? b.name) === key)) {
    bookmarks[folder].push({ ...item, bookmarkedAt: new Date().toISOString() });
  }
  await saveBookmarks(bookmarks);
}

export async function removeBookmark(
  folder: string,
  itemKey: string
): Promise<void> {
  const bookmarks = await getBookmarks();
  if (!bookmarks[folder]) return;
  bookmarks[folder] = bookmarks[folder].filter(
    (b) => (b.id ?? b.name) !== itemKey
  );
  await saveBookmarks(bookmarks);
}

export async function removeBookmarkFromAll(itemKey: string): Promise<void> {
  const bookmarks = await getBookmarks();
  Object.keys(bookmarks).forEach((folder) => {
    bookmarks[folder] = bookmarks[folder].filter(
      (b) => (b.id ?? b.name) !== itemKey
    );
  });
  await saveBookmarks(bookmarks);
}

export async function isBookmarked(itemKey: string): Promise<boolean> {
  const bookmarks = await getBookmarks();
  return Object.values(bookmarks).some((folder) =>
    folder.some((b) => (b.id ?? b.name) === itemKey)
  );
}

export async function getAllBookmarkedIds(): Promise<string[]> {
  const bookmarks = await getBookmarks();
  const ids = new Set<string>();
  Object.values(bookmarks).forEach((folder) => {
    folder.forEach((item) => {
      const k = item.id ?? item.name;
      if (k) ids.add(k);
    });
  });
  return Array.from(ids);
}

export async function toggleBookmarkItem(item: BookmarkItem): Promise<boolean> {
  const key = item.id ?? item.name;
  if (!key) return false;
  const already = await isBookmarked(key);
  if (already) {
    await removeBookmarkFromAll(key);
    return false;
  }
  await addBookmark(DEFAULT_BOOKMARK_FOLDER, item);
  return true;
}

export async function createFolder(name: string): Promise<void> {
  const bookmarks = await getBookmarks();
  if (!bookmarks[name]) {
    bookmarks[name] = [];
    await saveBookmarks(bookmarks);
  }
}

export async function deleteFolder(name: string): Promise<void> {
  const bookmarks = await getBookmarks();
  delete bookmarks[name];
  await saveBookmarks(bookmarks);
}

export async function renameFolder(
  oldName: string,
  newName: string
): Promise<void> {
  if (oldName === newName) return;
  const bookmarks = await getBookmarks();
  if (!bookmarks[oldName] || bookmarks[newName]) return;
  bookmarks[newName] = bookmarks[oldName];
  delete bookmarks[oldName];
  await saveBookmarks(bookmarks);
}

export async function getProfile(): Promise<Profile> {
  try {
    const raw = await AsyncStorage.getItem(PROFILE_KEY);
    return { ...DEFAULT_PROFILE, ...(raw ? JSON.parse(raw) : {}) };
  } catch {
    return { ...DEFAULT_PROFILE };
  }
}

export async function updateProfile(
  updates: Partial<Profile>
): Promise<Profile> {
  const profile = await getProfile();
  const next = { ...profile, ...updates };
  await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(next));
  return next;
}
