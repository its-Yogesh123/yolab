import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Upload, Image as ImageIcon, Sliders,
  Download, RefreshCw, Sparkles, ArrowLeft,
  CheckCircle2, AlertCircle, X, Menu, ChevronDown,
} from 'lucide-react';
import Footer from '../shared/Footer.jsx';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/* ─── Theme ─────────────────────────────────── */
const C = {
  bg: '#050505', card: '#111111', border: '#262626',
  text: '#f5f5f5', muted: '#a3a3a3',
  accent: '#d4d4d4', accentDim: '#737373',
  success: '#4ade80', error: '#f87171',
};

/* ─── Taglines ───────────────────────────────── */
const TAGLINES = [
  'Preparing your image…', 'Crunching pixels…', 'Applying the algorithm…',
  'Tuning the result…', 'Almost there…', 'Running through OnePic…',
  'Polishing every edge…', 'Smoothing things out…',
  'Your image is in good hands…', 'Finalizing the magic…',
];

/* ─── Ops config ─────────────────────────────── */
const PHASE_GROUPS = [
  {
    phase: 'Phase 1', label: 'Enhancement', color: '#d4d4d4',
    ops: [
      { id: 'gaussian', label: 'Gaussian Blur', endpoint: '/api/image/gaussian', icon: '◉',
        description: 'Smooth an image by averaging neighbouring pixels with a Gaussian kernel. Great for noise reduction and depth-of-field effects.',
        params: [{ key: 'radius', label: 'Blur Radius (σ)', type: 'range', min: 0.1, max: 20, step: 0.1, default: 2, unit: 'px' }] },
      { id: 'median', label: 'Median Filter', endpoint: '/api/image/median', icon: '◈',
        description: 'Replace each pixel with the median of its neighbours. Excellent for removing salt-and-pepper noise while preserving sharp edges.',
        params: [{ key: 'size', label: 'Kernel Size', type: 'select', options: [3,5,7,9,11,15,21], default: 3, unit: 'px' }] },
      { id: 'sharpen', label: 'Sharpening', endpoint: '/api/image/sharpen', icon: '◇',
        description: 'Enhance fine details and edges by boosting high-frequency components. Makes blurry images crisper and more defined.',
        params: [{ key: 'factor', label: 'Sharpness Factor', type: 'range', min: 0, max: 10, step: 0.1, default: 2, unit: 'x' }] },
      { id: 'histogram-eq', label: 'Histogram EQ', endpoint: '/api/image/histogram-eq', icon: '◆',
        description: 'Redistribute pixel intensities to enhance global contrast.',
        params: [] },
    ],
  },
  {
    phase: 'Phase 2', label: 'Edge Detection', color: '#a78bfa',
    ops: [
      { id: 'sobel', label: 'Sobel', endpoint: '/api/image/sobel', icon: '⬡',
        description: 'Detects edges using horizontal and vertical Sobel kernels.',
        params: [] },
      { id: 'prewitt', label: 'Prewitt', endpoint: '/api/image/prewitt', icon: '⬢',
        description: 'Edge detection with equal-weight Prewitt kernels.',
        params: [] },
      { id: 'laplacian', label: 'Laplacian', endpoint: '/api/image/laplacian', icon: '◻',
        description: 'Second-order derivative edge detection.',
        params: [{ key: 'connectivity', label: 'Connectivity', type: 'select', options: [4,8], default: 8, unit: '' }] },
      { id: 'canny', label: 'Canny', endpoint: '/api/image/canny', icon: '◎',
        description: 'Multi-stage detector: Gaussian → gradient → NMS → hysteresis.',
        params: [
          { key: 'sigma', label: 'Gaussian σ', type: 'range', min: 0.5, max: 5, step: 0.1, default: 1.4, unit: '' },
          { key: 'low_threshold', label: 'Low Threshold', type: 'range', min: 0.01, max: 0.5, step: 0.01, default: 0.05, unit: '' },
          { key: 'high_threshold', label: 'High Threshold', type: 'range', min: 0.05, max: 0.9, step: 0.01, default: 0.15, unit: '' },
        ] },
    ],
  },
  {
    phase: 'Phase 3', label: 'Transforms', color: '#34d399',
    ops: [
      { id: 'rotate', label: 'Rotate', endpoint: '/api/image/rotate', icon: '↻',
        description: 'Rotate the image by any angle. Enable expand to avoid cropping.',
        params: [
          { key: 'angle', label: 'Angle (°)', type: 'range', min: -180, max: 180, step: 1, default: 90, unit: '°' },
          { key: 'expand', label: 'Expand Canvas', type: 'toggle', default: true },
        ] },
      { id: 'flip', label: 'Flip', endpoint: '/api/image/flip', icon: '⇄',
        description: 'Mirror the image horizontally or vertically.',
        params: [{ key: 'direction', label: 'Direction', type: 'select', options: ['horizontal','vertical'], default: 'horizontal', unit: '' }] },
      { id: 'resize', label: 'Resize', endpoint: '/api/image/resize', icon: '⤢',
        description: 'Resize to exact pixel dimensions, optionally preserving aspect ratio.',
        params: [
          { key: 'width',  label: 'Width (px)',  type: 'range', min: 64, max: 4096, step: 1, default: 800, unit: 'px' },
          { key: 'height', label: 'Height (px)', type: 'range', min: 64, max: 4096, step: 1, default: 600, unit: 'px' },
          { key: 'keep_aspect', label: 'Keep Aspect Ratio', type: 'toggle', default: true },
        ] },
      { id: 'brightness-contrast', label: 'Brightness & Contrast', endpoint: '/api/image/brightness-contrast', icon: '◑',
        description: 'Independently adjust brightness and contrast.',
        params: [
          { key: 'brightness', label: 'Brightness', type: 'range', min: 0.1, max: 3.0, step: 0.05, default: 1.0, unit: 'x' },
          { key: 'contrast',   label: 'Contrast',   type: 'range', min: 0.1, max: 3.0, step: 0.05, default: 1.0, unit: 'x' },
        ] },
      { id: 'grayscale', label: 'Grayscale', endpoint: '/api/image/grayscale', icon: '◐',
        description: 'Convert to grayscale using luminance formula.',
        params: [] },
      { id: 'invert', label: 'Invert Colors', endpoint: '/api/image/invert', icon: '◍',
        description: 'Produce a photographic negative (255 − pixel).',
        params: [] },
      { id: 'convolution', label: 'Convolution', endpoint: '/api/image/convolution', icon: '⧞',
        description: 'Apply a preset NxN convolution kernel.',
        params: [{ key: 'kernel', label: 'Kernel Preset', type: 'select', unit: '', default: '[[0,-1,0],[-1,5,-1],[0,-1,0]]',
          options: [
            { label: 'Sharpen',     value: '[[0,-1,0],[-1,5,-1],[0,-1,0]]' },
            { label: 'Edge Detect', value: '[[-1,-1,-1],[-1,8,-1],[-1,-1,-1]]' },
            { label: 'Emboss',      value: '[[-2,-1,0],[-1,1,1],[0,1,2]]' },
            { label: 'Box Blur',    value: '[[0.111,0.111,0.111],[0.111,0.111,0.111],[0.111,0.111,0.111]]' },
          ] }] },
      { id: 'threshold', label: 'Thresholding', endpoint: '/api/image/threshold', icon: '▨',
        description: 'Segment image into black and white.',
        params: [
          { key: 'threshold', label: 'Threshold Value', type: 'range', min: 0, max: 255, step: 1, default: 128, unit: '' },
          { key: 'mode', label: 'Mode', type: 'select', options: ['binary','otsu'], default: 'binary', unit: '' },
        ] },
      { id: 'dft', label: 'DFT Spectrum', endpoint: '/api/image/dft', icon: '∿',
        description: 'Visualise the 2-D Discrete Fourier Transform magnitude spectrum.',
        params: [] },
    ],
  },
];

