import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, SlidersHorizontal, Sparkles, Code, 
  MessageSquare, Image as ImageIcon, X, Heart, 
  Copy, Check, ExternalLink 
} from 'lucide-react';

// --- MOCK DATA ---
const TEMPLATES = [
  {
    id: 1,
    title: "Viral Hook Generator",
    description: "Generate scroll-stopping opening lines for TikTok and Reels.",
    tags: ["Trending", "Popular"],
    llm: ["GPT", "Claude"],
    category: "Social Media",
    prompt: "Act as an expert social media copywriter. Write 5 viral hooks for a short-form video about [topic]. The hooks must be under 3 seconds to read, create a curiosity gap, and use high-emotion words.",
    uses: 12400
  },
  {
    id: 2,
    title: "React Component Refactor",
    description: "Clean up messy React code, add types, and optimize hooks.",
    tags: ["New"],
    llm: ["Claude", "Gemini"],
    category: "Coding",
    prompt: "Review the following React code. Refactor it to follow modern best practices. Extract inline styles to Tailwind classes, convert to TypeScript, and wrap expensive calculations in useMemo.",
    uses: 890
  },
  {
    id: 3,
    title: "Midjourney Photorealism",
    description: "A highly detailed prompt structure for ultra-realistic portraits.",
    tags: ["Popular"],
    llm: ["GPT"],
    category: "AI Art",
    prompt: "Cinematic portrait photograph of [subject], shot on 35mm lens, f/1.8, soft volumetric lighting, 8k resolution, photorealistic, incredibly detailed, hyper-maximalist.",
    uses: 4520
  },
  {
    id: 4,
    title: "SEO Blog Post Outliner",
    description: "Create comprehensive, SEO-optimized outlines for articles.",
    tags: [],
    llm: ["GPT", "Claude", "Gemini"],
    category: "Marketing",
    prompt: "Create a comprehensive SEO-optimized blog post outline for the keyword '[keyword]'. Include H1, H2, and H3 tags. Add a section for FAQ based on 'People Also Ask' on Google.",
    uses: 3200
  },
];

const CATEGORIES = ["All", "Marketing", "Social Media", "Coding", "AI Art"];
const LLMS = ["GPT", "Claude", "Gemini"];

