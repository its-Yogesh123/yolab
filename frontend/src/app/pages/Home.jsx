import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  QrCode,
  Link as LinkIcon,
  ImageIcon,
  Layers,
  Zap,
  Workflow,
  Code2,
  ArrowRight,
  TerminalSquare,
  FileSearch,
  X,
  Bell,
} from 'lucide-react';

/* ─────────────────────────────────────────
   Tiny local components (no import needed)
───────────────────────────────────────── */
const Button = ({ children, variant = 'default', className = '', ...props }) => {
  const base = "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4d4d8]/50 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2";
  const variants = {
    default:   "bg-[#e5e5e5] text-[#050505] hover:bg-white",
    outline:   "border border-[#333333] bg-[#0f0f0f] text-[#f5f5f5] hover:border-[#737373] hover:bg-[#171717]",
    ghost:     "text-[#f5f5f5] hover:bg-[#171717]",
    secondary: "bg-[#1a1a1a] text-[#f5f5f5] hover:bg-[#262626]",
  };
  return <button className={`${base} ${variants[variant]} ${className}`} {...props}>{children}</button>;
};

const Card = ({ className = '', children }) => (
  <div className={`rounded-md border border-[#262626] bg-[#111111] text-[#f5f5f5] shadow-sm shadow-black/30 transition-all duration-300 hover:-translate-y-1 hover:border-[#404040] ${className}`}>
    {children}
  </div>
);

/* ─────────────────────────────────────────
   Upcoming Product Banner
   Shown on homepage only, dismissable.
───────────────────────────────────────── */
function UpcomingProductBanner() {
  const [visible, setVisible] = useState(true);

  // Respect user dismissal for the session
  if (!visible) return null;

  return (
    <div
      role="banner"
      aria-label="Upcoming product announcement"
      className="w-full bg-[#111111] border-b border-[#262626] py-2.5 px-4"
    >
      <div className="container mx-auto max-w-7xl flex items-center justify-between gap-4">
        {/* Left badge */}
        <div className="flex items-center gap-3 min-w-0">
          <span className="shrink-0 inline-flex items-center gap-1.5 rounded-md border border-[#404040] bg-[#1a1a1a] px-2.5 py-1 text-[11px] font-bold uppercase tracking-widest text-[#a3a3a3]">
            <Bell className="h-3 w-3" />
            Coming Soon
          </span>

          {/* Message */}
          <p className="text-sm text-[#d4d4d4] truncate">
            <span className="font-semibold text-[#f5f5f5]">Maester</span>
            {' '}— our intelligent PDF analyzer is almost here.{' '}
            <span className="hidden sm:inline text-[#a3a3a3]">
              Upload, query, and extract insights from any PDF document in seconds.
            </span>
          </p>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3 shrink-0">
          <span className="hidden md:inline-flex items-center gap-1.5 text-xs text-[#737373]">
            <FileSearch className="h-3.5 w-3.5" />
            PDF Intelligence
          </span>

          <button
            aria-label="Dismiss announcement"
            onClick={() => setVisible(false)}
            className="rounded-md p-1 text-[#737373] hover:text-[#f5f5f5] hover:bg-[#262626] transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   Hero Section
───────────────────────────────────────── */
const HeroSection = () => (
  <section
    id="hero"
    aria-label="Hero — YoLab platform overview"
    className="relative overflow-hidden bg-[#050505] pt-24 pb-32"
  >
    <div className="container mx-auto px-4 md:px-6 relative z-10 text-center max-w-4xl">
      {/* Version pill */}
      <div className="inline-flex items-center rounded-md border border-[#262626] bg-[#111111] px-3 py-1 text-sm font-semibold text-[#a3a3a3] mb-8 shadow-sm">
        <TerminalSquare className="mr-2 h-4 w-4 text-[#d4d4d4]" />
        <span>v0.4.0 — Analytics, Subscriptions & More</span>
      </div>

      {/* H1 — exact target keyword phrase first */}
      <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-[#f5f5f5] mb-6 leading-tight">
        All-in-One{' '}
        <span className="text-[#d4d4d4]">Developer Utilities</span>
        <br className="hidden md:block" />
        for Modern Teams.
      </h1>

      <p className="text-lg md:text-xl text-[#a3a3a3] mb-10 max-w-2xl mx-auto leading-relaxed">
        YoLab is a multi-service SaaS platform — shorten links, generate QR codes, analyze PDFs,
        and access a growing suite of tools, all under one subscription.
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <Button className="w-full sm:w-auto text-base h-12 px-8" onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })}>
          Explore Services
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
        <Button variant="outline" className="w-full sm:w-auto text-base h-12 px-8" onClick={() => window.location.href = '/short-url'}>
          Try for Free
        </Button>
      </div>
    </div>
  </section>
);

