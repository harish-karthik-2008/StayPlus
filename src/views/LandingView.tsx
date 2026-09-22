import React from 'react';
import {
  ShieldAlert,
  ArrowRight,
  TrendingDown,
  BrainCircuit,
  PieChart,
  Lightbulb,
  Activity,
  CheckCircle2,
  Building2,
  Database,
  PlayCircle,
  Sparkles,
} from 'lucide-react';
import { NavigationTab } from '../components/layout/Sidebar';

interface LandingViewProps {
  onEnterApp: (targetTab?: NavigationTab) => void;
  onOpenUpload: () => void;
}

export const LandingView: React.FC<LandingViewProps> = ({
  onEnterApp,
  onOpenUpload,
}) => {
  return (
    <div className="min-h-screen bg-[#FFF7F7] flex flex-col selection:bg-coral-100 selection:text-coral-800">
      {/* Landing Navigation */}
      <nav className="w-full max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-coral-400 to-coral-600 text-white flex items-center justify-center shadow-md shadow-coral-500/25">
            <ShieldAlert className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-extrabold text-[#252525] tracking-tight">
            ChurnGuard <span className="text-coral-500 font-black">AI</span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onEnterApp('dashboard')}
            className="px-4 py-2 text-xs sm:text-sm font-semibold text-gray-700 hover:text-coral-600 transition-colors"
          >
            Live Demo
          </button>
          <button
            onClick={() => onEnterApp('companies')}
            className="px-4 py-2 text-xs sm:text-sm font-semibold text-gray-700 hover:text-coral-600 transition-colors hidden sm:inline"
          >
            Organizations
          </button>
          <button
            onClick={onOpenUpload}
            className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl bg-coral-500 hover:bg-coral-600 text-white font-bold text-xs sm:text-sm shadow-md shadow-coral-500/25 transition-all active:scale-95 flex items-center gap-1.5"
          >
            <span>+ Add Company</span>
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl mx-auto px-6 pt-10 pb-20 flex flex-col items-center text-center">
        {/* Sub-badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-coral-100 border border-coral-200 text-coral-700 text-xs font-bold mb-6 shadow-xs animate-fadeIn">
          <Sparkles className="w-3.5 h-3.5 text-coral-600" />
          <span>Multi-Organization Customer Intelligence Platform</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-[#252525] tracking-tight leading-[1.1] max-w-4xl animate-fadeIn">
          Predict Churn. <br />
          <span className="text-coral-500">Understand Customers.</span> <br />
          Protect Revenue.
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-base sm:text-xl text-gray-600 max-w-2xl leading-relaxed animate-fadeIn">
          Enterprise AI customer intelligence for predicting flight risk, discovering behavioural churn drivers,
          segmenting account portfolios, and executing high-ROI retention interventions.
        </p>

        {/* Call to Actions */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4 animate-fadeIn">
          <button
            onClick={() => onEnterApp('dashboard')}
            className="px-7 py-3.5 rounded-2xl bg-coral-500 hover:bg-coral-600 text-white font-bold text-sm sm:text-base shadow-lg shadow-coral-500/30 transition-all flex items-center gap-2 group active:scale-95"
          >
            <span>Launch Platform</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={onOpenUpload}
            className="px-7 py-3.5 rounded-2xl bg-white border border-coral-200 hover:border-coral-300 text-[#252525] font-bold text-sm sm:text-base shadow-sm hover:shadow-md transition-all flex items-center gap-2"
          >
            <Database className="w-4 h-4 text-coral-500" />
            <span>Upload Customer CSV</span>
          </button>
        </div>

        {/* Live Interactive Teaser Card */}
        <div className="mt-14 w-full max-w-5xl bg-white rounded-3xl border border-coral-200 p-6 sm:p-8 shadow-card text-left relative overflow-hidden animate-fadeIn">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-coral-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-coral-600 bg-coral-50 px-2.5 py-1 rounded-md border border-coral-200">
                  Live Product Journey
                </span>
                <span className="text-xs text-gray-400">TechStream Services Dataset</span>
              </div>
              <h3 className="text-xl font-bold text-[#252525] mt-1.5">
                From Raw Data to Retention Intervention in Seconds
              </h3>
            </div>
            <button
              onClick={() => onEnterApp('dashboard')}
              className="text-xs font-bold text-coral-600 hover:text-coral-700 flex items-center gap-1.5"
            >
              <span>Explore TechStream Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Product Workflow Steps Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mt-6 text-center text-xs font-medium">
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
                className="p-3 bg-coral-50/50 rounded-xl border border-coral-100 flex flex-col items-center justify-center hover:bg-coral-100/60 transition-colors"
              >
                <span className="font-bold text-coral-700">{step.title}</span>
                <span className="text-[10px] text-gray-500 mt-0.5">{step.desc}</span>
              </div>
            ))}
          </div>

          {/* Quick Stats Banner inside preview */}
          <div className="mt-6 p-4 rounded-2xl bg-gradient-to-r from-coral-50 via-white to-coral-50 border border-coral-200 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <p className="text-[11px] font-bold text-gray-500 uppercase">Analyzed Accounts</p>
              <p className="text-2xl font-black text-[#252525]">25,420</p>
            </div>
            <div>
              <p className="text-[11px] font-bold text-gray-500 uppercase">Current Churn Rate</p>
              <p className="text-2xl font-black text-coral-600">18.4%</p>
            </div>
            <div>
              <p className="text-[11px] font-bold text-gray-500 uppercase">Revenue at Risk</p>
              <p className="text-2xl font-black text-[#252525]">₹18.6 Lakhs</p>
            </div>
            <div>
              <p className="text-[11px] font-bold text-gray-500 uppercase">Retention Opportunity</p>
              <p className="text-2xl font-black text-emerald-600">₹32.4 Lakhs</p>
            </div>
          </div>
        </div>

        {/* 5 Core Pillars Section (Section 44) */}
        <div className="mt-20 w-full max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-[#252525]">
              Everything you need to stop customer loss
            </h2>
            <p className="text-gray-500 text-sm mt-2">
              Engineered for data-driven product leaders, customer success executives, and CFOs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {/* Predict */}
            <div className="card-coral p-5 text-left flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-coral-100 text-coral-600 flex items-center justify-center mb-4">
                  <TrendingDown className="w-5 h-5" />
                </div>
                <h4 className="text-base font-bold text-[#252525]">1. Predict</h4>
                <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                  Identify accounts likely to churn weeks before cancellation with calibrated ML probability scores.
                </p>
              </div>
              <span className="text-[11px] font-bold text-coral-600 mt-4 inline-block">High/Med/Low Badges</span>
            </div>

            {/* Explain */}
            <div className="card-coral p-5 text-left flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-coral-100 text-coral-600 flex items-center justify-center mb-4">
                  <BrainCircuit className="w-5 h-5" />
                </div>
                <h4 className="text-base font-bold text-[#252525]">2. Explain</h4>
                <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                  Understand the behavioural factors behind each prediction using transparent SHAP-style contributions.
                </p>
              </div>
              <span className="text-[11px] font-bold text-coral-600 mt-4 inline-block">No Black Box</span>
            </div>

            {/* Segment */}
            <div className="card-coral p-5 text-left flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-coral-100 text-coral-600 flex items-center justify-center mb-4">
                  <PieChart className="w-5 h-5" />
                </div>
                <h4 className="text-base font-bold text-[#252525]">3. Segment</h4>
                <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                  Automatically categorize portfolios into Loyal, At Risk, High Risk, High Value, and New Customer cohorts.
                </p>
              </div>
              <span className="text-[11px] font-bold text-coral-600 mt-4 inline-block">Value Prioritization</span>
            </div>

            {/* Act */}
            <div className="card-coral p-5 text-left flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-coral-100 text-coral-600 flex items-center justify-center mb-4">
                  <Lightbulb className="w-5 h-5" />
                </div>
                <h4 className="text-base font-bold text-[#252525]">4. Act</h4>
                <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                  Generate targeted retention playbooks: Priority Support, Concierge Renewal Discounts, or Re-engagement.
                </p>
              </div>
              <span className="text-[11px] font-bold text-coral-600 mt-4 inline-block">Rule-Based Automation</span>
            </div>

            {/* Monitor */}
            <div className="card-coral p-5 text-left flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-coral-100 text-coral-600 flex items-center justify-center mb-4">
                  <Activity className="w-5 h-5" />
                </div>
                <h4 className="text-base font-bold text-[#252525]">5. Monitor</h4>
                <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                  Track dynamic portfolio risk, historical churn curves, and test counter-factual "What-if" scenarios.
                </p>
              </div>
              <span className="text-[11px] font-bold text-coral-600 mt-4 inline-block">Real-Time Dashboards</span>
            </div>
          </div>
        </div>

        {/* Ready to start banner */}
        <div className="mt-20 w-full max-w-4xl p-8 rounded-3xl bg-gradient-to-r from-coral-500 to-coral-600 text-white shadow-xl shadow-coral-500/20 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="text-left">
            <h3 className="text-2xl font-bold">Ready to analyze your customer dataset?</h3>
            <p className="text-coral-100 text-sm mt-1">
              Supports CSV files up to 100MB with automated quality validation.
            </p>
          </div>
          <button
            onClick={() => onEnterApp('dashboard')}
            className="px-6 py-3 rounded-xl bg-white text-coral-600 hover:bg-coral-50 font-extrabold text-sm shadow-md transition-all shrink-0 active:scale-95"
          >
            Launch Live Dashboard
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-coral-200 py-6 text-center text-xs text-gray-400 bg-white">
        <p>ChurnGuard AI — Predict. Explain. Retain. Built for Enterprise Customer Intelligence.</p>
      </footer>
    </div>
  );
};