// --- COMPONENT ---
export default function TemplateMarketplace() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [selectedLLMs, setSelectedLLMs] = useState([]);
  const [sortBy, setSortBy] = useState('Popular');
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [copied, setCopied] = useState(false);

  // Filtering & Sorting Logic
  const filteredTemplates = useMemo(() => {
    return TEMPLATES.filter(t => {
      const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase()) || 
                            t.description.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = category === 'All' || t.category === category;
      const matchesLLM = selectedLLMs.length === 0 || t.llm.some(l => selectedLLMs.includes(l));
      return matchesSearch && matchesCategory && matchesLLM;
    }).sort((a, b) => {
      if (sortBy === 'Popular') return b.uses - a.uses;
      if (sortBy === 'Latest') return b.id - a.id;
      return 0;
    });
  }, [search, category, selectedLLMs, sortBy]);

  const toggleLLM = (llm) => {
    setSelectedLLMs(prev => 
      prev.includes(llm) ? prev.filter(l => l !== llm) : [...prev, llm]
    );
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 font-sans selection:bg-neutral-200">
      
      {/* NAVBAR */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-neutral-200">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xl font-bold tracking-tight">
            <Sparkles className="w-6 h-6 text-indigo-600" />
            <span>Prompt<span className="text-neutral-500 font-normal">Base</span></span>
          </div>
          
          <div className="hidden md:flex flex-1 max-w-md mx-8 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input 
              type="text" 
              placeholder="Search templates..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-neutral-100 border-transparent focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 rounded-lg text-sm transition-all outline-none"
            />
          </div>

          <div className="flex items-center gap-4">
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="text-sm bg-transparent border border-neutral-200 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            >
              <option>Popular</option>
              <option>Latest</option>
            </select>
          </div>
        </div>
      </header>

      {/* MAIN LAYOUT */}
      <div className="container mx-auto px-4 py-8 flex flex-col md:flex-row gap-8">
        
        {/* SIDEBAR */}
        <aside className="w-full md:w-64 flex-shrink-0 space-y-8">
          <div>
            <h3 className="text-sm font-semibold text-neutral-900 mb-3 flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4" /> Categories
            </h3>
            <ul className="space-y-1 text-sm">
              {CATEGORIES.map(cat => (
                <li key={cat}>
                  <button 
                    onClick={() => setCategory(cat)}
                    className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                      category === cat ? 'bg-neutral-200 font-medium' : 'hover:bg-neutral-100 text-neutral-600'
                    }`}
                  >
                    {cat}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-neutral-900 mb-3">Compatible With</h3>
            <div className="space-y-2">
              {LLMS.map(llm => (
                <label key={llm} className="flex items-center gap-2 text-sm text-neutral-600 cursor-pointer group">
                  <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                    selectedLLMs.includes(llm) ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-neutral-300 group-hover:border-indigo-400'
                  }`}>
                    {selectedLLMs.includes(llm) && <Check className="w-3 h-3" />}
                  </div>
                  <input 
                    type="checkbox" 
                    className="hidden"
                    checked={selectedLLMs.includes(llm)}
                    onChange={() => toggleLLM(llm)}
                  />
                  {llm}
                </label>
              ))}
            </div>
          </div>
        </aside>

        {/* GRID */}
        <main className="flex-1">
          {filteredTemplates.length === 0 ? (
             <div className="text-center py-20 text-neutral-500">
               <p>No templates found matching your criteria.</p>
             </div>
          ) : (
            <motion.div layout className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              <AnimatePresence>
                {filteredTemplates.map(template => (
                  <motion.div 
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    key={template.id}
                    className="group bg-white rounded-2xl border border-neutral-200 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col cursor-pointer"
                    onClick={() => setSelectedTemplate(template)}
                  >
                    {/* Placeholder Image */}
                    <div className="h-40 bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center border-b border-neutral-100">
                      {template.category === 'Coding' ? <Code className="w-10 h-10 text-indigo-200" /> :
                       template.category === 'AI Art' ? <ImageIcon className="w-10 h-10 text-purple-200" /> :
                       <MessageSquare className="w-10 h-10 text-blue-200" />}
                    </div>
                    
                    <div className="p-5 flex-1 flex flex-col">
                      <div className="flex gap-2 mb-3 flex-wrap">
                        {template.tags.map(tag => (
                          <span key={tag} className="text-[10px] uppercase tracking-wider font-semibold px-2 py-1 bg-neutral-100 text-neutral-600 rounded-full">
                            {tag}
                          </span>
                        ))}
                      </div>
                      
                      <h3 className="text-lg font-bold text-neutral-900 mb-1 leading-tight">{template.title}</h3>
                      <p className="text-sm text-neutral-500 line-clamp-2 mb-4 flex-1">{template.description}</p>
                      
                      <div className="flex items-center justify-between mt-auto pt-4 border-t border-neutral-100">
                        <div className="flex gap-1">
                          {template.llm.map(l => (
                            <span key={l} className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded-md font-medium border border-blue-100">
                              {l}
                            </span>
                          ))}
                        </div>
                        <span className="text-xs text-neutral-400 flex items-center gap-1 font-medium">
                          <Heart className="w-3 h-3 fill-neutral-300 text-neutral-300" />
                          {(template.uses / 1000).toFixed(1)}k
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </main>
      </div>

      {/* MODAL DIALOG */}
      <AnimatePresence>
        {selectedTemplate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-neutral-900/40 backdrop-blur-sm"
              onClick={() => setSelectedTemplate(null)}
            />
            
            <motion.div 
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-neutral-100 flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-neutral-900 mb-2">{selectedTemplate.title}</h2>
                  <p className="text-sm text-neutral-500">{selectedTemplate.description}</p>
                </div>
                <button 
                  onClick={() => setSelectedTemplate(null)}
                  className="p-2 text-neutral-400 hover:bg-neutral-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto flex-1 bg-neutral-50">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-neutral-900">Prompt Template</h3>
                  <button 
                    onClick={() => handleCopy(selectedTemplate.prompt)}
                    className="flex items-center gap-1 text-xs font-medium text-neutral-600 hover:text-indigo-600 bg-white border border-neutral-200 px-3 py-1.5 rounded-md shadow-sm transition-colors"
                  >
                    {copied ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3" />}
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                
                <div className="bg-white border border-neutral-200 p-4 rounded-xl text-sm text-neutral-700 whitespace-pre-wrap font-mono leading-relaxed shadow-sm">
                  {selectedTemplate.prompt.split(/(\[.*?\])/).map((part, i) => 
                    part.startsWith('[') && part.endsWith(']') 
                      ? <span key={i} className="text-indigo-600 font-bold bg-indigo-50 px-1 rounded">{part}</span> 
                      : part
                  )}
                </div>
              </div>

              <div className="p-6 border-t border-neutral-100 bg-white flex justify-between items-center">
                <div className="flex gap-2">
                  {selectedTemplate.llm.map(l => (
                    <span key={l} className="text-xs px-2 py-1 bg-neutral-100 text-neutral-700 rounded-md font-medium">
                      {l}
                    </span>
                  ))}
                </div>
                <button className="flex items-center gap-2 bg-neutral-900 hover:bg-neutral-800 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors">
                  Open in App <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}