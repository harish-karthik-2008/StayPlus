import React from 'react';
import {
  ArrowRight,
  TrendingDown,
  BrainCircuit,
  PieChart,
  Lightbulb,
  Activity,
  Database,
  Sparkles,
  Menu,
  X,
} from 'lucide-react';
import { NavigationTab } from '../components/layout/Sidebar';
import { Logo } from '../components/common/Logo';

interface LandingViewProps {
  onEnterApp: (targetTab?: NavigationTab) => void;
  onOpenUpload: () => void;
}

export const LandingView: React.FC<LandingViewProps> = ({
  onEnterApp,
  onOpenUpload,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-[#FFF7F7] flex flex-col selection:bg-coral-100 selection:text-coral-800">
      {/* Landing Navigation */}
      <nav className="w-full sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-coral-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          {/* Brand */}
          <div className="flex items-center gap-2.5">
            <Logo size="sm" />
            <span className="text-lg sm:text-xl font-extrabold text-[#252525] tracking-tight">
              Stay<span className="text-coral-500 font-black">Plus</span>
            </span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={() => onEnterApp('dashboard')}
              className="px-4 py-2 text-sm font-semibold text-gray-700 hover:text-coral-600 transition-colors rounded-lg hover:bg-coral-50"
            >
              Live Demo
            </button>
            <button
              onClick={() => onEnterApp('companies')}
              className="px-4 py-2 text-sm font-semibold text-gray-700 hover:text-coral-600 transition-colors rounded-lg hover:bg-coral-50"
            >
              Organizations
            </button>
            <button
              onClick={onOpenUpload}
              className="ml-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl bg-coral-500 hover:bg-coral-600 text-white font-bold text-sm shadow-md shadow-coral-500/25 transition-all active:scale-95 flex items-center gap-1.5"
            >
              <span>+ Add Company</span>
            </button>
          </div>

          {/* Mobile menu toggle */}
          <button
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-coral-50 hover:text-coral-600"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Nav Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-coral-100 px-4 py-3 space-y-1 animate-fadeIn">
            <button
              onClick={() => { onEnterApp('dashboard'); setMobileMenuOpen(false); }}
              className="w-full text-left px-4 py-3 text-sm font-semibold text-gray-700 hover:text-coral-600 hover:bg-coral-50 rounded-xl transition-colors"
            >
              Live Demo
            </button>
            <button
              onClick={() => { onEnterApp('companies'); setMobileMenuOpen(false); }}
              className="w-full text-left px-4 py-3 text-sm font-semibold text-gray-700 hover:text-coral-600 hover:bg-coral-50 rounded-xl transition-colors"
            >
              Organizations
            </button>
            <button
              onClick={() => { onOpenUpload(); setMobileMenuOpen(false); }}
              className="w-full px-4 py-3 rounded-xl bg-coral-500 hover:bg-coral-600 text-white font-bold text-sm transition-all flex items-center justify-center gap-1.5"
            >
              + Add Company
            </button>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 pt-10 sm:pt-16 pb-16 sm:pb-24 flex flex-col items-center text-center w-full">
        {/* Sub-badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-coral-100 border border-coral-200 text-coral-700 text-xs font-bold mb-5 sm:mb-6 shadow-xs animate-fadeIn">
          <Sparkles className="w-3.5 h-3.5 text-coral-600" />
          <span>Multi-Organization Customer Intelligence Platform</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-3xl sm:text-5xl lg:text-7xl font-extrabold text-[#252525] tracking-tight leading-[1.1] max-w-4xl animate-fadeIn px-2">
          Predict Churn. <br />
          <span className="text-coral-500">Understand Customers.</span> <br />
          Protect Revenue.
        </h1>

        {/* Subtitle */}
        <p className="mt-5 sm:mt-6 text-sm sm:text-lg lg:text-xl text-gray-600 max-w-2xl leading-relaxed animate-fadeIn px-4">
          Enterprise AI customer intelligence for predicting flight risk, discovering behavioural churn drivers,
          segmenting account portfolios, and executing high-ROI retention interventions.
        </p>

        {/* Call to Actions */}
        <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row flex-wrap items-center justify-center gap-3 sm:gap-4 animate-fadeIn w-full px-4">
          <button
            onClick={() => onEnterApp('dashboard')}
            className="w-full sm:w-auto px-6 sm:px-7 py-3 sm:py-3.5 rounded-2xl bg-coral-500 hover:bg-coral-600 text-white font-bold text-sm sm:text-base shadow-lg shadow-coral-500/30 transition-all flex items-center justify-center gap-2 group active:scale-95"
          >
            <span>Launch Platform</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={onOpenUpload}
            className="w-full sm:w-auto px-6 sm:px-7 py-3 sm:py-3.5 rounded-2xl bg-white border border-coral-200 hover:border-coral-300 text-[#252525] font-bold text-sm sm:text-base shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2"
          >
            <Database className="w-4 h-4 text-coral-500" />
            <span>Upload Customer CSV</span>
          </button>
        </div>

        {/* Live Interactive Teaser Card */}
        <div className="mt-10 sm:mt-14 w-full max-w-5xl bg-white rounded-2xl sm:rounded-3xl border border-coral-200 p-5 sm:p-8 shadow-lg text-left relative overflow-hidden animate-fadeIn">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 sm:pb-6 border-b border-coral-100">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-coral-600 bg-coral-50 px-2.5 py-1 rounded-md border border-coral-200">
                  Live Product Journey
                </span>
                <span className="text-xs text-gray-400">TechStream Services Dataset</span>
              </div>
              <h3 className="text-base sm:text-xl font-bold text-[#252525] mt-1.5">
                From Raw Data to Retention Intervention in Seconds
              </h3>
            </div>
            <button
              onClick={() => onEnterApp('dashboard')}
              className="text-xs font-bold text-coral-600 hover:text-coral-700 flex items-center gap-1.5 whitespace-nowrap"
            >
              <span>Explore Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Product Workflow Steps Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 sm:gap-3 mt-5 sm:mt-6 text-center text-xs font-medium">
            {[
              { title: '1. Upload CSV', desc: 'Drag-and-drop 17 features' },
              { title: '2. Validate Data', desc: '96% Quality Score Check' },
              { title: '3. Preprocess', desc: 'Scalers & Encoding Pipeline' },
              { title: '4. Predict Churn', desc: 'XGBoost Churn Probabilities' },
              { title: '5. Explain Drivers', desc: 'SHAP-style Feature Impact' },
              { title: '6. Segment', desc: 'Loyal to High Risk Groups' },
              { title: '7. What-if Sim', desc: 'Interactive ROI Scenarios' },
            ].map((step, idx) => (
              <div
                key={idx}
                className="p-2 sm:p-3 bg-coral-50/50 rounded-xl border border-coral-100 flex flex-col items-center justify-center hover:bg-coral-100/60 transition-colors"
              >
                <span className="font-bold text-coral-700 leading-tight">{step.title}</span>
                <span className="text-[9px] sm:text-[10px] text-gray-500 mt-0.5 leading-tight">{step.desc}</span>
              </div>
            ))}
          </div>

          {/* Quick Stats Banner inside preview */}
          <div className="mt-5 sm:mt-6 p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-r from-coral-50 via-white to-coral-50 border border-coral-200 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div>
              <p className="text-[10px] sm:text-[11px] font-bold text-gray-500 uppercase">Analyzed Accounts</p>
              <p className="text-xl sm:text-2xl font-black text-[#252525]">25,420</p>
            </div>
            <div>
              <p className="text-[10px] sm:text-[11px] font-bold text-gray-500 uppercase">Current Churn Rate</p>
              <p className="text-xl sm:text-2xl font-black text-coral-600">18.4%</p>
            </div>
            <div>
              <p className="text-[10px] sm:text-[11px] font-bold text-gray-500 uppercase">Revenue at Risk</p>
              <p className="text-xl sm:text-2xl font-black text-[#252525]">₹18.6L</p>
            </div>
            <div>
              <p className="text-[10px] sm:text-[11px] font-bold text-gray-500 uppercase">Retention Opp.</p>
              <p className="text-xl sm:text-2xl font-black text-emerald-600">₹32.4L</p>
            </div>
          </div>
        </div>

        {/* 5 Core Pillars Section */}
        <div className="mt-16 sm:mt-20 w-full max-w-6xl">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#252525] px-4">
              Everything you need to stop customer loss
            </h2>
            <p className="text-gray-500 text-sm mt-2 px-4">
              Engineered for data-driven product leaders, customer success executives, and CFOs.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {[
              { icon: TrendingDown, num: '1', title: 'Predict', desc: 'Identify accounts likely to churn weeks before cancellation with calibrated ML probability scores.', tag: 'High/Med/Low Badges' },
              { icon: BrainCircuit, num: '2', title: 'Explain', desc: 'Understand the behavioural factors behind each prediction using transparent SHAP-style contributions.', tag: 'No Black Box' },
              { icon: PieChart, num: '3', title: 'Segment', desc: 'Automatically categorize portfolios into Loyal, At Risk, High Risk, High Value, and New Customer cohorts.', tag: 'Value Prioritization' },
              { icon: Lightbulb, num: '4', title: 'Act', desc: 'Generate targeted retention playbooks: Priority Support, Concierge Renewal Discounts, or Re-engagement.', tag: 'Rule-Based Automation' },
              { icon: Activity, num: '5', title: 'Monitor', desc: 'Track dynamic portfolio risk, historical churn curves, and test counter-factual "What-if" scenarios.', tag: 'Real-Time Dashboards' },
            ].map((pillar) => {
              const Icon = pillar.icon;
              return (
                <div key={pillar.num} className="card-coral p-5 text-left flex flex-col justify-between">
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-coral-100 text-coral-600 flex items-center justify-center mb-4">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h4 className="text-base font-bold text-[#252525]">{pillar.num}. {pillar.title}</h4>
                    <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                      {pillar.desc}
                    </p>
                  </div>
                  <span className="text-[11px] font-bold text-coral-600 mt-4 inline-block">{pillar.tag}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Ready to start banner */}
        <div className="mt-16 sm:mt-20 w-full max-w-4xl p-6 sm:p-8 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-coral-500 to-coral-600 text-white shadow-xl shadow-coral-500/20 flex flex-col sm:flex-row items-center justify-between gap-5 sm:gap-6">
          <div className="text-center sm:text-left">
            <h3 className="text-xl sm:text-2xl font-bold">Ready to analyze your customer dataset?</h3>
            <p className="text-coral-100 text-sm mt-1">
              Supports CSV files up to 100MB with automated quality validation.
            </p>
          </div>
          <button
            onClick={() => onEnterApp('dashboard')}
            className="w-full sm:w-auto px-5 sm:px-6 py-3 rounded-xl bg-white text-coral-600 hover:bg-coral-50 font-extrabold text-sm shadow-md transition-all shrink-0 active:scale-95"
          >
            Launch Live Dashboard
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-coral-200 py-6 text-center text-xs text-gray-400 bg-white px-4">
        <div className="flex items-center justify-center gap-2 mb-1">
          <Logo size="sm" />
          <span className="font-bold text-[#252525] text-sm">Stay<span className="text-coral-500">Plus</span></span>
        </div>
        <p>Customer Churn Intelligence & Retention Analytics Platform</p>
        <p className="mt-1">Predict. Explain. Retain.</p>
      </footer>
    </div>
  );
};
