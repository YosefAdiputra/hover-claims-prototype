import React, { useState, useMemo, useEffect } from 'react';
import {
  Search, ChevronRight, ChevronDown, Camera, Box, Ruler, FileText,
  CheckCircle2, AlertTriangle, Sparkles, ArrowRight, ArrowLeft,
  Edit3, Check, X, Shield, Home, Layers, MapPin, Calendar, User,
  Zap, Eye, MoreHorizontal, Send, Clock, FileCheck, Maximize2, Info,
  Hexagon, Activity, TrendingUp, TrendingDown, Building2, CloudHail, Wind, Droplets,
  Brain, HardHat
} from 'lucide-react';
import House3D from './House3D';
import House3DAdvanced from './House3DAdvanced';

// ============ MOCK DATA ============
const CLAIM = {
  id: 'CLM-2026-04812',
  policyholder: 'Sarah Henderson',
  address: '2847 Pacific Avenue',
  city: 'San Francisco, CA 94115',
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
  { id: 1, category: 'Roof', code: 'RFG 240', description: 'Remove laminated comp. shingle roofing — w/ felt', qty: 24.5, unit: 'SQ', unitPrice: 72.40, materialCost: 18.60, laborCost: 53.80, confidence: 96, status: 'pending',
    evidence: ['North slope — hail impact overview', 'North slope — strike density detail', 'East slope — impact pattern', 'East slope — granule loss close-up', 'Ridge line — bruising detail', 'Southeast corner — damage extent'],
    explanation: 'Recommended removal of existing shingles on north and east slopes based on 6 photos showing hail bruising at >8 strikes per 100 sq ft, which exceeds Summit Mutual\'s repair-vs-replace threshold. 3D model measurements confirm 24.5 squares of affected area.',
    comparables: 12, inspectorNote: 'Severe granule loss across north and east slopes. Multiple hail bruises visible on ridge.' },
  { id: 2, category: 'Roof', code: 'RFG 220', description: 'Laminated comp. shingle roofing — w/ felt', qty: 24.5, unit: 'SQ', unitPrice: 385.15, materialCost: 185.20, laborCost: 199.95, confidence: 96, status: 'pending',
    evidence: ['North slope — replacement area', 'East slope — replacement area', 'Material spec reference', '3D measurement overlay'],
    explanation: 'Replacement quantity matched to removal scope. Material grade (30-year architectural) selected to match existing based on inspector note and Summit Mutual\'s like-kind-and-quality guideline.',
    comparables: 12, inspectorNote: 'Existing material: 30-year architectural laminated.' },
  { id: 3, category: 'Roof', code: 'RFG DRIP', description: 'R&R Drip edge', qty: 142, unit: 'LF', unitPrice: 4.12, materialCost: 1.85, laborCost: 2.27, confidence: 93, status: 'pending',
    evidence: ['Eave line north', 'Eave line east', 'Rake edge detail'],
    explanation: 'Drip edge replacement required when shingles are removed per carrier guideline. Linear footage calculated from 3D model perimeter of affected slopes.',
    comparables: 18, inspectorNote: 'Drip edge bent at multiple points along north eave.' },
  { id: 4, category: 'Roof', code: 'RFG IWS', description: 'Ice & water shield', qty: 320, unit: 'SF', unitPrice: 2.18, materialCost: 1.25, laborCost: 0.93, confidence: 91, status: 'pending',
    evidence: ['Eave detail — existing underlayment', '3D eave measurement'],
    explanation: 'Required at eaves per IRC code for this climate zone. Quantity based on 3 ft from eave edge across affected slope length.',
    comparables: 15, inspectorNote: 'Existing ice & water shield appears intact but recommend replacement with new underlayment.' },
  { id: 5, category: 'Roof', code: 'RFG RIDGE', description: 'R&R Ridge cap — composition shingles', qty: 52, unit: 'LF', unitPrice: 8.96, materialCost: 3.45, laborCost: 5.51, confidence: 94, status: 'pending',
    evidence: ['Ridge line full view', 'Ridge cap damage detail'],
    explanation: 'Ridge cap replacement required with full shingle replacement. Linear footage matches 3D model ridge measurement.',
    comparables: 12, inspectorNote: 'Ridge cap showing significant hail bruising.' },
  { id: 6, category: 'Roof', code: 'RFG FLASH', description: 'R&R Flashing — pipe jack', qty: 3, unit: 'EA', unitPrice: 48.30, materialCost: 12.80, laborCost: 35.50, confidence: 89, status: 'pending',
    evidence: ['Pipe jack 1 — north slope', 'Pipe jack 2 — rear', 'Pipe jack 3 — east'],
    explanation: '3 pipe jacks identified in inspection photos on affected slopes. Standard practice to replace during full re-roof.',
    comparables: 20, inspectorNote: 'All three pipe jack flashings show impact damage and require replacement.' },
  { id: 7, category: 'Roof', code: 'RFG FELT', description: 'Roofing felt — 15 lb', qty: 24.5, unit: 'SQ', unitPrice: 34.20, materialCost: 22.80, laborCost: 11.40, confidence: 95, status: 'pending',
    evidence: ['Underlayment reference'],
    explanation: 'Felt underlayment quantity matches shingle replacement area.',
    comparables: 22, inspectorNote: 'Existing felt underlayment exposed in damaged areas shows weathering.' },

  // GUTTERS
  { id: 8, category: 'Gutters', code: 'GUT 5IN', description: 'R&R Gutter — aluminum, 5"', qty: null, unit: 'LF', unitPrice: 9.85, materialCost: 4.20, laborCost: 5.65, confidence: 58, status: 'needs_review',
    evidence: ['Gutter north — possible damage', 'Gutter east — possible damage'],
    explanation: 'AI detected possible hail damage in 2 photos but could not determine extent. Inspector\'s checklist did not include gutter measurements.',
    comparables: 8, inspectorNote: 'Gutter system pulling away from roofline with visible hail dents along north section.' },
  { id: 9, category: 'Gutters', code: 'GUT DS', description: 'R&R Downspout — aluminum', qty: 24, unit: 'LF', unitPrice: 8.40, materialCost: 3.65, laborCost: 4.75, confidence: 87, status: 'pending',
    evidence: ['Downspout north', 'Downspout east'],
    explanation: 'Two downspouts visible with dent damage consistent with hail impact.',
    comparables: 14, inspectorNote: 'Dents visible on both north-facing downspouts.' },

  // FASCIA
  { id: 10, category: 'Fascia', code: 'FCA 1X6', description: 'R&R Fascia board — 1"x6"', qty: 36, unit: 'LF', unitPrice: 6.80, materialCost: 2.85, laborCost: 3.95, confidence: 74, status: 'pending',
    evidence: ['Fascia damage north', 'Fascia damage east'],
    explanation: 'Partial fascia damage identified on north eave. Quantity estimated from visible damage zone in photos; measurement not captured by inspector.',
    comparables: 6, inspectorNote: 'Hail damage to fascia board with splintering along north eave edge.' },
  { id: 11, category: 'Fascia', code: 'PNT FCA', description: 'Paint fascia — 1 coat', qty: 36, unit: 'LF', unitPrice: 2.10, materialCost: 0.65, laborCost: 1.45, confidence: 74, status: 'pending',
    evidence: ['Fascia reference'],
    explanation: 'Paint applied to match fascia replacement quantity.',
    comparables: 6, inspectorNote: 'Paint chipping and damage corresponds to fascia board replacement area.' },

  // SIDING
  { id: 12, category: 'Siding', code: 'SDG VNL', description: 'R&R Siding — vinyl, detached', qty: 48, unit: 'SF', unitPrice: 6.25, materialCost: 2.80, laborCost: 3.45, confidence: 81, status: 'pending',
    evidence: ['North elevation — siding', 'East elevation — impact'],
    explanation: 'Localized siding damage on north elevation from hail impact. 4 damaged panels identified across ~48 SF.',
    comparables: 9, inspectorNote: 'Cracking visible on lower north elevation panels.' },
  { id: 13, category: 'Siding', code: 'PNT EXT', description: 'Paint exterior — spot repair', qty: 48, unit: 'SF', unitPrice: 1.85, materialCost: 0.55, laborCost: 1.30, confidence: 81, status: 'pending',
    evidence: ['Siding reference'],
    explanation: 'Spot paint matched to siding replacement area.',
    comparables: 9, inspectorNote: 'Primer and topcoat needed to match existing siding color after panel replacement.' },
];

