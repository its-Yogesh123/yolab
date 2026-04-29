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
  const baseStyles = "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3b82f6]/60 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2";
  const variants = {
    default: "bg-[#3b82f6] text-[#e2e8f0] hover:bg-[#2563eb] shadow-lg shadow-[#3b82f6]/30",
    outline: "border border-[#1f2937] bg-[#111827] text-[#e2e8f0] hover:border-[#a855f7] hover:text-[#a855f7]",
    ghost: "text-[#e2e8f0] hover:bg-[#1f2937] hover:text-[#a855f7]",
    secondary: "bg-[#1f2937] text-[#e2e8f0] hover:bg-[#273449]"
  };
  return (
    <button className={`${baseStyles} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

const Card = ({ className = '', children }) => (
  <div className={`rounded-xl border border-[#1f2937] bg-[#111827] text-[#e2e8f0] shadow-md shadow-black/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-[#3b82f6]/10 ${className}`}>
    {children}
  </div>
);

const HeroSection = () => (
  <section className="relative overflow-hidden bg-[#020617] pt-24 pb-32">
    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-soft-light"></div>
    <div className="absolute -top-20 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-[#3b82f6]/20 blur-3xl"></div>
    <div className="absolute top-24 right-10 h-56 w-56 rounded-full bg-[#a855f7]/15 blur-3xl"></div>
    <div className="container mx-auto px-4 md:px-6 relative z-10 text-center max-w-4xl">
      <div className="inline-flex items-center rounded-full border border-[#1f2937] bg-[#111827] px-3 py-1 text-sm font-semibold text-[#9ca3af] mb-8 shadow-sm">
        <TerminalSquare className="mr-2 h-4 w-4 text-[#3b82f6]" />
        <span>v2.0 Modular Monolith Released</span>
      </div>
      <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-[#e2e8f0] mb-6 leading-tight">
        Developer Utilities, <br className="hidden md:block" />
        <span className="bg-gradient-to-r from-[#3b82f6] to-[#a855f7] bg-clip-text text-transparent">Unified and Scalable.</span>
      </h1>
      <p className="text-lg md:text-xl text-[#9ca3af] mb-10 max-w-2xl mx-auto leading-relaxed">
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
    <section className="py-24 bg-[#020617]">
      <div className="container mx-auto px-4 md:px-6 max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-[#e2e8f0] sm:text-4xl">Available Services</h2>
          <p className="mt-4 text-lg text-[#9ca3af]">Everything you need to streamline your daily development tasks.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <Card key={index} className="flex flex-col p-6 group">
              <div className="h-12 w-12 rounded-lg border border-[#1f2937] bg-[#0b1220] text-[#3b82f6] flex items-center justify-center mb-6 group-hover:border-[#a855f7] group-hover:text-[#a855f7] transition-colors duration-300">
                <service.icon className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold text-[#e2e8f0] mb-3">{service.title}</h3>
              <p className="text-[#9ca3af] flex-grow mb-6">{service.desc}</p>
              <Button variant="secondary" className="w-full group-hover:bg-[#a855f7] group-hover:text-white transition-colors duration-300">
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
    <section className="py-24 bg-[#020617]">
      <div className="container mx-auto px-4 md:px-6 max-w-7xl">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-[#e2e8f0] sm:text-4xl mb-6">
              Engineered for Scale and Speed
            </h2>
            <p className="text-lg text-[#9ca3af] mb-8">
              YoLab isn't just a collection of tools; it's a cohesive platform built with modern architectural patterns to ensure reliability and performance.
            </p>
            <div className="space-y-8">
              {features.map((feature, index) => (
                <div key={index} className="flex gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <div className="h-10 w-10 rounded-full bg-[#0b1220] border border-[#1f2937] flex items-center justify-center shadow-sm">
                      <feature.icon className="h-5 w-5 text-[#a855f7]" />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-[#e2e8f0]">{feature.title}</h4>
                    <p className="mt-2 text-[#9ca3af] leading-relaxed">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative rounded-2xl bg-[#111827] p-8 shadow-2xl overflow-hidden border border-[#1f2937] lg:h-[600px] flex items-center justify-center">
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[#a855f7]/20 blur-3xl"></div>
            <div className="relative z-10 w-full font-mono text-sm">
              <div className="flex items-center gap-2 mb-4 pb-4 border-b border-[#1f2937]">
                <div className="h-3 w-3 rounded-full bg-red-500"></div>
                <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                <div className="h-3 w-3 rounded-full bg-green-500"></div>
              </div>
              <div className="text-[#a855f7] mb-2"># Starting YoLab Modular Monolith...</div>
              <div className="text-[#e2e8f0] mb-1">&gt; Booting core platform</div>
              <div className="text-[#e2e8f0] mb-1">&gt; Loading service: QR Generator... <span className="text-[#3b82f6]">OK</span></div>
              <div className="text-[#e2e8f0] mb-1">&gt; Loading service: URL Shortener... <span className="text-[#3b82f6]">OK</span></div>
              <div className="text-[#e2e8f0] mb-1">&gt; Loading service: API Mocker... <span className="text-[#3b82f6]">OK</span></div>
              <div className="text-[#a855f7] mt-4">YoLab Server running on port 3000</div>
              <div className="text-[#a855f7]">Ready to accept connections.</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const CTASection = () => (
  <section className="py-24 bg-[#020617]">
    <div className="container mx-auto px-4 md:px-6 max-w-5xl">
      <div className="relative rounded-3xl bg-[#111827] border border-[#1f2937] overflow-hidden px-6 py-20 text-center shadow-xl md:px-12 md:py-24">
        <div className="absolute inset-0 bg-gradient-to-r from-[#3b82f6]/10 to-[#a855f7]/10"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay"></div>
        <div className="relative z-10">
          <h2 className="text-3xl font-bold tracking-tight text-[#e2e8f0] sm:text-4xl mb-6">
            Ready to supercharge your workflow?
          </h2>
          <p className="text-lg text-[#9ca3af] mb-10 max-w-2xl mx-auto">
            Join thousands of developers using YoLab's unified platform to build better software, faster.
          </p>
          <Button className="bg-[#3b82f6] text-[#e2e8f0] hover:bg-[#2563eb] h-12 px-8 text-base shadow-lg shadow-[#3b82f6]/30">
            Start Using YoLab for Free
          </Button>
        </div>
      </div>
    </div>
  </section>
);

export default function YoLabHome() {
  return (
    <div className="min-h-screen bg-[#020617] font-sans text-[#e2e8f0] selection:bg-[#3b82f6]/30 selection:text-[#e2e8f0]">
      <main>
        <HeroSection />
        <ServicesSection />
        <FeaturesSection />
        <CTASection />
      </main>
    </div>
  );
}