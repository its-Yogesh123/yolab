import { useSession } from '@/context/sessions';
import React, { useState, useEffect } from 'react';
import {
  FiMenu, FiX, FiSun, FiMoon, FiGithub,
  FiUser, FiSettings, FiLogOut,
} from 'react-icons/fi';
import { QrCode, Link2, Zap, BarChart3, BookOpen, Image } from 'lucide-react';

/* ─── nav link definitions ─────────────────────────────────── */
const navLinks = [
  { name: 'Home',         href: '/' },
  { name: 'Short URL',    href: '/short-url' },
  { name: 'QR Code',      href: '/qr-code' },
  { name: 'OnePic',      href: '/image-processing' },
  { name: 'Pricing',      href: '/pricing' },
];

const mobileLinks = [
  { name: 'Home',         href: '/',               Icon: null },
  { name: 'Short URL',    href: '/short-url',      Icon: Link2 },
  { name: 'QR Code',      href: '/qr-code',        Icon: QrCode },
  { name: 'OnePic',      href: '/image-processing',        Icon: BookOpen },
  { name: 'Pricing',      href: '/pricing',        Icon: Zap },
];

/* ─── helpers ───────────────────────────────────────────────── */
function isActive(href) {
  if (typeof window === 'undefined') return false;
  return href === '/'
    ? window.location.pathname === '/'
    : window.location.pathname.startsWith(href);
}

