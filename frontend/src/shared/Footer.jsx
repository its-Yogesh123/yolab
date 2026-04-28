import React from 'react';
import { FaGithub, FaLinkedin, FaTwitter, FaEnvelope, FaHeart, FaDiscord } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-black text-gray-500 border-t-[1px] border-gray-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand Section */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white">yoLAB</h2>
            <p className="text-sm">
              A SaaS platform providing multiple web utilities like URL shortening and QR code generation through a unified dashboard.

            </p>
            <p>Made in <span className='text-orange-400'>IN</span><span className='text-white'>D</span><span className='text-green-500'>IA</span> <span> </span>
    <FaHeart className="text-red-500 animate-pulse inline-block" /></p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold text-gray-400 mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <a href="/" className="hover:text-white transition-colors duration-200">
                About Us
                </a>
              </li>
              <li>
                <a href="/about" className="hover:text-white transition-colors duration-200">

                </a>
              </li>
              <li>
                <a href="/projects" className="hover:text-white transition-colors duration-200">
                  Products
                </a>
              </li>
              <li>
                <a href="/blog" className="hover:text-white transition-colors duration-200">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="/blog" className="hover:text-white transition-colors duration-200">
                  Refund Policy
                </a>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-semibold text-gray-100  mb-4">Product & Services</h3>
            <ul className="space-y-2">
            <li>
                <a href="#" className="hover:text-white transition-colors duration-200">
                  <span className='animate-pulse'>croW</span>
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors duration-200">
                  URL Shortner
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors duration-200">
                  Image Editing
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors duration-200">
                 QR Generator
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors duration-200">
                  <span className='animate-pulse'>Neuronoz</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Contact & Social */}
          <div>
            <h3 className="text-lg font-semibold text-gray-100  mb-4">Connect</h3>
            <div className="space-y-2 mb-4">
              <p className="text-sm">NIT Kurukshetra, India</p>
              <p className="text-sm">contact@yolab.in</p>
            </div>
            <div className="flex space-x-4">
              <a 
                href="https://github.com/its-Yogesh123" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-2xl hover:text-white transition-colors duration-200"
              >
                <FaGithub />
              </a>
              <a 
                href="https://www.linkedin.com/in/yogeshKumaRdev123/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-2xl hover:text-white transition-colors duration-200"
              >
                <FaLinkedin />
              </a>
              <a 
                href="https://twitter.com/yourusername" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-2xl hover:text-white transition-colors duration-200"
              >
                <FaDiscord />
              </a>
              <a 
                href="mailto:contact@yolab.in"
                className="text-2xl hover:text-white transition-colors duration-200"
              >
                <FaEnvelope />
              </a>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-sm">
          © {new Date().getFullYear()} yoLAB. All rights reserved. <br/>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
