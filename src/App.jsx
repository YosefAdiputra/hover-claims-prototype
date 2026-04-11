import { useState, useMemo } from 'react';
import {
  Search, ChevronRight, ChevronDown, Camera, Box, Ruler, FileText,
  CheckCircle2, AlertTriangle, Sparkles, ArrowRight, ArrowLeft,
  Edit3, Check, X, Shield, Home, Layers, MapPin, Calendar, User,
  Zap, Eye, MoreHorizontal, Send, Clock, FileCheck, Maximize2, Info,
  Hexagon, Activity, TrendingUp, Building2, CloudHail, Wind, Droplets
} from 'lucide-react';

// ============ MOCK DATA ============
const CLAIM = {
  id: 'CLM-2026-04812',
  policyholder: 'Sarah Henderson',
  address: '4421 Oak Ridge Drive',
  city: 'Henderson, NV 89052',
  carrier: 'Summit Mutual Insurance',
  policyNumber: 'SM-88241-HO3',
  lossType: 'Hail',
  lossDate: 'April 2, 2026',
  inspectionDate: 'April 6, 2026',
  deductible: 2500,
  yearBuilt: 2008,
  roofMaterial: 'Laminated Asphalt',
  squareFootage: 2840,
  inspector: 'Marcus Reyes',
  photoCount: 84,
  measurementCount: 23,
  checklistComplete: 100,
};

const INITIAL_LINE_ITEMS = [
  // ROOF
  { id: 1, category: 'Roof', code: 'RFG 240', description: 'Remove laminated comp. shingle roofing — w/ felt', qty: 24.5, unit: 'SQ', unitPrice: 72.40, confidence: 96, status: 'pending',
    evidence: ['North slope — hail impact overview', 'North slope — strike density detail', 'East slope — impact pattern', 'East slope — granule loss close-up', 'Ridge line — bruising detail', 'Southeast corner — damage extent'],
    explanation: 'Recommended removal of existing shingles on north and east slopes based on 6 photos showing hail bruising at >8 strikes per 100 sq ft, which exceeds Summit Mutual\'s repair-vs-replace threshold. 3D model measurements confirm 24.5 squares of affected area.',
    comparables: 12, inspectorNote: 'Severe granule loss across north and east slopes. Multiple hail bruises visible on ridge.' },
  { id: 2, category: 'Roof', code: 'RFG 220', description: 'Laminated comp. shingle roofing — w/ felt', qty: 24.5, unit: 'SQ', unitPrice: 385.15, confidence: 96, status: 'pending',
    evidence: ['North slope — replacement area', 'East slope — replacement area', 'Material spec reference', '3D measurement overlay'],
    explanation: 'Replacement quantity matched to removal scope. Material grade (30-year architectural) selected to match existing based on inspector note and Summit Mutual\'s like-kind-and-quality guideline.',
    comparables: 12, inspectorNote: 'Existing material: 30-year architectural laminated.' },
  { id: 3, category: 'Roof', code: 'RFG DRIP', description: 'R&R Drip edge', qty: 142, unit: 'LF', unitPrice: 4.12, confidence: 93, status: 'pending',
    evidence: ['Eave line north', 'Eave line east', 'Rake edge detail'],
    explanation: 'Drip edge replacement required when shingles are removed per carrier guideline. Linear footage calculated from 3D model perimeter of affected slopes.',
    comparables: 18, inspectorNote: 'Drip edge bent at multiple points along north eave.' },
  { id: 4, category: 'Roof', code: 'RFG IWS', description: 'Ice & water shield', qty: 320, unit: 'SF', unitPrice: 2.18, confidence: 91, status: 'pending',
    evidence: ['Eave detail — existing underlayment', '3D eave measurement'],
    explanation: 'Required at eaves per IRC code for this climate zone. Quantity based on 3 ft from eave edge across affected slope length.',
    comparables: 15, inspectorNote: '' },
  { id: 5, category: 'Roof', code: 'RFG RIDGE', description: 'R&R Ridge cap — composition shingles', qty: 52, unit: 'LF', unitPrice: 8.96, confidence: 94, status: 'pending',
    evidence: ['Ridge line full view', 'Ridge cap damage detail'],
    explanation: 'Ridge cap replacement required with full shingle replacement. Linear footage matches 3D model ridge measurement.',
    comparables: 12, inspectorNote: 'Ridge cap showing significant hail bruising.' },
  { id: 6, category: 'Roof', code: 'RFG FLASH', description: 'R&R Flashing — pipe jack', qty: 3, unit: 'EA', unitPrice: 48.30, confidence: 89, status: 'pending',
    evidence: ['Pipe jack 1 — north slope', 'Pipe jack 2 — rear', 'Pipe jack 3 — east'],
    explanation: '3 pipe jacks identified in inspection photos on affected slopes. Standard practice to replace during full re-roof.',
    comparables: 20, inspectorNote: '' },
  { id: 7, category: 'Roof', code: 'RFG FELT', description: 'Roofing felt — 15 lb', qty: 24.5, unit: 'SQ', unitPrice: 34.20, confidence: 95, status: 'pending',
    evidence: ['Underlayment reference'],
    explanation: 'Felt underlayment quantity matches shingle replacement area.',
    comparables: 22, inspectorNote: '' },

  // GUTTERS
  { id: 8, category: 'Gutters', code: 'GUT 5IN', description: 'R&R Gutter — aluminum, 5"', qty: null, unit: 'LF', unitPrice: 9.85, confidence: 58, status: 'needs_review',
    evidence: ['Gutter north — possible damage', 'Gutter east — possible damage'],
    explanation: 'AI detected possible hail damage in 2 photos but could not determine extent. Inspector\'s checklist did not include gutter measurements.',
    comparables: 8, inspectorNote: '' },
  { id: 9, category: 'Gutters', code: 'GUT DS', description: 'R&R Downspout — aluminum', qty: 24, unit: 'LF', unitPrice: 8.40, confidence: 87, status: 'pending',
    evidence: ['Downspout north', 'Downspout east'],
    explanation: 'Two downspouts visible with dent damage consistent with hail impact.',
    comparables: 14, inspectorNote: 'Dents visible on both north-facing downspouts.' },

  // FASCIA
  { id: 10, category: 'Fascia', code: 'FCA 1X6', description: 'R&R Fascia board — 1"x6"', qty: 36, unit: 'LF', unitPrice: 6.80, confidence: 74, status: 'pending',
    evidence: ['Fascia damage north', 'Fascia damage east'],
    explanation: 'Partial fascia damage identified on north eave. Quantity estimated from visible damage zone in photos; measurement not captured by inspector.',
    comparables: 6, inspectorNote: '' },
  { id: 11, category: 'Fascia', code: 'PNT FCA', description: 'Paint fascia — 1 coat', qty: 36, unit: 'LF', unitPrice: 2.10, confidence: 74, status: 'pending',
    evidence: ['Fascia reference'],
    explanation: 'Paint applied to match fascia replacement quantity.',
    comparables: 6, inspectorNote: '' },

  // SIDING
  { id: 12, category: 'Siding', code: 'SDG VNL', description: 'R&R Siding — vinyl, detached', qty: 48, unit: 'SF', unitPrice: 6.25, confidence: 81, status: 'pending',
    evidence: ['North elevation — siding', 'East elevation — impact'],
    explanation: 'Localized siding damage on north elevation from hail impact. 4 damaged panels identified across ~48 SF.',
    comparables: 9, inspectorNote: 'Cracking visible on lower north elevation panels.' },
  { id: 13, category: 'Siding', code: 'PNT EXT', description: 'Paint exterior — spot repair', qty: 48, unit: 'SF', unitPrice: 1.85, confidence: 81, status: 'pending',
    evidence: ['Siding reference'],
    explanation: 'Spot paint matched to siding replacement area.',
    comparables: 9, inspectorNote: '' },
];