const ALL_OPS = PHASE_GROUPS.flatMap((g) => g.ops);

/* ─── Tiny helpers ───────────────────────────── */
const PhaseBadge = ({ label, color }) => (
  <span style={{ display:'inline-flex', alignItems:'center', padding:'2px 7px', borderRadius:'9999px',
    border:`1px solid ${color}44`, background:`${color}11`,
    fontSize:'10px', fontWeight:700, color, letterSpacing:'0.06em', textTransform:'uppercase' }}>
    {label}
  </span>
);

/* ─── Param Control ──────────────────────────── */
const ParamControl = ({ param, value, onChange, compact }) => {
  if (param.type === 'range') {
    const dec = param.step < 0.1 ? 2 : param.step < 1 ? 1 : 0;
    return (
      <div style={{ flex: compact ? '1 1 160px' : undefined, minWidth: compact ? '140px' : undefined, marginBottom: compact ? 0 : '14px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'5px' }}>
          <label style={{ fontSize:'11px', color:C.muted, fontWeight:500 }}>{param.label}</label>
          <span style={{ fontSize:'11px', color:C.accent, fontWeight:700, fontFamily:'monospace' }}>{Number(value).toFixed(dec)}{param.unit}</span>
        </div>
        <input type="range" min={param.min} max={param.max} step={param.step} value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          style={{ width:'100%', accentColor:C.accent, cursor:'pointer', height:'3px' }} />
        <div style={{ display:'flex', justifyContent:'space-between', marginTop:'2px' }}>
          <span style={{ fontSize:'9px', color:C.accentDim }}>{param.min}{param.unit}</span>
          <span style={{ fontSize:'9px', color:C.accentDim }}>{param.max}{param.unit}</span>
        </div>
      </div>
    );
  }
  if (param.type === 'select') {
    return (
      <div style={{ flex: compact ? '0 0 auto' : undefined, marginBottom: compact ? 0 : '14px' }}>
        <label style={{ fontSize:'11px', color:C.muted, fontWeight:500, display:'block', marginBottom:'6px' }}>{param.label}</label>
        <div style={{ display:'flex', gap:'5px', flexWrap:'wrap' }}>
          {param.options.map((opt) => {
            const v = typeof opt === 'object' ? opt.value : opt;
            const l = typeof opt === 'object' ? opt.label : (param.unit ? `${opt}×${opt}` : String(opt));
            const active = value === v;
            return (
              <button key={v} onClick={() => onChange(v)} style={{ padding:'4px 10px', borderRadius:'6px',
                border:`1px solid ${active ? C.accent : C.border}`, background: active ? 'rgba(212,212,212,0.12)' : 'transparent',
                color: active ? C.accent : C.muted, fontSize:'11px', fontWeight:700, cursor:'pointer',
                transition:'all 0.15s', fontFamily:'monospace' }}>
                {l}
              </button>
            );
          })}
        </div>
      </div>
    );
  }
  if (param.type === 'toggle') {
    return (
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:'12px',
        flex: compact ? '0 0 auto' : undefined, marginBottom: compact ? 0 : '14px' }}>
        <label style={{ fontSize:'11px', color:C.muted, fontWeight:500, whiteSpace:'nowrap' }}>{param.label}</label>
        <button onClick={() => onChange(!value)} style={{ width:'36px', height:'20px', borderRadius:'999px', border:'none',
          cursor:'pointer', background: value ? C.accent : '#333', position:'relative', transition:'background 0.2s', flexShrink:0 }}>
          <span style={{ position:'absolute', top:'2px', left: value ? '18px' : '2px', width:'16px', height:'16px',
            borderRadius:'50%', background: value ? '#050505' : '#777', transition:'left 0.2s' }} />
        </button>
      </div>
    );
  }
  return null;
};

