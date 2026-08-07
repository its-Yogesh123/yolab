import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Upload,
  Image as ImageIcon,
  Sliders,
  ChevronRight,
  Download,
  RefreshCw,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ScanLine,
} from 'lucide-react';
import Navbar from '../shared/Navigation.jsx';
import Footer from '../shared/Footer.jsx';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// ──────────────────────────────────────────────
//  Theme
// ──────────────────────────────────────────────
const C = {
  bg: '#050505',
  card: '#111111',
  border: '#262626',
  borderHover: '#404040',
  text: '#f5f5f5',
  muted: '#a3a3a3',
  accent: '#d4d4d4',
  accentDim: '#737373',
  success: '#4ade80',
  error: '#f87171',
};

// ──────────────────────────────────────────────
//  Loader taglines — cycle while processing
// ──────────────────────────────────────────────
const TAGLINES = [
  'Preparing your image…',
  'Crunching pixels…',
  'Applying the algorithm…',
  'Tuning the result…',
  'Almost there…',
  'Running through OnePic…',
  'Polishing every edge…',
  'Smoothing things out…',
  'Your image is in good hands…',
  'Finalizing the magic…',
];

// ──────────────────────────────────────────────
//  Operations config
// ──────────────────────────────────────────────
const PHASE_GROUPS = [
  {
    phase: 'Phase 1',
    label: 'Image Enhancement',
    color: '#d4d4d4',
    ops: [
      {
        id: 'gaussian',
        label: 'Gaussian Blur',
        endpoint: '/api/image/gaussian',
        description: 'Smooth an image by averaging neighbouring pixels with a Gaussian kernel. Great for noise reduction and depth-of-field effects.',
        icon: '◉',
        params: [
          { key: 'radius', label: 'Blur Radius (σ)', type: 'range', min: 0.1, max: 20, step: 0.1, default: 2, unit: 'px' },
        ],
      },
      {
        id: 'median',
        label: 'Median Filter',
        endpoint: '/api/image/median',
        description: 'Replace each pixel with the median of its neighbours. Excellent for removing salt-and-pepper noise while preserving sharp edges.',
        icon: '◈',
        params: [
          { key: 'size', label: 'Kernel Size', type: 'select', options: [3, 5, 7, 9, 11, 15, 21], default: 3, unit: 'px' },
        ],
      },
      {
        id: 'sharpen',
        label: 'Sharpening',
        endpoint: '/api/image/sharpen',
        description: 'Enhance fine details and edges by boosting high-frequency components. Makes blurry images crisper and more defined.',
        icon: '◇',
        params: [
          { key: 'factor', label: 'Sharpness Factor', type: 'range', min: 0, max: 10, step: 0.1, default: 2, unit: 'x' },
        ],
      },
      {
        id: 'histogram-eq',
        label: 'Histogram Equalization',
        endpoint: '/api/image/histogram-eq',
        description: 'Redistribute pixel intensities to enhance global contrast. Particularly effective on images that appear washed-out or underexposed.',
        icon: '◆',
        params: [],
      },
    ],
  },
  {
    phase: 'Phase 2',
    label: 'Edge Detection',
    color: '#a78bfa',
    ops: [
      {
        id: 'sobel',
        label: 'Sobel',
        endpoint: '/api/image/sobel',
        description: 'Detects edges by computing horizontal and vertical intensity gradients. Produces smooth, weighted edges using a 3×3 kernel.',
        icon: '⬡',
        params: [],
      },
      {
        id: 'prewitt',
        label: 'Prewitt',
        endpoint: '/api/image/prewitt',
        description: 'Similar to Sobel but uses equal weighting across the kernel. Slightly faster, good for detecting simple directional edges.',
        icon: '⬢',
        params: [],
      },
      {
        id: 'laplacian',
        label: 'Laplacian',
        endpoint: '/api/image/laplacian',
        description: 'Uses second-order derivatives to find regions of rapid intensity change. Detects both positive and negative edges simultaneously.',
        icon: '◻',
        params: [
          { key: 'connectivity', label: 'Connectivity', type: 'select', options: [4, 8], default: 8, unit: '' },
        ],
      },
      {
        id: 'canny',
        label: 'Canny',
        endpoint: '/api/image/canny',
        description: 'Multi-stage detector: Gaussian smoothing → gradient computation → non-max suppression → hysteresis. Produces thin, accurate edges.',
        icon: '◎',
        params: [
          { key: 'sigma', label: 'Gaussian σ', type: 'range', min: 0.5, max: 5, step: 0.1, default: 1.4, unit: '' },
          { key: 'low_threshold', label: 'Low Threshold', type: 'range', min: 0.01, max: 0.5, step: 0.01, default: 0.05, unit: '' },
          { key: 'high_threshold', label: 'High Threshold', type: 'range', min: 0.05, max: 0.9, step: 0.01, default: 0.15, unit: '' },
        ],
      },
    ],
  },
];