const DASHBOARD_CLAIMS = [
  { id: 'CLM-2026-04812', address: '4421 Oak Ridge Dr', city: 'Henderson, NV', loss: 'Hail', date: 'Apr 6', status: 'draft_ready', confidence: 94, total: 18420, clickable: true,
    image: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400&h=300&fit=crop' },
  { id: 'CLM-2026-04807', address: '892 Desert Willow Ln', city: 'Las Vegas, NV', loss: 'Wind', date: 'Apr 6', status: 'draft_ready', confidence: 91, total: 12840,
    image: 'https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?w=400&h=300&fit=crop' },
  { id: 'CLM-2026-04803', address: '15 Summit Ridge Ct', city: 'Reno, NV', loss: 'Hail', date: 'Apr 5', status: 'needs_review', confidence: 72, total: 24100,
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&h=300&fit=crop' },
  { id: 'CLM-2026-04801', address: '2204 Canyon View Dr', city: 'Sparks, NV', loss: 'Water', date: 'Apr 5', status: 'processing', confidence: null, total: null,
    image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=300&fit=crop' },
  { id: 'CLM-2026-04795', address: '778 Juniper Hill Rd', city: 'Carson City, NV', loss: 'Hail', date: 'Apr 4', status: 'draft_ready', confidence: 97, total: 8420,
    image: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=400&h=300&fit=crop' },
  { id: 'CLM-2026-04790', address: '3301 Red Rock Blvd', city: 'Henderson, NV', loss: 'Wind', date: 'Apr 4', status: 'manual', confidence: null, total: null,
    image: 'https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=400&h=300&fit=crop' },
];

// ============ HELPERS ============
const fmt = (n) => n == null ? '—' : `$${n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
const fmtDetail = (n) => `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const CONFIDENCE_COLORS = {
  high: { dot: 'bg-emerald-500', text: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200', ring: 'ring-emerald-500/20' },
  med:  { dot: 'bg-amber-500',   text: 'text-amber-700',   bg: 'bg-amber-50',   border: 'border-amber-200',   ring: 'ring-amber-500/20' },
  low:  { dot: 'bg-rose-500',    text: 'text-rose-700',    bg: 'bg-rose-50',    border: 'border-rose-200',    ring: 'ring-rose-500/20' },
};
const confBand = (c) => c == null ? 'low' : c >= 90 ? 'high' : c >= 75 ? 'med' : 'low';

const LossTypeBadge = ({ lossType }) => {
  const configs = {
    Hail: {
      icon: CloudHail,
      styles: 'bg-amber-50 text-amber-700 border-amber-200'
    },
    Wind: {
      icon: Wind,
      styles: 'bg-sky-50 text-sky-700 border-sky-200'
    },
    Water: {
      icon: Droplets,
      styles: 'bg-blue-50 text-blue-700 border-blue-200'
    },
  };

  const config = configs[lossType] || {
    icon: AlertTriangle,
    styles: 'bg-stone-50 text-stone-700 border-stone-200'
  };

  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium border ${config.styles}`}>
      <Icon className="w-2.5 h-2.5" />
      {lossType}
    </span>
  );
};

// ============ MAIN COMPONENT ============
export default function HoverClaimsPrototype() {
  const [screen, setScreen] = useState('dashboard');
  const [lineItems, setLineItems] = useState(INITIAL_LINE_ITEMS);
  const [selectedItemId, setSelectedItemId] = useState(1);
  const [editingItem, setEditingItem] = useState(null);
  const [evidenceTab, setEvidenceTab] = useState('photos');
  const [expandedPhoto, setExpandedPhoto] = useState(null);
  const [attested, setAttested] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [showGame, setShowGame] = useState(false);

  const selectedItem = lineItems.find(i => i.id === selectedItemId);
  const totals = useMemo(() => {
    const valid = lineItems.filter(i => i.qty != null && i.status !== 'rejected');
    const subtotal = valid.reduce((s, i) => s + i.qty * i.unitPrice, 0);
    const oAndP = subtotal * 0.20;
    const tax = subtotal * 0.0825;
    const total = subtotal + oAndP + tax;
    const approved = lineItems.filter(i => i.status === 'approved').length;
    const needsReview = lineItems.filter(i => i.status === 'needs_review').length;
    const edits = lineItems.filter(i => i.edited).length;
    return { subtotal, oAndP, tax, total, approved, needsReview, edits, count: lineItems.length };
  }, [lineItems]);

  const handleApproveLineItem = (id) => {
    setLineItems(items => items.map(i => i.id === id ? { ...i, status: 'approved' } : i));
  };
  const handleSaveEdit = (id, updates) => {
    setLineItems(items => items.map(i => i.id === id ? { ...i, ...updates, edited: true, status: 'approved' } : i));
    setEditingItem(null);
  };
  const handleResolveException = (id, resolution) => {
    if (resolution === 'manual') {
      setEditingItem(lineItems.find(i => i.id === id));
    } else if (resolution === 'remove') {
      setLineItems(items => items.map(i => i.id === id ? { ...i, status: 'rejected' } : i));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 antialiased">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500&display=swap');
        .font-display { font-family: 'Inter', ui-sans-serif, system-ui, sans-serif; font-weight: 700; letter-spacing: -0.02em; }
        .font-sans-ui { font-family: 'Inter', ui-sans-serif, system-ui, sans-serif; }
        .font-mono-ui { font-family: 'JetBrains Mono', ui-monospace, monospace; }
        html, body, #root {
          font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Inter', ui-sans-serif, system-ui, sans-serif;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          background-color: #F5F5F7;
        }
        .tabular { font-variant-numeric: tabular-nums; }
        .touch-manipulation {
          -webkit-touch-callout: none;
          -webkit-tap-highlight-color: transparent;
          touch-action: manipulation;
        }
        @media (hover: none) and (pointer: coarse) {
          .hover\\:bg-gray-50:hover { background-color: rgb(249 250 251); }
          .hover\\:bg-gray-100:hover { background-color: rgb(243 244 246); }
          .active\\:bg-gray-100:active { background-color: rgb(243 244 246); }
        }
        .grid-bg {
          background-image: linear-gradient(rgba(156,163,175,0.1) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(156,163,175,0.1) 1px, transparent 1px);
          background-size: 24px 24px;
        }
      `}</style>

      <TopNav screen={screen} setScreen={setScreen} totals={totals} />

      {screen === 'dashboard' && <Dashboard onOpen={() => setScreen('summary')} />}
      {screen === 'summary' && <Summary onBack={() => setScreen('dashboard')} onReview={() => setScreen('review')} totals={totals} />}
      {screen === 'review' && (
        <ReviewScreen
          lineItems={lineItems}
          selectedItem={selectedItem}
          setSelectedItemId={setSelectedItemId}
          onApprove={handleApproveLineItem}
          onEdit={setEditingItem}
          onResolve={handleResolveException}
          onContinue={() => setScreen('approve')}
          onBack={() => setScreen('summary')}
          evidenceTab={evidenceTab}
          setEvidenceTab={setEvidenceTab}
          setExpandedPhoto={setExpandedPhoto}
          totals={totals}
        />
      )}
      {screen === 'approve' && (
        <ApproveScreen
          totals={totals}
          lineItems={lineItems}
          attested={attested}
          setAttested={setAttested}
          onBack={() => setScreen('review')}
          onSubmit={() => setShowSuccessPopup(true)}
        />
      )}
      {screen === 'confirmation' && <Confirmation onReset={() => { setScreen('dashboard'); setLineItems(INITIAL_LINE_ITEMS); setAttested(false); }} totals={totals} />}

      {editingItem && <EditDrawer item={editingItem} onClose={() => setEditingItem(null)} onSave={handleSaveEdit} />}
      {expandedPhoto && <PhotoLightbox photo={expandedPhoto} onClose={() => setExpandedPhoto(null)} />}
      {showSuccessPopup && (
        <SuccessPopup
          totals={totals}
          onClose={() => setShowSuccessPopup(false)}
          onBackToQueue={() => {
            setShowSuccessPopup(false);
            setScreen('dashboard');
            setLineItems(INITIAL_LINE_ITEMS);
            setAttested(false);
          }}
          onTakeBreak={() => {
            setShowSuccessPopup(false);
            setShowGame(true);
          }}
        />
      )}
      {showGame && (
        <SeveranceGame
          onClose={() => {
            setShowGame(false);
            setScreen('dashboard');
            setLineItems(INITIAL_LINE_ITEMS);
            setAttested(false);
          }}
        />
      )}
    </div>
  );
}

// ============ TOP NAV ============
function TopNav({ screen }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const crumbs = {
    dashboard: ['Claims'],
    summary: ['Claims', CLAIM.id],
    review: ['Claims', CLAIM.id, 'AI Draft Scope'],
    approve: ['Claims', CLAIM.id, 'Final Review'],
    confirmation: ['Claims', CLAIM.id, 'Submitted'],
  }[screen] || ['Claims'];

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-100">
      <div className="flex items-center justify-between px-4 md:px-8 h-16">
        <div className="flex items-center gap-4 md:gap-8">
          {/* Hover Logo - cleaner, more like real Hover */}
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 md:w-8 md:h-8 bg-black rounded-lg flex items-center justify-center">
              <Hexagon className="w-4 h-4 md:w-5 md:h-5 text-white" strokeWidth={2} />
            </div>
            <div className="text-lg md:text-xl font-bold text-gray-900 tracking-tight">Hover</div>
          </div>

          {/* Navigation menu - simplified like real Hover */}
          <nav className="hidden md:flex items-center gap-8 text-[15px] text-gray-600">
            <span className="text-gray-900 font-medium">Claims</span>
            <span className="hover:text-gray-900 cursor-pointer transition-colors">Insurance</span>
            <span className="hover:text-gray-900 cursor-pointer transition-colors">Construction</span>
            <span className="hover:text-gray-900 cursor-pointer transition-colors">Homeowners</span>
          </nav>
        </div>

        <div className="flex items-center gap-3 md:gap-4">
          {/* Search - more minimal */}
          <div className="hidden lg:flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-full text-[14px] text-gray-500 hover:bg-gray-100 transition-colors cursor-pointer">
            <Search className="w-4 h-4" />
            <span>Search claims</span>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 text-gray-600 hover:text-gray-900 transition-colors touch-manipulation"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>

          {/* User menu - cleaner styling */}
          <div className="flex items-center gap-3">
            <span className="hidden sm:block text-[14px] text-gray-600">Yosef Adiputra</span>
            <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-gray-900 flex items-center justify-center text-white text-[12px] md:text-[13px] font-medium">YA</div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4">
          <nav className="space-y-3">
            <div className="text-gray-900 font-medium py-3 text-[15px]">Claims</div>
            <div className="text-gray-600 hover:text-gray-900 cursor-pointer transition-colors py-3 text-[15px]">Insurance</div>
            <div className="text-gray-600 hover:text-gray-900 cursor-pointer transition-colors py-3 text-[15px]">Construction</div>
            <div className="text-gray-600 hover:text-gray-900 cursor-pointer transition-colors py-3 text-[15px]">Homeowners</div>
            <div className="pt-3 border-t border-gray-100">
              <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-lg text-[15px] text-gray-500 touch-manipulation">
                <Search className="w-5 h-5" />
                <span>Search claims</span>
              </div>
            </div>
          </nav>
        </div>
      )}

      {/* Breadcrumb bar - simplified */}
      {screen !== 'dashboard' && (
        <div className="px-4 md:px-8 py-2 bg-gray-50 border-t border-gray-100">
          <nav className="flex items-center gap-2 text-[12px] md:text-[13px] text-gray-500">
            {crumbs.map((c, i) => (
              <span key={i} className="flex items-center gap-2">
                {i > 0 && <ChevronRight className="w-3 h-3 text-gray-300" />}
                <span className={i === crumbs.length - 1 ? 'text-gray-900 font-medium' : 'hover:text-gray-700 cursor-pointer'}>{c}</span>
              </span>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}

// ============ DASHBOARD ============
function Dashboard({ onOpen }) {
  const [expandedImage, setExpandedImage] = useState(null);

  const statusStyles = {
    draft_ready: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    needs_review: 'bg-amber-50 text-amber-700 border-amber-200',
    processing: 'bg-stone-100 text-stone-600 border-stone-200',
    manual: 'bg-stone-100 text-stone-600 border-stone-200',
  };
  const statusLabels = {
    draft_ready: 'Draft Ready', needs_review: 'Needs Review', processing: 'Processing', manual: 'Manual Only'
  };

  return (
    <main className="max-w-[1400px] mx-auto px-4 md:px-8 py-8 md:py-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 md:mb-10 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[11px] md:text-[12px] uppercase tracking-wider text-gray-500 font-medium">My Queue</span>
            <span className="text-[11px] md:text-[12px] text-gray-300">•</span>
            <span className="text-[11px] md:text-[12px] text-gray-500">Wednesday, April 8, 2026</span>
          </div>
          <h1 className="font-display text-4xl md:text-6xl text-gray-900 leading-tight tracking-tight">Good morning, Yosef.</h1>
          <p className="text-gray-600 mt-3 md:mt-4 text-[14px] md:text-[16px] leading-relaxed">You have <span className="text-gray-900 font-semibold">6 claims</span> in your queue. 3 are ready to review with high-confidence AI drafts.</p>
        </div>
        <div className="flex items-center gap-3 mt-4 md:mt-0">
          <button className="text-[14px] px-4 py-2.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors touch-manipulation">Filter</button>
          <button className="text-[14px] px-4 py-2.5 bg-gray-900 text-white hover:bg-gray-800 rounded-lg transition-colors touch-manipulation">Export</button>
        </div>
      </div>

      {/* Metric strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6 md:mb-8">
        <MetricCard label="In queue" value="6" delta="+2 today" />
        <MetricCard label="Drafts ready" value="3" accent="emerald" delta="94% avg confidence" />
        <MetricCard label="Need review" value="1" accent="amber" delta="Action required" />
        <MetricCard label="Time saved this week" value="14.2h" accent="emerald" delta="vs. manual baseline" />
      </div>

      {/* Claims list - responsive */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        {/* Desktop table header */}
        <div className="hidden lg:grid grid-cols-[1.3fr_1.8fr_0.8fr_0.7fr_0.7fr_1.1fr_0.9fr_0.7fr] gap-4 px-6 xl:px-8 py-4 bg-gray-50 border-b border-gray-100 text-[12px] uppercase tracking-wider text-gray-600 font-semibold items-center">
          <div>Claim ID</div>
          <div>Property</div>
          <div>Photo</div>
          <div>Loss</div>
          <div>Inspected</div>
          <div>AI Draft</div>
          <div className="text-right">Est. Total</div>
          <div></div>
        </div>

        {/* Mobile section header */}
        <div className="lg:hidden px-4 py-3 bg-gray-50 border-b border-gray-100">
          <div className="text-[12px] uppercase tracking-wider text-gray-600 font-semibold">Claims Queue</div>
        </div>

        {DASHBOARD_CLAIMS.map((c) => (
          <button
            key={c.id}
            onClick={() => c.clickable && onOpen()}
            disabled={!c.clickable}
            className={`w-full text-left border-b border-gray-50 last:border-0 transition-colors touch-manipulation ${c.clickable ? 'hover:bg-gray-50 active:bg-gray-100 cursor-pointer' : 'opacity-60 cursor-not-allowed'}`}
          >
            {/* Desktop table row */}
            <div className="hidden lg:grid grid-cols-[1.3fr_1.8fr_0.8fr_0.7fr_0.7fr_1.1fr_0.9fr_0.7fr] gap-4 px-6 xl:px-8 py-5 items-center">
              <div className="font-mono-ui text-[13px] text-gray-600">{c.id}</div>
              <div>
                <div className="text-[14px] text-gray-900 font-medium">{c.address}</div>
                <div className="text-[12px] text-gray-500">{c.city}</div>
              </div>
              <div>
                <PropertyImage
                  src={c.image}
                  alt={`${c.address}, ${c.city}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setExpandedImage({ src: c.image, alt: `${c.address}, ${c.city}`, address: c.address, city: c.city });
                  }}
                />
              </div>
              <div><LossTypeBadge lossType={c.loss} /></div>
              <div className="text-[14px] text-gray-600">{c.date}</div>
              <div>
                <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium border ${statusStyles[c.status]}`}>
                  {c.status === 'draft_ready' && <Sparkles className="w-2.5 h-2.5" />}
                  {c.status === 'needs_review' && <AlertTriangle className="w-2.5 h-2.5" />}
                  {c.status === 'processing' && <Clock className="w-2.5 h-2.5" />}
                  {statusLabels[c.status]}
                </span>
                {c.confidence && (
                  <div className="text-[12px] text-gray-500 mt-1 tabular">{c.confidence}% confidence</div>
                )}
              </div>
              <div className="text-right tabular">
                <div className="text-[14px] text-gray-900 font-semibold">{fmt(c.total)}</div>
              </div>
              <div></div>
            </div>

            {/* Mobile card layout */}
            <div className="lg:hidden p-4">
              <div className="flex items-start gap-4">
                {/* Photo */}
                <div className="flex-shrink-0">
                  <PropertyImage
                    src={c.image}
                    alt={`${c.address}, ${c.city}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setExpandedImage({ src: c.image, alt: `${c.address}, ${c.city}`, address: c.address, city: c.city });
                    }}
                  />
                </div>

                {/* Main content */}
                <div className="flex-1 min-w-0">
                  {/* Header row */}
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <div className="text-[15px] text-gray-900 font-medium truncate">{c.address}</div>
                      <div className="text-[13px] text-gray-500">{c.city}</div>
                    </div>
                    <div className="text-right ml-3">
                      <div className="text-[15px] text-gray-900 font-semibold tabular">{fmt(c.total)}</div>
                    </div>
                  </div>

                  {/* Details row */}
                  <div className="flex flex-wrap items-center gap-3 text-[13px]">
                    <div className="font-mono-ui text-gray-500">{c.id}</div>
                    <LossTypeBadge lossType={c.loss} />
                    <div className="text-gray-500">{c.date}</div>
                  </div>

                  {/* Status row */}
                  <div className="mt-3">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[12px] font-medium border ${statusStyles[c.status]}`}>
                      {c.status === 'draft_ready' && <Sparkles className="w-3 h-3" />}
                      {c.status === 'needs_review' && <AlertTriangle className="w-3 h-3" />}
                      {c.status === 'processing' && <Clock className="w-3 h-3" />}
                      {statusLabels[c.status]}
                    </span>
                    {c.confidence && (
                      <span className="ml-2 text-[12px] text-gray-500 tabular">{c.confidence}% confidence</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="mt-6 flex items-center gap-2 text-[12px] text-gray-400">
        <Info className="w-3.5 h-3.5" />
        <span>Demo: only the Henderson claim is clickable. All other data is illustrative.</span>
      </div>
    {expandedImage && (
  <PropertyImageLightbox image={expandedImage} onClose={() => setExpandedImage(null)} />
)}</main>
  );
}
function PropertyImage({ src, alt, onClick }) {
  const [errored, setErrored] = useState(false);

  if (errored || !src) {
    return (
      <div className="w-14 h-10 rounded-md bg-stone-100 border border-stone-200 flex items-center justify-center">
        <Home className="w-3.5 h-3.5 text-stone-400" />
      </div>
    );
  }

  return (
    <button
      onClick={onClick}
      className="w-14 h-10 rounded-md overflow-hidden border border-stone-200 hover:border-stone-400 hover:ring-2 hover:ring-stone-900/10 transition-all"
      aria-label={`Expand photo of ${alt}`}
    >
      <img
        src={src}
        alt={alt}
        onError={() => setErrored(true)}
        className="w-full h-full object-cover"
      />
    </button>
  );
}

function PropertyImageLightbox({ image, onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 bg-stone-950/90 backdrop-blur-md flex items-center justify-center p-8"
      onClick={onClose}
    >
      <div className="max-w-3xl w-full" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-stone-400">Property photo</div>
            <div className="text-white text-[16px] font-medium mt-0.5">{image.address}</div>
            <div className="text-stone-400 text-[12px]">{image.city}</div>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-white" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="bg-stone-900 rounded-xl overflow-hidden aspect-[4/3]">
          <img src={image.src} alt={image.alt} className="w-full h-full object-cover" />
        </div>
      </div>
    </div>
  );
}
function MetricCard({ label, value, delta, accent }) {
  return (
    <div className="bg-white border border-stone-200 rounded-xl p-4 md:p-5">
      <div className="text-[10px] md:text-[11px] uppercase tracking-wider text-stone-500 font-medium">{label}</div>
      <div className="flex items-baseline gap-2 mt-1.5 md:mt-2">
        <div className={`font-display text-3xl md:text-4xl leading-none ${accent === 'emerald' ? 'text-emerald-700' : accent === 'amber' ? 'text-amber-700' : 'text-stone-900'}`}>{value}</div>
      </div>
      <div className="text-[10px] md:text-[11px] text-stone-500 mt-1.5 md:mt-2">{delta}</div>
    </div>
  );
}

// ============ SUMMARY SCREEN ============
function Summary({ onBack, onReview, totals }) {
  const claimImage = DASHBOARD_CLAIMS.find(c => c.id === CLAIM.id)?.image;

  return (
    <main className="max-w-[1440px] mx-auto px-6 py-8 bg-[#F5F5F7] min-h-screen">
      <button onClick={onBack} className="flex items-center gap-2 text-[15px] text-[#86868B] hover:text-[#1D1D1F] mb-8 transition-colors touch-manipulation font-medium">
        <ArrowLeft className="w-4 h-4" /> Back to queue
      </button>

      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-5xl md:text-6xl font-semibold text-[#1D1D1F] leading-tight tracking-tight mb-3">{CLAIM.address}</h1>
        <div className="flex items-center gap-4 text-[15px] text-[#86868B]">
          <span>{CLAIM.city}</span>
          <span>•</span>
          <span className="font-mono text-[14px]">{CLAIM.id}</span>
        </div>
      </div>

      {/* 12-Column Grid Layout */}
      <div className="grid grid-cols-12 gap-8">
        {/* Main Content (Columns 1-8): Property Hero & Dossier */}
        <div className="col-span-12 lg:col-span-8">
          {/* Property Hero with Integrated Dossier */}
          <div className="relative group shadow-[0_4px_24px_rgba(0,0,0,0.04)] rounded-[20px] overflow-hidden bg-white">
            {/* Wide Aspect Hero Image */}
            <div className="aspect-[21/9] relative overflow-hidden bg-gradient-to-br from-black/5 to-black/10">
              {claimImage ? (
                <img
                  src={claimImage}
                  alt={`${CLAIM.address}, ${CLAIM.city}`}
                  className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700 ease-out"
                  style={{filter: 'contrast(1.05) saturate(1.1)'}}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center">
                    <Home className="w-12 h-12 text-[#86868B] mx-auto mb-3" />
                    <div className="text-[#86868B] font-medium">Property Image</div>
                  </div>
                </div>
              )}
              {/* Glassmorphism Overlay Button */}
              <div className="absolute bottom-4 right-4 backdrop-blur-md bg-white/20 rounded-[12px] border border-white/30 px-4 py-2 text-white font-medium text-[14px] opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                View 84 Photos
              </div>
            </div>

            {/* Integrated Property Dossier - No Gap */}
            <div className="bg-[#F5F5F7] p-6 border-t border-gray-100">
              <h3 className="text-[14px] font-semibold text-[#1D1D1F] mb-4 uppercase tracking-wide">Property Dossier</h3>
              <div className="grid grid-cols-3 gap-x-6 gap-y-4">
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-bold text-[#86868B] tracking-wider mb-1">YEAR BUILT</span>
                  <span className="text-[14px] font-medium text-[#1D1D1F]">{CLAIM.yearBuilt}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-bold text-[#86868B] tracking-wider mb-1">INSPECTOR</span>
                  <span className="text-[14px] font-medium text-[#1D1D1F]">{CLAIM.inspector}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-bold text-[#86868B] tracking-wider mb-1">SQUARE FOOTAGE</span>
                  <span className="text-[14px] font-medium text-[#1D1D1F]">{CLAIM.squareFootage.toLocaleString()} sf</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-bold text-[#86868B] tracking-wider mb-1">INSPECTION DATE</span>
                  <span className="text-[14px] font-medium text-[#1D1D1F]">{CLAIM.inspectionDate}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-bold text-[#86868B] tracking-wider mb-1">ROOF MATERIAL</span>
                  <span className="text-[14px] font-medium text-[#1D1D1F]">{CLAIM.roofMaterial}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-bold text-[#86868B] tracking-wider mb-1">PHOTOS</span>
                  <span className="text-[14px] font-medium text-[#1D1D1F]">{CLAIM.photoCount}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-bold text-[#86868B] tracking-wider mb-1">POLICY NUMBER</span>
                  <span className="text-[12px] font-mono text-[#1D1D1F]">{CLAIM.policyNumber}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-bold text-[#86868B] tracking-wider mb-1">MEASUREMENTS</span>
                  <span className="text-[14px] font-medium text-[#1D1D1F]">{CLAIM.measurementCount}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Control Center (Columns 9-12): Sticky AI Intelligence & Actions */}
        <div className="col-span-12 lg:col-span-4 lg:sticky lg:top-8 lg:self-start">
          {/* Unified Control Center - One Continuous Slab */}
          <div className="bg-white rounded-[20px] shadow-[0_4px_24px_rgba(0,0,0,0.04)] overflow-hidden">

            {/* Price Hero */}
            <div className="p-6 text-center border-b border-gray-100">
              <div className="text-[48px] font-semibold text-[#1D1D1F] leading-none tracking-tight mb-3">{fmt(totals.total)}</div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 rounded-full text-blue-600 font-medium text-[13px] mb-2">
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                94% Match
              </div>
              <div className="text-[14px] text-[#86868B]">{totals.count} line items • {totals.needsReview > 0 ? `${totals.needsReview} need review` : 'All items verified'}</div>
            </div>

            {/* AI Summary */}
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-7 h-7 rounded-full bg-[#0071E3]/10 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-[#0071E3]" />
                </div>
                <span className="text-[16px] font-semibold text-[#1D1D1F]">AI Summary</span>
              </div>
              <p className="text-[14px] text-[#1D1D1F] leading-relaxed mb-4">
                Automated inspection analysis identified significant hail damage across 24.5 squares of roofing on the north and east-facing slopes. Damage density exceeds carrier replacement thresholds with consistent impact patterns and granule loss.
              </p>
              <div className="flex items-center gap-2 text-[13px] text-[#86868B]">
                <Clock className="w-4 h-4" />
                <span>Analysis completed in 2.4 seconds</span>
              </div>
            </div>

            {/* Action Group - Status & Button */}
            <div className="p-6">
              {/* Status Indicators */}
              <div className="space-y-3 mb-6">
                {totals.needsReview > 0 && (
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="w-4 h-4 text-[#FF9F0A]" />
                    <span className="text-[14px] text-[#FF9F0A] font-medium">{totals.needsReview} item needs attention</span>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-[#34C759]" />
                  <span className="text-[14px] font-medium text-[#1D1D1F]">Ready for Review</span>
                </div>
                <div className="flex items-center gap-3">
                  <FileCheck className="w-4 h-4 text-[#86868B]" />
                  <span className="text-[14px] text-[#86868B]">Ready for Xactimate import</span>
                </div>
              </div>

              {/* Primary Action Button */}
              <button
                onClick={onReview}
                className="w-full bg-[#0071E3] hover:brightness-110 text-white px-6 py-4 rounded-[12px] text-[16px] font-semibold flex items-center justify-center gap-3 transition-all touch-manipulation shadow-sm"
              >
                Review AI Draft Scope
                <ArrowRight className="w-4 h-4" />
              </button>
              <div className="text-center text-[13px] text-[#86868B] mt-3">
                Estimated review time: 3-5 minutes
              </div>
            </div>

          </div>
        </div>
      </div>
    </main>
  );
}

// function lineItemsSummary(t) {
//   return `${t.needsReview} need review`;
// }

// function InfoCard({ icon: Icon, title, children, accent }) {
//   return (
//     <div className={`bg-white border rounded-lg p-3 shadow-sm ${accent ? 'border-emerald-200 ring-1 ring-emerald-100/50' : 'border-gray-200'}`}>
//       <div className="flex items-center gap-2 mb-2">
//         <Icon className={`w-3.5 h-3.5 ${accent ? 'text-emerald-600' : 'text-gray-500'}`} />
//         <span className="text-[10px] uppercase tracking-wider text-gray-600 font-semibold">{title}</span>
//       </div>
//       <div className="space-y-2">{children}</div>
//     </div>
//   );
// }

function DataRow({ label, value, mono, highlight, amber }) {
  return (
    <div className="flex items-baseline justify-between text-[12px]">
      <span className="text-gray-500">{label}</span>
      <span className={`${mono ? 'font-mono-ui text-[11px]' : 'text-[12px]'} ${highlight ? 'text-emerald-700 font-semibold' : amber ? 'text-amber-700 font-semibold' : 'text-gray-900 font-medium'} tabular`}>{value}</span>
    </div>
  );
}

// ============ REVIEW SCREEN (CORE) ============
function ReviewScreen({ lineItems, selectedItem, setSelectedItemId, onApprove, onEdit, onResolve, onContinue, onBack, evidenceTab, setEvidenceTab, setExpandedPhoto, totals }) {
  const [mobileTab, setMobileTab] = useState('items');
  const grouped = useMemo(() => {
    const g = {};
    lineItems.forEach(i => {
      if (!g[i.category]) g[i.category] = [];
      g[i.category].push(i);
    });
    return g;
  }, [lineItems]);

  return (
    <div className="min-h-[calc(100vh-56px)] md:h-[calc(100vh-56px)] flex flex-col">
      {/* Sub header */}
      <div className="border-b border-stone-200 bg-white px-4 md:px-6 py-3 flex-shrink-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="text-stone-400 hover:text-stone-900 touch-manipulation">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-[14px] font-medium text-stone-900">AI Draft Scope</h2>
                <span className="font-mono-ui text-[11px] text-stone-500">{CLAIM.id}</span>
              </div>
              <div className="text-[11px] text-stone-500">{CLAIM.address} · {CLAIM.carrier}</div>
            </div>
          </div>

          {/* Desktop stats */}
          <div className="hidden md:flex items-center gap-6">
            <div className="flex items-center gap-4 text-[12px]">
              <Stat label="Approved" value={`${totals.approved}/${totals.count}`} />
              <Stat label="Edited" value={totals.edits} />
              <Stat label="Needs review" value={totals.needsReview} amber={totals.needsReview > 0} />
              <div className="h-6 w-px bg-stone-200" />
              <div>
                <div className="text-[10px] uppercase tracking-wider text-stone-500">Current total</div>
                <div className="font-display text-2xl text-stone-900 leading-none tabular">{fmt(totals.total)}</div>
              </div>
            </div>
            <button
              onClick={onContinue}
              className="bg-stone-900 hover:bg-stone-800 text-white px-4 py-2 rounded-lg text-[13px] font-medium flex items-center gap-1.5 touch-manipulation"
            >
              Continue to Final Review <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Mobile stats and continue button */}
          <div className="md:hidden flex items-center justify-between">
            <div className="flex items-center gap-4 text-[11px]">
              <div className="flex items-center gap-1">
                <span className="text-stone-500">Total:</span>
                <span className="font-display text-lg text-stone-900 tabular">{fmt(totals.total)}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-stone-500">Review:</span>
                <span className={totals.needsReview > 0 ? 'text-amber-700 font-medium' : 'text-stone-900'}>{totals.needsReview}</span>
              </div>
            </div>
            <button
              onClick={onContinue}
              className="bg-stone-900 hover:bg-stone-800 text-white px-4 py-2.5 rounded-lg text-[13px] font-medium flex items-center gap-1.5 touch-manipulation"
            >
              Continue <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile tab navigation */}
      <div className="md:hidden border-b border-stone-200 bg-white px-4 flex">
        {[
          { id: 'items', label: 'Line Items', count: totals.count },
          { id: 'evidence', label: 'Evidence', count: selectedItem?.evidence?.length || 0 },
          { id: 'ai', label: 'AI Analysis' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setMobileTab(tab.id)}
            className={`flex-1 py-3 px-1 text-[13px] font-medium border-b-2 -mb-px transition-colors touch-manipulation ${
              mobileTab === tab.id
                ? 'border-stone-900 text-stone-900'
                : 'border-transparent text-stone-500 hover:text-stone-700'
            }`}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span className="ml-1 text-[11px] opacity-60">({tab.count})</span>
            )}
          </button>
        ))}
      </div>

      {/* Three column layout - desktop / Mobile stacked layout */}
      <div className="flex-1 md:grid md:grid-cols-[320px_1fr_320px] lg:grid-cols-[360px_1fr_360px] md:overflow-hidden min-h-0">
        {/* LEFT: Line items */}
        <div className={`md:border-r border-stone-200 bg-white md:overflow-y-auto ${mobileTab !== 'items' ? 'hidden md:block' : 'overflow-y-auto h-full'}`}>
          <div className="p-4 border-b border-stone-100 sticky top-0 bg-white z-10">
            <div className="text-[11px] uppercase tracking-wider text-stone-500 font-medium">Scope Line Items</div>
          </div>
          {Object.entries(grouped).map(([category, items]) => (
            <div key={category}>
              <div className="px-4 py-2 bg-stone-50/60 border-b border-stone-100 flex items-center justify-between">
                <span className="text-[11px] uppercase tracking-wider text-stone-600 font-semibold">{category}</span>
                <span className="text-[11px] text-stone-400 tabular">{items.filter(i => i.status !== 'rejected').length} items</span>
              </div>
              {items.map(item => (
                <LineItemRow
                  key={item.id}
                  item={item}
                  selected={selectedItem?.id === item.id}
                  onSelect={() => setSelectedItemId(item.id)}
                />
              ))}
            </div>
          ))}
        </div>

        {/* CENTER: Evidence */}
        <div className={`bg-stone-50 md:overflow-y-auto ${mobileTab !== 'evidence' ? 'hidden md:block' : 'overflow-y-auto h-full'}`}>
          {selectedItem && (
            <EvidencePanel
              item={selectedItem}
              tab={evidenceTab}
              setTab={setEvidenceTab}
              onExpand={setExpandedPhoto}
            />
          )}
        </div>

        {/* RIGHT: Confidence + actions */}
        <div className={`md:border-l border-stone-200 bg-white md:overflow-y-auto ${mobileTab !== 'ai' ? 'hidden md:block' : 'overflow-y-auto h-full'}`}>
          {selectedItem && (
            <DetailPanel
              item={selectedItem}
              onApprove={() => onApprove(selectedItem.id)}
              onEdit={() => onEdit(selectedItem)}
              onResolve={(r) => onResolve(selectedItem.id, r)}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, amber }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-stone-500">{label}</div>
      <div className={`text-[14px] font-semibold tabular ${amber ? 'text-amber-700' : 'text-stone-900'}`}>{value}</div>
    </div>
  );
}

function LineItemRow({ item, selected, onSelect }) {
  const band = confBand(item.confidence);
  const colors = CONFIDENCE_COLORS[band];
  const isException = item.status === 'needs_review';
  const isApproved = item.status === 'approved';
  const isRejected = item.status === 'rejected';

  if (isRejected) {
    return (
      <div className="px-4 py-3 border-b border-stone-100 opacity-40">
        <div className="text-[12px] text-stone-500 line-through">{item.description}</div>
        <div className="text-[10px] text-stone-400 mt-0.5">Removed from scope</div>
      </div>
    );
  }

  return (
    <button
      onClick={onSelect}
      className={`w-full text-left px-4 py-3 border-b border-stone-100 transition-colors relative ${selected ? 'bg-stone-50' : 'hover:bg-stone-50/50'}`}
    >
      {selected && <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-stone-900" />}
      <div className="flex items-start gap-2.5">
        <div className={`w-1.5 h-1.5 rounded-full ${colors.dot} mt-2 flex-shrink-0`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="text-[12px] text-stone-900 leading-snug line-clamp-2">{item.description}</div>
            {isApproved && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />}
          </div>
          <div className="flex items-center justify-between mt-1.5">
            <div className="text-[11px] text-stone-500 tabular">
              {item.qty != null ? (
                <>{item.qty} {item.unit} · <span className="font-mono-ui">{item.code}</span></>
              ) : (
                <span className="text-amber-700 font-medium">Qty pending</span>
              )}
            </div>
            <div className="text-[12px] text-stone-900 font-medium tabular">
              {item.qty != null ? fmt(item.qty * item.unitPrice) : '—'}
            </div>
          </div>
          {isException && (
            <div className="mt-2 flex items-center gap-1 text-[10px] text-amber-700 bg-amber-50 border border-amber-200 rounded px-1.5 py-0.5 w-fit">
              <AlertTriangle className="w-2.5 h-2.5" /> Needs review
            </div>
          )}
          {item.edited && (
            <div className="mt-2 flex items-center gap-1 text-[10px] text-stone-600 bg-stone-100 rounded px-1.5 py-0.5 w-fit">
              <Edit3 className="w-2.5 h-2.5" /> Edited
            </div>
          )}
        </div>
      </div>
    </button>
  );
}

// ============ EVIDENCE PANEL (CENTER) ============
function EvidencePanel({ item, tab, setTab, onExpand }) {
  const tabs = [
    { id: 'photos', label: 'Photos', icon: Camera, count: item.evidence.length },
    { id: '3d', label: '3D Model', icon: Box },
    { id: 'measurements', label: 'Measurements', icon: Ruler },
    { id: 'notes', label: 'Notes', icon: FileText },
  ];

  return (
    <div>
      {/* Tabs */}
      <div className="bg-white border-b border-stone-200 px-6 pt-4 sticky top-0 z-10">
        <div className="mb-3">
          <div className="text-[11px] uppercase tracking-wider text-stone-500 font-medium">Evidence for</div>
          <div className="text-[14px] font-medium text-stone-900 mt-0.5">{item.description}</div>
        </div>
        <div className="flex items-center gap-1">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-3 py-2 text-[12px] font-medium border-b-2 -mb-px transition-colors ${tab === t.id ? 'border-stone-900 text-stone-900' : 'border-transparent text-stone-500 hover:text-stone-900'}`}
            >
              <t.icon className="w-3.5 h-3.5" />
              {t.label}
              {t.count != null && <span className="text-stone-400 tabular">({t.count})</span>}
            </button>
          ))}
        </div>
      </div>

      <div className="p-6">
        {tab === 'photos' && <PhotosView item={item} onExpand={onExpand} />}
        {tab === '3d' && <ThreeDView item={item} />}
        {tab === 'measurements' && <MeasurementsView item={item} />}
        {tab === 'notes' && <NotesView item={item} />}
      </div>
    </div>
  );
}

function PhotosView({ item, onExpand }) {
  if (item.evidence.length === 0) {
    return <EmptyEvidence message="No photos captured for this line item." />;
  }
  return (
    <div>
      <div className="flex items-center gap-2 mb-4 text-[12px] text-stone-600">
        <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
        <span>AI has highlighted <span className="font-medium text-stone-900">{item.evidence.length} photos</span> relevant to this line item</span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {item.evidence.map((label, idx) => (
          <PhotoCard key={idx} label={label} index={idx} onClick={() => onExpand({ label, index: idx, item })} />
        ))}
      </div>
    </div>
  );
}

function PhotoCard({ label, index, onClick }) {
  // Insurance adjuster hail damage inspection photo
  const realisticPhotos = [
    'https://media.istockphoto.com/id/488913912/photo/insurance-adjuster-marked-roof-with-hail-damage.jpg?s=612x612&w=0&k=20&c=5XvO8YpE7b_0rCUKK_8Fm0w7n-XN2S8yI5dBhB7T3vA=', // Insurance adjuster marking hail damage
    'https://media.istockphoto.com/id/488913912/photo/insurance-adjuster-marked-roof-with-hail-damage.jpg?s=612x612&w=0&k=20&c=5XvO8YpE7b_0rCUKK_8Fm0w7n-XN2S8yI5dBhB7T3vA=', // Same image - different angle view
    'https://media.istockphoto.com/id/488913912/photo/insurance-adjuster-marked-roof-with-hail-damage.jpg?s=612x612&w=0&k=20&c=5XvO8YpE7b_0rCUKK_8Fm0w7n-XN2S8yI5dBhB7T3vA=', // Same image - close-up view
    'https://media.istockphoto.com/id/488913912/photo/insurance-adjuster-marked-roof-with-hail-damage.jpg?s=612x612&w=0&k=20&c=5XvO8YpE7b_0rCUKK_8Fm0w7n-XN2S8yI5dBhB7T3vA=', // Same image - overview
    'https://media.istockphoto.com/id/488913912/photo/insurance-adjuster-marked-roof-with-hail-damage.jpg?s=612x612&w=0&k=20&c=5XvO8YpE7b_0rCUKK_8Fm0w7n-XN2S8yI5dBhB7T3vA=', // Same image - detail view
    'https://media.istockphoto.com/id/488913912/photo/insurance-adjuster-marked-roof-with-hail-damage.jpg?s=612x612&w=0&k=20&c=5XvO8YpE7b_0rCUKK_8Fm0w7n-XN2S8yI5dBhB7T3vA=', // Same image - wide view
  ];

  const photoUrl = realisticPhotos[index % realisticPhotos.length];

  return (
    <button onClick={onClick} className="group relative bg-white rounded-lg overflow-hidden border border-stone-200 hover:border-stone-300 hover:shadow-md transition-all text-left">
      <div className="aspect-[4/3] relative overflow-hidden">
        <img
          src={photoUrl}
          alt={`Roof damage inspection photo ${index + 1}`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            // Fallback to a solid color if image fails to load
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'flex';
          }}
        />
        {/* Fallback background */}
        <div className="absolute inset-0 bg-gradient-to-br from-stone-600 to-stone-800 flex items-center justify-center" style={{display: 'none'}}>
          <Camera className="w-8 h-8 text-white/50" />
        </div>

        {/* Damage indicator overlays */}
        <div className="absolute inset-0">
          {[...Array(6)].map((_, i) => {
            const left = 15 + (i * 47) % 70 + (index * 10) % 15;
            const top = 20 + (i * 31) % 60 + (index * 8) % 20;
            return (
              <div
                key={i}
                className="absolute w-6 h-6 border-2 border-orange-400 rounded-full bg-orange-400/20 flex items-center justify-center"
                style={{ left: `${left}%`, top: `${top}%` }}
              >
                <div className="w-1.5 h-1.5 bg-orange-400 rounded-full"></div>
              </div>
            );
          })}
        </div>

        {/* Corner meta overlay */}
        <div className="absolute top-2 left-2 bg-black/60 backdrop-blur text-white text-[9px] font-mono px-2 py-1 rounded">
          IMG_{String(index + 1).padStart(3, '0')}
        </div>

        <div className="absolute top-2 right-2 bg-emerald-500/90 backdrop-blur text-white text-[9px] font-medium px-1.5 py-0.5 rounded flex items-center gap-1">
          <Sparkles className="w-2 h-2" /> AI
        </div>
        <div className="absolute inset-0 bg-stone-900/0 group-hover:bg-stone-900/20 transition-colors flex items-center justify-center">
          <Maximize2 className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>
      <div className="p-3">
        <div className="text-[12px] text-stone-900 font-medium leading-tight">{label}</div>
        <div className="text-[10px] text-stone-500 mt-1 flex items-center gap-2">
          <MapPin className="w-2.5 h-2.5" /> Tagged to 3D model
        </div>
      </div>
    </button>
  );
}

function ThreeDView() {
  return (
    <div className="bg-white rounded-lg border border-stone-200 p-8">
      <div className="text-center mb-6">
        <div className="text-[11px] uppercase tracking-wider text-stone-500 font-medium mb-1">3D Digital Twin</div>
        <div className="text-[13px] text-stone-900">Affected area highlighted</div>
      </div>
      {/* Stylized isometric house SVG */}
      <div className="flex justify-center grid-bg rounded-lg py-8">
        <svg viewBox="0 0 400 300" className="w-full max-w-md">
          <defs>
            <linearGradient id="roof-north" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#dc2626" stopOpacity="0.7" />
            </linearGradient>
            <linearGradient id="roof-east" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f97316" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#ea580c" stopOpacity="0.6" />
            </linearGradient>
          </defs>
          {/* House body */}
          <polygon points="80,200 200,240 200,140 80,100" fill="#e7e5e4" stroke="#78716c" strokeWidth="1" />
          <polygon points="200,240 320,200 320,100 200,140" fill="#d6d3d1" stroke="#78716c" strokeWidth="1" />
          {/* Roof north (highlighted) */}
          <polygon points="80,100 200,140 200,70 80,30" fill="url(#roof-north)" stroke="#dc2626" strokeWidth="1.5" />
          {/* Roof east (highlighted) */}
          <polygon points="200,140 320,100 320,30 200,70" fill="url(#roof-east)" stroke="#ea580c" strokeWidth="1.5" />
          {/* Ridge line */}
          <line x1="80" y1="30" x2="320" y2="30" stroke="#78716c" strokeWidth="1" />
          <line x1="200" y1="70" x2="200" y2="140" stroke="#78716c" strokeWidth="1" strokeDasharray="2,2" />
          {/* Damage pins */}
          {[[130, 70], [160, 85], [110, 55], [250, 65], [280, 80], [230, 90]].map(([x, y], i) => (
            <g key={i}>
              <circle cx={x} cy={y} r="4" fill="white" stroke="#dc2626" strokeWidth="2" />
              <circle cx={x} cy={y} r="1.5" fill="#dc2626" />
            </g>
          ))}
          {/* Labels */}
          <text x="130" y="130" fontSize="9" fill="#44403c" fontFamily="Geist, sans-serif" fontWeight="500">NORTH SLOPE</text>
          <text x="240" y="130" fontSize="9" fill="#44403c" fontFamily="Geist, sans-serif" fontWeight="500">EAST SLOPE</text>
          {/* Measurement annotation */}
          <line x1="80" y1="215" x2="200" y2="255" stroke="#059669" strokeWidth="1" strokeDasharray="3,2" />
          <text x="120" y="250" fontSize="10" fill="#059669" fontWeight="600">24.5 SQ affected</text>
        </svg>
      </div>
      <div className="grid grid-cols-3 gap-3 mt-6">
        <div className="text-center">
          <div className="text-[10px] uppercase tracking-wider text-stone-500">Affected area</div>
          <div className="font-display text-2xl text-stone-900 tabular">24.5 <span className="text-[11px] text-stone-500">SQ</span></div>
        </div>
        <div className="text-center">
          <div className="text-[10px] uppercase tracking-wider text-stone-500">Slopes</div>
          <div className="font-display text-2xl text-stone-900">2<span className="text-[11px] text-stone-500"> of 4</span></div>
        </div>
        <div className="text-center">
          <div className="text-[10px] uppercase tracking-wider text-stone-500">Pitch</div>
          <div className="font-display text-2xl text-stone-900 tabular">6/12</div>
        </div>
      </div>
    </div>
  );
}

function MeasurementsView() {
  return (
    <div className="bg-white rounded-lg border border-stone-200 p-6">
      <div className="text-[12px] text-stone-600 mb-4">Measurements extracted from Hover 3D digital twin</div>
      <div className="space-y-3">
        {[
          { label: 'North slope area', value: '1,312 sf (13.1 SQ)' },
          { label: 'East slope area', value: '1,138 sf (11.4 SQ)' },
          { label: 'Total affected', value: '2,450 sf (24.5 SQ)' },
          { label: 'Ridge length', value: '52 LF' },
          { label: 'North eave length', value: '76 LF' },
          { label: 'East eave length', value: '66 LF' },
          { label: 'Roof pitch', value: '6/12' },
        ].map((m, i) => (
          <div key={i} className="flex items-center justify-between py-2 border-b border-stone-100 last:border-0">
            <span className="text-[13px] text-stone-600">{m.label}</span>
            <span className="text-[13px] text-stone-900 font-medium tabular font-mono-ui">{m.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function NotesView({ item }) {
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg border border-stone-200 p-5">
        <div className="flex items-center gap-2 mb-3">
          <User className="w-3.5 h-3.5 text-stone-500" />
          <span className="text-[12px] text-stone-600">Inspector note — {CLAIM.inspector}</span>
          <span className="text-[11px] text-stone-400 ml-auto">{CLAIM.inspectionDate}</span>
        </div>
        <p className="text-[13px] text-stone-900 leading-relaxed">
          {item.inspectorNote || 'No specific note captured for this line item by the field inspector.'}
        </p>
      </div>
      <div className="bg-white rounded-lg border border-stone-200 p-5">
        <div className="flex items-center gap-2 mb-3">
          <FileCheck className="w-3.5 h-3.5 text-stone-500" />
          <span className="text-[12px] text-stone-600">Checklist response</span>
        </div>
        <div className="space-y-2 text-[13px]">
          <div className="flex items-start gap-2"><Check className="w-3.5 h-3.5 text-emerald-600 mt-0.5" /><span className="text-stone-700">Hail impact confirmed on affected slopes</span></div>
          <div className="flex items-start gap-2"><Check className="w-3.5 h-3.5 text-emerald-600 mt-0.5" /><span className="text-stone-700">Impact density exceeds 8 per 100 sq ft</span></div>
          <div className="flex items-start gap-2"><Check className="w-3.5 h-3.5 text-emerald-600 mt-0.5" /><span className="text-stone-700">Granule loss documented</span></div>
        </div>
      </div>
    </div>
  );
}

function EmptyEvidence({ message }) {
  return (
    <div className="bg-white rounded-lg border border-stone-200 p-12 text-center">
      <div className="w-10 h-10 mx-auto rounded-full bg-stone-100 flex items-center justify-center mb-3">
        <Camera className="w-4 h-4 text-stone-400" />
      </div>
      <div className="text-[13px] text-stone-600">{message}</div>
    </div>
  );
}

// ============ DETAIL PANEL (RIGHT) ============
function DetailPanel({ item, onApprove, onEdit, onResolve }) {
  const band = confBand(item.confidence);
  const colors = CONFIDENCE_COLORS[band];
  const isException = item.status === 'needs_review';
  const isApproved = item.status === 'approved';
  const lineTotal = item.qty != null ? item.qty * item.unitPrice : null;

  return (
    <div className="p-6">
      {/* Confidence header */}
      <div className={`rounded-lg border p-4 mb-5 ${colors.bg} ${colors.border}`}>
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] uppercase tracking-wider font-medium text-stone-600">Confidence</span>
          {isException ? (
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
          ) : (
            <Activity className="w-3.5 h-3.5 text-stone-500" />
          )}
        </div>
        <div className="flex items-baseline gap-2">
          <span className={`font-display text-4xl leading-none tabular ${colors.text}`}>
            {item.confidence}<span className="text-lg">%</span>
          </span>
          <span className={`text-[11px] font-medium uppercase tracking-wider ${colors.text}`}>
            {band === 'high' ? 'High' : band === 'med' ? 'Moderate' : 'Low'}
          </span>
        </div>
        {/* confidence bar */}
        <div className="mt-3 h-1 bg-white/60 rounded-full overflow-hidden">
          <div className={`h-full ${colors.dot}`} style={{ width: `${item.confidence}%` }} />
        </div>
      </div>

      {/* Line item details */}
      <div className="mb-5">
        <div className="text-[10px] uppercase tracking-wider text-stone-500 font-medium mb-2">Line Item</div>
        <div className="space-y-2 text-[12px]">
          <div className="flex justify-between"><span className="text-stone-500">Code</span><span className="font-mono-ui text-stone-900">{item.code}</span></div>
          <div className="flex justify-between"><span className="text-stone-500">Quantity</span><span className="text-stone-900 font-medium tabular">{item.qty != null ? `${item.qty} ${item.unit}` : '—'}</span></div>
          <div className="flex justify-between"><span className="text-stone-500">Unit price</span><span className="text-stone-900 tabular">{fmtDetail(item.unitPrice)}</span></div>
          <div className="flex justify-between pt-2 border-t border-stone-100"><span className="text-stone-500">Line total</span><span className="text-stone-900 font-semibold tabular">{lineTotal != null ? fmt(lineTotal) : '—'}</span></div>
        </div>
      </div>

      {/* Why this recommendation */}
      <div className="mb-5">
        <div className="flex items-center gap-1.5 mb-2">
          <Sparkles className="w-3 h-3 text-emerald-600" />
          <span className="text-[10px] uppercase tracking-wider text-emerald-700 font-semibold">Why this recommendation</span>
        </div>
        <p className="text-[12px] text-stone-700 leading-relaxed">{item.explanation}</p>
      </div>

      {/* Evidence breakdown */}
      <div className="mb-5">
        <div className="text-[10px] uppercase tracking-wider text-stone-500 font-medium mb-2">Evidence Used</div>
        <div className="space-y-1.5 text-[12px]">
          <div className="flex items-center gap-2 text-stone-600">
            <Camera className="w-3 h-3" /> {item.evidence.length} photos tagged to location
          </div>
          <div className="flex items-center gap-2 text-stone-600">
            <Ruler className="w-3 h-3" /> 3D model measurements
          </div>
          <div className="flex items-center gap-2 text-stone-600">
            <TrendingUp className="w-3 h-3" /> {item.comparables} comparable claims in region
          </div>
          {item.inspectorNote && (
            <div className="flex items-center gap-2 text-stone-600">
              <FileText className="w-3 h-3" /> Inspector field note
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-2 pt-4 border-t border-stone-200">
        {isException ? (
          <>
            <div className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3 mb-2">
              <div className="font-semibold mb-1 flex items-center gap-1.5"><AlertTriangle className="w-3 h-3" /> AI cannot complete this line</div>
              AI detected possible damage but couldn't determine extent. Choose how to proceed.
            </div>
            <button onClick={() => onResolve('manual')} className="w-full bg-stone-900 hover:bg-stone-800 text-white py-2.5 rounded-lg text-[13px] font-medium flex items-center justify-center gap-1.5">
              <Edit3 className="w-3.5 h-3.5" /> Estimate manually
            </button>
            <button className="w-full bg-white hover:bg-stone-50 border border-stone-200 text-stone-700 py-2 rounded-lg text-[12px] font-medium flex items-center justify-center gap-1.5">
              <Send className="w-3 h-3" /> Request re-inspection
            </button>
            <button onClick={() => onResolve('remove')} className="w-full text-stone-500 hover:text-stone-700 py-1.5 text-[12px]">
              Mark not applicable
            </button>
          </>
        ) : isApproved ? (
          <div className="w-full bg-emerald-50 border border-emerald-200 text-emerald-700 py-2.5 rounded-lg text-[13px] font-medium flex items-center justify-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" /> Approved{item.edited && ' with edits'}
          </div>
        ) : (
          <>
            <button onClick={onApprove} className="w-full bg-stone-900 hover:bg-stone-800 text-white py-2.5 rounded-lg text-[13px] font-medium flex items-center justify-center gap-1.5">
              <Check className="w-4 h-4" /> Approve line item
            </button>
            <button onClick={onEdit} className="w-full bg-white hover:bg-stone-50 border border-stone-200 text-stone-700 py-2 rounded-lg text-[12px] font-medium flex items-center justify-center gap-1.5">
              <Edit3 className="w-3.5 h-3.5" /> Edit
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ============ EDIT DRAWER ============
function EditDrawer({ item, onClose, onSave }) {
  const [qty, setQty] = useState(item.qty ?? 0);
  const [unitPrice, setUnitPrice] = useState(item.unitPrice);
  const [reason, setReason] = useState('adjuster_judgment');
  const [note, setNote] = useState('');
  const newTotal = qty * unitPrice;
  const origTotal = (item.qty ?? 0) * item.unitPrice;
  const delta = newTotal - origTotal;

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-stone-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="w-[440px] bg-white shadow-2xl flex flex-col">
        <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-stone-500 font-semibold">Edit Line Item</div>
            <div className="text-[14px] text-stone-900 font-medium mt-0.5">{item.code}</div>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-900">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          <div>
            <label className="text-[11px] uppercase tracking-wider text-stone-500 font-medium">Description</label>
            <div className="mt-1 text-[13px] text-stone-900">{item.description}</div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] uppercase tracking-wider text-stone-500 font-medium">Quantity ({item.unit})</label>
              <input
                type="number"
                step="0.1"
                value={qty}
                onChange={(e) => setQty(parseFloat(e.target.value) || 0)}
                className="w-full mt-1 px-3 py-2 bg-white border border-stone-200 rounded-lg text-[14px] text-stone-900 tabular focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-400"
              />
              {item.qty != null && (
                <button onClick={() => setQty(item.qty)} className="mt-1.5 inline-flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 rounded px-1.5 py-0.5">
                  <Sparkles className="w-2.5 h-2.5" /> AI suggests {item.qty}
                </button>
              )}
            </div>
            <div>
              <label className="text-[11px] uppercase tracking-wider text-stone-500 font-medium">Unit price</label>
              <input
                type="number"
                step="0.01"
                value={unitPrice}
                onChange={(e) => setUnitPrice(parseFloat(e.target.value) || 0)}
                className="w-full mt-1 px-3 py-2 bg-white border border-stone-200 rounded-lg text-[14px] text-stone-900 tabular focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-400"
              />
              <div className="mt-1.5 text-[10px] text-stone-400">Regional: {fmtDetail(item.unitPrice)}</div>
            </div>
          </div>

          {delta !== 0 && (
            <div className="bg-stone-50 border border-stone-200 rounded-lg p-3">
              <div className="flex items-center justify-between text-[12px]">
                <span className="text-stone-500">Line total change</span>
                <span className={`font-semibold tabular ${delta > 0 ? 'text-stone-900' : 'text-emerald-700'}`}>
                  {delta > 0 ? '+' : ''}{fmt(delta)}
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] mt-1 text-stone-500">
                <span>New total</span>
                <span className="tabular">{fmt(newTotal)}</span>
              </div>
            </div>
          )}

          <div>
            <label className="text-[11px] uppercase tracking-wider text-stone-500 font-medium">Reason for change <span className="text-rose-600">*</span></label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full mt-1 px-3 py-2 bg-white border border-stone-200 rounded-lg text-[13px] text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900/10"
            >
              <option value="adjuster_judgment">Adjuster judgment</option>
              <option value="carrier_guideline">Carrier guideline</option>
              <option value="evidence_insufficient">Evidence insufficient</option>
              <option value="field_correction">Field correction</option>
              <option value="other">Other</option>
            </select>
            <div className="mt-1.5 text-[10px] text-stone-400">Required for audit log</div>
          </div>

          <div>
            <label className="text-[11px] uppercase tracking-wider text-stone-500 font-medium">Note (optional)</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add context for the audit trail..."
              rows={3}
              className="w-full mt-1 px-3 py-2 bg-white border border-stone-200 rounded-lg text-[13px] text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900/10 resize-none"
            />
          </div>
        </div>

        <div className="px-6 py-4 border-t border-stone-200 flex items-center gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 text-[13px] text-stone-600 hover:text-stone-900 font-medium">
            Cancel
          </button>
          <button
            onClick={() => onSave(item.id, { qty, unitPrice })}
            className="flex-[2] bg-stone-900 hover:bg-stone-800 text-white py-2.5 rounded-lg text-[13px] font-medium"
          >
            Save & approve
          </button>
        </div>
      </div>
    </div>
  );
}

// ============ PHOTO LIGHTBOX ============
function PhotoLightbox({ photo, onClose }) {
  return (
    <div className="fixed inset-0 z-50 bg-stone-950/90 backdrop-blur-md flex items-center justify-center p-8" onClick={onClose}>
      <div className="max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-stone-400">Photo evidence</div>
            <div className="text-white text-[16px] font-medium mt-0.5">{photo.label}</div>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="bg-stone-900 rounded-xl overflow-hidden aspect-[4/3]">
          <svg viewBox="0 0 800 600" className="w-full h-full">
            <defs>
              <linearGradient id="lb-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#44403c" />
                <stop offset="100%" stopColor="#78716c" />
              </linearGradient>
              <pattern id="lb-shingle" x="0" y="0" width="80" height="30" patternUnits="userSpaceOnUse">
                <rect width="80" height="30" fill="rgba(0,0,0,0.15)" />
                <rect x="0" y="0" width="80" height="2" fill="rgba(255,255,255,0.08)" />
                <rect x="40" y="15" width="80" height="2" fill="rgba(255,255,255,0.08)" />
              </pattern>
            </defs>
            <rect width="800" height="600" fill="url(#lb-grad)" />
            <rect width="800" height="600" fill="url(#lb-shingle)" />
            {[...Array(12)].map((_, i) => {
              const cx = 80 + (i * 67) % 640;
              const cy = 60 + (i * 51) % 480;
              return (
                <g key={i}>
                  <circle cx={cx} cy={cy} r="26" fill="none" stroke="#fbbf24" strokeWidth="2" opacity="0.9" />
                  <circle cx={cx} cy={cy} r="6" fill="#fbbf24" opacity="0.95" />
                  <text x={cx + 32} y={cy + 4} fontSize="11" fill="#fbbf24" fontFamily="monospace">HAIL {i + 1}</text>
                </g>
              );
            })}
          </svg>
        </div>
        <div className="mt-4 flex items-center gap-4 text-[12px] text-stone-400">
          <span className="flex items-center gap-1.5"><Sparkles className="w-3 h-3 text-emerald-400" /> AI detected 12 hail impacts</span>
          <span>•</span>
          <span>Tagged to north slope</span>
          <span>•</span>
          <span className="font-mono-ui">IMG_{String(photo.index + 1).padStart(3, '0')}</span>
        </div>
      </div>
    </div>
  );
}

// ============ APPROVE SCREEN ============
function ApproveScreen({ totals, lineItems, attested, setAttested, onBack, onSubmit }) {
  const canSubmit = attested && totals.needsReview === 0;

  return (
    <main className="max-w-[1000px] mx-auto px-6 py-10">
      <button onClick={onBack} className="flex items-center gap-1.5 text-[13px] text-stone-500 hover:text-stone-900 mb-6">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to review
      </button>

      <div className="mb-8">
        <div className="text-[11px] uppercase tracking-wider text-stone-500 font-medium mb-2">Final Review</div>
        <h1 className="font-display text-5xl text-stone-900 leading-tight">Ready to submit?</h1>
        <p className="text-stone-500 mt-3 text-[14px]">Review your scope and attest before sending to Xactimate.</p>
      </div>

      {/* Metric strip */}
      <div className="bg-white border border-stone-200 rounded-xl p-6 mb-6">
        <div className="grid grid-cols-4 gap-6">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-stone-500 font-medium">Total estimate</div>
            <div className="font-display text-4xl text-stone-900 tabular mt-1">{fmt(totals.total)}</div>
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-wider text-stone-500 font-medium">Line items</div>
            <div className="font-display text-4xl text-stone-900 tabular mt-1">{lineItems.filter(i => i.status !== 'rejected').length}</div>
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-wider text-stone-500 font-medium">Your edits</div>
            <div className="font-display text-4xl text-stone-900 tabular mt-1">{totals.edits}</div>
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-wider text-stone-500 font-medium">Exceptions</div>
            <div className={`font-display text-4xl tabular mt-1 ${totals.needsReview > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>
              {totals.needsReview === 0 ? '✓' : totals.needsReview}
            </div>
          </div>
        </div>
      </div>

      {/* Compliance checks */}
      <div className="bg-white border border-stone-200 rounded-xl p-6 mb-6">
        <div className="text-[11px] uppercase tracking-wider text-stone-500 font-medium mb-4">Carrier Compliance</div>
        <div className="space-y-3">
          <ComplianceRow ok label="Within Summit Mutual scoping guidelines" detail="All line items match carrier's like-kind-and-quality rules" />
          <ComplianceRow ok label="Required documentation present" detail="84 photos, 23 measurements, inspector checklist complete" />
          <ComplianceRow ok label="Audit trail complete" detail={`${totals.edits} edits logged with reason codes`} />
          <ComplianceRow ok={totals.needsReview === 0} label="All exceptions resolved" detail={totals.needsReview === 0 ? 'No outstanding items need review' : `${totals.needsReview} items still need review — go back to resolve`} />
          <ComplianceRow ok label="Within regional comparables" detail="Estimate is within 8% of comparable hail claims in Henderson, NV" />
        </div>
      </div>

      {/* Breakdown */}
      <div className="bg-white border border-stone-200 rounded-xl p-6 mb-6">
        <div className="text-[11px] uppercase tracking-wider text-stone-500 font-medium mb-4">Cost Breakdown</div>
        <div className="space-y-2.5 text-[13px]">
          <div className="flex justify-between"><span className="text-stone-600">Subtotal</span><span className="text-stone-900 tabular">{fmt(totals.subtotal)}</span></div>
          <div className="flex justify-between"><span className="text-stone-600">Overhead & profit (20%)</span><span className="text-stone-900 tabular">{fmt(totals.oAndP)}</span></div>
          <div className="flex justify-between"><span className="text-stone-600">Sales tax (8.25%)</span><span className="text-stone-900 tabular">{fmt(totals.tax)}</span></div>
          <div className="flex justify-between pt-3 border-t border-stone-200 text-[15px]"><span className="text-stone-900 font-semibold">Total</span><span className="text-stone-900 font-semibold tabular">{fmt(totals.total)}</span></div>
          <div className="flex justify-between text-[12px] text-stone-500"><span>Less deductible</span><span className="tabular">−{fmt(CLAIM.deductible)}</span></div>
          <div className="flex justify-between pt-2 border-t border-stone-100 text-[14px]"><span className="text-stone-700 font-medium">Net claim payable</span><span className="text-emerald-700 font-semibold tabular">{fmt(totals.total - CLAIM.deductible)}</span></div>
        </div>
      </div>

      {/* Attestation */}
      <div className="bg-white border-2 border-stone-900 rounded-xl p-6 mb-6">
        <div className="flex items-start gap-3">
          <button
            onClick={() => setAttested(!attested)}
            className={`flex-shrink-0 w-5 h-5 rounded border-2 transition-all flex items-center justify-center ${attested ? 'bg-stone-900 border-stone-900' : 'bg-white border-stone-300 hover:border-stone-500'}`}
          >
            {attested && <Check className="w-3 h-3 text-white" />}
          </button>
          <div className="flex-1">
            <div className="text-[13px] text-stone-900 font-medium">Adjuster attestation</div>
            <p className="text-[12px] text-stone-600 mt-1 leading-relaxed">
              I have reviewed this scope in its entirety and confirm it accurately reflects the damage documented in the field inspection. I understand that this submission is my professional determination and will be used by Summit Mutual to authorize repair.
            </p>
            <div className="mt-3 flex items-center gap-2 text-[11px] text-stone-500">
              <Shield className="w-3 h-3" /> Submitted as Yosef Adiputra, Adjuster ID ADJ-4421 · {new Date().toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <button onClick={onBack} className="text-[13px] text-stone-600 hover:text-stone-900 px-4 py-2">
          Save as draft
        </button>
        <button
          onClick={onSubmit}
          disabled={!canSubmit}
          className={`px-6 py-3 rounded-lg text-[14px] font-medium flex items-center gap-2 transition-all ${canSubmit ? 'bg-stone-900 hover:bg-stone-800 text-white shadow-sm' : 'bg-stone-200 text-stone-400 cursor-not-allowed'}`}
        >
          Approve & send to Xactimate <Send className="w-4 h-4" />
        </button>
      </div>
      {!attested && (
        <div className="mt-3 text-right text-[11px] text-stone-500">Check the attestation box to submit</div>
      )}
    </main>
  );
}

function ComplianceRow({ ok, label, detail }) {
  return (
    <div className="flex items-start gap-3">
      <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5 ${ok ? 'bg-emerald-100' : 'bg-amber-100'}`}>
        {ok ? <Check className="w-3 h-3 text-emerald-700" strokeWidth={3} /> : <AlertTriangle className="w-3 h-3 text-amber-700" />}
      </div>
      <div className="flex-1">
        <div className="text-[13px] text-stone-900 font-medium">{label}</div>
        <div className="text-[11px] text-stone-500 mt-0.5">{detail}</div>
      </div>
    </div>
  );
}

// ============ CONFIRMATION SCREEN ============
function Confirmation({ onReset, totals }) {
  return (
    <main className="max-w-[720px] mx-auto px-6 py-20 text-center">
      <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 flex items-center justify-center mb-6">
        <CheckCircle2 className="w-8 h-8 text-emerald-700" strokeWidth={2} />
      </div>

      <div className="text-[11px] uppercase tracking-wider text-emerald-700 font-semibold mb-3">Scope Approved</div>
      <h1 className="font-display text-5xl text-stone-900 leading-tight">Sent to Xactimate.</h1>
      <p className="text-stone-500 mt-4 text-[15px] max-w-md mx-auto">
        Claim <span className="font-mono-ui text-stone-700">{CLAIM.id}</span> is now in Summit Mutual's carrier review queue. Sarah Henderson will be notified.
      </p>

      {/* Time saved callout */}
      <div className="mt-10 bg-white border border-stone-200 rounded-2xl p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full blur-3xl opacity-60 -translate-y-20 translate-x-20" />
        <div className="relative">
          <div className="text-[11px] uppercase tracking-wider text-stone-500 font-medium">Time saved vs. manual baseline</div>
          <div className="font-display text-7xl text-stone-900 mt-2 tabular leading-none">
            2<span className="text-stone-400">.</span>5<span className="text-3xl text-stone-500 ml-2">hours</span>
          </div>
          <div className="grid grid-cols-3 gap-6 mt-8 pt-6 border-t border-stone-100">
            <div>
              <div className="text-[10px] uppercase tracking-wider text-stone-500">Manual baseline</div>
              <div className="text-[18px] text-stone-900 font-medium tabular mt-1">~3 hrs</div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-stone-500">Your time</div>
              <div className="text-[18px] text-stone-900 font-medium tabular mt-1">28 min</div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-emerald-700">Total estimate</div>
              <div className="text-[18px] text-emerald-700 font-semibold tabular mt-1">{fmt(totals.total)}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-10 flex items-center justify-center gap-3">
        <button onClick={onReset} className="bg-stone-900 hover:bg-stone-800 text-white px-6 py-3 rounded-lg text-[14px] font-medium flex items-center gap-2">
          Next claim in queue <ArrowRight className="w-4 h-4" />
        </button>
        <button className="text-[13px] text-stone-600 hover:text-stone-900 px-4 py-3">
          View submission
        </button>
      </div>
    </main>
  );
}

// ============ SUCCESS POPUP ============
function SuccessPopup({ totals, onClose, onBackToQueue, onTakeBreak }) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-[24px] shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 pb-4 text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-[#34C759]/10 flex items-center justify-center mb-4">
            <CheckCircle2 className="w-8 h-8 text-[#34C759]" strokeWidth={2} />
          </div>
          <h2 className="text-[24px] font-semibold text-[#1D1D1F] mb-2">Successfully Submitted!</h2>
          <p className="text-[15px] text-[#86868B] leading-relaxed">
            Claim {CLAIM.id} has been sent to Xactimate and is now in Summit Mutual's review queue.
          </p>
        </div>

        {/* Claim Summary */}
        <div className="px-6 pb-4">
          <div className="bg-[#F5F5F7] rounded-[16px] p-4 mb-4">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-[11px] uppercase tracking-wider text-[#86868B] font-medium">Total Estimate</div>
                <div className="text-[24px] font-semibold text-[#1D1D1F] mt-1">{fmt(totals.total)}</div>
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-wider text-[#86868B] font-medium">Line Items</div>
                <div className="text-[24px] font-semibold text-[#1D1D1F] mt-1">{totals.count}</div>
              </div>
            </div>
          </div>

          {/* Time Savings */}
          <div className="bg-gradient-to-r from-[#0071E3]/5 to-[#34C759]/5 rounded-[16px] p-4 mb-6">
            <div className="text-center mb-3">
              <div className="text-[11px] uppercase tracking-wider text-[#86868B] font-medium">Time Saved vs Manual</div>
              <div className="text-[32px] font-semibold text-[#0071E3] leading-none mt-1">
                2.5<span className="text-[16px] text-[#86868B] ml-1">hours</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-3 border-t border-black/5">
              <div className="text-center">
                <div className="text-[10px] uppercase tracking-wider text-[#86868B]">Manual Baseline</div>
                <div className="text-[16px] font-medium text-[#1D1D1F] mt-1">~3.0 hrs</div>
              </div>
              <div className="text-center">
                <div className="text-[10px] uppercase tracking-wider text-[#86868B]">Your Time</div>
                <div className="text-[16px] font-medium text-[#34C759] mt-1">28 min</div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 pb-6 space-y-3">
          <button
            onClick={onBackToQueue}
            className="w-full bg-[#0071E3] hover:brightness-110 text-white px-6 py-4 rounded-[12px] text-[16px] font-semibold flex items-center justify-center gap-3 transition-all"
          >
            Back to Claims Queue
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={onTakeBreak}
            className="w-full bg-gradient-to-r from-[#34C759] to-[#30B64F] hover:brightness-110 text-white px-6 py-3 rounded-[12px] text-[15px] font-semibold flex items-center justify-center gap-3 transition-all"
          >
            🎮 Take a Break
          </button>
          <button
            onClick={onClose}
            className="w-full bg-[#F5F5F7] hover:bg-[#EBEBF0] text-[#1D1D1F] px-6 py-3 rounded-[12px] text-[15px] font-medium transition-all"
          >
            Stay on Final Review
          </button>
        </div>
      </div>
    </div>
  );
}

// ============ SEVERANCE GAME ============
function SeveranceGame({ onClose }) {
  const [numbers, setNumbers] = useState([]);
  const [currentQuota, setCurrentQuota] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);

  // Generate numbers for the sorting game
  const generateNumbers = () => {
    const newNumbers = [];
    for (let i = 0; i < 10; i++) {
      newNumbers.push({
        id: i,
        value: Math.floor(Math.random() * 100).toString().padStart(2, '0'),
        isSorted: false
      });
    }
    setNumbers(newNumbers);
  };

  // Start the game
  const startGame = () => {
    setGameStarted(true);
    setCurrentQuota(0);
    generateNumbers();
  };

  // Handle number sorting
  const sortNumber = (id) => {
    setNumbers(prev => prev.map(num =>
      num.id === id ? { ...num, isSorted: true } : num
    ));
    setCurrentQuota(prev => prev + 1);

    // Replace sorted number with new one after delay
    setTimeout(() => {
      setNumbers(prev => prev.map(num =>
        num.id === id ? {
          ...num,
          value: Math.floor(Math.random() * 100).toString().padStart(2, '0'),
          isSorted: false
        } : num
      ));
    }, 500);
  };

  return (
    <div className="fixed inset-0 bg-[#003D2F] z-50 font-mono">
      <div className="h-full flex flex-col">
        {/* Top Border */}
        <div className="h-2 bg-[#00A86B]"></div>

        {!gameStarted ? (
          /* Welcome Screen */
          <div className="flex-1 flex items-center justify-center bg-[#003D2F]">
            <div className="text-center max-w-2xl px-8">
              <div className="text-[#00A86B] text-6xl font-bold mb-8 tracking-wider">
                MACRODATA REFINEMENT
              </div>
              <div className="text-[#00A86B] text-xl mb-8 leading-relaxed">
                Please sort the data below according to your employee handbook.
              </div>
              <div className="text-[#00A86B] text-lg mb-12">
                Remember: All numbers are beautiful and deserve care.
              </div>
              <button
                onClick={startGame}
                className="bg-[#00A86B] hover:bg-[#00B86F] text-[#003D2F] px-12 py-4 text-2xl font-bold tracking-wider transition-colors"
              >
                BEGIN
              </button>
              <div className="mt-8">
                <button
                  onClick={onClose}
                  className="text-[#00A86B] hover:text-[#00B86F] text-lg underline transition-colors"
                >
                  EXIT TO WORK
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Game Screen */
          <div className="flex-1 bg-[#003D2F] p-8">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
              <div className="text-[#00A86B] text-2xl font-bold">
                MDR - QUOTA: {currentQuota}
              </div>
              <button
                onClick={onClose}
                className="text-[#00A86B] hover:text-[#00B86F] text-lg underline transition-colors"
              >
                EXIT TO WORK
              </button>
            </div>

            {/* Instructions */}
            <div className="text-[#00A86B] text-xl mb-8 text-center">
              Select the data below to sort it into the appropriate file.
            </div>

            {/* Data Grid */}
            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-5 gap-6 mb-12">
                {numbers.map(num => (
                  <button
                    key={num.id}
                    onClick={() => !num.isSorted && sortNumber(num.id)}
                    className={`aspect-square border-2 text-4xl font-bold transition-all duration-300 ${
                      num.isSorted
                        ? 'border-[#00A86B] bg-[#00A86B] text-[#003D2F] scale-95 opacity-50'
                        : 'border-[#00A86B] text-[#00A86B] hover:bg-[#00A86B] hover:text-[#003D2F] hover:scale-105'
                    }`}
                    disabled={num.isSorted}
                  >
                    {num.value}
                  </button>
                ))}
              </div>

              {/* Bottom Text */}
              <div className="text-[#00A86B] text-lg text-center">
                Thank you for your service to Lumon Industries.
              </div>
            </div>
          </div>
        )}

        {/* Bottom Border */}
        <div className="h-2 bg-[#00A86B]"></div>
      </div>
    </div>
  );
}