/* ─── Processing Loader ──────────────────────── */
const ProcessingLoader = ({ opLabel }) => {
  const [idx, setIdx] = useState(0);
  const [fade, setFade] = useState(true);
  useEffect(() => {
    const iv = setInterval(() => { setFade(false); setTimeout(() => { setIdx((i) => (i+1) % TAGLINES.length); setFade(true); }, 300); }, 2200);
    return () => clearInterval(iv);
  }, []);
  return (
    <div style={{ position:'fixed', inset:0, zIndex:9999, background:'rgba(5,5,5,0.93)', backdropFilter:'blur(14px)',
      display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'28px' }}>
      <div style={{ position:'relative', width:'80px', height:'80px' }}>
        <div style={{ position:'absolute', inset:0, borderRadius:'50%', border:'2px solid #262626' }} />
        <div style={{ position:'absolute', inset:0, borderRadius:'50%', border:'2px solid transparent', borderTopColor:C.accent, animation:'spin 0.9s linear infinite' }} />
        <div style={{ position:'absolute', inset:'14px', borderRadius:'50%', border:'1px solid transparent', borderTopColor:'#737373', animation:'spin 1.4s linear infinite reverse' }} />
        <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <Sparkles size={20} color={C.accent} strokeWidth={1.5} />
        </div>
      </div>
      <div style={{ textAlign:'center' }}>
        <p style={{ margin:'0 0 8px', fontSize:'17px', fontWeight:700, color:C.text }}>Applying {opLabel}</p>
        <p style={{ margin:0, fontSize:'13px', color:C.muted, transition:'opacity 0.3s', opacity:fade?1:0, minHeight:'18px' }}>{TAGLINES[idx]}</p>
      </div>
      <div style={{ display:'flex', gap:'8px' }}>
        {[0,1,2].map((i) => <div key={i} style={{ width:'5px', height:'5px', borderRadius:'50%', background:C.accentDim, animation:`pulse 1.4s ease-in-out ${i*0.2}s infinite` }} />)}
      </div>
    </div>
  );
};

