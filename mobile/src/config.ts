import Constants from 'expo-constants';
import { Platform } from 'react-native';

const getBaseUrl = () => {
  if (process.env.EXPO_PUBLIC_API_BASE_URL) return process.env.EXPO_PUBLIC_API_BASE_URL;
  
  const debuggerHost = Constants.expoConfig?.hostUri;
  const localhost = debuggerHost?.split(':').shift();
  
  if (localhost) {
    return `http://${localhost}:5000/api`;
  }
  
  return Platform.OS === 'android' ? 'http://10.0.2.2:5000/api' : 'http://localhost:5000/api';
};

export const API_BASE_URL = getBaseUrl();

export const GPS_MAX_ACCURACY_METERS = 100;
export const GPS_MAX_CAPTURE_AGE_MINUTES = 5;
