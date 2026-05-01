import React, { useState, useEffect } from 'react';
import { 
  FiMenu, FiX, FiSun, FiMoon, FiGithub, FiUser, 
  FiSettings, FiLogOut, FiHome, FiInfo, FiBriefcase, FiMail 
} from 'react-icons/fi';

const navLinks = [
  { name: 'Home', icon: FiHome, href: '#' },
  { name: 'About', icon: FiInfo, href: '/about' },
  { name: 'Services', icon: FiBriefcase, href: '#' },
  { name: 'Contact', icon: FiMail, href: '#' },
];

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Handle Dark Mode Theme Toggle
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Handle Escape Key to close drawers
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        setIsMobileMenuOpen(false);
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  // Prevent background scrolling when a drawer is open
  useEffect(() => {
    if (isMobileMenuOpen || isProfileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isMobileMenuOpen, isProfileMenuOpen]);

  return (
    <>
      <nav className="sticky top-0 z-40 w-full border-b border-gray-200 bg-white/80 backdrop-blur-md transition-colors duration-300 dark:border-gray-800 dark:bg-gray-900/80">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between relative">
            
            {/* Mobile: Left - Hamburger */}
            <div className="flex md:hidden">
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(true)}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-md dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
                aria-controls="mobile-menu"
                aria-expanded={isMobileMenuOpen}
                aria-label="Open main menu"
              >
                <FiMenu className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>

            {/* Desktop: Left / Mobile: Center - Logo */}
            <div className="flex-shrink-0 md:flex-1 md:flex md:items-center absolute md:static left-1/2 -translate-x-1/2 md:translate-x-0">
              <a href="#" className="flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-white">
                {/* <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                  <span className="font-bold text-lg">L</span>
                </div> */}
                <span className="hidden sm:block">yolab</span>
              </a>
            </div>

            {/* Desktop: Center - Navigation Links */}
            <div className="hidden md:flex md:flex-1 md:justify-center">
              <ul className="flex space-x-8">
                {navLinks.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      className="text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 font-medium transition-colors"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Desktop & Mobile: Right Side */}
            <div className="flex items-center justify-end gap-2 md:flex-1">
              {/* Theme Toggle (Hidden on mobile, moved to sidebar) */}
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="hidden md:flex p-2 text-gray-600 hover:bg-gray-100 rounded-full dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
                aria-label="Toggle Dark Mode"
              >
                {isDarkMode ? <FiSun className="h-5 w-5" /> : <FiMoon className="h-5 w-5" />}
              </button>

              {/* GitHub Icon */}
              <a
                href="https://github.com/its-Yogesh123/yolab"
                target="_blank"
                rel="noreferrer"
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-full dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
                aria-label="GitHub Repository"
              >
                <FiGithub className="h-5 w-5" />
              </a>

              {/* Profile Avatar Button */}
              <button
                onClick={() => setIsProfileMenuOpen(true)}
                className="ml-2 h-8 w-8 rounded-full bg-gray-200 border-2 border-transparent hover:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 dark:bg-gray-700 transition-all overflow-hidden"
                aria-expanded={isProfileMenuOpen}
                aria-label="Open user menu"
              >
                <img 
                  src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" 
                  alt="User avatar" 
                  className="h-full w-full object-cover"
                />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* --- Overlays and Drawers --- */}

      {/* Backdrop for both drawers */}
      {(isMobileMenuOpen || isProfileMenuOpen) && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity"
          aria-hidden="true"
          onClick={() => {
            setIsMobileMenuOpen(false);
            setIsProfileMenuOpen(false);
          }}
        />
      )}

      {/* Mobile Menu Drawer (Left Side) */}
      <div 
        className={`fixed top-0 left-0 z-50 h-full w-72 bg-white shadow-2xl transition-transform duration-300 ease-in-out dark:bg-gray-900 ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-gray-800">
          <span className="text-lg font-bold text-gray-900 dark:text-white">Menu</span>
          <button 
            onClick={() => setIsMobileMenuOpen(false)}
            className="rounded-md p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
            aria-label="Close menu"
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>
        <div className="p-4 flex flex-col h-[calc(100vh-65px)] justify-between">
          <ul className="space-y-2">
            {navLinks.map((link) => (
              <li key={link.name}>
                <a
                  href={link.href}
                  className="flex items-center gap-3 rounded-lg px-4 py-3 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 font-medium transition-colors"
                >
                  <link.icon className="h-5 w-5 text-gray-400" />
                  {link.name}
                </a>
              </li>
            ))}
          </ul>
          
          {/* Theme toggle for mobile */}
          <div className="border-t border-gray-200 dark:border-gray-800 pt-4">
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 font-medium transition-colors"
            >
              {isDarkMode ? <FiSun className="h-5 w-5 text-gray-400" /> : <FiMoon className="h-5 w-5 text-gray-400" />}
              {isDarkMode ? 'Light Mode' : 'Dark Mode'}
            </button>
          </div>
        </div>
      </div>

      {/* Profile Drawer (Right Side) */}
      <div 
        className={`fixed top-0 right-0 z-50 h-full w-80 bg-white shadow-2xl transition-transform duration-300 ease-in-out dark:bg-gray-900 ${
          isProfileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-gray-800">
          <span className="text-lg font-bold text-gray-900 dark:text-white">Account</span>
          <button 
            onClick={() => setIsProfileMenuOpen(false)}
            className="rounded-md p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
            aria-label="Close profile menu"
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>
        
        <div className="p-4">
          <div className="flex items-center gap-4 mb-6 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50">
            <img 
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" 
              alt="User" 
              className="h-12 w-12 rounded-full bg-gray-200 dark:bg-gray-700"
            />
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">John Doe</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">john.doe@example.com</p>
            </div>
          </div>

          <ul className="space-y-1">
            <li>
              <button className="w-full flex items-center gap-3 rounded-lg px-4 py-3 text-left text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors">
                <FiUser className="h-5 w-5 text-gray-400" />
                <span className="font-medium">Your Profile</span>
              </button>
            </li>
            <li>
              <button className="w-full flex items-center gap-3 rounded-lg px-4 py-3 text-left text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors">
                <FiSettings className="h-5 w-5 text-gray-400" />
                <span className="font-medium">Settings</span>
              </button>
            </li>
          </ul>

          <div className="mt-6 border-t border-gray-200 pt-6 dark:border-gray-800">
            <button className="w-full flex items-center gap-3 rounded-lg px-4 py-3 text-left text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors font-medium">
              <FiLogOut className="h-5 w-5" />
              Sign out
            </button>
          </div>
        </div>
      </div>
    </>
  );
}