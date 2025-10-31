// API Configuration
export const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001').replace(/\/$/, '');
export const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5001';

// Helper function to get full image URL
export const getImageUrl = (path: string): string => {
  if (!path) return '';
  return path.startsWith('http') ? path : `${API_URL}${path}`;
};
