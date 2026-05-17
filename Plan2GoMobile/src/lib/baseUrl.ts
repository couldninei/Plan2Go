// src/lib/baseUrl.ts
//
// On the Android emulator, 10.0.2.2 is a special alias to the host machine's
// localhost (where your Express backend is running). iOS simulator and web
// can use localhost directly.
//
// If you're testing on a real device, change DEV_URL to your dev machine's
// LAN IP (e.g. 'http://192.168.1.42:5001') and make sure the device is on
// the same network.

import { Platform } from 'react-native';

export const API_BASE: string =
  Platform.OS === 'android' ? 'http://10.0.2.2:5001' : 'http://localhost:5001';
