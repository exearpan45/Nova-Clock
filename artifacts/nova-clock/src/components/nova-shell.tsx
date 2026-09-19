import { type FormEvent, type ReactNode, useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { motion } from 'framer-motion';
import {
  AlarmClock, CalendarDays, Clock3, Globe2, Hourglass, LayoutGrid,
  ListTodo, LoaderCircle, LockKeyhole, Menu, Moon, Settings2, Sun, Timer, UserRound, X,
} from 'lucide-react';
import { signInWithPassword, signUpWithPassword, supabaseConfig } from '@/lib/supabase';

const navItems = [
  { href: '/', label: 'Overview', icon: LayoutGrid },
  { href: '/alarms', label: 'Alarms', icon: AlarmClock },
  { href: '/stopwatch', label: 'Stopwatch', icon: Timer },
  { href: '/timer', label: 'Timer', icon: Hourglass },
  { href: '/world-clock', label: 'World clock', icon: Globe2 },
  { href: '/countdown', label: 'Countdowns', icon: ListTodo },
  { href: '/calendar', label: 'Calendar', icon: CalendarDays },
];

const secondaryItems = [
  { href: '/settings', label: 'Settings', icon: Settings2 },
  { href: '/profile', label: 'Profile', icon: UserRound },
];

export function NovaShell({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'welcome' | 'login' | 'signup'>('welcome');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authBusy, setAuthBusy] = useState(false);
  const [authMessage, setAuthMessage] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  useEffect(() => {
    setAuthOpen(window.localStorage.getItem('nova-auth-seen') !== 'true');
    const savedTheme = window.localStorage.getItem('nova-theme');
    const nextDarkMode = savedTheme === 'dark';
    setDarkMode(nextDarkMode);
    document.documentElement.classList.toggle('dark', nextDarkMode);
  }, []);
  const toggleDarkMode = () => {
    setDarkMode((current) => {
      const next = !current;
      window.localStorage.setItem('nova-theme', next ? 'dark' : 'light');
      document.documentElement.classList.toggle('dark', next);
      return next;
    });
  };
  const dismissAuth = () => {
    window.localStorage.setItem('nova-auth-seen', 'true');
    setAuthOpen(false);
    setAuthMessage('');
  };
  const submitAuth = async (event: FormEvent) => {
    event.preventDefault();
    setAuthBusy(true);
    setAuthMessage('');
    const result = authMode === 'signup'
      ? await signUpWithPassword(authEmail, authPassword)
      : await signInWithPassword(authEmail, authPassword);
    setAuthBusy(false);
    if (!result.ok) {
      setAuthMessage(result.message ?? 'We could not sign you in right now.');
      return;
    }
    window.localStorage.setItem('nova-signed-in', 'true');
    dismissAuth();
  };
  const current = useMemo(() => [...navItems, ...secondaryItems].find((item) => item.href === location), [location]);
  const links = (items: typeof navItems) => items.map(({ href, label, icon: Icon }) => (
    <Link
      key={href}
      href={href}
      data-testid={`link-${label.toLowerCase().replaceAll(' ', '-')}`}
      onClick={() => setMenuOpen(false)}
      className={`group flex min-h-11 items-center gap-3 rounded-xl px-3.5 text-[13px] font-semibold transition-all ${
        location === href
          ? 'bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))] shadow-[0_8px_18px_rgba(185,210,74,.16)]'
          : 'text-[hsl(var(--sidebar-foreground)/.68)] hover:bg-white/[.07] hover:text-[hsl(var(--sidebar-foreground))]'
      }`}
    >
      <Icon size={17} strokeWidth={location === href ? 2.4 : 1.8} />
      <span>{label}</span>
      {location === href && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-current" />}
    </Link>
  ));

  return (
    <div className="app-noise min-h-[100dvh] bg-[hsl(var(--background))]">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[238px] flex-col bg-[#1c1a2b] px-4 py-5 text-[#f5f1e6] lg:flex">
        <Link href="/" data-testid="link-brand" className="mb-9 flex items-center gap-3 px-3">
          <span className="grid h-9 w-9 place-items-center rounded-[12px] bg-[#d8ef68] text-[#1c1a2b]">
            <Clock3 size={20} strokeWidth={2.5} />
          </span>
          <span className="display text-[17px] font-bold tracking-[-.04em]">NOVA<span className="text-[#d8ef68]">.</span></span>
        </Link>
        <div className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[.18em] text-white/30">Your cockpit</div>
        <nav className="space-y-1">{links(navItems)}</nav>
        <div className="mt-auto border-t border-white/10 pt-4">
          <nav className="space-y-1">{links(secondaryItems)}</nav>
          <button data-testid="button-theme-quick" className="mt-3 flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-left text-[12px] font-semibold text-white/45 hover:bg-white/[.07] hover:text-white/80" onClick={toggleDarkMode}>
            {darkMode ? <Sun size={16} /> : <Moon size={16} />}<span>{darkMode ? 'Light palette' : 'Night palette'}</span><span className="ml-auto h-2 w-2 rounded-full bg-[#d8ef68]" />
          </button>
        </div>
      </aside>

      {menuOpen && <div className="fixed inset-0 z-40 bg-[#1c1a2b]/30 backdrop-blur-sm lg:hidden" onClick={() => setMenuOpen(false)} />}
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-[270px] flex-col bg-[#1c1a2b] px-4 py-5 text-[#f5f1e6] transition-transform lg:hidden ${menuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="mb-9 flex items-center justify-between px-3">
          <Link href="/" onClick={() => setMenuOpen(false)} className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-[12px] bg-[#d8ef68] text-[#1c1a2b]"><Clock3 size={20} /></span><span className="display text-[17px] font-bold">NOVA<span className="text-[#d8ef68]">.</span></span></Link>
          <button data-testid="button-close-menu" onClick={() => setMenuOpen(false)} className="rounded-full p-2 text-white/60"><X size={18} /></button>
        </div>
        <nav className="space-y-1">{links(navItems)}</nav>
        <div className="mt-auto border-t border-white/10 pt-4"><nav className="space-y-1">{links(secondaryItems)}</nav></div>
      </aside>

      <div className="min-h-[100dvh] lg:pl-[238px]">
        <header className="sticky top-0 z-30 flex h-[68px] items-center justify-between border-b border-[hsl(var(--border)/.55)] bg-[hsl(var(--background)/.84)] px-5 backdrop-blur-xl sm:px-8 lg:px-10">
          <div className="flex items-center gap-3">
            <button data-testid="button-open-menu" className="rounded-xl p-2 lg:hidden" onClick={() => setMenuOpen(true)}><Menu size={21} /></button>
            <div className="text-sm font-semibold text-[hsl(var(--muted-foreground))]">{current?.label ?? 'Overview'}</div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4 text-[11px] font-semibold text-[hsl(var(--muted-foreground))]">
            <span className="hidden items-center gap-2 sm:flex"><span className="h-1.5 w-1.5 rounded-full bg-[#a9c94d]" />Local cockpit</span>
            <button data-testid="button-header-theme" aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'} onClick={toggleDarkMode} className="grid h-9 w-9 place-items-center rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--card))] hover:border-[hsl(var(--accent))]">{darkMode ? <Sun size={16} /> : <Moon size={16} />}</button>
            <Link href="/profile" data-testid="link-header-profile" className="grid h-9 w-9 place-items-center rounded-full bg-[#dedbd0] text-[#27243a] hover:bg-[#d8ef68]"><UserRound size={16} /></Link>
          </div>
        </header>
        <motion.main initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .35 }} className="mx-auto max-w-[1400px] px-5 pb-28 pt-7 sm:px-8 lg:px-10 lg:pb-10">{children}</motion.main>
      </div>

      <nav className="fixed inset-x-3 bottom-3 z-30 flex items-center justify-around rounded-[22px] border border-[hsl(var(--border)/.65)] bg-[hsl(var(--card)/.94)] p-2 shadow-[0_12px_35px_rgba(38,34,64,.13)] backdrop-blur-xl lg:hidden">
        {navItems.slice(0, 5).map(({ href, label, icon: Icon }) => <Link key={href} href={href} data-testid={`mobile-link-${label.toLowerCase().replaceAll(' ', '-')}`} className={`grid h-11 min-w-12 place-items-center rounded-2xl ${location === href ? 'bg-[hsl(var(--accent))] text-[#202033]' : 'text-[hsl(var(--muted-foreground))]'}`}><Icon size={18} /><span className="sr-only">{label}</span></Link>)}
      </nav>
      <footer className="px-5 pb-24 pt-2 text-center text-[10px] font-semibold tracking-[.08em] text-[hsl(var(--muted-foreground)/.75)] sm:px-8 lg:pb-5 lg:pl-[238px]">
        © 2026 NOVA CLOCK · Developed by Arpan Goswami
      </footer>
      {authOpen && (
        <div className="fixed inset-0 z-[60] grid place-items-center bg-[#1c1a2b]/55 p-4 backdrop-blur-md">
          <div className="w-full max-w-[460px] overflow-hidden rounded-[28px] border border-white/15 bg-[#27243b] text-[#f7f2e7] shadow-2xl">
            <div className="p-7 sm:p-9">
              <div className="mb-8 flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#d8ef68] text-[#27243b]"><Clock3 size={22} /></span>
                <div><p className="display text-lg font-bold tracking-[-.04em]">NOVA<span className="text-[#d8ef68]">.</span></p><p className="text-[10px] uppercase tracking-[.18em] text-white/45">Smart time. Simplified.</p></div>
              </div>
              {authMode === 'welcome' ? (
                <>
                  <p className="text-[10px] font-bold uppercase tracking-[.18em] text-[#d8ef68]">Welcome to Nova Clock</p>
                  <h2 className="display mt-3 text-3xl font-bold leading-[.98] tracking-[-.06em]">Your time,<br />in one calm place.</h2>
                  <p className="mt-4 max-w-sm text-sm leading-6 text-white/58">Use guest mode now, or sign in to keep alarms, themes, and routines with you across devices.</p>
                  <div className="mt-8 space-y-2.5">
                    <button onClick={() => setAuthMode('login')} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#d8ef68] px-4 text-sm font-bold text-[#27243b] transition-transform hover:-translate-y-0.5"><LockKeyhole size={16} /> Sign in</button>
                    <button onClick={() => setAuthMode('signup')} className="min-h-12 w-full rounded-xl border border-white/15 px-4 text-sm font-bold text-white hover:bg-white/[.07]">Create account</button>
                    <button onClick={dismissAuth} className="min-h-12 w-full rounded-xl px-4 text-xs font-bold text-white/55 hover:text-white">Continue as guest</button>
                  </div>
                </>
              ) : (
                <form onSubmit={submitAuth}>
                  <button type="button" onClick={() => { setAuthMode('welcome'); setAuthMessage(''); }} className="mb-6 text-xs font-bold text-white/50 hover:text-white">← Back</button>
                  <p className="text-[10px] font-bold uppercase tracking-[.18em] text-[#d8ef68]">{authMode === 'signup' ? 'Create your account' : 'Welcome back'}</p>
                  <h2 className="display mt-3 text-3xl font-bold tracking-[-.06em]">{authMode === 'signup' ? 'Keep your rhythm.' : 'Pick up where you left off.'}</h2>
                  <div className="mt-7 space-y-3">
                    <label className="block"><span className="mb-2 block text-xs font-bold text-white/55">Email</span><input required type="email" value={authEmail} onChange={(event) => setAuthEmail(event.target.value)} className="h-12 w-full rounded-xl border border-white/15 bg-white/[.06] px-4 text-sm text-white outline-none focus:border-[#d8ef68]" placeholder="you@example.com" /></label>
                    <label className="block"><span className="mb-2 block text-xs font-bold text-white/55">Password</span><input required minLength={6} type="password" value={authPassword} onChange={(event) => setAuthPassword(event.target.value)} className="h-12 w-full rounded-xl border border-white/15 bg-white/[.06] px-4 text-sm text-white outline-none focus:border-[#d8ef68]" placeholder="At least 6 characters" /></label>
                  </div>
                  {authMessage && <p className="mt-4 rounded-xl bg-[#f2a68d]/15 px-3 py-2.5 text-xs leading-5 text-[#f2c5b5]">{authMessage}</p>}
                  {!supabaseConfig.configured && <p className="mt-4 text-[11px] leading-5 text-white/42">Supabase is not configured in this preview yet. You can still explore every clock tool as a guest.</p>}
                  <button disabled={authBusy} type="submit" className="mt-7 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#d8ef68] px-4 text-sm font-bold text-[#27243b] disabled:opacity-60">{authBusy && <LoaderCircle size={16} className="animate-spin" />}{authMode === 'signup' ? 'Create account' : 'Sign in'}</button>
                  <button type="button" onClick={dismissAuth} className="mt-3 min-h-11 w-full text-xs font-bold text-white/50 hover:text-white">Continue as guest</button>
                </form>
              )}
            </div>
            <div className="border-t border-white/10 px-7 py-4 text-[10px] leading-5 text-white/35 sm:px-9">Your clock keeps working offline. Cloud sync is optional and uses only your Supabase public client configuration.</div>
          </div>
        </div>
      )}
    </div>
  );
}