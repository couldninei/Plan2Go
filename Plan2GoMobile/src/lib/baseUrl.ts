import { Platform } from 'react-native';

export const API_BASE: string =
  Platform.OS === 'android' ? 'http://10.0.2.2:5001' : 'http://localhost:5001';
