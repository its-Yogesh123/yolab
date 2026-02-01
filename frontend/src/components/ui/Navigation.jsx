import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Menu, X, User, Settings, LogOut } from 'lucide-react';

const NavigationMenu = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);

  const profileRef = useRef(null);
  const dropdownRefs = useRef({});

  // Navigation items with dropdowns
  const navItems = [
    {
      name: 'Products',
      hasDropdown: true,
      dropdownItems: [
        { name: 'Web Development', href: '#' },
        { name: 'Mobile Apps', href: '#' },
        { name: 'UI/UX Design', href: '#' },
        { name: 'Cloud Services', href: '#' },
      ]
    },
    {
      name: 'Services',
      hasDropdown: true,
      dropdownItems: [
        { name: 'QR Generator', href: '#' },
        { name: 'Get Short URL', href: '#' },
        { name: 'Image editor', href: '#' },
      ]
    },
    {
      name: 'Pricing',
      hasDropdown: false,
      href: '#'
    },
    {
      name: 'Contact',
      hasDropdown: false,
      href: '#'
    },
  ];

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }

      if (activeDropdown && dropdownRefs.current[activeDropdown]) {
        if (!dropdownRefs.current[activeDropdown].contains(event.target)) {
          setActiveDropdown(null);
        }
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [activeDropdown]);

  return (
    <nav className="bg-background shadow-lg fixed w-full top-0 z-50 border-b-2">
      <div className="px-0 md:pl-8 lg:pl-8">
        <div className="flex justify-between items-center h-16">

          {/* Mobile Menu Button (Left side - only on mobile) */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-50"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>

          {/* Logo */}
          <div className="shrink-0 flex items-center">
            <span className="text-2xl font-bold text-white"> yoLAB</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-1">
            {navItems.map((item, index) => (
              <div
                key={index}
                className="relative"
                ref={el => dropdownRefs.current[item.name] = el}
              >
                {item.hasDropdown ? (
                  <>
                    <button
                      onMouseEnter={() => setActiveDropdown(item.name)}
                      className="flex items-center px-4 py-2 text-white hover:text-gray-500 hover:bg-gray-700 rounded-4xl transition-colors duration-200"
                    >
                      {item.name}
                      <ChevronDown className={`ml-1 h-4 w-4 transition-transform duration-200 ${activeDropdown === item.name ? 'rotate-180' : ''
                        }`} />
                    </button>

                    {/* Dropdown Menu */}
                    {activeDropdown === item.name && (
                      <div
                        onMouseEnter={() => setActiveDropdown(item.name)}
                        onMouseLeave={() => setActiveDropdown(null)}
                        className="absolute left-0 mt-2 w-56 bg-white rounded-md shadow-lg py-2 border border-gray-100 animate-fadeIn"
                      >
                        {item.dropdownItems.map((dropItem, dropIndex) => (
                          <a
                            key={dropIndex}
                            href={dropItem.href}
                            className="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-150"
                          >
                            {dropItem.name}
                          </a>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <a
                    href={item.href}
                    className="px-4 py-2 text-white  hover:bg-black rounded-md transition-colors duration-200"
                  >
                    {item.name}
                  </a>
                )}
              </div>
            ))}
          </div>

          {/* Profile Button (Desktop) */}
          <div className=" md:block relative" ref={profileRef}>
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className=" flex items-center space-x-2 px-2 py-2  rounded-full transition-colors duration-200 cursor-pointer bg-black hover:bg-gray-300 hover:text-black text-white"
            >
              <div className="w-8 h-8 rounded-full flex items-center justify-center">
                <User className="h-5 w-5 " />
              </div>
            </button>

            {/* Profile Dropdown Panel (Desktop) */}
            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg py-2 border border-gray-100 animate-fadeIn">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-semibold text-gray-900">John Doe</p>
                  <p className="text-sm text-gray-500">john@example.com</p>
                </div>
                <a
                  href="#"
                  className="flex items-center px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-150"
                >
                  <User className="h-4 w-4 mr-3" />
                  Your Profile
                </a>
                <a
                  href="#"
                  className="flex items-center px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-150"
                >
                  <Settings className="h-4 w-4 mr-3" />
                  Settings
                </a>
                <div className="border-t border-gray-100 mt-2 pt-2">
                  <a
                    href="#"
                    className="flex items-center px-4 py-2 text-red-600 hover:bg-red-50 transition-colors duration-150"
                  >
                    <LogOut className="h-4 w-4 mr-3" />
                    Sign Out
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Mobile Menu Sidebar (Left) */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-50 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          } md:hidden`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <span className="text-xl font-bold text-blue-600">Menu</span>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-50"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="overflow-y-auto h-full pb-20">
          {navItems.map((item, index) => (
            <div key={index} className="border-b border-gray-100">
              {item.hasDropdown ? (
                <div>
                  <button
                    onClick={() => setActiveDropdown(activeDropdown === item.name ? null : item.name)}
                    className="w-full flex items-center justify-between px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors duration-200"
                  >
                    <span>{item.name}</span>
                    <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${activeDropdown === item.name ? 'rotate-180' : ''
                      }`} />
                  </button>

                  {activeDropdown === item.name && (
                    <div className="bg-gray-50 py-2">
                      {item.dropdownItems.map((dropItem, dropIndex) => (
                        <a
                          key={dropIndex}
                          href={dropItem.href}
                          className="block px-8 py-2 text-gray-600 hover:text-blue-600 hover:bg-gray-100 transition-colors duration-150"
                        >
                          {dropItem.name}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <a
                  href={item.href}
                  className="block px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors duration-200"
                >
                  {item.name}
                </a>
              )}
            </div>
          ))}
        </div>

      </div>

      {/* Profile Panel (Right Side - Mobile) */}
      <div
        className={`fixed top-0 right-0 h-full w-64 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-50 ${isProfileOpen ? 'translate-x-0' : 'translate-x-full'
          } md:hidden`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <span className="text-xl font-bold text-blue-600">Profile</span>
          <button
            onClick={() => setIsProfileOpen(false)}
            className="p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-50"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-4">
          <div className="flex flex-col items-center py-6 border-b border-gray-200">
            <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mb-3">
              <User className="h-10 w-10 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">John Doe</h3>
            <p className="text-sm text-gray-500">john@example.com</p>
          </div>

          <div className="mt-4">
            <a
              href="#"
              className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-blue-600 rounded-md transition-colors duration-150"
            >
              <User className="h-5 w-5 mr-3" />
              Your Profile
            </a>
            <a
              href="#"
              className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-blue-600 rounded-md transition-colors duration-150"
            >
              <Settings className="h-5 w-5 mr-3" />
              Settings
            </a>
            <a
              href="#"
              className="flex items-center px-4 py-3 text-red-600 hover:bg-red-50 rounded-md transition-colors duration-150 mt-4"
            >
              <LogOut className="h-5 w-5 mr-3" />
              Sign Out
            </a>
          </div>
        </div>
      </div>

      {/* Overlay */}
      {(isMobileMenuOpen || isProfileOpen) && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => {
            setIsMobileMenuOpen(false);
            setIsProfileOpen(false);
          }}
        />
      )}
    </nav>
  );
};

export default NavigationMenu;