/* ─── component ─────────────────────────────────────────────── */
export default function Navbar() {
  const [mobileOpen,  setMobileOpen]  = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [isDarkMode,  setIsDarkMode]  = useState(true);
  const { session, logout } = useSession();

  /* dark-mode class */
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  /* escape key */
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') { setMobileOpen(false); setProfileOpen(false); }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  /* body scroll lock */
  useEffect(() => {
    document.body.style.overflow = (mobileOpen || profileOpen) ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen, profileOpen]);

  const closeAll = () => { setMobileOpen(false); setProfileOpen(false); };

  return (
    <>
      {/* ── Main bar ── */}
      <nav className="sticky top-0 z-40 w-full border-b border-neutral-800 bg-[#050505]/90 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">

          {/* ── MOBILE bar (< md) ── */}
          <div className="flex md:hidden h-16 items-center justify-between">
            {/* Left: hamburger */}
            <button
              onClick={() => setMobileOpen(true)}
              className="h-9 w-9 flex items-center justify-center rounded-md text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors"
              aria-label="Open menu"
            >
              <FiMenu className="h-5 w-5" />
            </button>

            {/* Centre: logo */}
            <a href="/" className="flex items-center gap-2 text-white select-none">
              <div className="flex h-6 w-6 items-center justify-center rounded bg-neutral-200 text-neutral-950 font-black text-xs leading-none">
                Y
              </div>
              <span className="text-base font-bold tracking-tight">
                yo<span className="text-neutral-400 font-medium">LAB</span>
              </span>
            </a>

            {/* Right: avatar */}
            <button
              onClick={() => setProfileOpen(true)}
              className="h-8 w-8 rounded-full overflow-hidden border-2 border-transparent hover:border-neutral-600 transition-all"
              aria-label="Open account menu"
            >
              <img
                src={
                  session?.img ||
                  `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(session?.name || 'Y')}&backgroundColor=262626&textColor=e5e5e5`
                }
                alt="Avatar"
                className="h-full w-full object-cover"
              />
            </button>
          </div>

          {/* ── DESKTOP bar (≥ md) — 3-col grid ── */}
          <div className="hidden md:grid h-16 grid-cols-[auto_1fr_auto] items-center gap-6">

            {/* Col 1: Logo */}
            <a href="/" className="flex items-center gap-2 text-white select-none">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-neutral-200 text-neutral-950 font-black text-sm leading-none">
                Y
              </div>
              <span className="text-lg font-bold tracking-tight">
                yo<span className="text-neutral-400 font-medium">LAB</span>
              </span>
            </a>

            {/* Col 2: Centre links */}
            <div className="flex justify-center">
              <ul className="flex items-center gap-1">
                {navLinks.map((link) => {
                  const active = isActive(link.href);
                  return (
                    <li key={link.name}>
                      <a
                        href={link.href}
                        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-150 ${
                          active
                            ? 'text-white bg-neutral-800'
                            : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
                        }`}
                      >
                        {link.name}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Col 3: Right actions */}
            <div className="flex items-center gap-1">
              {/* Theme toggle */}
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="hidden md:flex h-8 w-8 items-center justify-center rounded-md text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors"
                aria-label="Toggle colour scheme"
              >
                {isDarkMode ? <FiSun className="h-4 w-4" /> : <FiMoon className="h-4 w-4" />}
              </button>

              {/* GitHub */}
              <a
                href="https://github.com/its-Yogesh123/yolab"
                target="_blank"
                rel="noreferrer"
                className="hidden md:flex h-8 w-8 items-center justify-center rounded-md text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors"
                aria-label="GitHub"
              >
                <FiGithub className="h-4 w-4" />
              </a>

              {/* Divider */}
              <div className="hidden md:block h-4 w-px bg-neutral-800 mx-1" />

              {/* Avatar / profile trigger */}
              <button
                onClick={() => setProfileOpen(true)}
                className="h-8 w-8 rounded-full overflow-hidden border-2 border-transparent hover:border-neutral-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500 transition-all"
                aria-label="Open account menu"
                aria-expanded={profileOpen}
              >
                <img
                  src={
                    session?.img ||
                    `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(session?.name || 'Y')}&backgroundColor=262626&textColor=e5e5e5`
                  }
                  alt="Avatar"
                  className="h-full w-full object-cover"
                />
              </button>

            </div>

          </div>{/* end desktop grid */}
        </div>
      </nav>


      {/* ── Backdrop ── */}
      {(mobileOpen || profileOpen) && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          aria-hidden="true"
          onClick={closeAll}
        />
      )}

      {/* ── Mobile nav drawer (left) ── */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-[#0a0a0a] border-r border-neutral-800 shadow-2xl transition-transform duration-300 ease-in-out ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation"
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between border-b border-neutral-800 px-4 py-4">
          <a href="/" className="flex items-center gap-2 text-white" onClick={closeAll}>
            <div className="flex h-6 w-6 items-center justify-center rounded bg-neutral-200 text-neutral-950 font-black text-xs">
              Y
            </div>
            <span className="text-base font-bold tracking-tight">
              yo<span className="text-neutral-400 font-medium">LAB</span>
            </span>
          </a>
          <button
            onClick={() => setMobileOpen(false)}
            className="h-8 w-8 flex items-center justify-center rounded-md text-neutral-400 hover:text-white hover:bg-neutral-900"
            aria-label="Close menu"
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>

        {/* Links */}
        <nav className="flex flex-col gap-1 p-3 flex-1">
          {mobileLinks.map(({ name, href, Icon }) => {
            const active = isActive(href);
            return (
              <a
                key={name}
                href={href}
                onClick={closeAll}
                className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? 'bg-neutral-800 text-white'
                    : 'text-neutral-400 hover:bg-neutral-900 hover:text-white'
                }`}
              >
                {Icon && <Icon className="h-4 w-4 shrink-0" />}
                {name}
              </a>
            );
          })}
        </nav>

        {/* Mobile footer */}
        <div className="border-t border-neutral-800 p-3">
          <button
            onClick={() => { setIsDarkMode(!isDarkMode); }}
            className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-neutral-400 hover:bg-neutral-900 hover:text-white transition-colors"
          >
            {isDarkMode ? <FiSun className="h-4 w-4" /> : <FiMoon className="h-4 w-4" />}
            {isDarkMode ? 'Light mode' : 'Dark mode'}
          </button>
        </div>
      </div>

      {/* ── Profile drawer (right) ── */}
      <div
        className={`fixed inset-y-0 right-0 z-50 w-80 bg-[#0a0a0a] border-l border-neutral-800 shadow-2xl transition-transform duration-300 ease-in-out ${
          profileOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Account menu"
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between border-b border-neutral-800 px-4 py-4">
          <span className="text-sm font-semibold text-white">Account</span>
          <button
            onClick={() => setProfileOpen(false)}
            className="h-8 w-8 flex items-center justify-center rounded-md text-neutral-400 hover:text-white hover:bg-neutral-900"
            aria-label="Close account menu"
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>

        {/* User card */}
        <div className="p-4">
          <div className="flex items-center gap-3 rounded-lg bg-neutral-900 border border-neutral-800 p-4 mb-5">
            <img
              src={
                session?.img ||
                `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(session?.name || 'Y')}&backgroundColor=262626&textColor=e5e5e5`
              }
              alt="Avatar"
              className="h-10 w-10 rounded-full bg-neutral-800 shrink-0"
            />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate">
                {session ? session.name : 'Guest'}
              </p>
              <p className="text-xs text-neutral-500 truncate mt-0.5">
                {session ? session.email : 'Sign in to continue'}
              </p>
            </div>
          </div>

          {session ? (
            <>
              <ul className="space-y-0.5">
                <li>
                  <button className="w-full flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors text-left">
                    <FiUser className="h-4 w-4 shrink-0" />
                    Your Profile
                  </button>
                </li>
                <li>
                  <a
                    href="/pricing"
                    onClick={closeAll}
                    className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors"
                  >
                    <Zap className="h-4 w-4 shrink-0" />
                    Subscription &amp; Pricing
                  </a>
                </li>
                {session?.role === 'admin' && (
                  <li>
                    <a
                      href="/admin/analytics"
                      onClick={closeAll}
                      className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors"
                    >
                      <BarChart3 className="h-4 w-4 shrink-0" />
                      Analytics Dashboard
                    </a>
                  </li>
                )}
                <li>
                  <button className="w-full flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors text-left">
                    <FiSettings className="h-4 w-4 shrink-0" />
                    Settings
                  </button>
                </li>
              </ul>

              <div className="mt-4 border-t border-neutral-800 pt-4">
                <button
                  onClick={() => { logout(); closeAll(); }}
                  className="w-full flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-950/30 transition-colors text-left font-medium"
                >
                  <FiLogOut className="h-4 w-4 shrink-0" />
                  Sign out
                </button>
              </div>
            </>
          ) : (
            <div className="mt-2">
              <a
                href="/auth/login"
                onClick={closeAll}
                className="flex w-full items-center justify-center gap-2 rounded-md bg-neutral-200 hover:bg-white px-4 py-2.5 text-sm font-semibold text-neutral-900 transition-colors"
              >
                <FiUser className="h-4 w-4" />
                Sign in
              </a>
              <a
                href="/auth/register"
                onClick={closeAll}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-md border border-neutral-800 hover:bg-neutral-900 px-4 py-2.5 text-sm font-medium text-neutral-400 hover:text-white transition-colors"
              >
                Create account
              </a>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