const DASHBOARD_CLAIMS = [
  { id: 'CLM-2026-04812', address: '2847 Pacific Ave', city: 'San Francisco, CA', loss: 'Hail', date: 'Apr 6', status: 'draft_ready', confidence: 94, total: 18420, clickable: true,
    image: 'https://photos.zillowstatic.com/fp/063e61c4d756c4b0b0b93d8701023db3-cc_ft_1536.webp' },
  { id: 'CLM-2026-04807', address: '1456 Haight St', city: 'San Francisco, CA', loss: 'Wind', date: 'Apr 6', status: 'draft_ready', confidence: 91, total: 12840,
    image: 'https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?w=400&h=300&fit=crop' },
  { id: 'CLM-2026-04803', address: '345 University Ave', city: 'Palo Alto, CA', loss: 'Hail', date: 'Apr 5', status: 'needs_review', confidence: 72, total: 24100,
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&h=300&fit=crop' },
  { id: 'CLM-2026-04801', address: '892 Castro St', city: 'Mountain View, CA', loss: 'Water', date: 'Apr 5', status: 'processing', confidence: null, total: null,
    image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=300&fit=crop' },
  { id: 'CLM-2026-04795', address: '2156 Shattuck Ave', city: 'Berkeley, CA', loss: 'Hail', date: 'Apr 4', status: 'draft_ready', confidence: 97, total: 8420,
    image: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=400&h=300&fit=crop' },
  { id: 'CLM-2026-04790', address: '789 Broadway', city: 'Oakland, CA', loss: 'Wind', date: 'Apr 4', status: 'manual', confidence: null, total: null,
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
        @keyframes slideUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      <TopNav screen={screen} setScreen={setScreen} totals={totals} showGame={showGame} setShowGame={setShowGame} />

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
          setScreen={setScreen}
          onBack={() => setScreen('review')}
          onSubmit={() => setShowSuccessPopup(true)}
        />
      )}
      {screen === 'confirmation' && <Confirmation onReset={() => { setScreen('dashboard'); setLineItems(INITIAL_LINE_ITEMS); setAttested(false); }} totals={totals} />}
      {screen === 'negotiation' && <ContractorNegotiationScreen lineItems={lineItems} setLineItems={setLineItems} totals={totals} onBack={() => setScreen('approve')} onSubmit={() => setScreen('confirmation')} />}

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
function TopNav({ screen, showGame, setShowGame }) {
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
          {/* Hover Logo - official branding */}
          <div className="flex items-center gap-3">
            <img
              src="https://23226235.fs1.hubspotusercontent-na1.net/hubfs/23226235/web/images/branding/hover.to-social-image.jpg"
              alt="Hover"
              className="h-14 md:h-16 w-auto object-contain"
              onError={(e) => {
                // Fallback to text + icon if image fails
                e.target.style.display = 'none';
                e.target.parentElement.innerHTML = `
                  <div class="flex items-center gap-2.5">
                    <div class="w-7 h-7 md:w-8 md:h-8 bg-black rounded-lg flex items-center justify-center">
                      <svg class="w-4 h-4 md:w-5 md:h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polygon points="12 2 2 7 2 17 12 22 22 17 22 7 12 2"></polygon>
                      </svg>
                    </div>
                    <div class="text-xl md:text-2xl font-bold text-gray-900 tracking-tight">Hover</div>
                  </div>
                `;
              }}
            />
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

          {/* Take a Break button */}
          <button
            onClick={() => setShowGame(true)}
            className="hidden md:flex items-center gap-2 px-3 py-2 text-[13px] text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors touch-manipulation"
          >
            <Activity className="w-4 h-4" />
            Take a break
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
            <span className="text-[11px] md:text-[12px] text-gray-500">Thursday, April 16, 2026</span>
          </div>
          <h1 className="font-display text-[2.025rem] md:text-[3.375rem] text-gray-900 leading-tight tracking-tight">Good morning, Yosef.</h1>
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
              <div className="text-[12px] uppercase tracking-wider text-[#86868B] font-medium mb-2">Total Repair Estimate</div>
              <div className="text-[48px] font-semibold text-[#1D1D1F] leading-none tracking-tight mb-1">{fmt(totals.total)}</div>
              <div className="text-[14px] text-[#86868B] mb-3">Including materials + local San Francisco, CA labor</div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 rounded-full text-blue-600 font-medium text-[13px] mb-2">
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                94% Confident
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
  const [filter, setFilter] = useState('all'); // all, needs_review, low_confidence, resolved
  const [sortBy, setSortBy] = useState('category'); // category, confidence, status, price

  const filteredAndSorted = useMemo(() => {
    let items = [...lineItems];

    // Apply filters
    if (filter === 'needs_review') {
      items = items.filter(i => i.status === 'needs_review');
    } else if (filter === 'low_confidence') {
      items = items.filter(i => i.confidence && i.confidence < 80);
    } else if (filter === 'resolved') {
      items = items.filter(i => i.status === 'approved');
    }

    // Apply sorting
    items.sort((a, b) => {
      if (sortBy === 'confidence') {
        return (b.confidence || 0) - (a.confidence || 0);
      } else if (sortBy === 'status') {
        const statusOrder = { 'needs_review': 0, 'manual': 1, 'approved': 2, 'rejected': 3 };
        return (statusOrder[a.status] || 4) - (statusOrder[b.status] || 4);
      } else if (sortBy === 'price') {
        return (b.total || 0) - (a.total || 0);
      }
      // Default: category
      return a.category.localeCompare(b.category);
    });

    return items;
  }, [lineItems, filter, sortBy]);

  const grouped = useMemo(() => {
    const g = {};
    filteredAndSorted.forEach(i => {
      if (!g[i.category]) g[i.category] = [];
      g[i.category].push(i);
    });
    return g;
  }, [filteredAndSorted]);

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
                <div className="text-[9px] text-stone-400 mt-0.5">incl. labor & materials</div>
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
            <div className="flex items-center justify-between mb-3">
              <div className="text-[11px] uppercase tracking-wider text-stone-500 font-medium">Scope Line Items</div>
              <div className="text-[10px] text-stone-400 tabular">{filteredAndSorted.length} of {lineItems.length}</div>
            </div>

            {/* Filter pills */}
            <div className="flex gap-1.5 mb-3 overflow-x-auto scrollbar-hide">
              {[
                { id: 'all', label: 'All', count: lineItems.length },
                { id: 'needs_review', label: 'Review', count: lineItems.filter(i => i.status === 'needs_review').length },
                { id: 'low_confidence', label: 'Low Conf', count: lineItems.filter(i => i.confidence && i.confidence < 80).length },
                { id: 'resolved', label: 'Resolved', count: lineItems.filter(i => i.status === 'approved').length }
              ].map(filterOption => (
                <button
                  key={filterOption.id}
                  onClick={() => setFilter(filterOption.id)}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-full text-[10px] font-medium transition-all ${
                    filter === filterOption.id
                      ? filterOption.id === 'needs_review'
                        ? 'bg-amber-500 text-white shadow-sm'
                        : filterOption.id === 'low_confidence'
                        ? 'bg-red-500 text-white shadow-sm'
                        : filterOption.id === 'resolved'
                        ? 'bg-emerald-500 text-white shadow-sm'
                        : 'bg-stone-800 text-white shadow-sm'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  {filterOption.label} {filterOption.count > 0 && `(${filterOption.count})`}
                </button>
              ))}
            </div>

            {/* Sort dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-stone-500 font-medium">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-[10px] bg-white border border-stone-200 rounded px-2 py-1 text-stone-700 focus:outline-none focus:ring-1 focus:ring-stone-400"
              >
                <option value="category">Category</option>
                <option value="confidence">Confidence</option>
                <option value="status">Status</option>
                <option value="price">Price</option>
              </select>
            </div>
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
            <div className="flex items-center gap-2">
              <div className="text-[11px] text-stone-500 tabular">
                {item.qty != null ? (
                  <>{item.qty} {item.unit} · <span className="font-mono-ui">{item.code}</span></>
                ) : (
                  <span className="text-amber-700 font-medium">Qty pending</span>
                )}
              </div>
              {/* Confidence indicator */}
              {item.confidence && (
                <div className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                  item.confidence >= 90 ? 'text-emerald-700 bg-emerald-50' :
                  item.confidence >= 80 ? 'text-blue-700 bg-blue-50' :
                  item.confidence >= 70 ? 'text-amber-700 bg-amber-50' :
                  'text-red-700 bg-red-50'
                }`}>
                  {item.confidence}%
                </div>
              )}
            </div>
            <div className="text-[12px] text-stone-900 font-medium tabular">
              {item.qty != null ? fmt(item.qty * item.unitPrice) : '—'}
            </div>
            {item.qty != null && (
              <div className="text-[10px] text-stone-400 mt-0.5">incl. labor</div>
            )}
          </div>

          {/* Status indicators */}
          <div className="mt-2 flex items-center gap-1.5 flex-wrap">
            {isException && (
              <div className="flex items-center gap-1 text-[10px] text-amber-700 bg-amber-50 border border-amber-200 rounded px-1.5 py-0.5">
                <AlertTriangle className="w-2.5 h-2.5" /> Needs review
              </div>
            )}
            {item.edited && (
              <div className="flex items-center gap-1 text-[10px] text-stone-600 bg-stone-100 rounded px-1.5 py-0.5">
                <Edit3 className="w-2.5 h-2.5" /> Edited
              </div>
            )}
            {item.confidence && item.confidence < 80 && !isException && (
              <div className="flex items-center gap-1 text-[10px] text-red-700 bg-red-50 border border-red-200 rounded px-1.5 py-0.5">
                <TrendingDown className="w-2.5 h-2.5" /> Low confidence
              </div>
            )}
            {isApproved && (
              <div className="flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 rounded px-1.5 py-0.5">
                <CheckCircle2 className="w-2.5 h-2.5" /> Resolved
              </div>
            )}
          </div>
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
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide -mx-6 px-6 md:mx-0 md:px-0">
          <div className="flex items-center gap-1 min-w-max">
            {tabs.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-1.5 px-3 py-2 text-[12px] font-medium border-b-2 -mb-px transition-colors whitespace-nowrap ${tab === t.id ? 'border-stone-900 text-stone-900' : 'border-transparent text-stone-500 hover:text-stone-900'}`}
              >
                <t.icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{t.label}</span>
                <span className="sm:hidden">{t.label.split(' ')[0]}</span>
                {t.count != null && <span className="text-stone-400 tabular">({t.count})</span>}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="p-6">
        {tab === 'photos' && <PhotosView item={item} onExpand={onExpand} />}
        {tab === '3d' && <House3DAdvanced />}
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
    'https://media.istockphoto.com/id/1331204626/photo/roof-with-hail-damage-and-markings-from-inspection.jpg?s=1024x1024&w=is&k=20&c=XoUshW3oD6yUapSIK31_frX_tA1KHJhwNNF3pyewg0M=', // Insurance adjuster marking hail damage
    'https://media.istockphoto.com/id/1974119513/photo/roof-with-hail-damage-and-markings-from-inspection.jpg?s=1024x1024&w=is&k=20&c=i3nh1s_aMxsEkNp_PDCL81wVp7u-MyQuvnRN83-eXFc=', // Same image - different angle view
    'https://media.istockphoto.com/id/2041202984/photo/roof-with-hail-damage-and-markings-from-inspection.jpg?s=1024x1024&w=is&k=20&c=IwGWJnbOnGLGmtvjciCdph3p3nvNtgaSwJWxeoIV0fk=', // Same image - close-up view
    'https://media.istockphoto.com/id/2259570761/photo/residential-roof-inspection-due-to-insurance-claim-for-storm-damage-the-three-tab-asphalt.jpg?s=1024x1024&w=is&k=20&c=W42XAFfEvSVemt5AfUgbBvoYGAXTNdxwWojviFUMDPQ=', // Same image - overview
    'https://media.istockphoto.com/id/1331204626/photo/roof-with-hail-damage-and-markings-from-inspection.jpg?s=1024x1024&w=is&k=20&c=XoUshW3oD6yUapSIK31_frX_tA1KHJhwNNF3pyewg0M=', // Same image - detail view
    'https://media.istockphoto.com/id/1331204626/photo/roof-with-hail-damage-and-markings-from-inspection.jpg?s=1024x1024&w=is&k=20&c=XoUshW3oD6yUapSIK31_frX_tA1KHJhwNNF3pyewg0M=', // Same image - wide view
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
  const [rotationY, setRotationY] = React.useState(-30);
  const [rotationX, setRotationX] = React.useState(25);
  const [isDragging, setIsDragging] = React.useState(false);
  const [startPos, setStartPos] = React.useState({ x: 0, y: 0 });
  const [hoveredDamage, setHoveredDamage] = React.useState(null);
  const [pulseAnimation, setPulseAnimation] = React.useState(true);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setPulseAnimation(false);
    setStartPos({
      x: e.clientX - rotationY,
      y: e.clientY - rotationX
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const newRotationY = e.clientX - startPos.x;
    const newRotationX = Math.max(-45, Math.min(45, e.clientY - startPos.y));
    setRotationY(newRotationY);
    setRotationX(newRotationX);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, startPos]);

  return (
    <div className="bg-white rounded-lg border border-stone-200 p-6">
      <div className="text-center mb-4">
        <div className="text-[11px] uppercase tracking-wider text-stone-500 font-medium mb-1">3D Digital Twin</div>
        <div className="text-[13px] text-stone-900">Drag to rotate • Hover damage markers for details</div>
      </div>

      {/* Futuristic Holographic 3D House */}
      <div
        className="relative flex justify-center rounded-2xl p-8 cursor-grab active:cursor-grabbing select-none"
        onMouseDown={handleMouseDown}
        style={{
          userSelect: 'none',
          minHeight: '450px',
          background: 'radial-gradient(ellipse at center, #0f172a 0%, #1e293b 50%, #334155 100%)',
          position: 'relative'
        }}>

        {/* Grid floor effect */}
        <div className="absolute inset-0 opacity-20">
          <svg className="w-full h-full">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#10b981" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* 3D Scene Container */}
        <div className="relative z-10" style={{
          transform: `perspective(1500px) rotateX(${rotationX}deg) rotateY(${rotationY}deg)`,
          transition: isDragging ? 'none' : 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          transformStyle: 'preserve-3d',
          width: '450px',
          height: '350px'
        }}>

        {/* Futuristic Geometric House SVG */}
        <svg viewBox="0 0 900 700" className="absolute inset-0 w-full h-full">
          <defs>
            {/* Holographic gradients */}
            <linearGradient id="holoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.8"/>
              <stop offset="33%" stopColor="#06b6d4" stopOpacity="0.6"/>
              <stop offset="66%" stopColor="#8b5cf6" stopOpacity="0.7"/>
              <stop offset="100%" stopColor="#ec4899" stopOpacity="0.8"/>
            </linearGradient>

            <linearGradient id="glassWall" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.1"/>
              <stop offset="50%" stopColor="#10b981" stopOpacity="0.05"/>
              <stop offset="100%" stopColor="#064e3b" stopOpacity="0.2"/>
            </linearGradient>

            <linearGradient id="neonGlow" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="1"/>
              <stop offset="50%" stopColor="#34d399" stopOpacity="0.8"/>
              <stop offset="100%" stopColor="#10b981" stopOpacity="1"/>
            </linearGradient>

            {/* Damage pulse effect */}
            <radialGradient id="damagePulse">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.9"/>
              <stop offset="50%" stopColor="#f87171" stopOpacity="0.5"/>
              <stop offset="100%" stopColor="#fca5a5" stopOpacity="0.1"/>
            </radialGradient>

            {/* Glow filter */}
            <filter id="glow">
              <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* Floating platform */}
          <ellipse cx="450" cy="500" rx="200" ry="40" fill="#10b981" opacity="0.1"/>
          <ellipse cx="450" cy="500" rx="180" ry="35" fill="none" stroke="#10b981" strokeWidth="1" opacity="0.3"/>

          {/* 3D House Structure - Holographic Style */}
          <g filter="url(#glow)">
            {/* House Foundation/Base */}
            <path d="M 250 420 L 250 380 L 450 340 L 650 380 L 650 420 L 450 460 Z"
                  fill="url(#glassWall)" stroke="#10b981" strokeWidth="1.5" opacity="0.4"/>

            {/* Front Wall */}
            <path d="M 250 380 L 250 280 L 450 240 L 450 340 Z"
                  fill="url(#glassWall)" stroke="#10b981" strokeWidth="2" opacity="0.6"/>

            {/* Right Wall */}
            <path d="M 450 240 L 650 280 L 650 380 L 450 340 Z"
                  fill="url(#glassWall)" stroke="#06b6d4" strokeWidth="2" opacity="0.5"/>

            {/* Front Door */}
            <rect x="330" y="320" width="40" height="60" fill="none" stroke="#10b981" strokeWidth="1.5" opacity="0.8"/>
            <rect x="335" y="325" width="30" height="50" fill="url(#glassDoor)" opacity="0.6"/>

            {/* Front Windows */}
            <g opacity="0.8">
              <rect x="270" y="300" width="35" height="35" fill="url(#glassDoor)" stroke="#10b981" strokeWidth="1"/>
              <rect x="395" y="300" width="35" height="35" fill="url(#glassDoor)" stroke="#10b981" strokeWidth="1"/>
            </g>

            {/* Side Windows */}
            <g opacity="0.7">
              <path d="M 480 270 L 520 275 L 520 310 L 480 305 Z" fill="url(#glassDoor)" stroke="#06b6d4" strokeWidth="1"/>
              <path d="M 560 280 L 600 285 L 600 320 L 560 315 Z" fill="url(#glassDoor)" stroke="#06b6d4" strokeWidth="1"/>
            </g>

            {/* Garage Door */}
            <path d="M 520 335 L 620 350 L 620 380 L 520 365 Z"
                  fill="none" stroke="#06b6d4" strokeWidth="1.5" opacity="0.7"/>
            <path d="M 525 340 L 615 354 L 615 375 L 525 361 Z"
                  fill="url(#glassWall)" opacity="0.3"/>

            {/* Main Roof - Traditional pitched shape */}
            <path d="M 230 280 L 450 180 L 670 280 L 450 240 Z"
                  fill="url(#glassWall)" stroke="url(#holoGradient)" strokeWidth="2" opacity="0.7"/>

            {/* Roof Ridge */}
            <line x1="450" y1="180" x2="450" y2="240" stroke="#10b981" strokeWidth="2" opacity="0.8"/>

            {/* Roof Side Faces */}
            <path d="M 230 280 L 450 180 L 450 240 L 250 280 Z"
                  fill="#10b981" opacity="0.15"/>
            <path d="M 450 180 L 670 280 L 450 240 Z"
                  fill="#06b6d4" opacity="0.15"/>

            {/* Chimney */}
            <g opacity="0.7">
              <rect x="550" y="200" width="25" height="50" fill="url(#glassWall)" stroke="#8b5cf6" strokeWidth="1.5"/>
              <rect x="548" y="195" width="29" height="8" fill="#8b5cf6" opacity="0.5"/>
            </g>

            {/* Holographic Details */}
            <g opacity="0.6">
              {/* Energy field lines */}
              <line x1="250" y1="280" x2="250" y2="380" stroke="#10b981" strokeWidth="0.5">
                <animate attributeName="opacity" values="0.3;1;0.3" dur="3s" repeatCount="indefinite"/>
              </line>
              <line x1="450" y1="240" x2="450" y2="340" stroke="#10b981" strokeWidth="0.5">
                <animate attributeName="opacity" values="0.3;1;0.3" dur="3s" repeatCount="indefinite" begin="1s"/>
              </line>
              <line x1="650" y1="280" x2="650" y2="380" stroke="#06b6d4" strokeWidth="0.5">
                <animate attributeName="opacity" values="0.3;1;0.3" dur="3s" repeatCount="indefinite" begin="2s"/>
              </line>
            </g>
          </g>

          {/* Hail damage indicators - Positioned on roof */}
          {[
            {x: 340, y: 230, size: 10, severity: 'high'},
            {x: 450, y: 210, size: 8, severity: 'high'},
            {x: 560, y: 230, size: 9, severity: 'medium'},
            {x: 290, y: 260, size: 7, severity: 'high'},
            {x: 610, y: 260, size: 8, severity: 'medium'},
            {x: 380, y: 240, size: 6, severity: 'low'},
            {x: 520, y: 240, size: 9, severity: 'high'},
            {x: 450, y: 190, size: 10, severity: 'high'},
            {x: 400, y: 220, size: 7, severity: 'medium'},
            {x: 500, y: 220, size: 8, severity: 'high'},
          ].map((damage, i) => (
            <g key={i}
               className="damage-marker"
               onMouseEnter={() => setHoveredDamage(i)}
               onMouseLeave={() => setHoveredDamage(null)}
               style={{ cursor: 'pointer' }}>
              {/* Animated damage ring */}
              <circle
                cx={damage.x}
                cy={damage.y}
                r={damage.size + 5}
                fill="none"
                stroke={damage.severity === 'high' ? '#ef4444' : damage.severity === 'medium' ? '#f97316' : '#fbbf24'}
                strokeWidth="1"
                opacity={hoveredDamage === i ? 1 : 0.4}>
                {hoveredDamage === i && (
                  <animate attributeName="r" values={`${damage.size + 5};${damage.size + 10};${damage.size + 5}`} dur="1s" repeatCount="indefinite"/>
                )}
              </circle>

              {/* Damage core */}
              <circle
                cx={damage.x}
                cy={damage.y}
                r={damage.size}
                fill="url(#damagePulse)"
                opacity={hoveredDamage === i ? 1 : 0.7}>
                <animate attributeName="opacity" values="0.7;1;0.7" dur="2s" repeatCount="indefinite"/>
              </circle>

              {/* Center point */}
              <circle
                cx={damage.x}
                cy={damage.y}
                r="3"
                fill={damage.severity === 'high' ? '#dc2626' : damage.severity === 'medium' ? '#ea580c' : '#f59e0b'}
              />
            </g>
          ))}

          {/* Holographic measurements */}
          <g opacity={hoveredDamage === null ? 1 : 0.3}>
            {/* Connection lines */}
            <line x1="300" y1="350" x2="280" y2="550" stroke="#10b981" strokeWidth="1" opacity="0.5"/>
            <line x1="600" y1="350" x2="620" y2="550" stroke="#10b981" strokeWidth="1" opacity="0.5"/>

            {/* Measurement displays */}
            <g transform="translate(280, 550)">
              <rect x="-40" y="-15" width="80" height="30" fill="#0f172a" stroke="#10b981" strokeWidth="1" rx="4" opacity="0.9"/>
              <text x="0" y="5" fontSize="12" fill="#10b981" textAnchor="middle" fontWeight="bold">13.1 SQ</text>
            </g>

            <g transform="translate(620, 550)">
              <rect x="-40" y="-15" width="80" height="30" fill="#0f172a" stroke="#10b981" strokeWidth="1" rx="4" opacity="0.9"/>
              <text x="0" y="5" fontSize="12" fill="#10b981" textAnchor="middle" fontWeight="bold">11.4 SQ</text>
            </g>

            {/* Total display */}
            <g transform="translate(450, 50)">
              <rect x="-60" y="-20" width="120" height="40" fill="#0f172a" stroke="url(#holoGradient)" strokeWidth="2" rx="6" opacity="0.95"/>
              <text x="0" y="-2" fontSize="10" fill="#6ee7b7" textAnchor="middle">TOTAL AFFECTED</text>
              <text x="0" y="12" fontSize="16" fill="#10b981" textAnchor="middle" fontWeight="bold">24.5 SQ</text>
            </g>
          </g>

          {/* Hover info panel */}
          {hoveredDamage !== null && (
            <g transform="translate(450, 600)">
              <rect x="-80" y="-30" width="160" height="60" fill="#0f172a" stroke="#10b981" strokeWidth="2" rx="8" opacity="0.95"/>
              <text x="0" y="-5" fontSize="12" fill="#10b981" textAnchor="middle" fontWeight="bold">
                DAMAGE POINT #{hoveredDamage + 1}
              </text>
              <text x="0" y="15" fontSize="10" fill="#6ee7b7" textAnchor="middle">
                Click for analysis
              </text>
            </g>
          )}
        </svg>
        </div>
      </div>

      {/* Interactive controls hint */}
      <div className="text-center mt-3">
        <p className="text-[10px] text-stone-400">
          <span className="inline-flex items-center gap-1.5">
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 9l7-7 7 7M5 15l7 7 7-7" />
            </svg>
            Click and drag to rotate model • Hover damage markers for details
          </span>
        </p>
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
  const [selectedView, setSelectedView] = useState('blueprint');

  return (
    <div className="space-y-4">
      {/* View Toggle */}
      <div className="flex gap-2 bg-stone-100 p-1 rounded-lg">
        <button
          onClick={() => setSelectedView('blueprint')}
          className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
            selectedView === 'blueprint' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          Architectural Drawing
        </button>
        <button
          onClick={() => setSelectedView('measurements')}
          className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
            selectedView === 'measurements' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          Measurements List
        </button>
      </div>

      {/* Blueprint View */}
      {selectedView === 'blueprint' && (
        <div className="bg-white rounded-lg border border-stone-200 p-6">
          <div className="text-[12px] text-stone-600 mb-4">Architectural roof plan with damage zones</div>
          <div className="relative bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-8" style={{ minHeight: '400px' }}>
            {/* SVG Blueprint */}
            <svg viewBox="0 0 800 600" className="w-full h-full">
              {/* Grid pattern */}
              <defs>
                <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#cbd5e1" strokeWidth="0.5" opacity="0.5"/>
                </pattern>
                <pattern id="hatch" width="10" height="10" patternUnits="userSpaceOnUse">
                  <path d="M0,10 L10,0 M-2,2 L2,-2 M8,12 L12,8" stroke="#ef4444" strokeWidth="1" opacity="0.3"/>
                </pattern>
              </defs>
              <rect width="800" height="600" fill="url(#grid)" />

              {/* Main roof outline */}
              <g transform="translate(400,300)">
                {/* North slope with damage hatching */}
                <path d="M -200,-100 L 0,-180 L 200,-100 L 200,0 L -200,0 Z"
                      fill="url(#hatch)" stroke="#1e40af" strokeWidth="2" strokeDasharray="5,3"/>
                <text x="-100" y="-50" className="fill-blue-900 text-sm font-medium">NORTH SLOPE</text>
                <text x="-100" y="-30" className="fill-blue-700 text-xs">1,312 sf (13.1 SQ)</text>
                <text x="-100" y="-10" className="fill-red-600 text-xs font-medium">DAMAGE ZONE</text>

                {/* East slope with damage hatching */}
                <path d="M 200,-100 L 200,100 L 120,150 L 0,100 L 0,-180 L 200,-100 Z"
                      fill="url(#hatch)" stroke="#1e40af" strokeWidth="2" strokeDasharray="5,3"/>
                <text x="80" y="30" className="fill-blue-900 text-sm font-medium">EAST SLOPE</text>
                <text x="80" y="50" className="fill-blue-700 text-xs">1,138 sf (11.4 SQ)</text>
                <text x="80" y="70" className="fill-red-600 text-xs font-medium">DAMAGE ZONE</text>

                {/* South slope (undamaged) */}
                <path d="M -200,0 L -200,100 L 0,180 L 200,100 L 200,0 Z"
                      fill="none" stroke="#64748b" strokeWidth="2"/>
                <text x="-50" y="120" className="fill-gray-600 text-sm">SOUTH SLOPE</text>
                <text x="-50" y="140" className="fill-gray-500 text-xs">No damage</text>

                {/* West slope (undamaged) */}
                <path d="M -200,-100 L -200,100 L -120,150 L 0,100 L 0,-180 Z"
                      fill="none" stroke="#64748b" strokeWidth="2"/>
                <text x="-150" y="30" className="fill-gray-600 text-sm">WEST SLOPE</text>
                <text x="-150" y="50" className="fill-gray-500 text-xs">No damage</text>

                {/* Ridge line */}
                <line x1="-200" y1="-100" x2="200" y2="-100" stroke="#dc2626" strokeWidth="3"/>
                <text x="-30" y="-110" className="fill-red-700 text-xs font-bold">RIDGE: 52 LF</text>

                {/* Eave measurements */}
                <g>
                  {/* North eave */}
                  <line x1="-200" y1="0" x2="200" y2="0" stroke="#059669" strokeWidth="2" strokeDasharray="2,2"/>
                  <text x="210" y="5" className="fill-green-700 text-xs">North Eave: 76 LF</text>

                  {/* East eave */}
                  <line x1="200" y1="-100" x2="200" y2="100" stroke="#059669" strokeWidth="2" strokeDasharray="2,2"/>
                  <text x="150" y="-120" className="fill-green-700 text-xs" transform="rotate(-90 150 -120)">East Eave: 66 LF</text>
                </g>

                {/* Damage markers */}
                {[
                  { x: -100, y: -60, label: 'D1' },
                  { x: -50, y: -40, label: 'D2' },
                  { x: 50, y: -50, label: 'D3' },
                  { x: 100, y: 20, label: 'D4' },
                  { x: 120, y: 60, label: 'D5' },
                  { x: -80, y: -30, label: 'D6' },
                  { x: 30, y: -70, label: 'D7' },
                  { x: 140, y: 10, label: 'D8' },
                ].map((d, i) => (
                  <g key={i}>
                    <circle cx={d.x} cy={d.y} r="8" fill="#ef4444" opacity="0.8"/>
                    <text x={d.x} y={d.y + 3} className="fill-white text-xs font-bold" textAnchor="middle">{d.label}</text>
                  </g>
                ))}

                {/* Compass */}
                <g transform="translate(280, -200)">
                  <circle cx="0" cy="0" r="25" fill="white" stroke="#374151" strokeWidth="2"/>
                  <path d="M 0,-20 L 5,-5 L 0,0 L -5,-5 Z" fill="#374151"/>
                  <text x="0" y="-25" className="fill-gray-700 text-sm font-bold" textAnchor="middle">N</text>
                </g>

                {/* Pitch indicator */}
                <g transform="translate(-280, -200)">
                  <rect x="-40" y="-15" width="80" height="30" fill="white" stroke="#374151" strokeWidth="1" rx="3"/>
                  <text x="0" y="-2" className="fill-gray-700 text-xs font-medium" textAnchor="middle">PITCH</text>
                  <text x="0" y="10" className="fill-gray-900 text-sm font-bold" textAnchor="middle">6/12</text>
                </g>
              </g>

              {/* Legend */}
              <g transform="translate(50, 520)">
                <rect x="0" y="0" width="200" height="60" fill="white" stroke="#cbd5e1" strokeWidth="1" rx="4" opacity="0.95"/>
                <text x="10" y="20" className="fill-gray-700 text-xs font-bold">LEGEND</text>
                <rect x="10" y="25" width="20" height="10" fill="url(#hatch)"/>
                <text x="35" y="33" className="fill-gray-600 text-xs">Hail damage area</text>
                <circle cx="20" cy="45" r="4" fill="#ef4444"/>
                <text x="35" y="48" className="fill-gray-600 text-xs">Damage point</text>
              </g>

              {/* Title block */}
              <g transform="translate(550, 520)">
                <rect x="0" y="0" width="200" height="60" fill="white" stroke="#cbd5e1" strokeWidth="1" rx="4" opacity="0.95"/>
                <text x="10" y="18" className="fill-gray-700 text-xs font-bold">ROOF DAMAGE ASSESSMENT</text>
                <text x="10" y="32" className="fill-gray-600 text-xs">2847 Pacific Avenue</text>
                <text x="10" y="44" className="fill-gray-600 text-xs">San Francisco, CA 94115</text>
                <text x="10" y="56" className="fill-gray-500 text-xs">Scale: 1" = 20'</text>
              </g>
            </svg>
          </div>
        </div>
      )}

      {/* Measurements List View */}
      {selectedView === 'measurements' && (
        <div className="bg-white rounded-lg border border-stone-200 p-6">
          <div className="text-[12px] text-stone-600 mb-4">Measurements extracted from Hover 3D digital twin</div>
          <div className="space-y-3">
            {[
              { label: 'North slope area', value: '1,312 sf (13.1 SQ)', status: 'damaged' },
              { label: 'East slope area', value: '1,138 sf (11.4 SQ)', status: 'damaged' },
              { label: 'South slope area', value: '1,086 sf (10.9 SQ)', status: 'undamaged' },
              { label: 'West slope area', value: '1,164 sf (11.6 SQ)', status: 'undamaged' },
              { label: 'Total roof area', value: '4,700 sf (47.0 SQ)', status: 'total' },
              { label: 'Total affected', value: '2,450 sf (24.5 SQ)', status: 'affected' },
              { label: 'Ridge length', value: '52 LF', status: 'measurement' },
              { label: 'North eave length', value: '76 LF', status: 'measurement' },
              { label: 'East eave length', value: '66 LF', status: 'measurement' },
              { label: 'South eave length', value: '76 LF', status: 'measurement' },
              { label: 'West eave length', value: '66 LF', status: 'measurement' },
              { label: 'Roof pitch', value: '6/12', status: 'specification' },
              { label: 'Roof height', value: '28.5 ft', status: 'specification' },
            ].map((m, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-stone-100 last:border-0">
                <div className="flex items-center gap-2">
                  <span className="text-[13px] text-stone-600">{m.label}</span>
                  {m.status === 'damaged' && (
                    <span className="px-1.5 py-0.5 bg-red-100 text-red-700 text-[10px] font-medium rounded">DAMAGED</span>
                  )}
                  {m.status === 'affected' && (
                    <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-medium rounded">AFFECTED</span>
                  )}
                </div>
                <span className="text-[13px] text-stone-900 font-medium tabular font-mono-ui">{m.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
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
  const [showPriceComparison, setShowPriceComparison] = useState(false);
  const [selectedRetailer, setSelectedRetailer] = useState('Ace Hardware');
  const [priceOverride, setPriceOverride] = useState(null);

  // Use priceOverride if set, otherwise use item's original price
  const currentPrice = priceOverride !== null ? priceOverride : item.unitPrice;

  const band = confBand(item.confidence);
  const colors = CONFIDENCE_COLORS[band];
  const isException = item.status === 'needs_review';
  const isApproved = item.status === 'approved';
  const lineTotal = item.qty != null ? item.qty * currentPrice : null;

  // Reset price override when item changes
  React.useEffect(() => {
    setPriceOverride(null);
    setSelectedRetailer('Ace Hardware');
  }, [item.id]);

  // Price comparison data for retailers
  const retailers = [
    {
      name: 'Ace Hardware',
      price: item.unitPrice,
      availability: 'In Stock',
      delivery: 'Same day delivery',
      sku: 'ACE-4821739',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/Ace_Hardware_Logo.svg/3840px-Ace_Hardware_Logo.svg.png',
      color: 'red'
    },
    {
      name: 'Home Depot',
      price: item.unitPrice * 1.08,
      availability: 'In Stock',
      delivery: '3-5 day delivery',
      sku: 'HD-1000692847',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/TheHomeDepot.svg/1920px-TheHomeDepot.svg.png',
      color: 'orange'
    },
    {
      name: 'Lowe\'s',
      price: item.unitPrice * 1.12,
      availability: 'In Stock',
      delivery: '2-4 day delivery',
      sku: 'LOW-5013098432',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Lowes_Companies_Logo.svg/3840px-Lowes_Companies_Logo.svg.png',
      color: 'blue'
    },
    {
      name: 'Tractor Supply',
      price: item.unitPrice * 1.15,
      availability: 'Limited',
      delivery: '5-7 day delivery',
      sku: 'TSC-20946813',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/86/TractorSupplyCompanylogo.svg/3840px-TractorSupplyCompanylogo.svg.png',
      color: 'gray'
    }
  ].sort((a, b) => a.price - b.price);

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
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1.5">
              <span className="text-stone-500">Unit price</span>
              <button
                onClick={() => setShowPriceComparison(!showPriceComparison)}
                className="group relative w-4 h-4 rounded-full bg-stone-100 hover:bg-stone-200 transition-colors flex items-center justify-center"
                aria-label="View price comparison"
              >
                <Info className="w-2.5 h-2.5 text-stone-500 group-hover:text-stone-700" />
              </button>
            </div>
            <span className="text-stone-900 tabular">{fmtDetail(currentPrice)}</span>
          </div>
          <div className="ml-4 mt-1 space-y-0.5">
            <div className="flex justify-between text-xs">
              <span className="text-stone-400">Materials:</span>
              <span className="text-stone-600 tabular">{fmtDetail(item.materialCost)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-stone-400">Labor (San Francisco, CA):</span>
              <span className="text-stone-600 tabular">{fmtDetail(item.laborCost)}</span>
            </div>
          </div>
          <div className="flex justify-between pt-2 border-t border-stone-100"><span className="text-stone-500">Line total <span className="text-xs text-stone-400">(incl. labor)</span></span><span className="text-stone-900 font-semibold tabular">{lineTotal != null ? fmt(lineTotal) : '—'}</span></div>
        </div>
      </div>

      {/* Price Comparison Modal */}
      {showPriceComparison && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setShowPriceComparison(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full animate-slideUp">
            {/* Header */}
            <div className="px-6 pt-6 pb-4 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Price Comparison</h3>
                  <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                </div>
                <button
                  onClick={() => setShowPriceComparison(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>

              {/* Local pricing info */}
              <div className="mt-3 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-blue-600" />
                  <span className="text-xs font-medium text-blue-900">Local prices for San Francisco, CA 94104</span>
                </div>
                <p className="text-[10px] text-blue-700 mt-0.5 ml-5">Prices include local availability and delivery charges to job site</p>
              </div>
            </div>

            {/* Retailer List */}
            <div className="p-6 space-y-3">
              {retailers.map((retailer, idx) => (
                <div
                  key={retailer.name}
                  className={`
                    relative p-4 rounded-xl border-2 transition-all cursor-pointer
                    ${selectedRetailer === retailer.name
                      ? 'border-emerald-500 bg-emerald-50/50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }
                  `}
                  onClick={() => {
                    setSelectedRetailer(retailer.name);
                    setPriceOverride(retailer.price);
                  }}
                >
                  {selectedRetailer === retailer.name && (
                    <div className="absolute -top-2 -right-2 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      SELECTED
                    </div>
                  )}

                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {/* Logo */}
                      <div className={`
                        w-12 h-12 rounded-lg flex items-center justify-center overflow-hidden
                        ${retailer.color === 'red' ? 'bg-red-50' : ''}
                        ${retailer.color === 'orange' ? 'bg-orange-50' : ''}
                        ${retailer.color === 'blue' ? 'bg-blue-50' : ''}
                        ${retailer.color === 'gray' ? 'bg-gray-50' : ''}
                      `}>
                        <img
                          src={retailer.logo}
                          alt={`${retailer.name} logo`}
                          className="w-full h-full object-contain p-1"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.parentElement.innerHTML = retailer.name.charAt(0);
                          }}
                        />
                      </div>

                      <div>
                        <div className="font-medium text-gray-900">{retailer.name}</div>
                        <div className="text-[10px] text-gray-400 font-mono mt-0.5">SKU: {retailer.sku}</div>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs text-gray-500">{retailer.availability}</span>
                          <span className="text-xs text-gray-400">•</span>
                          <span className="text-xs text-gray-500">{retailer.delivery}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-bold text-gray-900 tabular">
                        {fmtDetail(retailer.price)}
                      </div>
                      {idx === 0 && (
                        <div className="text-xs text-emerald-600 font-medium mt-0.5">
                          Best Price
                        </div>
                      )}
                      {retailer.price > item.unitPrice && (
                        <div className="text-xs text-gray-500 mt-0.5">
                          +{Math.round((retailer.price - item.unitPrice) / item.unitPrice * 100)}%
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer Actions */}
            <div className="px-6 pb-6">
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    // Apply the selected retailer's price
                    if (selectedRetailer) {
                      const selected = retailers.find(r => r.name === selectedRetailer);
                      if (selected && selected.price !== item.unitPrice) {
                        // Would typically update the item here
                        // For now, just close the modal
                        setShowPriceComparison(false);
                        // If price changed, could trigger edit
                        if (currentPrice !== item.unitPrice) {
                          onEdit();
                        }
                      } else {
                        setShowPriceComparison(false);
                      }
                    }
                  }}
                  className="flex-1 bg-gray-900 hover:bg-gray-800 text-white py-2.5 rounded-lg text-sm font-medium transition-colors"
                >
                  Change Supplier
                </button>
                <button
                  onClick={() => setShowPriceComparison(false)}
                  className="flex-1 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 py-2.5 rounded-lg text-sm font-medium transition-colors"
                >
                  Keep Current
                </button>
              </div>

              <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-xs font-medium text-emerald-900">
                      {selectedRetailer === 'Ace Hardware' ? 'Optimal pricing selected' : `Selected: ${selectedRetailer}`}
                    </div>
                    <div className="text-xs text-emerald-700 mt-0.5">
                      {(() => {
                        const avgPrice = retailers.reduce((sum, r) => sum + r.price, 0) / retailers.length;
                        const savings = (avgPrice - currentPrice) * (item.qty || 1);
                        return savings > 0
                          ? `Saving $${savings.toFixed(2)} vs. average market price`
                          : `$${Math.abs(savings).toFixed(2)} above average market price`;
                      })()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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
  const [showPriceComparison, setShowPriceComparison] = useState(false);

  const newTotal = qty * unitPrice;
  const origTotal = (item.qty ?? 0) * item.unitPrice;
  const delta = newTotal - origTotal;

  // Retailer price data (matches original DetailPanel component)
  const retailers = [
    {
      name: 'Ace Hardware',
      price: item.unitPrice,
      availability: 'In Stock',
      delivery: 'Same day delivery',
      sku: 'ACE-4821739',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/Ace_Hardware_Logo.svg/3840px-Ace_Hardware_Logo.svg.png',
      color: 'red'
    },
    {
      name: 'Home Depot',
      price: item.unitPrice * 1.08,
      availability: 'In Stock',
      delivery: '3-5 day delivery',
      sku: 'HD-1000692847',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/TheHomeDepot.svg/1920px-TheHomeDepot.svg.png',
      color: 'orange'
    },
    {
      name: 'Lowe\'s',
      price: item.unitPrice * 1.12,
      availability: 'In Stock',
      delivery: '2-4 day delivery',
      sku: 'LOW-5013098432',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Lowes_Companies_Logo.svg/3840px-Lowes_Companies_Logo.svg.png',
      color: 'blue'
    },
    {
      name: 'Tractor Supply',
      price: item.unitPrice * 1.15,
      availability: 'Limited',
      delivery: '5-7 day delivery',
      sku: 'TSC-20946813',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/86/TractorSupplyCompanylogo.svg/3840px-TractorSupplyCompanylogo.svg.png',
      color: 'gray'
    }
  ];

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
              <div className="flex items-center justify-between">
                <label className="text-[11px] uppercase tracking-wider text-stone-500 font-medium">Unit price</label>
                <button
                  onClick={() => setShowPriceComparison(true)}
                  className="text-[10px] text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                >
                  Compare retailers <Eye className="w-3 h-3" />
                </button>
              </div>
              <input
                type="number"
                step="0.01"
                value={unitPrice}
                onChange={(e) => setUnitPrice(parseFloat(e.target.value) || 0)}
                className="w-full mt-1 px-3 py-2 bg-white border border-stone-200 rounded-lg text-[14px] text-stone-900 tabular focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-400"
              />
              <div className="mt-1.5 text-[10px] text-stone-400">Regional: {fmtDetail(item.unitPrice)} (materials + labor)</div>
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

      {/* Price Comparison Modal */}
      {showPriceComparison && (
        <div className="fixed inset-0 z-[60] bg-stone-900/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowPriceComparison(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-stone-100">
              <div className="flex items-center justify-between">
                <h3 className="text-[14px] font-semibold text-stone-900">Compare Retailer Prices</h3>
                <button
                  onClick={() => setShowPriceComparison(false)}
                  className="text-stone-400 hover:text-stone-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-[12px] text-stone-500 mt-1">Select a retailer to update unit price</p>

              {/* Local pricing info */}
              <div className="mt-3 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-blue-600" />
                  <span className="text-xs font-medium text-blue-900">Local prices for San Francisco, CA 94104</span>
                </div>
                <p className="text-[10px] text-blue-700 mt-0.5 ml-5">Prices include local availability and delivery charges to job site</p>
              </div>
            </div>

            <div className="p-4 space-y-2 max-h-80 overflow-y-auto">
              {retailers.map((retailer, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setUnitPrice(retailer.price);
                    setShowPriceComparison(false);
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-xl border border-stone-200 hover:border-stone-300 hover:bg-stone-50 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    {retailer.logo ? (
                      <img
                        src={retailer.logo}
                        alt={retailer.name}
                        className="w-8 h-8 object-contain"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : (
                      <div className="w-8 h-8 bg-stone-100 rounded-lg flex items-center justify-center">
                        <Building2 className="w-4 h-4 text-stone-500" />
                      </div>
                    )}
                    <div style={{ display: retailer.logo ? 'none' : 'flex' }} className="w-8 h-8 bg-stone-100 rounded-lg items-center justify-center">
                      <Building2 className="w-4 h-4 text-stone-500" />
                    </div>
                    <div className="text-left">
                      <div className="text-[13px] font-medium text-stone-900">{retailer.name}</div>
                      <div className="text-[9px] text-stone-400 font-mono">SKU: {retailer.sku}</div>
                      <div className="text-[10px] text-stone-500 mt-0.5">{retailer.availability} • {retailer.delivery}</div>
                    </div>
                  </div>
                  <div className="text-[14px] font-semibold text-stone-900 tabular group-hover:text-blue-600 transition-colors">
                    {fmtDetail(retailer.price)}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
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
function ApproveScreen({ totals, lineItems, attested, setAttested, setScreen, onBack, onSubmit }) {
  const canSubmit = attested && totals.needsReview === 0;

  return (
    <main className="max-w-[1000px] mx-auto px-4 md:px-6 py-6 md:py-10">
      <button onClick={onBack} className="flex items-center gap-1.5 text-[13px] text-stone-500 hover:text-stone-900 mb-6">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to review
      </button>

      <div className="mb-8">
        <div className="text-[11px] uppercase tracking-wider text-stone-500 font-medium mb-2">Final Review</div>
        <h1 className="font-display text-4xl md:text-5xl text-stone-900 leading-tight">Ready to submit?</h1>
        <p className="text-stone-500 mt-3 text-[14px]">Review your scope and attest before sending to Xactimate.</p>
      </div>

      {/* Metric strip */}
      <div className="bg-white border border-stone-200 rounded-xl p-4 md:p-6 mb-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-6">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-stone-500 font-medium">Total estimate</div>
            <div className="font-display text-2xl md:text-4xl text-stone-900 tabular mt-1">{fmt(totals.total)}</div>
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-wider text-stone-500 font-medium">Items approved</div>
            <div className="font-display text-2xl md:text-4xl text-emerald-700 tabular mt-1">
              {lineItems.filter(i => i.status === 'approved').length}/{lineItems.length}
            </div>
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-wider text-stone-500 font-medium">Items reviewed</div>
            <div className="font-display text-2xl md:text-4xl text-stone-900 tabular mt-1">
              {lineItems.filter(i => i.status === 'resolved').length}
            </div>
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-wider text-stone-500 font-medium">Your edits</div>
            <div className="font-display text-2xl md:text-4xl text-stone-900 tabular mt-1">{totals.edits}</div>
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-wider text-stone-500 font-medium">Exceptions</div>
            <div className={`font-display text-2xl md:text-4xl tabular mt-1 ${totals.needsReview > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>
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
          <ComplianceRow ok label="Within regional comparables" detail="Estimate is within 8% of comparable hail claims in San Francisco, CA" />
        </div>
      </div>

      {/* Breakdown */}
      <div className="bg-white border border-stone-200 rounded-xl p-6 mb-6">
        <div className="text-[11px] uppercase tracking-wider text-stone-500 font-medium mb-4">Cost Breakdown</div>
        <div className="space-y-2.5 text-[13px]">
          <div className="flex justify-between"><span className="text-stone-600">Subtotal <span className="text-xs text-stone-400">(materials + labor)</span></span><span className="text-stone-900 tabular">{fmt(totals.subtotal)}</span></div>
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
        <div className="flex items-center gap-3">
          <button
            onClick={() => setScreen('negotiation')}
            className="px-4 py-3 rounded-lg text-[14px] font-medium flex items-center gap-2 bg-amber-100 hover:bg-amber-200 text-amber-900 transition-all"
          >
            <HardHat className="w-4 h-4" />
            View Contractor Negotiation
          </button>
          <button
            onClick={onSubmit}
            disabled={!canSubmit}
            className={`px-6 py-3 rounded-lg text-[14px] font-medium flex items-center gap-2 transition-all ${canSubmit ? 'bg-stone-900 hover:bg-stone-800 text-white shadow-sm' : 'bg-stone-200 text-stone-400 cursor-not-allowed'}`}
          >
            Approve & authorize payment <Send className="w-4 h-4" />
          </button>
        </div>
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
      <h1 className="font-display text-5xl text-stone-900 leading-tight">Sent to Carrier.</h1>
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

// ============ CONTRACTOR NEGOTIATION SCREEN ============
function ContractorNegotiationScreen({ lineItems, setLineItems, totals, onBack, onSubmit }) {
  const [contractorProposals, setContractorProposals] = useState({});
  const [negotiationStatus, setNegotiationStatus] = useState('pending');
  const [selectedLineId, setSelectedLineId] = useState(null);
  const [showAutoApproval, setShowAutoApproval] = useState(false);

  // Generate contractor proposals (simulated)
  useEffect(() => {
    const proposals = {};
    lineItems.forEach((item, index) => {
      if (item.status !== 'rejected') {
        // Simulate contractor counter-proposals with some variance
        const variance = Math.random() * 0.2 - 0.1; // -10% to +10%
        const shouldCounter = Math.random() > 0.6; // 40% chance to counter

        proposals[item.id] = {
          accepted: !shouldCounter,
          originalPrice: item.unitPrice,
          proposedPrice: shouldCounter ? item.unitPrice * (1 + variance) : item.unitPrice,
          originalQty: item.qty,
          proposedQty: item.qty,
          reason: shouldCounter ?
            variance > 0 ?
              'Current material costs higher in SF market' :
              'Can source materials at lower cost through preferred vendor'
            : null,
          variance: variance
        };
      }
    });
    setContractorProposals(proposals);
  }, [lineItems]);

  const calculateNegotiationStats = () => {
    const proposals = Object.values(contractorProposals);
    const accepted = proposals.filter(p => p.accepted).length;
    const countered = proposals.filter(p => !p.accepted).length;
    const avgVariance = proposals.filter(p => !p.accepted).reduce((sum, p) => sum + Math.abs(p.variance), 0) / (countered || 1);

    return { accepted, countered, avgVariance: (avgVariance * 100).toFixed(1) };
  };

  const stats = calculateNegotiationStats();

  const handleAutoNegotiate = () => {
    // Auto-approve items within 10% variance
    const updated = { ...contractorProposals };
    Object.keys(updated).forEach(id => {
      if (Math.abs(updated[id].variance) <= 0.1) {
        updated[id].accepted = true;
        updated[id].finalPrice = (updated[id].originalPrice + updated[id].proposedPrice) / 2;
      }
    });
    setContractorProposals(updated);
    setShowAutoApproval(true);
    setTimeout(() => setShowAutoApproval(false), 3000);
  };

  return (
    <main className="min-h-screen bg-stone-50">
      {/* Header */}
      <div className="bg-white border-b border-stone-200">
        <div className="max-w-[1600px] mx-auto px-6 py-4">
          <button onClick={onBack} className="flex items-center gap-2 text-stone-600 hover:text-stone-900 text-[13px] mb-4">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to approval
          </button>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[11px] uppercase tracking-wider text-stone-500 font-medium">CONTRACTOR NEGOTIATION</div>
              <h1 className="font-display text-3xl text-stone-900 mt-1">Three-Way Scope Review</h1>
              <p className="text-stone-500 mt-2 text-[14px]">
                Comparing AI-generated scope with contractor proposal for {CLAIM.address}
              </p>
            </div>
            <div className="text-right">
              <div className="text-[11px] uppercase tracking-wider text-stone-500 font-medium">Contractor</div>
              <div className="text-lg font-medium text-stone-900">Bay Area Construction LLC</div>
              <div className="text-sm text-emerald-700">✓ Preferred Network</div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="bg-white border-b border-stone-200">
        <div className="max-w-[1600px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <div>
                <span className="text-[11px] uppercase tracking-wider text-stone-500">Items Accepted</span>
                <div className="text-xl font-semibold text-emerald-700">{stats.accepted}/{lineItems.length}</div>
              </div>
              <div>
                <span className="text-[11px] uppercase tracking-wider text-stone-500">Counter-Proposals</span>
                <div className="text-xl font-semibold text-amber-700">{stats.countered}</div>
              </div>
              <div>
                <span className="text-[11px] uppercase tracking-wider text-stone-500">Avg Variance</span>
                <div className="text-xl font-semibold text-stone-900">{stats.avgVariance}%</div>
              </div>
            </div>
            <button
              onClick={handleAutoNegotiate}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Auto-Negotiate Minor Variances
            </button>
          </div>
        </div>
      </div>

      {/* Three-Column Layout */}
      <div className="max-w-[1600px] mx-auto px-6 py-6">
        <div className="grid grid-cols-3 gap-4">
          {/* AI Scope Column */}
          <div className="bg-white rounded-lg border border-stone-200">
            <div className="p-4 border-b border-stone-200 bg-gradient-to-r from-blue-50 to-blue-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Brain className="w-4 h-4 text-blue-700" />
                  <span className="text-sm font-semibold text-blue-900">AI-Generated Scope</span>
                </div>
                <span className="text-xs text-blue-700 font-medium">Original</span>
              </div>
              <div className="text-xl font-semibold text-blue-900 mt-2">{fmt(totals.total)}</div>
            </div>
            <div className="divide-y divide-stone-100 max-h-[600px] overflow-y-auto">
              {lineItems.filter(item => item.status !== 'rejected').map((item) => (
                <div
                  key={item.id}
                  className={`p-4 cursor-pointer hover:bg-stone-50 ${selectedLineId === item.id ? 'bg-blue-50' : ''}`}
                  onClick={() => setSelectedLineId(item.id)}
                >
                  <div className="text-xs font-mono text-stone-500 mb-1">{item.code}</div>
                  <div className="text-sm text-stone-900 font-medium mb-2">{item.description}</div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-stone-600">{item.qty} {item.unit}</span>
                    <span className="text-sm font-semibold text-stone-900">{fmt(item.qty * item.unitPrice)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Contractor Proposal Column */}
          <div className="bg-white rounded-lg border border-stone-200">
            <div className="p-4 border-b border-stone-200 bg-gradient-to-r from-amber-50 to-orange-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <HardHat className="w-4 h-4 text-amber-700" />
                  <span className="text-sm font-semibold text-amber-900">Contractor Proposal</span>
                </div>
                <span className="text-xs text-amber-700 font-medium">Counter</span>
              </div>
              <div className="text-xl font-semibold text-amber-900 mt-2">
                {fmt(lineItems.reduce((sum, item) => {
                  const proposal = contractorProposals[item.id];
                  if (!proposal) return sum;
                  return sum + (item.qty * proposal.proposedPrice);
                }, 0))}
              </div>
            </div>
            <div className="divide-y divide-stone-100 max-h-[600px] overflow-y-auto">
              {lineItems.filter(item => item.status !== 'rejected').map((item) => {
                const proposal = contractorProposals[item.id];
                if (!proposal) return null;

                return (
                  <div
                    key={item.id}
                    className={`p-4 cursor-pointer hover:bg-stone-50 ${selectedLineId === item.id ? 'bg-amber-50' : ''}`}
                    onClick={() => setSelectedLineId(item.id)}
                  >
                    <div className="text-xs font-mono text-stone-500 mb-1">{item.code}</div>
                    <div className="text-sm text-stone-900 font-medium mb-2">{item.description}</div>

                    {proposal.accepted ? (
                      <div className="flex items-center gap-2 text-emerald-700 text-xs font-medium mb-2">
                        <Check className="w-3 h-3" />
                        Accepts AI pricing
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-stone-600">{proposal.proposedQty} {item.unit}</span>
                          <span className="text-sm font-semibold text-amber-900">
                            {fmt(proposal.proposedQty * proposal.proposedPrice)}
                          </span>
                        </div>
                        {proposal.variance !== 0 && (
                          <div className="text-xs text-amber-700 bg-amber-50 rounded px-2 py-1">
                            {proposal.variance > 0 ? '+' : ''}{(proposal.variance * 100).toFixed(1)}% • {proposal.reason}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Resolution Column */}
          <div className="bg-white rounded-lg border border-stone-200">
            <div className="p-4 border-b border-stone-200 bg-gradient-to-r from-emerald-50 to-green-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  <span className="text-sm font-semibold text-emerald-900">Final Resolution</span>
                </div>
                <span className="text-xs text-emerald-700 font-medium">Agreed</span>
              </div>
              <div className="text-xl font-semibold text-emerald-900 mt-2">
                {fmt(lineItems.reduce((sum, item) => {
                  const proposal = contractorProposals[item.id];
                  if (!proposal) return sum;
                  const finalPrice = proposal.accepted ? proposal.originalPrice :
                    (proposal.finalPrice || (proposal.originalPrice + proposal.proposedPrice) / 2);
                  return sum + (item.qty * finalPrice);
                }, 0))}
              </div>
            </div>
            <div className="divide-y divide-stone-100 max-h-[600px] overflow-y-auto">
              {lineItems.filter(item => item.status !== 'rejected').map((item) => {
                const proposal = contractorProposals[item.id];
                if (!proposal) return null;

                const finalPrice = proposal.accepted ? proposal.originalPrice :
                  (proposal.finalPrice || (proposal.originalPrice + proposal.proposedPrice) / 2);

                return (
                  <div
                    key={item.id}
                    className={`p-4 cursor-pointer hover:bg-stone-50 ${selectedLineId === item.id ? 'bg-emerald-50' : ''}`}
                    onClick={() => setSelectedLineId(item.id)}
                  >
                    <div className="text-xs font-mono text-stone-500 mb-1">{item.code}</div>
                    <div className="text-sm text-stone-900 font-medium mb-2">{item.description}</div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-stone-600">{item.qty} {item.unit}</span>
                        <span className="text-sm font-semibold text-emerald-900">
                          {fmt(item.qty * finalPrice)}
                        </span>
                      </div>

                      {!proposal.accepted && (
                        <div className="text-xs text-emerald-700 bg-emerald-50 rounded px-2 py-1">
                          ✓ Negotiated: Split difference
                        </div>
                      )}

                      {proposal.accepted && (
                        <div className="text-xs text-emerald-700 bg-emerald-50 rounded px-2 py-1">
                          ✓ Agreed: AI pricing accepted
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Auto-Approval Notification */}
        {showAutoApproval && (
          <div className="fixed bottom-6 right-6 bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-slideUp">
            <CheckCircle2 className="w-5 h-5" />
            <span className="text-sm font-medium">Auto-approved items within 10% variance</span>
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="sticky bottom-0 bg-white border-t border-stone-200">
        <div className="max-w-[1600px] mx-auto px-6 py-4 flex items-center justify-between">
          <div className="text-sm text-stone-600">
            <span className="font-medium text-stone-900">Final negotiated total:</span> {fmt(lineItems.reduce((sum, item) => {
              const proposal = contractorProposals[item.id];
              if (!proposal) return sum;
              const finalPrice = proposal.accepted ? proposal.originalPrice :
                (proposal.finalPrice || (proposal.originalPrice + proposal.proposedPrice) / 2);
              return sum + (item.qty * finalPrice);
            }, 0))}
            <span className="text-stone-500 ml-2">
              ({((lineItems.reduce((sum, item) => {
                const proposal = contractorProposals[item.id];
                if (!proposal) return sum;
                const finalPrice = proposal.accepted ? proposal.originalPrice :
                  (proposal.finalPrice || (proposal.originalPrice + proposal.proposedPrice) / 2);
                return sum + (item.qty * finalPrice);
              }, 0) / totals.total - 1) * 100).toFixed(1)}% from original)
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="px-4 py-2 text-stone-600 hover:text-stone-900 text-sm font-medium"
            >
              Back to review
            </button>
            <button
              onClick={onSubmit}
              className="px-6 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 flex items-center gap-2"
            >
              Approve & Authorize Payment
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

// ============ SEVERANCE GAME ============
function SeveranceGame({ onClose }) {
  return (
    <div className="fixed inset-0 bg-stone-900/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-stone-900">Macrodata Refinement</h2>
            <p className="text-sm text-stone-500 mt-1">Take a break with the Lumon Industries experience</p>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-600 p-2 rounded-lg hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Game Content */}
        <div className="flex-1 p-6 flex items-center justify-center">
          <iframe
            style={{ border: "1px solid rgba(0, 0, 0, 0.1)", borderRadius: "12px" }}
            width="100%"
            height="100%"
            src="https://embed.figma.com/proto/dDHIgVJBZEVDMk7E7j6Mqf/Severance-Macrodata-Refinement-Game--Community-?node-id=8-142&scaling=scale-down&content-scaling=fixed&page-id=9%3A667&starting-point-node-id=8%3A142&embed-host=share"
            allowFullScreen
            title="Severance Macrodata Refinement Game"
          />
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-stone-200 bg-stone-50 rounded-b-2xl">
          <p className="text-xs text-stone-500 text-center">
            Remember: Work-life balance is important. Enjoy your break from refining insurance claims data.
          </p>
        </div>
      </div>
    </div>
  );
}
