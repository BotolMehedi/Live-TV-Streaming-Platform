import { useState, useEffect } from 'react';
import { verifyAdmin, updateAdminPassword, getTVPlaylists, setTVPlaylists, getMoviePlaylists, setMoviePlaylists, clearAuthToken } from '@/lib/store';
import { Lock, LogOut, Plus, Trash2, Save, Tv, Film, KeyRound, Loader2, ShieldCheck, Eye, EyeOff, CheckCircle2, XCircle } from 'lucide-react';

const SESSION_KEY = 'ahcl_admin_session';
const SESSION_TTL = 8 * 60 * 60 * 1000;

function saveSession(username: string) {
  localStorage.setItem(SESSION_KEY, JSON.stringify({ username, expires: Date.now() + SESSION_TTL }));
}

function loadSession(): string | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const { username, expires } = JSON.parse(raw);
    if (Date.now() > expires) { localStorage.removeItem(SESSION_KEY); return null; }
    return username;
  } catch { return null; }
}

function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
  *, *::before, *::after { box-sizing: border-box; }
  .adm-root { font-family: 'DM Sans', sans-serif; }
  .adm-display { font-family: 'Syne', sans-serif; }

  .adm-glass { background: rgba(255,255,255,0.03); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.08); }
  .adm-card { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); }

  .adm-input {
    display: block; width: 100%;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    color: #e2e8f0;
    transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
  }
  .adm-input::placeholder { color: rgba(255,255,255,0.22); }
  .adm-input:focus {
    outline: none;
    border-color: #6366f1;
    background: rgba(99,102,241,0.06);
    box-shadow: 0 0 0 3px rgba(99,102,241,0.15);
  }

  .adm-btn-primary {
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    transition: opacity 0.2s, transform 0.2s, box-shadow 0.2s;
    box-shadow: 0 4px 20px rgba(99,102,241,0.28);
    border: none; cursor: pointer; color: white;
    display: inline-flex; align-items: center; gap: 8px;
  }
  .adm-btn-primary:hover:not(:disabled) { opacity: 0.88; transform: translateY(-1px); box-shadow: 0 6px 24px rgba(99,102,241,0.38); }
  .adm-btn-primary:disabled { opacity: 0.48; cursor: not-allowed; transform: none; }

  .adm-btn-ghost { background: none; border: none; cursor: pointer; transition: color 0.2s, background 0.2s; display: inline-flex; align-items: center; gap: 6px; }
  .adm-btn-ghost:hover { color: #ef4444 !important; background: rgba(239,68,68,0.08); }

  /* Tab bar — scrollable on mobile, no scrollbar */
  .adm-tabs { display: flex; gap: 6px; overflow-x: auto; padding-bottom: 2px; }
  .adm-tabs::-webkit-scrollbar { display: none; }
  .adm-tabs { scrollbar-width: none; -ms-overflow-style: none; }
  .adm-tab {
    flex-shrink: 0; display: inline-flex; align-items: center; gap: 8px;
    border: 1px solid transparent; background: none; cursor: pointer;
    transition: all 0.2s; white-space: nowrap;
    padding: 9px 16px; border-radius: 11px; font-size: 13px; font-weight: 500;
  }
  .adm-tab-active { background: linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.2)); border-color: rgba(99,102,241,0.35) !important; color: #a5b4fc; }
  .adm-tab-inactive { color: rgba(255,255,255,0.4); }
  .adm-tab-inactive:hover { color: rgba(255,255,255,0.75); background: rgba(255,255,255,0.05); }

  /* Card footer stacks on small screens */
  .adm-card-footer { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
  @media (max-width: 480px) {
    .adm-card-footer { flex-direction: column; align-items: stretch; }
    .adm-card-footer > p { text-align: center; }
    .adm-card-footer > button { width: 100% !important; justify-content: center; }
  }

  /* Toast: full-width on tiny screens */
  .adm-toast-wrap { position: fixed; top: 14px; right: 14px; z-index: 100; max-width: calc(100vw - 28px); }

  /* URL rows: on very small screens hide the row number */
  @media (max-width: 380px) {
    .adm-row-num { display: none !important; }
  }

  /* Animations */
  .adm-fade-in { animation: admFade 0.3s ease forwards; }
  @keyframes admFade { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
  .adm-shake { animation: admShake 0.4s ease; }
  @keyframes admShake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-5px)} 75%{transform:translateX(5px)} }
  .adm-slide { animation: admSlide 0.2s ease forwards; }
  @keyframes admSlide { from{opacity:0;transform:translateX(-6px)} to{opacity:1;transform:translateX(0)} }
  .adm-toast-in { animation: admToastIn 0.3s ease; }
  @keyframes admToastIn { from{opacity:0;transform:translateY(-10px)} to{opacity:1;transform:translateY(0)} }
  .adm-spin { animation: spin 1s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }
`;

const Admin = () => {
  const [loggedIn, setLoggedIn] = useState(false);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [tab, setTab] = useState<'tv' | 'movies' | 'password'>('tv');
  const [tvUrls, setTvUrls] = useState<string[]>([]);
  const [movieUrls, setMovieUrls] = useState<string[]>([]);
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const [loggingIn, setLoggingIn] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const user = loadSession();
    if (user) {
      setLoggedIn(true);
      Promise.all([getTVPlaylists(), getMoviePlaylists()]).then(([tv, movies]) => {
        setTvUrls(tv); setMovieUrls(movies); setSessionLoading(false);
      });
    } else {
      setSessionLoading(false);
    }
  }, []);

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoggingIn(true); setError('');
    const valid = await verifyAdmin(username, password);
    if (valid) {
      saveSession(username);
      setLoggedIn(true);
      const [tv, movies] = await Promise.all([getTVPlaylists(), getMoviePlaylists()]);
      setTvUrls(tv); setMovieUrls(movies);
    } else {
      setError('Invalid credentials. Please try again.');
    }
    setLoggingIn(false);
  };

  const handleLogout = () => {
    clearAuthToken(); clearSession();
    setLoggedIn(false); setUsername(''); setPassword(''); setError('');
  };

  const saveTv = async () => {
    setSaving(true);
    const ok = await setTVPlaylists(tvUrls.filter(Boolean));
    setSaving(false);
    showToast(ok ? 'TV playlists saved.' : 'Failed to save TV playlists.', ok);
  };

  const saveMovies = async () => {
    setSaving(true);
    const ok = await setMoviePlaylists(movieUrls.filter(Boolean));
    setSaving(false);
    showToast(ok ? 'Movie playlists saved.' : 'Failed to save Movie playlists.', ok);
  };

  const changePassword = async () => {
    if (!newPass || newPass.length < 4) { setError('Password must be at least 4 characters.'); return; }
    if (newPass !== confirmPass) { setError('Passwords do not match.'); return; }
    setSaving(true);
    const ok = await updateAdminPassword(newPass);
    setSaving(false);
    if (ok) { setNewPass(''); setConfirmPass(''); setError(''); showToast('Password updated.', true); }
    else setError('Failed to update password.');
  };

  // ── Loading ──────────────────────────────────────────────────────────────
  if (sessionLoading) return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <style>{STYLES}</style>
      <Loader2 className="adm-spin" style={{ width: 32, height: 32, color: '#6366f1' }} />
    </div>
  );

  // ── Login ────────────────────────────────────────────────────────────────
  if (!loggedIn) return (
    <div className="adm-root" style={{
      minHeight: '100vh', background: '#0a0a0f',
      backgroundImage: 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(99,102,241,0.15) 0%, transparent 60%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '16px',
    }}>
      <style>{STYLES}</style>
      <div className="adm-fade-in" style={{ width: '100%', maxWidth: 380 }}>
        {/* Logo */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 28 }}>
          <div style={{
            width: 60, height: 60, borderRadius: 16, marginBottom: 14,
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            boxShadow: '0 8px 32px rgba(99,102,241,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <ShieldCheck style={{ width: 28, height: 28, color: 'white' }} />
          </div>
          <h1 className="adm-display" style={{ color: 'white', fontSize: 22, margin: 0 }}>Admin Portal</h1>
          <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: 13, marginTop: 4 }}>AHCL Control Panel</p>
        </div>

        <div className="adm-glass" style={{ borderRadius: 20, padding: '28px 24px' }}>
          {error && (
            <div className="adm-shake" style={{
              display: 'flex', alignItems: 'flex-start', gap: 10,
              padding: '12px 14px', borderRadius: 12, marginBottom: 18,
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
            }}>
              <XCircle style={{ width: 15, height: 15, color: '#f87171', flexShrink: 0, marginTop: 1 }} />
              <p style={{ color: '#fca5a5', fontSize: 13, margin: 0 }}>{error}</p>
            </div>
          )}
          <form onSubmit={handleLogin}>
            {/* Username */}
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 11, color: 'rgba(255,255,255,0.38)', textTransform: 'uppercase', letterSpacing: '0.09em', marginBottom: 7 }}>
                Username
              </label>
              <input type="text" placeholder="Enter username" value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="adm-input"
                style={{ padding: '11px 14px', borderRadius: 11, fontSize: 14 }}
              />
            </div>
            {/* Password */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 11, color: 'rgba(255,255,255,0.38)', textTransform: 'uppercase', letterSpacing: '0.09em', marginBottom: 7 }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input type={showPass ? 'text' : 'password'} placeholder="Enter password" value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="adm-input"
                  style={{ padding: '11px 44px 11px 14px', borderRadius: 11, fontSize: 14 }}
                />
                <button type="button" onClick={() => setShowPass(!showPass)} style={{
                  position: 'absolute', right: 11, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'rgba(255,255,255,0.3)', padding: 3, display: 'flex',
                }}>
                  {showPass ? <EyeOff style={{ width: 16, height: 16 }} /> : <Eye style={{ width: 16, height: 16 }} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loggingIn} className="adm-btn-primary" style={{
              width: '100%', justifyContent: 'center',
              padding: '12px', borderRadius: 12, fontSize: 14, fontWeight: 600,
            }}>
              {loggingIn
                ? <><Loader2 style={{ width: 16, height: 16 }} className="adm-spin" /> Verifying...</>
                : <><Lock style={{ width: 15, height: 15 }} /> Sign In</>
              }
            </button>
          </form>
        </div>
        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.18)', fontSize: 12, marginTop: 18 }}>Session persists for 8 hours</p>
      </div>
    </div>
  );

  // ── Dashboard ────────────────────────────────────────────────────────────
  const tabs = [
    { key: 'tv' as const, Icon: Tv, label: 'TV Playlists' },
    { key: 'movies' as const, Icon: Film, label: 'Movies' },
    { key: 'password' as const, Icon: KeyRound, label: 'Security' },
  ];
  const urlList = tab === 'tv' ? tvUrls : movieUrls;
  const setUrlList = tab === 'tv' ? setTvUrls : setMovieUrls;
  const urlPlaceholder = tab === 'tv' ? 'https://example.com/playlist.m3u' : 'https://example.com/movies.m3u';
  const handleSave = tab === 'tv' ? saveTv : saveMovies;

  return (
    <div className="adm-root" style={{
      minHeight: '100vh', background: '#0a0a0f',
      backgroundImage: 'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(99,102,241,0.08) 0%, transparent 60%)',
    }}>
      <style>{STYLES}</style>

      {/* Toast */}
      {toast && (
        <div className="adm-toast-wrap">
          <div className="adm-toast-in" style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '11px 16px', borderRadius: 14, fontSize: 13, fontWeight: 500,
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            background: toast.ok ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
            border: `1px solid ${toast.ok ? 'rgba(16,185,129,0.28)' : 'rgba(239,68,68,0.28)'}`,
            color: toast.ok ? '#6ee7b7' : '#fca5a5',
          }}>
            {toast.ok
              ? <CheckCircle2 style={{ width: 15, height: 15, flexShrink: 0 }} />
              : <XCircle style={{ width: 15, height: 15, flexShrink: 0 }} />
            }
            {toast.msg}
          </div>
        </div>
      )}

      {/* Header */}
      <header className="adm-glass" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', position: 'sticky', top: 0, zIndex: 40 }}>
        <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 58 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 30, height: 30, borderRadius: 9, flexShrink: 0,
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <ShieldCheck style={{ width: 15, height: 15, color: 'white' }} />
            </div>
            <span className="adm-display" style={{ color: 'rgba(255,255,255,0.88)', fontSize: 14, letterSpacing: '0.02em' }}>Admin</span>
          </div>
          <button onClick={handleLogout} className="adm-btn-ghost" style={{ padding: '7px 11px', borderRadius: 9, color: 'rgba(255,255,255,0.38)', fontSize: 13 }}>
            <LogOut style={{ width: 14, height: 14 }} /> Sign Out
          </button>
        </div>
      </header>

      <main style={{ maxWidth: 960, margin: '0 auto', padding: '24px 16px 56px' }}>

        {/* Tab bar */}
        <div className="adm-tabs" style={{ marginBottom: 20 }}>
          {tabs.map(({ key, Icon, label }) => (
            <button key={key} onClick={() => { setTab(key); setError(''); }}
              className={`adm-tab ${tab === key ? 'adm-tab-active' : 'adm-tab-inactive'}`}>
              <Icon style={{ width: 14, height: 14 }} /> {label}
            </button>
          ))}
        </div>

        {/* TV / Movies */}
        {(tab === 'tv' || tab === 'movies') && (
          <div className="adm-card" style={{ borderRadius: 18, padding: '22px 18px' }}>
            {/* Panel header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 22, flexWrap: 'wrap' }}>
              <div>
                <h2 className="adm-display" style={{ color: 'white', fontSize: 16, margin: 0 }}>
                  {tab === 'tv' ? 'TV Playlist URLs' : 'Movie Playlist URLs'}
                </h2>
                <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13, margin: '3px 0 0' }}>
                  {urlList.length} source{urlList.length !== 1 ? 's' : ''} configured
                </p>
              </div>
              <button
                onClick={() => setUrlList([...urlList, ''])}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '8px 14px', borderRadius: 9,
                  border: '1px solid rgba(255,255,255,0.1)', background: 'none',
                  color: 'rgba(255,255,255,0.58)', fontSize: 13, cursor: 'pointer',
                  transition: 'all 0.18s', whiteSpace: 'nowrap', flexShrink: 0,
                }}
                onMouseEnter={e => { const el = e.currentTarget; el.style.borderColor = 'rgba(99,102,241,0.45)'; el.style.color = 'white'; el.style.background = 'rgba(99,102,241,0.1)'; }}
                onMouseLeave={e => { const el = e.currentTarget; el.style.borderColor = 'rgba(255,255,255,0.1)'; el.style.color = 'rgba(255,255,255,0.58)'; el.style.background = 'none'; }}
              >
                <Plus style={{ width: 13, height: 13 }} /> Add URL
              </button>
            </div>

            {/* URL list */}
            {urlList.length === 0 ? (
              <div style={{ padding: '36px 16px', textAlign: 'center', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: 11 }}>
                <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: 13, margin: 0 }}>
                  No playlist URLs yet. Click "Add URL" to get started.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                {urlList.map((url, i) => (
                  <div key={i} className="adm-slide" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className="adm-row-num" style={{ color: 'rgba(255,255,255,0.2)', fontSize: 11, fontFamily: 'monospace', width: 22, textAlign: 'center', flexShrink: 0 }}>
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <input
                      value={url}
                      onChange={(e) => { const u = [...urlList]; u[i] = e.target.value; setUrlList(u); }}
                      placeholder={urlPlaceholder}
                      className="adm-input"
                      style={{ padding: '10px 13px', borderRadius: 10, fontSize: 13, fontFamily: 'monospace', flex: 1, minWidth: 0 }}
                    />
                    <button
                      onClick={() => setUrlList(urlList.filter((_, j) => j !== i))}
                      style={{
                        padding: 8, borderRadius: 8, border: 'none', background: 'none',
                        cursor: 'pointer', color: 'rgba(255,255,255,0.22)',
                        display: 'flex', alignItems: 'center', flexShrink: 0, transition: 'all 0.15s',
                      }}
                      onMouseEnter={e => { const el = e.currentTarget; el.style.color = '#f87171'; el.style.background = 'rgba(239,68,68,0.1)'; }}
                      onMouseLeave={e => { const el = e.currentTarget; el.style.color = 'rgba(255,255,255,0.22)'; el.style.background = 'none'; }}
                    >
                      <Trash2 style={{ width: 14, height: 14 }} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Footer */}
            <div className="adm-card-footer" style={{ marginTop: 22, paddingTop: 18, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <p style={{ color: 'rgba(255,255,255,0.22)', fontSize: 12, margin: 0 }}>
                Changes are saved to the server immediately.
              </p>
              <button onClick={handleSave} disabled={saving} className="adm-btn-primary" style={{
                padding: '10px 20px', borderRadius: 10, fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap',
              }}>
                {saving ? <Loader2 style={{ width: 14, height: 14 }} className="adm-spin" /> : <Save style={{ width: 14, height: 14 }} />}
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        )}

        {/* Password */}
        {tab === 'password' && (
          <div className="adm-card" style={{ borderRadius: 18, padding: '22px 18px', maxWidth: 440, width: '100%' }}>
            <h2 className="adm-display" style={{ color: 'white', fontSize: 16, margin: '0 0 4px' }}>Change Password</h2>
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13, margin: '0 0 22px' }}>Update your admin credentials.</p>

            {error && (
              <div style={{
                display: 'flex', alignItems: 'flex-start', gap: 10,
                padding: '12px 14px', borderRadius: 12, marginBottom: 18,
                background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
              }}>
                <XCircle style={{ width: 15, height: 15, color: '#f87171', flexShrink: 0, marginTop: 1 }} />
                <p style={{ color: '#fca5a5', fontSize: 13, margin: 0 }}>{error}</p>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { label: 'New Password', val: newPass, set: setNewPass, show: showNewPass, setShow: setShowNewPass },
                { label: 'Confirm Password', val: confirmPass, set: setConfirmPass, show: showConfirmPass, setShow: setShowConfirmPass },
              ].map(({ label, val, set, show, setShow }) => (
                <div key={label}>
                  <label style={{ display: 'block', fontSize: 11, color: 'rgba(255,255,255,0.38)', textTransform: 'uppercase', letterSpacing: '0.09em', marginBottom: 7 }}>
                    {label}
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input type={show ? 'text' : 'password'} placeholder="••••••••" value={val}
                      onChange={(e) => set(e.target.value)}
                      className="adm-input"
                      style={{ padding: '11px 44px 11px 14px', borderRadius: 11, fontSize: 14 }}
                    />
                    <button type="button" onClick={() => setShow(!show)} style={{
                      position: 'absolute', right: 11, top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: 'rgba(255,255,255,0.3)', display: 'flex', padding: 3,
                    }}>
                      {show ? <EyeOff style={{ width: 16, height: 16 }} /> : <Eye style={{ width: 16, height: 16 }} />}
                    </button>
                  </div>
                </div>
              ))}

              {newPass && confirmPass && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: newPass === confirmPass ? '#6ee7b7' : '#f87171' }}>
                  {newPass === confirmPass
                    ? <CheckCircle2 style={{ width: 13, height: 13 }} />
                    : <XCircle style={{ width: 13, height: 13 }} />
                  }
                  {newPass === confirmPass ? 'Passwords match' : 'Passwords do not match'}
                </div>
              )}

              <button onClick={changePassword} disabled={saving} className="adm-btn-primary" style={{
                justifyContent: 'center', width: '100%',
                padding: '12px', borderRadius: 12, fontSize: 14, fontWeight: 600,
              }}>
                {saving ? <Loader2 style={{ width: 15, height: 15 }} className="adm-spin" /> : <KeyRound style={{ width: 15, height: 15 }} />}
                {saving ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Admin;