import Footer from '@/shared/Footer';
import Navbar from '@/shared/Navigation';
import React, { useEffect, useState } from 'react';

const PrivacyPolicy = () => {
  const [activeSection, setActiveSection] = useState('');

  const sections = [
    { id: 'introduction', title: '1. Introduction' },
    { id: 'information-we-collect', title: '2. Information We Collect' },
    { id: 'how-we-use', title: '3. How We Use Information' },
    { id: 'data-storage', title: '4. Data Storage & Security' },
    { id: 'third-party', title: '5. Third-Party Services' },
    { id: 'cookies', title: '6. Cookies Policy' },
    { id: 'user-rights', title: '7. Your User Rights' },
    { id: 'data-retention', title: '8. Data Retention' },
    { id: 'childrens-privacy', title: '9. Children\'s Privacy' },
    { id: 'changes', title: '10. Changes to This Policy' },
    { id: 'contact', title: '11. Contact Information' },
  ];

  // Intersection Observer to highlight the active section in the Table of Contents
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: '-20% 0px -80% 0px' }
    );

    sections.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <>
    <Navbar />
    <div className="min-h-screen bg-[#020617] text-[#e2e8f0] font-sans selection:bg-[#3b82f6] selection:text-white pb-20">
      {/* Header */}
      <header className="pt-20 pb-12 border-b border-[#111827]">
        <div className="max-w-5xl mx-auto px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#3b82f6] to-[#a855f7] mb-4">
            Privacy Policy
          </h1>
          <p className="text-[#9ca3af] text-lg">
            Last Updated: <span className="text-[#e2e8f0] font-medium">April 29, 2026</span>
          </p>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 mt-12 flex flex-col lg:flex-row gap-12 items-start">
        
        {/* Sticky Table of Contents */}
        <aside className="lg:w-1/4 lg:sticky lg:top-8 hidden md:block">
          <div className="bg-[#111827] rounded-xl p-6 shadow-lg border border-[#111827]/50">
            <h3 className="text-[#e2e8f0] font-semibold text-lg mb-4">Table of Contents</h3>
            <nav className="flex flex-col gap-3">
              {sections.map((section) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className={`text-sm transition-colors duration-200 hover:text-[#3b82f6] ${
                    activeSection === section.id ? 'text-[#3b82f6] font-medium' : 'text-[#9ca3af]'
                  }`}
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById(section.id).scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  {section.title}
                </a>
              ))}
            </nav>
          </div>
        </aside>

        {/* Policy Content */}
        <main className="lg:w-3/4 space-y-12 leading-relaxed">
          
          <PolicySection id="introduction" title="1. Introduction">
            <p>
              Welcome to <strong className="text-[#3b82f6]">YoLab</strong>. We respect your privacy and are committed to protecting your personal data. This Privacy Policy will inform you about how we look after your personal data when you visit our website and use our modular AI-powered utilities, including our QR generator, URL shortener, and related services.
            </p>
            <p className="mt-4">
              By accessing or using YoLab, you agree to the collection and use of information in accordance with this policy. We prioritize clarity, avoiding unnecessary legal jargon to ensure you understand exactly how your data is handled.
            </p>
          </PolicySection>

          <PolicySection id="information-we-collect" title="2. Information We Collect">
            <p>We collect several different types of information for various purposes to provide and improve our service to you.</p>
            <ul className="list-disc pl-5 mt-4 space-y-2 text-[#9ca3af]">
              <li><strong className="text-[#e2e8f0]">Personal Data:</strong> When you register for an account, we may ask for your email address, name, and billing information.</li>
              <li><strong className="text-[#e2e8f0]">Usage Data:</strong> We automatically collect information on how YoLab is accessed and used. This includes your IP address, browser type, browser version, the pages of our service that you visit, and the time spent on those pages.</li>
              <li><strong className="text-[#e2e8f0]">Generated Content:</strong> Links you shorten and QR codes you generate are stored on our servers to ensure they remain active and functional.</li>
            </ul>
          </PolicySection>

          <PolicySection id="how-we-use" title="3. How We Use Information">
            <p>YoLab uses the collected data for the following purposes:</p>
            <ul className="list-disc pl-5 mt-4 space-y-2 text-[#9ca3af]">
              <li>To provide, operate, and maintain our web application.</li>
              <li>To improve and personalize your experience, particularly regarding our upcoming AI-based utilities.</li>
              <li>To analyze usage patterns so we can continuously improve user interface and application performance.</li>
              <li>To communicate with you, including sending updates, security alerts, and support messages.</li>
            </ul>
          </PolicySection>

          <PolicySection id="data-storage" title="4. Data Storage & Security">
            <p>
              The security of your data is important to us. YoLab relies on industry-standard security measures to protect against unauthorized access, alteration, disclosure, or destruction of your personal information. 
            </p>
            <p className="mt-4">
              While we strive to use commercially acceptable means (like <strong className="text-[#a855f7]">end-to-end encryption</strong> for sensitive credentials) to protect your Personal Data, remember that no method of transmission over the Internet or method of electronic storage is 100% secure.
            </p>
          </PolicySection>

          <PolicySection id="third-party" title="5. Third-Party Services">
            <p>
              We may employ third-party companies and individuals to facilitate our service, provide the service on our behalf, or assist us in analyzing how our service is used. These third parties have access to your Personal Data only to perform these tasks and are obligated not to disclose or use it for any other purpose.
            </p>
            <ul className="list-disc pl-5 mt-4 space-y-2 text-[#9ca3af]">
              <li><strong className="text-[#e2e8f0]">Analytics:</strong> We use aggregated, anonymized data via third-party analytics to understand site traffic.</li>
              <li><strong className="text-[#e2e8f0]">Payment Processors:</strong> If you upgrade to a paid tier, your payment data is processed securely by certified third-party payment gateways. We do not store your full credit card details.</li>
            </ul>
          </PolicySection>

          <PolicySection id="cookies" title="6. Cookies Policy">
            <p>
              We use cookies and similar tracking technologies to track activity on YoLab. Cookies are files with a small amount of data which may include an anonymous unique identifier.
            </p>
            <p className="mt-4">
              You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some core features of our service, such as remaining logged into your account.
            </p>
          </PolicySection>

          <PolicySection id="user-rights" title="7. Your User Rights">
            <p>Depending on your location, you may have the following rights regarding your personal data:</p>
            <ul className="list-disc pl-5 mt-4 space-y-2 text-[#9ca3af]">
              <li><strong className="text-[#e2e8f0]">The right to access:</strong> You can request a copy of your personal data.</li>
              <li><strong className="text-[#e2e8f0]">The right to rectification:</strong> You can request that we correct any information you believe is inaccurate.</li>
              <li><strong className="text-[#e2e8f0]">The right to erasure:</strong> You can request that we erase your personal data ("Right to be Forgotten") under certain conditions.</li>
              <li><strong className="text-[#e2e8f0]">The right to restrict processing:</strong> You can request that we restrict the processing of your personal data.</li>
            </ul>
            <p className="mt-4 text-[#9ca3af]">
              To exercise any of these rights, please contact us at the email provided at the bottom of this page.
            </p>
          </PolicySection>

          <PolicySection id="data-retention" title="8. Data Retention">
            <p>
              We will retain your Personal Data only for as long as is necessary for the purposes set out in this Privacy Policy. Active URLs and QR codes remain stored to ensure service continuity. If you delete your account, your personal data will be permanently purged from our active databases within 30 days.
            </p>
          </PolicySection>

          <PolicySection id="childrens-privacy" title="9. Children's Privacy">
            <p>
              Our Service does not address anyone under the age of 13. We do not knowingly collect personally identifiable information from anyone under 13. If you are a parent or guardian and you are aware that your child has provided us with Personal Data, please contact us so that we can take necessary actions to remove that information from our servers.
            </p>
          </PolicySection>

          <PolicySection id="changes" title="10. Changes to This Policy">
            <p>
              We may update our Privacy Policy from time to time to reflect changes in our modular features, particularly as we roll out new AI-based utilities. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date.
            </p>
            <p className="mt-4">
              You are advised to review this Privacy Policy periodically for any changes.
            </p>
          </PolicySection>

          <PolicySection id="contact" title="11. Contact Information">
            <p>
              If you have any questions, concerns, or requests regarding this Privacy Policy, please reach out to us. Our support team is ready to assist you.
            </p>
            <div className="mt-6 inline-block bg-[#111827] border border-[#111827]/50 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 w-full md:w-auto">
              <span className="block text-[#9ca3af] text-sm mb-1">Email Support:</span>
              <a href="mailto:support@yolab.in" className="text-xl font-medium text-[#3b82f6] hover:text-[#a855f7] transition-colors duration-300">
                support@yolab.in
              </a>
            </div>
          </PolicySection>

        </main>
      </div>
    </div>
    <Footer />
    </>
  );
};

// Reusable Section Component
const PolicySection = ({ id, title, children }) => {
  return (

    <section id={id} className="scroll-mt-28">
      <h2 className="text-2xl font-semibold text-[#e2e8f0] mb-6 pb-2 border-b border-[#111827]/50">
        {title}
      </h2>
      <div className="text-[#9ca3af] leading-relaxed">
        {children}
      </div>
    </section>
  );
};

export default PrivacyPolicy;