/* ─────────────────────────────────────────
   Services Section
───────────────────────────────────────── */
const ServicesSection = () => {
  const navigate = useNavigate();

  const services = [
    {
      icon: LinkIcon,
      title: 'URL Shortener',
      desc: 'Create branded short links with custom aliases, click analytics, and automatic expiry management. Free plan includes 5 active links.',
      path: '/short-url',
      badge: 'Live',
    },
    {
      icon: QrCode,
      title: 'QR Code Generator',
      desc: 'Generate high-resolution, fully customizable QR codes for any URL or text. Control size, colors, and download as PNG instantly.',
      path: '/qr-code',
      badge: 'Live',
    },
    {
      icon: ImageIcon,
      title: 'OnePic — Image Processing',
      desc: 'Enhance images with Gaussian blur, median filter, sharpening, and histogram equalization. Upload any photo and download the result instantly.',
      path: '/image-processing',
      badge: 'Live',
    },
    {
      icon: FileSearch,
      title: 'Maester — PDF Analyzer',
      desc: 'Upload any PDF and instantly query its content, extract key insights, summarize sections, and export structured data. Powered by AI.',
      path: null,
      badge: 'Coming Soon',
      highlight: true,
    },
  ];

  return (
    <section id="services" aria-labelledby="services-heading" className="py-24 bg-[#050505]">
      <div className="container mx-auto px-4 md:px-6 max-w-7xl">
        <div className="text-center mb-16">
          <h2 id="services-heading" className="text-3xl font-bold tracking-tight text-[#f5f5f5] sm:text-4xl">
            Available &amp; Upcoming Services
          </h2>
          <p className="mt-4 text-lg text-[#a3a3a3]">
            One platform. Every tool your team needs — live today or launching soon.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <Card
              key={index}
              className={`flex flex-col p-6 group ${service.highlight ? 'border-[#404040] ring-1 ring-[#404040]/50' : ''}`}
            >
              <div className="h-12 w-12 rounded-md border border-[#262626] bg-[#0a0a0a] text-[#d4d4d4] flex items-center justify-center mb-6 group-hover:border-[#737373] transition-colors duration-300">
                <service.icon className="h-6 w-6" />
              </div>

              <div className="flex items-center gap-2 mb-3">
                <h3 className="text-xl font-semibold text-[#f5f5f5]">{service.title}</h3>
                {service.badge && (
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                    service.badge === 'Live'
                      ? 'border-[#404040] bg-[#1a1a1a] text-[#d4d4d4]'
                      : service.badge === 'Coming Soon'
                      ? 'border-[#525252] bg-[#1a1a1a] text-[#e5e5e5]'
                      : 'border-[#2a2a2a] bg-[#111] text-[#737373]'
                  }`}>
                    {service.badge}
                  </span>
                )}
              </div>

              <p className="text-[#a3a3a3] flex-grow mb-6 leading-relaxed">{service.desc}</p>

              <Button
                variant={service.path ? 'default' : 'secondary'}
                className="w-full transition-colors duration-300"
                onClick={() => service.path && navigate(service.path)}
                disabled={!service.path}
                aria-label={service.path ? `Launch ${service.title}` : `${service.title} — coming soon`}
              >
                {service.path ? (
                  <>Launch Tool <ArrowRight className="ml-2 h-4 w-4" /></>
                ) : (
                  'Coming Soon'
                )}
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ─────────────────────────────────────────
   Features / Why YoLab Section
───────────────────────────────────────── */
const FeaturesSection = () => {
  const features = [
    {
      icon: Layers,
      title: 'Modular Architecture',
      desc: 'Every service runs as an independent module. Scale, update, or disable any tool without touching the rest of the platform.',
    },
    {
      icon: Zap,
      title: 'Single Subscription, All Tools',
      desc: 'One Pro plan unlocks unlimited access to every current and future YoLab service — no per-tool pricing, no surprises.',
    },
    {
      icon: Workflow,
      title: 'Built to Scale',
      desc: 'Architected as a modular monolith with a clear migration path to microservices as your team and traffic grows.',
    },
    {
      icon: Code2,
      title: 'RESTful API Access',
      desc: 'Every tool is accessible programmatically via clean, documented REST endpoints. Automate your workflows with ease.',
    },
  ];

  return (
    <section aria-labelledby="features-heading" className="py-24 bg-[#050505]">
      <div className="container mx-auto px-4 md:px-6 max-w-7xl">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 id="features-heading" className="text-3xl font-bold tracking-tight text-[#f5f5f5] sm:text-4xl mb-6">
              Why Teams Choose YoLab
            </h2>
            <p className="text-lg text-[#a3a3a3] mb-8">
              We built YoLab because fragmented tools slow teams down. One login, one subscription,
              one consistent interface — for everything from link management to AI-powered document analysis.
            </p>
            <div className="space-y-8">
              {features.map((feature, index) => (
                <div key={index} className="flex gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <div className="h-10 w-10 rounded-full bg-[#0a0a0a] border border-[#262626] flex items-center justify-center shadow-sm">
                      <feature.icon className="h-5 w-5 text-[#d4d4d4]" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-[#f5f5f5]">{feature.title}</h3>
                    <p className="mt-2 text-[#a3a3a3] leading-relaxed">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Terminal mock */}
          <div className="relative rounded-md bg-[#111111] p-8 shadow-2xl overflow-hidden border border-[#262626] lg:h-[520px] flex items-center justify-center">
            <div className="relative z-10 w-full font-mono text-sm">
              <div className="flex items-center gap-2 mb-4 pb-4 border-b border-[#262626]">
                <div className="h-3 w-3 rounded-full bg-red-500/80" />
                <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
                <div className="h-3 w-3 rounded-full bg-green-500/80" />
                <span className="ml-2 text-[#737373] text-xs">yolab-server</span>
              </div>
              <div className="text-[#737373] mb-2"># YoLab Modular Monolith — v0.4.0</div>
              <div className="text-[#f5f5f5] mb-1">&gt; Connecting to MongoDB... <span className="text-[#a3a3a3]">OK</span></div>
              <div className="text-[#f5f5f5] mb-1">&gt; Loading srv001: URL Shortener... <span className="text-[#a3a3a3]">OK</span></div>
              <div className="text-[#f5f5f5] mb-1">&gt; Loading srv002: QR Generator... <span className="text-[#a3a3a3]">OK</span></div>
              <div className="text-[#f5f5f5] mb-1">&gt; Subscription middleware... <span className="text-[#a3a3a3]">OK</span></div>
              <div className="text-[#f5f5f5] mb-1">&gt; Analytics engine... <span className="text-[#a3a3a3]">OK</span></div>
              <div className="text-[#737373] mb-1">&gt; Loading srv003: Maester PDF... <span className="text-yellow-500/80">PENDING</span></div>
              <div className="mt-4 text-[#a3a3a3]">Server running on port 8000</div>
              <div className="text-[#a3a3a3]">4 services active · 1 coming soon</div>
              <div className="mt-2 flex items-center gap-1.5">
                <span className="inline-block h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[#737373]">Ready.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

/* ─────────────────────────────────────────
   CTA Section
───────────────────────────────────────── */
const CTASection = () => (
  <section aria-label="Call to action" className="py-24 bg-[#050505]">
    <div className="container mx-auto px-4 md:px-6 max-w-5xl">
      <div className="relative rounded-md bg-[#111111] border border-[#262626] overflow-hidden px-6 py-20 text-center shadow-xl md:px-12 md:py-24">
        <div className="relative z-10">
          <h2 className="text-3xl font-bold tracking-tight text-[#f5f5f5] sm:text-4xl mb-6">
            Start building smarter today.
          </h2>
          <p className="text-lg text-[#a3a3a3] mb-10 max-w-2xl mx-auto">
            YoLab's free plan gives you instant access to URL shortening and QR code generation.
            Upgrade to Pro for unlimited usage across every current and upcoming service.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button className="h-12 px-8 text-base" onClick={() => window.location.href = '/auth/register'}>
              Get Started for Free
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button variant="outline" className="h-12 px-8 text-base" onClick={() => window.location.href = '/pricing'}>
              View Pricing
            </Button>
          </div>
        </div>
      </div>
    </div>
  </section>
);

/* ─────────────────────────────────────────
   Page-level SEO via useEffect
───────────────────────────────────────── */
function useSEO({ title, description }) {
  useEffect(() => {
    document.title = title;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', description);
  }, [title, description]);
}

/* ─────────────────────────────────────────
   Default Export
───────────────────────────────────────── */
export default function YoLabHome() {
  useSEO({
    title: 'YoLab — All-in-One Developer Utilities & SaaS Tools',
    description: 'YoLab is a multi-service SaaS platform offering URL shortening, QR code generation, PDF analysis, and more — built for developers and modern teams.',
  });

  return (
    <div className="min-h-screen bg-[#050505] font-sans text-[#f5f5f5] selection:bg-[#404040] selection:text-[#f5f5f5]">
      {/* Upcoming product announcement banner */}
      <UpcomingProductBanner />

      <main>
        <HeroSection />
        <ServicesSection />
        <FeaturesSection />
        <CTASection />
      </main>
    </div>
  );
}