/* ─── Upload Zone ────────────────────────────── */
const UploadZone = ({ onFile }) => {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef();
  const handleDrop = useCallback((e) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) onFile(f); }, [onFile]);
  return (
    <div onDragOver={(e) => { e.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)}
      onDrop={handleDrop} onClick={() => inputRef.current.click()}
      style={{ border:`2px dashed ${dragging ? C.accent : C.border}`, borderRadius:'12px', background: dragging ? 'rgba(212,212,212,0.04)' : C.card,
        display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
        padding:'48px 24px', cursor:'pointer', transition:'all 0.25s', minHeight:'240px' }}>
      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp,image/bmp" style={{ display:'none' }}
        onChange={(e) => e.target.files[0] && onFile(e.target.files[0])} />
      <Upload size={36} color={dragging ? C.accent : C.accentDim} strokeWidth={1.5} />
      <p style={{ margin:'14px 0 4px', color:C.text, fontWeight:600, fontSize:'15px' }}>Drop an image here</p>
      <p style={{ margin:0, color:C.muted, fontSize:'13px' }}>or <span style={{ color:C.accent, textDecoration:'underline' }}>browse files</span></p>
      <p style={{ margin:'10px 0 0', color:C.accentDim, fontSize:'11px' }}>JPEG · PNG · WebP · BMP — up to 20 MB</p>
    </div>
  );
};

