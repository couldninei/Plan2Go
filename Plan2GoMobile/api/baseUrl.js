import { Platform } from 'react-native';

const DEV_URL = Platform.OS === 'android'
  ? 'http://10.0.2.2:5001'
  : 'http://localhost:5001';

export const API_BASE = DEV_URL;