const ALL_OPS = PHASE_GROUPS.flatMap((g) => g.ops);

// ──────────────────────────────────────────────
//  Tiny sub-components
// ──────────────────────────────────────────────
const PhaseBadge = ({ label, color }) => (
  <span style={{
    display: 'inline-flex', alignItems: 'center',
    padding: '2px 8px', borderRadius: '9999px',
    border: `1px solid ${color}44`, background: `${color}11`,
    fontSize: '10px', fontWeight: 700, color,
    letterSpacing: '0.06em', textTransform: 'uppercase',
  }}>
    {label}
  </span>
);

const Badge = ({ children, color = C.muted }) => (
  <span style={{
    display: 'inline-flex', alignItems: 'center', padding: '2px 10px',
    borderRadius: '9999px', border: `1px solid ${C.border}`,
    background: C.card, fontSize: '11px', fontWeight: 600, color,
    letterSpacing: '0.05em', textTransform: 'uppercase',
  }}>
    {children}
  </span>
);

const Btn = ({ children, onClick, disabled, variant = 'primary', style = {} }) => {
  const base = {
    display: 'inline-flex', alignItems: 'center', gap: '8px',
    padding: '10px 20px', borderRadius: '8px', fontWeight: 600,
    fontSize: '14px', cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1, transition: 'all 0.2s ease', border: 'none', outline: 'none',
  };
  const variants = {
    primary: { background: C.accent, color: '#050505' },
    outline: { background: 'transparent', border: `1px solid ${C.border}`, color: C.text },
    ghost: { background: C.card, color: C.muted, border: `1px solid ${C.border}` },
  };
  return (
    <button onClick={onClick} disabled={disabled} style={{ ...base, ...variants[variant], ...style }}>
      {children}
    </button>
  );
};

// ──────────────────────────────────────────────
//  Processing Loader Overlay
// ──────────────────────────────────────────────
const ProcessingLoader = ({ opLabel }) => {
  const [taglineIdx, setTaglineIdx] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setTaglineIdx((i) => (i + 1) % TAGLINES.length);
        setFade(true);
      }, 300);
    }, 2200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(5,5,5,0.92)',
      backdropFilter: 'blur(12px)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: '28px',
    }}>
      {/* Animated ring */}
      <div style={{ position: 'relative', width: '88px', height: '88px' }}>
        <div style={{
          position: 'absolute', inset: 0, borderRadius: '50%',
          border: '2px solid #262626',
        }} />
        <div style={{
          position: 'absolute', inset: 0, borderRadius: '50%',
          border: '2px solid transparent',
          borderTopColor: C.accent,
          animation: 'spin 0.9s linear infinite',
        }} />
        <div style={{
          position: 'absolute', inset: '16px', borderRadius: '50%',
          border: '1px solid transparent',
          borderTopColor: '#737373',
          animation: 'spin 1.4s linear infinite reverse',
        }} />
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Sparkles size={22} color={C.accent} strokeWidth={1.5} />
        </div>
      </div>

      {/* Op label */}
      <div style={{ textAlign: 'center' }}>
        <p style={{
          margin: '0 0 10px',
          fontSize: '18px', fontWeight: 700, color: C.text,
          letterSpacing: '-0.01em',
        }}>
          Applying {opLabel}
        </p>
        {/* Cycling tagline */}
        <p style={{
          margin: 0, fontSize: '14px', color: C.muted,
          transition: 'opacity 0.3s ease',
          opacity: fade ? 1 : 0,
          minHeight: '20px',
        }}>
          {TAGLINES[taglineIdx]}
        </p>
      </div>

      {/* Animated dots */}
      <div style={{ display: 'flex', gap: '8px' }}>
        {[0, 1, 2].map((i) => (
          <div key={i} style={{
            width: '6px', height: '6px', borderRadius: '50%',
            background: C.accentDim,
            animation: `pulse 1.4s ease-in-out ${i * 0.2}s infinite`,
          }} />
        ))}
      </div>
    </div>
  );
};