/* ─── Preview Card ───────────────────────────── */
const PreviewCard = ({ label, src, isBlob, empty }) => (
  <div style={{ borderRadius:'10px', border:`1px solid ${C.border}`, background:C.card, overflow:'hidden', flex:1, minWidth:0 }}>
    <div style={{ padding:'9px 14px', borderBottom:`1px solid ${C.border}`, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
      <span style={{ fontSize:'11px', fontWeight:600, color:C.muted, textTransform:'uppercase', letterSpacing:'0.08em' }}>{label}</span>
      {src && <a href={src} download={isBlob ? 'processed.jpg' : undefined}
        style={{ color:C.muted, display:'flex', alignItems:'center', gap:'4px', fontSize:'11px', textDecoration:'none' }}>
        <Download size={12} /> Save
      </a>}
    </div>
    <div style={{ minHeight:'240px', display:'flex', alignItems:'center', justifyContent:'center', background:'#080808' }}>
      {src
        ? <img src={src} alt={label} style={{ maxWidth:'100%', maxHeight:'380px', objectFit:'contain', display:'block' }} />
        : <div style={{ textAlign:'center', color:C.accentDim }}>
            <ImageIcon size={30} strokeWidth={1} />
            <p style={{ marginTop:'8px', fontSize:'12px' }}>{empty || 'No image yet'}</p>
          </div>
      }
    </div>
  </div>
);

/* ─── Op selector list (used in mobile drawer) ─ */
const OpList = ({ selectedOp, onSelect }) => (
  <>
    {PHASE_GROUPS.map((group) => (
      <div key={group.phase}>
        <div style={{ display:'flex', alignItems:'center', gap:'8px', margin:'14px 0 6px' }}>
          <PhaseBadge label={group.phase} color={group.color} />
          <span style={{ fontSize:'11px', color:C.accentDim, fontWeight:600 }}>{group.label}</span>
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:'3px' }}>
          {group.ops.map((op) => {
            const active = selectedOp === op.id;
            return (
              <button key={op.id} onClick={() => onSelect(op.id)}
                style={{ background: active ? 'rgba(212,212,212,0.07)' : 'transparent',
                  border:`1px solid ${active ? C.accentDim : C.border}`, borderRadius:'8px',
                  padding:'9px 12px', cursor:'pointer', width:'100%',
                  display:'flex', alignItems:'center', gap:'10px', transition:'all 0.15s' }}>
                <span style={{ fontSize:'14px', color: active ? group.color : C.accentDim }}>{op.icon}</span>
                <span style={{ fontSize:'13px', fontWeight:600, color: active ? C.text : C.muted, flex:1, textAlign:'left' }}>{op.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    ))}
  </>
);

/* ─── Mobile Drawer ──────────────────────────── */
const ToolDrawer = ({ open, onClose, selectedOp, onSelect }) => {
  useEffect(() => { document.body.style.overflow = open ? 'hidden' : ''; return () => { document.body.style.overflow = ''; }; }, [open]);
  return (
    <>
      <div onClick={onClose} style={{ position:'fixed', inset:0, zIndex:1000, background:'rgba(0,0,0,0.65)', backdropFilter:'blur(4px)', opacity: open?1:0, pointerEvents: open?'auto':'none', transition:'opacity 0.25s' }} />
      <div style={{ position:'fixed', top:0, left:0, bottom:0, zIndex:1001, width:'300px', maxWidth:'85vw',
        background:'#0c0c0c', borderRight:`1px solid ${C.border}`, display:'flex', flexDirection:'column',
        transform: open ? 'translateX(0)' : 'translateX(-100%)', transition:'transform 0.28s cubic-bezier(0.4,0,0.2,1)' }}>
        <div style={{ padding:'16px', borderBottom:`1px solid ${C.border}`, display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0 }}>
          <div style={{ display:'flex', alignItems:'center', gap:'9px' }}>
            <Sparkles size={15} color={C.accent} strokeWidth={1.5} />
            <span style={{ fontWeight:700, fontSize:'14px', color:C.text }}>Select Tool</span>
          </div>
          <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', color:C.muted, padding:'4px', display:'flex' }}>
            <X size={17} />
          </button>
        </div>
        <div style={{ flex:1, overflowY:'auto', padding:'4px 12px 24px', scrollbarWidth:'thin', scrollbarColor:'#2a2a2a transparent' }}>
          <OpList selectedOp={selectedOp} onSelect={(id) => { onSelect(id); onClose(); }} />
        </div>
      </div>
    </>
  );
};

/* ─── Desktop Top Nav with Phase Dropdowns ───── */
const DesktopTopNav = ({ selectedOp, currentGroup, onSelect, navigate }) => {
  const [openPhase, setOpenPhase] = useState(null);
  const navRef = useRef();
  const currentOp = ALL_OPS.find((o) => o.id === selectedOp);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => { if (navRef.current && !navRef.current.contains(e.target)) setOpenPhase(null); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <nav ref={navRef} style={{ background: C.card, borderBottom:`1px solid ${C.border}`, position:'sticky', top:0, zIndex:500 }}>
      <div style={{ maxWidth:'1400px', margin:'0 auto', padding:'0 24px', height:'56px', display:'flex', alignItems:'center', gap:'0' }}>

        {/* Left: back + brand */}
        <div style={{ display:'flex', alignItems:'center', gap:'16px', flexShrink:0 }}>
          <button onClick={() => navigate('/')}
            style={{ background:'none', border:'none', cursor:'pointer', color:C.muted, display:'flex', alignItems:'center', gap:'6px', fontSize:'13px', fontWeight:500, padding:'6px 8px', borderRadius:'6px', transition:'color 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.color=C.text} onMouseLeave={e => e.currentTarget.style.color=C.muted}>
            <ArrowLeft size={14} /> Back
          </button>
          <div style={{ width:'1px', height:'22px', background:C.border }} />
          <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
            <Sparkles size={15} color={C.accent} strokeWidth={1.5} />
            <span style={{ fontWeight:700, fontSize:'14px', color:C.text, letterSpacing:'-0.01em' }}>OnePic</span>
            <span style={{ fontSize:'11px', color:C.accentDim, fontWeight:500 }}>— Image Processing</span>
          </div>
        </div>

        {/* Divider */}
        <div style={{ width:'1px', height:'22px', background:C.border, margin:'0 20px' }} />

        {/* Center: phase dropdown buttons */}
        <div style={{ display:'flex', alignItems:'center', gap:'4px', flex:1 }}>
          {PHASE_GROUPS.map((group) => {
            const isOpen = openPhase === group.phase;
            const hasActive = group.ops.some((o) => o.id === selectedOp);
            return (
              <div key={group.phase} style={{ position:'relative' }}>
                <button
                  onClick={() => setOpenPhase(isOpen ? null : group.phase)}
                  style={{ display:'flex', alignItems:'center', gap:'7px', padding:'7px 12px', borderRadius:'7px',
                    background: hasActive ? `${group.color}12` : (isOpen ? `${C.border}` : 'transparent'),
                    border:`1px solid ${hasActive ? `${group.color}44` : (isOpen ? C.border : 'transparent')}`,
                    cursor:'pointer', transition:'all 0.15s', color: hasActive ? group.color : C.muted,
                    fontSize:'13px', fontWeight:600 }}>
                  <PhaseBadge label={group.phase} color={group.color} />
                  <span style={{ color: hasActive ? group.color : C.muted }}>{group.label}</span>
                  <ChevronDown size={12} color={hasActive ? group.color : C.accentDim}
                    style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0)', transition:'transform 0.2s' }} />
                </button>

                {/* Dropdown */}
                {isOpen && (
                  <div style={{ position:'absolute', top:'calc(100% + 8px)', left:0, zIndex:600,
                    background:'#0e0e0e', border:`1px solid ${C.border}`, borderRadius:'10px',
                    boxShadow:'0 16px 48px rgba(0,0,0,0.6)', padding:'6px', minWidth:'200px',
                    animation:'fadeInDown 0.15s ease' }}>
                    <p style={{ margin:'0 0 4px', padding:'4px 8px', fontSize:'10px', fontWeight:700,
                      color:C.accentDim, textTransform:'uppercase', letterSpacing:'0.08em' }}>
                      {group.label}
                    </p>
                    {group.ops.map((op) => {
                      const active = selectedOp === op.id;
                      return (
                        <button key={op.id}
                          onClick={() => { onSelect(op.id); setOpenPhase(null); }}
                          style={{ width:'100%', display:'flex', alignItems:'center', gap:'10px',
                            padding:'8px 10px', borderRadius:'7px', cursor:'pointer',
                            background: active ? `${group.color}14` : 'transparent',
                            border:`1px solid ${active ? `${group.color}44` : 'transparent'}`,
                            transition:'all 0.12s', marginBottom:'2px' }}
                          onMouseEnter={e => { if (!active) e.currentTarget.style.background='rgba(255,255,255,0.04)'; }}
                          onMouseLeave={e => { if (!active) e.currentTarget.style.background='transparent'; }}>
                          <span style={{ fontSize:'15px', color: active ? group.color : C.accentDim }}>{op.icon}</span>
                          <span style={{ fontSize:'13px', fontWeight:600, color: active ? group.color : C.muted, flex:1, textAlign:'left' }}>{op.label}</span>
                          {active && <span style={{ fontSize:'10px', color:group.color, fontWeight:700 }}>✓</span>}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Right: current selection indicator */}
        <div style={{ display:'flex', alignItems:'center', gap:'8px', flexShrink:0, paddingLeft:'16px', borderLeft:`1px solid ${C.border}` }}>
          <span style={{ fontSize:'15px', color: currentGroup?.color || C.accent }}>{currentOp?.icon}</span>
          <span style={{ fontSize:'13px', fontWeight:600, color:C.text }}>{currentOp?.label}</span>
          {currentGroup && <PhaseBadge label={currentGroup.phase} color={currentGroup.color} />}
        </div>
      </div>
    </nav>
  );
};

/* ─── Desktop Controls Bar (params + apply) ──── */
const DesktopControlsBar = ({ currentOp, selectedOp, params, setParams, originalFile, loading, onProcess, onReset, status }) => (
  <div style={{ border:`1px solid ${C.border}`, borderRadius:'10px', background:C.card, padding:'14px 16px' }}>
    <div style={{ display:'flex', alignItems:'flex-end', gap:'16px', flexWrap:'wrap' }}>

      {/* Params spread horizontally */}
      {currentOp.params.length > 0 ? (
        currentOp.params.map((p) => (
          <div key={p.key} style={{ flex: p.type === 'range' ? '1 1 160px' : '0 0 auto', maxWidth: p.type === 'range' ? '240px' : undefined }}>
            <ParamControl param={p} value={params[`${selectedOp}.${p.key}`]}
              onChange={(v) => setParams((prev) => ({ ...prev, [`${selectedOp}.${p.key}`]: v }))} compact />
          </div>
        ))
      ) : (
        <p style={{ margin:0, fontSize:'12px', color:C.accentDim, fontStyle:'italic', alignSelf:'center' }}>
          No adjustable parameters — just apply.
        </p>
      )}

      {/* Spacer */}
      <div style={{ flex:1 }} />

      {/* Apply + Reset */}
      <div style={{ display:'flex', gap:'8px', flexShrink:0, alignSelf:'flex-end' }}>
        <button onClick={onProcess} disabled={!originalFile || loading}
          style={{ display:'inline-flex', alignItems:'center', gap:'7px', padding:'10px 20px', borderRadius:'8px',
            background:C.accent, color:'#050505', fontWeight:700, fontSize:'13px', border:'none',
            cursor: (!originalFile || loading) ? 'not-allowed' : 'pointer', opacity: (!originalFile || loading) ? 0.5 : 1, transition:'all 0.2s', whiteSpace:'nowrap' }}>
          <Sparkles size={14} /> Apply {currentOp.label}
        </button>
        {originalFile && (
          <button onClick={onReset}
            style={{ display:'inline-flex', alignItems:'center', gap:'6px', padding:'10px 14px', borderRadius:'8px',
              background:'transparent', color:C.muted, border:`1px solid ${C.border}`, fontWeight:600, fontSize:'13px', cursor:'pointer', transition:'all 0.2s' }}>
            <RefreshCw size={13} /> Reset
          </button>
        )}
      </div>
    </div>

    {/* Status inline */}
    {status && (
      <div style={{ display:'flex', alignItems:'center', gap:'7px', marginTop:'12px', paddingTop:'12px',
        borderTop:`1px solid ${C.border}`, fontSize:'12px',
        color: status.type === 'success' ? C.success : C.error }}>
        {status.type === 'success' ? <CheckCircle2 size={13} /> : <AlertCircle size={13} />}
        {status.msg}
      </div>
    )}
  </div>
);

/* ─── Mobile Actions (params stacked + button) ─ */
const MobileActions = ({ currentOp, selectedOp, params, setParams, originalFile, loading, onProcess, onReset, status }) => (
  <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
    {currentOp.params.length > 0 && (
      <div style={{ border:`1px solid ${C.border}`, borderRadius:'10px', background:C.card, padding:'14px 16px' }}>
        <p style={{ margin:'0 0 12px', fontSize:'10px', fontWeight:700, color:C.accentDim, textTransform:'uppercase', letterSpacing:'0.08em', display:'flex', alignItems:'center', gap:'5px' }}>
          <Sliders size={10} /> Parameters
        </p>
        {currentOp.params.map((p) => (
          <ParamControl key={p.key} param={p} value={params[`${selectedOp}.${p.key}`]}
            onChange={(v) => setParams((prev) => ({ ...prev, [`${selectedOp}.${p.key}`]: v }))} />
        ))}
      </div>
    )}
    <button onClick={onProcess} disabled={!originalFile || loading}
      style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px',
        padding:'12px', borderRadius:'8px', background:C.accent, color:'#050505', fontWeight:700,
        fontSize:'14px', border:'none', cursor: (!originalFile||loading) ? 'not-allowed' : 'pointer',
        opacity: (!originalFile||loading) ? 0.5 : 1, transition:'all 0.2s' }}>
      <Sparkles size={15} /> Apply {currentOp.label}
    </button>
    {originalFile && (
      <button onClick={onReset}
        style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'center', gap:'6px',
          padding:'10px', borderRadius:'8px', background:'transparent', color:C.muted,
          border:`1px solid ${C.border}`, fontWeight:600, fontSize:'13px', cursor:'pointer' }}>
        <RefreshCw size={13} /> Reset
      </button>
    )}
    {status && (
      <div style={{ display:'flex', alignItems:'flex-start', gap:'8px', padding:'11px 13px', borderRadius:'8px',
        border:`1px solid ${status.type==='success' ? 'rgba(74,222,128,0.3)' : 'rgba(248,113,113,0.3)'}`,
        background: status.type==='success' ? 'rgba(74,222,128,0.05)' : 'rgba(248,113,113,0.05)',
        fontSize:'13px', color: status.type==='success' ? C.success : C.error }}>
        {status.type==='success' ? <CheckCircle2 size={14} style={{ flexShrink:0, marginTop:'1px' }} /> : <AlertCircle size={14} style={{ flexShrink:0, marginTop:'1px' }} />}
        {status.msg}
      </div>
    )}
  </div>
);

/* ─── Main Page ──────────────────────────────── */
export default function ImageProcessingPage() {
  const navigate = useNavigate();
  const [drawerOpen,   setDrawerOpen]   = useState(false);
  const [originalFile, setOriginalFile] = useState(null);
  const [originalUrl,  setOriginalUrl]  = useState(null);
  const [processedUrl, setProcessedUrl] = useState(null);
  const [selectedOp,   setSelectedOp]   = useState(PHASE_GROUPS[0].ops[0].id);
  const [params,       setParams]       = useState(() => {
    const init = {};
    ALL_OPS.forEach((op) => op.params.forEach((p) => { init[`${op.id}.${p.key}`] = p.default; }));
    return init;
  });
  const [loading, setLoading] = useState(false);
  const [status,  setStatus]  = useState(null);

  const currentOp    = ALL_OPS.find((o) => o.id === selectedOp);
  const currentGroup = PHASE_GROUPS.find((g) => g.ops.some((o) => o.id === selectedOp));

  const handleFile   = (f) => { setOriginalFile(f); setOriginalUrl(URL.createObjectURL(f)); setProcessedUrl(null); setStatus(null); };
  const handleReset  = () => { setOriginalFile(null); setOriginalUrl(null); setProcessedUrl(null); setStatus(null); };
  const handleOpSel  = (id) => { setSelectedOp(id); setProcessedUrl(null); setStatus(null); };

  const handleProcess = async () => {
    if (!originalFile) return;
    setLoading(true); setStatus(null); setProcessedUrl(null);
    try {
      const form = new FormData();
      form.append('file', originalFile);
      currentOp.params.forEach((p) => form.append(p.key, String(params[`${selectedOp}.${p.key}`])));
      const res = await fetch(`${API}${currentOp.endpoint}`, { method:'POST', credentials:'include', body:form });
      if (!res.ok) { const b = await res.json().catch(() => ({ error:'Processing failed' })); throw new Error(b.error || `HTTP ${res.status}`); }
      setProcessedUrl(URL.createObjectURL(await res.blob()));
      setStatus({ type:'success', msg:`${currentOp.label} applied successfully.` });
    } catch (err) {
      setStatus({ type:'error', msg:err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight:'100vh', background:C.bg, color:C.text, fontFamily:"'Inter', system-ui, -apple-system, sans-serif", display:'flex', flexDirection:'column' }}>
      {loading && <ProcessingLoader opLabel={currentOp.label} />}

      {/* ══ DESKTOP TOP NAV — hidden on mobile ══ */}
      <div className="ip-desktop-nav">
        <DesktopTopNav selectedOp={selectedOp} currentGroup={currentGroup} onSelect={handleOpSel} navigate={navigate} />
      </div>

      {/* ══ MOBILE TOP BAR — shown on mobile only ══ */}
      <div className="ip-mobile-topbar" style={{ display:'none', background:C.card, borderBottom:`1px solid ${C.border}`, padding:'12px 16px', alignItems:'center', gap:'10px', position:'sticky', top:0, zIndex:500 }}>
        <button onClick={() => navigate('/')} style={{ background:'none', border:'none', cursor:'pointer', color:C.muted, display:'flex', padding:'4px' }}>
          <ArrowLeft size={16} />
        </button>
        <div style={{ flex:1, minWidth:0 }}>
          <p style={{ margin:0, fontSize:'13px', fontWeight:700, color:C.text }}>OnePic</p>
          <div style={{ display:'flex', alignItems:'center', gap:'6px', marginTop:'2px' }}>
            <span style={{ fontSize:'12px', color:currentGroup?.color }}>{currentOp?.icon}</span>
            <span style={{ fontSize:'12px', color:C.muted, fontWeight:500 }}>{currentOp?.label}</span>
            <PhaseBadge label={currentGroup?.phase} color={currentGroup?.color || C.accent} />
          </div>
        </div>
        <button onClick={() => setDrawerOpen(true)}
          style={{ display:'flex', alignItems:'center', gap:'6px', padding:'8px 12px', borderRadius:'8px',
            border:`1px solid ${C.border}`, background:'transparent', color:C.text, cursor:'pointer', fontSize:'12px', fontWeight:600 }}>
          <Menu size={15} /> Tools
        </button>
      </div>

      {/* Mobile drawer */}
      <ToolDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} selectedOp={selectedOp} onSelect={handleOpSel} />

      {/* ══ MAIN CONTENT ══ */}
      <div style={{ flex:1, maxWidth:'1400px', width:'100%', margin:'0 auto', padding:'20px 24px', display:'flex', flexDirection:'column', gap:'16px' }} className="ip-main">

        {/* Image panels */}
        {!originalUrl
          ? <UploadZone onFile={handleFile} />
          : (
            <div style={{ display:'flex', gap:'12px', flexWrap:'wrap' }}>
              <PreviewCard label="Original" src={originalUrl} />
              <PreviewCard label="Processed" src={processedUrl} isBlob empty="Apply an operation to see the result" />
            </div>
          )
        }

        {/* Desktop: horizontal controls bar */}
        <div className="ip-desktop-controls">
          <DesktopControlsBar
            currentOp={currentOp} selectedOp={selectedOp}
            params={params} setParams={setParams}
            originalFile={originalFile} loading={loading}
            onProcess={handleProcess} onReset={handleReset} status={status}
          />
        </div>

        {/* Mobile: stacked params + button */}
        <div className="ip-mobile-controls" style={{ display:'none' }}>
          <MobileActions
            currentOp={currentOp} selectedOp={selectedOp}
            params={params} setParams={setParams}
            originalFile={originalFile} loading={loading}
            onProcess={handleProcess} onReset={handleReset} status={status}
          />
        </div>

        {/* About */}
        <div style={{ border:`1px solid ${C.border}`, borderRadius:'10px', background:C.card, padding:'13px 16px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'6px' }}>
            <p style={{ margin:0, fontSize:'10px', fontWeight:700, color:C.accentDim, textTransform:'uppercase', letterSpacing:'0.08em' }}>About</p>
            <PhaseBadge label={currentGroup.phase} color={currentGroup.color} />
            <span style={{ fontSize:'13px', fontWeight:600, color:C.text }}>{currentOp.label}</span>
          </div>
          <p style={{ margin:0, fontSize:'13px', color:C.muted, lineHeight:1.7 }}>{currentOp.description}</p>
        </div>
      </div>

      <Footer />

      <style>{`
        @keyframes spin  { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }
        @keyframes pulse { 0%,100% { opacity:.3; transform:scale(.85); } 50% { opacity:1; transform:scale(1.15); } }
        @keyframes fadeInDown { from { opacity:0; transform:translateY(-6px); } to { opacity:1; transform:translateY(0); } }

        /* ── Mobile ≤ 768px ── */
        @media (max-width: 768px) {
          .ip-desktop-nav      { display: none !important; }
          .ip-mobile-topbar    { display: flex !important; }
          .ip-desktop-controls { display: none !important; }
          .ip-mobile-controls  { display: block !important; }
          .ip-main             { padding: 14px 14px !important; }
        }
      `}</style>
    </div>
  );
}
