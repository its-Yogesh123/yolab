import React from 'react';
import { 
  QrCode, 
  Link as LinkIcon, 
  Braces, 
  FileJson, 
  Hash, 
  Regex, 
  Layers, 
  Zap, 
  Workflow, 
  Code2, 
  ArrowRight, 
  TerminalSquare 
} from 'lucide-react';

const Button = ({ children, variant = 'default', className = '', ...props }) => {
  const baseStyles = "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4d4d8]/50 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2";
  const variants = {
    default: "bg-[#e5e5e5] text-[#050505] hover:bg-white",
    outline: "border border-[#333333] bg-[#0f0f0f] text-[#f5f5f5] hover:border-[#737373] hover:bg-[#171717]",
    ghost: "text-[#f5f5f5] hover:bg-[#171717]",
    secondary: "bg-[#1a1a1a] text-[#f5f5f5] hover:bg-[#262626]"
  };
  return (
    <button className={`${baseStyles} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

const Card = ({ className = '', children }) => (
  <div className={`rounded-md border border-[#262626] bg-[#111111] text-[#f5f5f5] shadow-sm shadow-black/30 transition-all duration-300 hover:-translate-y-1 hover:border-[#404040] ${className}`}>
    {children}
  </div>
);

const HeroSection = () => (
  <section className="relative overflow-hidden bg-[#050505] pt-24 pb-32">
    <div className="container mx-auto px-4 md:px-6 relative z-10 text-center max-w-4xl">
      <div className="inline-flex items-center rounded-md border border-[#262626] bg-[#111111] px-3 py-1 text-sm font-semibold text-[#a3a3a3] mb-8 shadow-sm">
        <TerminalSquare className="mr-2 h-4 w-4 text-[#d4d4d4]" />
        <span>v2.0 Modular Monolith Released</span>
      </div>
      <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-[#f5f5f5] mb-6 leading-tight">
        Developer Utilities, <br className="hidden md:block" />
        <span className="text-[#d4d4d4]">Unified and Scalable.</span>
      </h1>
      <p className="text-lg md:text-xl text-[#a3a3a3] mb-10 max-w-2xl mx-auto leading-relaxed">
        YoLab provides a powerful suite of modular tools designed to accelerate your workflow. Build, test, and deploy faster with our production-ready platform.
      </p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <Button className="w-full sm:w-auto text-base h-12 px-8">
          Explore Services
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
        <Button variant="outline" className="w-full sm:w-auto text-base h-12 px-8">
          Try Now
        </Button>
      </div>
    </div>
  </section>
);

const ServicesSection = () => {
  const services = [
    { icon: QrCode, title: 'QR Generator', desc: 'Generate high-res, customizable QR codes with embedded logos and dynamic routing.' },
    { icon: LinkIcon, title: 'URL Shortener', desc: 'Create branded short links, track click analytics, and manage link expirations.' },
    { icon: Braces, title: 'API Mocker', desc: 'Instantly mock REST/GraphQL endpoints for frontend development and testing.' },
    { icon: FileJson, title: 'JSON Tools', desc: 'Format, validate, and minify complex JSON payloads with deep syntax highlighting.' },
    { icon: Hash, title: 'Base64 Encoder', desc: 'Securely encode or decode strings and files to Base64 in real-time.' },
    { icon: Regex, title: 'Regex Tester', desc: 'Build and test complex regular expressions against custom string payloads.' },
  ];

  return (
    <section className="py-24 bg-[#050505]">
      <div className="container mx-auto px-4 md:px-6 max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-[#f5f5f5] sm:text-4xl">Available Services</h2>
          <p className="mt-4 text-lg text-[#a3a3a3]">Everything you need to streamline your daily development tasks.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <Card key={index} className="flex flex-col p-6 group">
              <div className="h-12 w-12 rounded-md border border-[#262626] bg-[#0a0a0a] text-[#d4d4d4] flex items-center justify-center mb-6 group-hover:border-[#737373] transition-colors duration-300">
                <service.icon className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold text-[#f5f5f5] mb-3">{service.title}</h3>
              <p className="text-[#a3a3a3] flex-grow mb-6">{service.desc}</p>
              <Button variant="secondary" className="w-full transition-colors duration-300">
                Launch Tool
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

const FeaturesSection = () => {
  const features = [
    { icon: Layers, title: 'Modular Architecture', desc: 'Built as a modular monolith, allowing independent utility scaling while maintaining a unified codebase.' },
    { icon: Zap, title: 'Fast Performance', desc: 'Optimized Node.js backend and React frontend ensure lightning-fast execution of all utilities.' },
    { icon: Workflow, title: 'Scalable Design', desc: 'Architected to easily transition into a microservices environment as your usage and teams grow.' },
    { icon: Code2, title: 'Developer-Friendly APIs', desc: 'Programmatic access to all tools via clean, well-documented RESTful endpoints.' },
  ];

  return (
    <section className="py-24 bg-[#050505]">
      <div className="container mx-auto px-4 md:px-6 max-w-7xl">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-[#f5f5f5] sm:text-4xl mb-6">
              Engineered for Scale and Speed
            </h2>
            <p className="text-lg text-[#a3a3a3] mb-8">
              YoLab isn't just a collection of tools; it's a cohesive platform built with modern architectural patterns to ensure reliability and performance.
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
                    <h4 className="text-lg font-semibold text-[#f5f5f5]">{feature.title}</h4>
                    <p className="mt-2 text-[#a3a3a3] leading-relaxed">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative rounded-md bg-[#111111] p-8 shadow-2xl overflow-hidden border border-[#262626] lg:h-[600px] flex items-center justify-center">
            <div className="relative z-10 w-full font-mono text-sm">
              <div className="flex items-center gap-2 mb-4 pb-4 border-b border-[#262626]">
                <div className="h-3 w-3 rounded-full bg-red-500"></div>
                <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                <div className="h-3 w-3 rounded-full bg-green-500"></div>
              </div>
              <div className="text-[#d4d4d4] mb-2"># Starting YoLab Modular Monolith...</div>
              <div className="text-[#f5f5f5] mb-1">&gt; Booting core platform</div>
              <div className="text-[#f5f5f5] mb-1">&gt; Loading service: QR Generator... <span className="text-[#d4d4d4]">OK</span></div>
              <div className="text-[#f5f5f5] mb-1">&gt; Loading service: URL Shortener... <span className="text-[#d4d4d4]">OK</span></div>
              <div className="text-[#f5f5f5] mb-1">&gt; Loading service: API Mocker... <span className="text-[#d4d4d4]">OK</span></div>
              <div className="text-[#d4d4d4] mt-4">YoLab Server running on port 3000</div>
              <div className="text-[#d4d4d4]">Ready to accept connections.</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const CTASection = () => (
  <section className="py-24 bg-[#050505]">
    <div className="container mx-auto px-4 md:px-6 max-w-5xl">
      <div className="relative rounded-md bg-[#111111] border border-[#262626] overflow-hidden px-6 py-20 text-center shadow-xl md:px-12 md:py-24">
        <div className="relative z-10">
          <h2 className="text-3xl font-bold tracking-tight text-[#f5f5f5] sm:text-4xl mb-6">
            Ready to supercharge your workflow?
          </h2>
          <p className="text-lg text-[#a3a3a3] mb-10 max-w-2xl mx-auto">
            Join thousands of developers using YoLab's unified platform to build better software, faster.
          </p>
          <Button className="h-12 px-8 text-base">
            Start Using YoLab for Free
          </Button>
        </div>
      </div>
    </div>
  </section>
);

export default function YoLabHome() {
  return (
    <div className="min-h-screen bg-[#050505] font-sans text-[#f5f5f5] selection:bg-[#404040] selection:text-[#f5f5f5]">
      <main>
        <HeroSection />
        <ServicesSection />
        <FeaturesSection />
        <CTASection />
      </main>
    </div>
  );
}