// ──────────────────────────────────────────────
//  Upload Zone
// ──────────────────────────────────────────────
const UploadZone = ({ onFile }) => {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef();

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) onFile(f);
  }, [onFile]);

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current.click()}
      className="ip-upload-zone"
      style={{
        border: `2px dashed ${dragging ? C.accent : C.border}`,
        borderRadius: '12px',
        background: dragging ? 'rgba(212,212,212,0.04)' : C.card,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '60px 24px', cursor: 'pointer',
        transition: 'all 0.25s ease', minHeight: '280px',
      }}
    >
      <input
        ref={inputRef} type="file"
        accept="image/jpeg,image/png,image/webp,image/bmp"
        style={{ display: 'none' }}
        onChange={(e) => e.target.files[0] && onFile(e.target.files[0])}
      />
      <Upload size={40} color={dragging ? C.accent : C.accentDim} strokeWidth={1.5} />
      <p style={{ margin: '16px 0 6px', color: C.text, fontWeight: 600, fontSize: '16px' }}>
        Drop an image here
      </p>
      <p style={{ margin: 0, color: C.muted, fontSize: '13px' }}>
        or <span style={{ color: C.accent, textDecoration: 'underline' }}>browse files</span>
      </p>
      <p style={{ margin: '12px 0 0', color: C.accentDim, fontSize: '12px' }}>
        JPEG · PNG · WebP · BMP — up to 20 MB
      </p>
    </div>
  );
};

