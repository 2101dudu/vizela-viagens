const isServer = typeof window === 'undefined';

export const API_BASE_URL = isServer
  ? "http://tarmac:8080/api"
  : (process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.eduardofaria.com/api");
