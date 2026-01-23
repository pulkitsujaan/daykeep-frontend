import axios from 'axios';

// 1. Determine the URL based on the environment
// Vercel will provide VITE_API_URL. Locally, it falls back to localhost.
export const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// 2. Create a custom Axios instance
const api = axios.create({
  baseURL: `${BASE_URL}/api`, // Note: We attach '/api' here automatically
});

export const getImageUrl = (path) => {
  if (!path) return '';
  // If it starts with http, it's a Cloudinary URL -> Return as is
  if (path.startsWith('http')) {
    return path;
  }
  // Otherwise, it's an old local upload -> Prepend backend URL
  return `${BASE_URL}${path}`;
};

export default api;