// ──────────────────────────────────────────────
//  Image Preview Card
// ──────────────────────────────────────────────
const PreviewCard = ({ label, src, isBlob, empty }) => (
  <div style={{
    borderRadius: '10px', border: `1px solid ${C.border}`,
    background: C.card, overflow: 'hidden', flex: 1, minWidth: 0,
  }}>
    <div style={{
      padding: '10px 16px', borderBottom: `1px solid ${C.border}`,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    }}>
      <span style={{ fontSize: '12px', fontWeight: 600, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        {label}
      </span>
      {src && (
        <a href={src} download={isBlob ? 'processed.jpg' : undefined}
          style={{ color: C.muted, display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', textDecoration: 'none' }}>
          <Download size={13} /> Save
        </a>
      )}
    </div>
    <div style={{
    minHeight: '300px', display: 'flex', alignItems: 'center',
    justifyContent: 'center', background: '#0a0a0a',
  }} className="ip-preview-card-body">
      {src ? (
        <img src={src} alt={label} style={{ maxWidth: '100%', maxHeight: '420px', objectFit: 'contain', display: 'block' }} />
      ) : (
        <div style={{ textAlign: 'center', color: C.accentDim }}>
          <ImageIcon size={36} strokeWidth={1} />
          <p style={{ marginTop: '10px', fontSize: '13px' }}>{empty || 'No image yet'}</p>
        </div>
      )}
    </div>
  </div>
);

// ──────────────────────────────────────────────
//  Operation Card
// ──────────────────────────────────────────────
const OperationCard = ({ op, phaseColor, selected, onSelect }) => (
  <button
    onClick={() => onSelect(op.id)}
    style={{
      background: selected ? 'rgba(212,212,212,0.06)' : 'transparent',
      border: `1px solid ${selected ? C.accentDim : C.border}`,
      borderRadius: '8px', padding: '11px 14px',
      cursor: 'pointer', textAlign: 'left', width: '100%',
      transition: 'all 0.18s ease',
      display: 'flex', alignItems: 'center', gap: '12px',
    }}
  >
    <span style={{ fontSize: '16px', color: selected ? phaseColor : C.accentDim, flexShrink: 0 }}>
      {op.icon}
    </span>
    <span style={{ fontWeight: 600, fontSize: '13px', color: selected ? C.text : C.muted, flex: 1 }}>
      {op.label}
    </span>
    {selected && <ChevronRight size={14} color={C.accentDim} />}
  </button>
);

// ──────────────────────────────────────────────
//  Param Controls
// ──────────────────────────────────────────────
const ParamControl = ({ param, value, onChange }) => {
  if (param.type === 'range') {
    const decimals = param.step < 1 ? (param.step < 0.1 ? 2 : 1) : 0;
    return (
      <div style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <label style={{ fontSize: '12px', color: C.muted, fontWeight: 500 }}>{param.label}</label>
          <span style={{ fontSize: '12px', color: C.accent, fontWeight: 700, fontFamily: 'monospace' }}>
            {Number(value).toFixed(decimals)}{param.unit}
          </span>
        </div>
        <input
          type="range" min={param.min} max={param.max} step={param.step} value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          style={{ width: '100%', accentColor: C.accent, cursor: 'pointer' }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '3px' }}>
          <span style={{ fontSize: '10px', color: C.accentDim }}>{param.min}{param.unit}</span>
          <span style={{ fontSize: '10px', color: C.accentDim }}>{param.max}{param.unit}</span>
        </div>
      </div>
    );
  }

  if (param.type === 'select') {
    return (
      <div style={{ marginBottom: '16px' }}>
        <label style={{ fontSize: '12px', color: C.muted, fontWeight: 500, display: 'block', marginBottom: '8px' }}>
          {param.label}
        </label>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {param.options.map((opt) => (
            <button key={opt} onClick={() => onChange(opt)} style={{
              padding: '5px 12px', borderRadius: '6px',
              border: `1px solid ${value === opt ? C.accent : C.border}`,
              background: value === opt ? 'rgba(212,212,212,0.12)' : 'transparent',
              color: value === opt ? C.accent : C.muted,
              fontSize: '12px', fontWeight: 700, cursor: 'pointer',
              transition: 'all 0.15s', fontFamily: 'monospace',
            }}>
              {param.unit ? `${opt}×${opt}` : opt}
            </button>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

// ──────────────────────────────────────────────
//  Main Page
// ──────────────────────────────────────────────
export default function ImageProcessingPage() {
  const navigate = useNavigate();

  const [originalFile, setOriginalFile] = useState(null);
  const [originalUrl, setOriginalUrl] = useState(null);
  const [processedUrl, setProcessedUrl] = useState(null);
  const [selectedOp, setSelectedOp] = useState(PHASE_GROUPS[0].ops[0].id);
  const [params, setParams] = useState(() => {
    const init = {};
    ALL_OPS.forEach((op) => op.params.forEach((p) => { init[`${op.id}.${p.key}`] = p.default; }));
    return init;
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);

  const currentOp = ALL_OPS.find((o) => o.id === selectedOp);
  const currentGroup = PHASE_GROUPS.find((g) => g.ops.some((o) => o.id === selectedOp));

  const handleFile = (file) => {
    setOriginalFile(file);
    setOriginalUrl(URL.createObjectURL(file));
    setProcessedUrl(null);
    setStatus(null);
  };

  const handleReset = () => {
    setOriginalFile(null);
    setOriginalUrl(null);
    setProcessedUrl(null);
    setStatus(null);
  };

  const handleProcess = async () => {
    if (!originalFile) return;
    setLoading(true);
    setStatus(null);
    setProcessedUrl(null);

    try {
      const form = new FormData();
      form.append('file', originalFile);
      currentOp.params.forEach((p) => {
        form.append(p.key, String(params[`${selectedOp}.${p.key}`]));
      });

      const res = await fetch(`${API}${currentOp.endpoint}`, {
        method: 'POST', credentials: 'include', body: form,
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({ error: 'Processing failed' }));
        throw new Error(body.error || `HTTP ${res.status}`);
      }

      const blob = await res.blob();
      setProcessedUrl(URL.createObjectURL(blob));
      setStatus({ type: 'success', msg: `${currentOp.label} applied successfully.` });
    } catch (err) {
      setStatus({ type: 'error', msg: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: C.bg, color: C.text, fontFamily: 'system-ui, sans-serif' }}>

      {/* Processing overlay */}
      {loading && <ProcessingLoader opLabel={currentOp.label} />}

      <Navbar />

      {/* Page header */}
      <div style={{ borderBottom: `1px solid ${C.border}`, background: C.card }}>
        <div className="ip-header-pad" style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px 24px' }}>
          <button
            onClick={() => navigate('/')}
            style={{ background: 'none', border: 'none', color: C.muted, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', padding: 0, marginBottom: '16px' }}
          >
            <ArrowLeft size={14} /> Back to Services
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <div className="ip-header-icon" style={{
              width: '44px', height: '44px', borderRadius: '10px',
              border: `1px solid ${C.border}`, background: '#0a0a0a',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <Sparkles size={20} color={C.accent} strokeWidth={1.5} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <h1 className="ip-header-title" style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: C.text }}>
                  OnePic — Image Processing
                </h1>
                <Badge>Phase 1 &amp; 2</Badge>
              </div>
              <p className="ip-header-subtitle" style={{ margin: '3px 0 0', fontSize: '13px', color: C.muted }}>
                Enhancement and edge detection — powered by the OnePic microservice.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="ip-main-pad" style={{ maxWidth: '1280px', margin: '0 auto', padding: '28px 24px' }}>
        <div
          className="ip-grid"
          style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '20px', alignItems: 'start' }}
        >

          {/* ── LEFT SIDEBAR — sticky + internally scrollable ── */}
          <div style={{
            position: 'sticky',
            top: '16px',
            maxHeight: 'calc(100vh - 32px)',
            overflowY: 'auto',
            overflowX: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            paddingRight: '4px',
            scrollbarWidth: 'thin',
            scrollbarColor: '#2a2a2a transparent',
          }} className="ip-sidebar">

            {PHASE_GROUPS.map((group) => (
              <div key={group.phase}>
                {/* Group header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', marginTop: '8px' }}>
                  <PhaseBadge label={group.phase} color={group.color} />
                  <span style={{ fontSize: '11px', color: C.accentDim, fontWeight: 600 }}>{group.label}</span>
                </div>

                {/* Op cards */}
                <div className="ip-ops-grid" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {group.ops.map((op) => (
                    <OperationCard
                      key={op.id} op={op}
                      phaseColor={group.color}
                      selected={selectedOp === op.id}
                      onSelect={(id) => { setSelectedOp(id); setProcessedUrl(null); setStatus(null); }}
                    />
                  ))}
                </div>
              </div>
            ))}

            {/* Params panel */}
            {currentOp.params.length > 0 && (
              <div className="ip-params" style={{
                marginTop: '8px', border: `1px solid ${C.border}`,
                borderRadius: '10px', background: C.card, padding: '14px',
              }}>
                <p style={{ margin: '0 0 14px', fontSize: '10px', fontWeight: 700, color: C.accentDim, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  <Sliders size={11} style={{ display: 'inline', marginRight: '5px' }} />
                  Parameters
                </p>
                {currentOp.params.map((p) => (
                  <ParamControl
                    key={p.key} param={p}
                    value={params[`${selectedOp}.${p.key}`]}
                    onChange={(v) => setParams((prev) => ({ ...prev, [`${selectedOp}.${p.key}`]: v }))}
                  />
                ))}
              </div>
            )}

            {/* Action buttons */}
            <div className="ip-action-row" style={{ display: 'flex', flexDirection: 'column', gap: '7px', marginTop: '4px' }}>
              <Btn
                onClick={handleProcess}
                disabled={!originalFile || loading}
                style={{ justifyContent: 'center', width: '100%' }}
              >
                <Sparkles size={15} />
                Apply {currentOp.label}
              </Btn>
              {originalFile && (
                <Btn variant="ghost" onClick={handleReset} style={{ justifyContent: 'center', width: '100%' }}>
                  <RefreshCw size={13} /> Reset
                </Btn>
              )}
            </div>

            {/* Status */}
            {status && (
              <div style={{
                display: 'flex', alignItems: 'flex-start', gap: '8px',
                padding: '11px 13px', borderRadius: '8px',
                border: `1px solid ${status.type === 'success' ? 'rgba(74,222,128,0.3)' : 'rgba(248,113,113,0.3)'}`,
                background: status.type === 'success' ? 'rgba(74,222,128,0.05)' : 'rgba(248,113,113,0.05)',
                fontSize: '13px',
                color: status.type === 'success' ? C.success : C.error,
              }}>
                {status.type === 'success'
                  ? <CheckCircle2 size={14} style={{ flexShrink: 0, marginTop: '2px' }} />
                  : <AlertCircle size={14} style={{ flexShrink: 0, marginTop: '2px' }} />}
                {status.msg}
              </div>
            )}
          </div>

          {/* ── RIGHT: Upload + Preview + About — also sticky so image stays in view ── */}
          <div style={{
            position: 'sticky',
            top: '16px',
            maxHeight: 'calc(100vh - 32px)',
            overflowY: 'auto',
            overflowX: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            minWidth: 0,
            scrollbarWidth: 'thin',
            scrollbarColor: '#2a2a2a transparent',
          }} className="ip-right">

            {/* Upload zone or previews */}
            {!originalUrl ? (
              <UploadZone onFile={handleFile} />
            ) : (
              <div className="ip-preview-row" style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                <PreviewCard label="Original" src={originalUrl} />
                <PreviewCard label="Processed" src={processedUrl} isBlob empty="Apply an operation to see the result" />
              </div>
            )}

            {/* About this operation */}
            <div style={{
              border: `1px solid ${C.border}`, borderRadius: '10px',
              background: C.card, padding: '16px 18px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <p style={{ margin: 0, fontSize: '10px', fontWeight: 700, color: C.accentDim, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  About this operation
                </p>
                <PhaseBadge label={currentGroup.phase} color={currentGroup.color} />
              </div>
              <p className="ip-about-text" style={{ margin: 0, fontSize: '14px', color: C.muted, lineHeight: 1.7 }}>
                {currentOp.description}
              </p>
              {currentOp.params.length === 0 && (
                <p style={{ margin: '8px 0 0', fontSize: '12px', color: C.accentDim }}>
                  No adjustable parameters — just upload and apply.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Global keyframes + responsive styles */}
      <style>{`
        @keyframes spin  { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: scale(0.85); }
          50%       { opacity: 1;   transform: scale(1.15); }
        }

        /* ── Scrollbar ── */
        .ip-sidebar::-webkit-scrollbar,
        .ip-right::-webkit-scrollbar { width: 4px; }
        .ip-sidebar::-webkit-scrollbar-track,
        .ip-right::-webkit-scrollbar-track { background: transparent; }
        .ip-sidebar::-webkit-scrollbar-thumb,
        .ip-right::-webkit-scrollbar-thumb { background: #2a2a2a; border-radius: 999px; }
        .ip-sidebar::-webkit-scrollbar-thumb:hover,
        .ip-right::-webkit-scrollbar-thumb:hover { background: #404040; }

        /* ════════════════════════════════════════
           ≤ 768px  — tablet / large phone
        ════════════════════════════════════════ */
        @media (max-width: 768px) {

          .ip-header-pad { padding: 16px !important; }
          .ip-main-pad   { padding: 16px 12px !important; }

          /* Single column */
          .ip-grid {
            grid-template-columns: 1fr !important;
            gap: 12px !important;
          }

          /* Unstick panels */
          .ip-sidebar,
          .ip-right {
            position: static !important;
            max-height: none !important;
            overflow-y: visible !important;
            overflow-x: visible !important;
          }

          /* Ops → horizontal scroll strip */
          .ip-ops-grid {
            display: flex !important;
            flex-direction: row !important;
            overflow-x: auto !important;
            gap: 6px !important;
            padding-bottom: 6px;
            scrollbar-width: none;
          }
          .ip-ops-grid::-webkit-scrollbar { display: none; }
          .ip-ops-grid > button {
            flex-shrink: 0 !important;
            min-width: 130px !important;
          }

          /* Preview cards stack vertically */
          .ip-preview-row { flex-direction: column !important; }

          /* Upload zone — reduced */
          .ip-upload-zone {
            min-height: 180px !important;
            padding: 32px 16px !important;
          }
        }

        /* ════════════════════════════════════════
           ≤ 480px  — small phone
        ════════════════════════════════════════ */
        @media (max-width: 480px) {

          /* Even tighter page padding */
          .ip-header-pad { padding: 12px !important; }
          .ip-main-pad   { padding: 12px 10px !important; }

          /* Shrink the page header icon + text */
          .ip-header-icon {
            width: 36px !important;
            height: 36px !important;
          }
          .ip-header-title {
            font-size: 16px !important;
          }
          .ip-header-subtitle {
            font-size: 12px !important;
          }

          /* Op buttons: compact pill — icon + label, min-width 110 */
          .ip-ops-grid > button {
            min-width: 110px !important;
            padding: 8px 10px !important;
            font-size: 12px !important;
            gap: 8px !important;
          }

          /* Params panel — full-width range input, bigger tap target */
          .ip-params input[type=range] {
            height: 28px !important;
          }
          .ip-params input[type=range]::-webkit-slider-thumb {
            width: 20px !important;
            height: 20px !important;
          }
          .ip-params > button {
            padding: 8px 14px !important;
            font-size: 12px !important;
          }

          /* Action buttons: side-by-side on very small screens */
          .ip-action-row {
            flex-direction: row !important;
            gap: 8px !important;
          }
          .ip-action-row > button {
            flex: 1 !important;
            font-size: 12px !important;
            padding: 10px 8px !important;
          }

          /* Upload zone — compact */
          .ip-upload-zone {
            min-height: 140px !important;
            padding: 24px 12px !important;
          }
          .ip-upload-zone p { font-size: 13px !important; }

          /* Preview min height — smaller */
          .ip-preview-card-body {
            min-height: 200px !important;
          }

          /* About section — smaller font */
          .ip-about-text { font-size: 13px !important; }
        }

        /* ════════════════════════════════════════
           ≤ 360px  — very small (Galaxy A series etc.)
        ════════════════════════════════════════ */
        @media (max-width: 360px) {

          .ip-header-pad { padding: 10px !important; }
          .ip-main-pad   { padding: 10px 8px !important; }

          .ip-ops-grid > button {
            min-width: 96px !important;
            font-size: 11px !important;
            padding: 7px 8px !important;
          }

          .ip-action-row > button {
            font-size: 11px !important;
            padding: 8px 6px !important;
          }

          .ip-upload-zone {
            min-height: 120px !important;
            padding: 20px 8px !important;
          }
        }
      `}</style>

      <Footer />
    </div>
  );
}
