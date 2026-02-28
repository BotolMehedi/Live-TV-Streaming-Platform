// Store module — uses API when API_URL is set, falls back to localStorage for dev

const API_URL = import.meta.env.VITE_API_URL || '';

// ==================== Auth Token Management ====================
let authToken = localStorage.getItem('ahcl_token') || '';

export function setAuthToken(token: string) {
  authToken = token;
  localStorage.setItem('ahcl_token', token);
}

export function getAuthToken(): string {
  return authToken;
}

export function clearAuthToken() {
  authToken = '';
  localStorage.removeItem('ahcl_token');
}

function authHeaders(): Record<string, string> {
  return authToken ? { Authorization: `Basic ${authToken}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
}

// ==================== API Mode Detection ====================
export function isApiMode(): boolean {
  return !!API_URL;
}

// ==================== Admin Auth ====================

interface AdminCredentials {
  username: string;
  password: string;
}

const ADMIN_KEY = 'ahcl_admin';
const PLAYLISTS_KEY = 'ahcl_playlists';
const MOVIE_PLAYLISTS_KEY = 'ahcl_movie_playlists';

const DEFAULT_ADMIN: AdminCredentials = { username: 'admin', password: 'admin' };

const DEFAULT_TV_PLAYLISTS = [
  'https://raw.githubusercontent.com/abusaeeidx/Mrgify-BDIX-IPTV/refs/heads/main/playlist.m3u',
  'https://raw.githubusercontent.com/time2shine/IPTV/refs/heads/master/combined.m3u',
  'https://raw.githubusercontent.com/bugsfreeweb/LiveTVCollector/refs/heads/main/LiveTV/Worldwide/LiveTV.m3u',
  'https://raw.githubusercontent.com/bugsfreeweb/LiveTVCollector/refs/heads/main/LiveTV/USA/LiveTV.m3u',
  'https://raw.githubusercontent.com/bugsfreeweb/LiveTVCollector/refs/heads/main/LiveTV/Pakistan/LiveTV.m3u',
  'https://raw.githubusercontent.com/bugsfreeweb/LiveTVCollector/refs/heads/main/LiveTV/Bangladesh/LiveTV.m3u',
  'https://raw.githubusercontent.com/bugsfreeweb/LiveTVCollector/refs/heads/main/LiveTV/India/LiveTV.m3u',
];

const DEFAULT_MOVIE_PLAYLISTS = [
  'https://raw.githubusercontent.com/bugsfreeweb/LiveTVCollector/refs/heads/main/Movies/Worldwide/Movies.m3u',
  'https://raw.githubusercontent.com/bugsfreeweb/LiveTVCollector/refs/heads/main/Movies/WorldCollection/Movies.m3u',
  'https://raw.githubusercontent.com/bugsfreeweb/LiveTVCollector/refs/heads/main/Movies/Bollywood/Movies.m3u',
];

// ==================== Local-only helpers (dev mode) ====================

function getAdmin(): AdminCredentials {
  const stored = localStorage.getItem(ADMIN_KEY);
  return stored ? JSON.parse(stored) : DEFAULT_ADMIN;
}

// ==================== Public API ====================

/** Verify admin credentials — works with both API and localStorage */
export async function verifyAdmin(username: string, password: string): Promise<boolean> {
  if (isApiMode()) {
    try {
      const res = await fetch(`${API_URL}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) return false;
      const data = await res.json();
      if (data.token) setAuthToken(data.token);
      return true;
    } catch {
      return false;
    }
  }
  const admin = getAdmin();
  const valid = admin.username === username && admin.password === password;
  if (valid) setAuthToken(btoa(`${username}:${password}`));
  return valid;
}

/** Update admin password */
export async function updateAdminPassword(newPassword: string): Promise<boolean> {
  if (isApiMode()) {
    try {
      const res = await fetch(`${API_URL}/api/admin/password`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({ newPassword }),
      });
      if (!res.ok) return false;
      const data = await res.json();
      if (data.token) setAuthToken(data.token);
      return true;
    } catch {
      return false;
    }
  }
  const admin = getAdmin();
  admin.password = newPassword;
  localStorage.setItem(ADMIN_KEY, JSON.stringify(admin));
  setAuthToken(btoa(`${admin.username}:${newPassword}`));
  return true;
}

/** Get TV playlist URLs */
export async function getTVPlaylists(): Promise<string[]> {
  if (isApiMode()) {
    try {
      const res = await fetch(`${API_URL}/api/playlists?type=tv`);
      const data = await res.json();
      return data.urls || [];
    } catch {
      return DEFAULT_TV_PLAYLISTS;
    }
  }
  const stored = localStorage.getItem(PLAYLISTS_KEY);
  return stored ? JSON.parse(stored) : DEFAULT_TV_PLAYLISTS;
}

/** Set TV playlist URLs */
export async function setTVPlaylists(urls: string[]): Promise<boolean> {
  if (isApiMode()) {
    try {
      const res = await fetch(`${API_URL}/api/admin/playlists`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({ type: 'tv', urls }),
      });
      return res.ok;
    } catch {
      return false;
    }
  }
  localStorage.setItem(PLAYLISTS_KEY, JSON.stringify(urls));
  return true;
}

/** Get Movie playlist URLs */
export async function getMoviePlaylists(): Promise<string[]> {
  if (isApiMode()) {
    try {
      const res = await fetch(`${API_URL}/api/playlists?type=movie`);
      const data = await res.json();
      return data.urls || [];
    } catch {
      return DEFAULT_MOVIE_PLAYLISTS;
    }
  }
  const stored = localStorage.getItem(MOVIE_PLAYLISTS_KEY);
  return stored ? JSON.parse(stored) : DEFAULT_MOVIE_PLAYLISTS;
}

/** Set Movie playlist URLs */
export async function setMoviePlaylists(urls: string[]): Promise<boolean> {
  if (isApiMode()) {
    try {
      const res = await fetch(`${API_URL}/api/admin/playlists`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({ type: 'movie', urls }),
      });
      return res.ok;
    } catch {
      return false;
    }
  }
  localStorage.setItem(MOVIE_PLAYLISTS_KEY, JSON.stringify(urls));
  return true;
}
