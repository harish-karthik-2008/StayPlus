import React, { useState } from 'react';
import {
  Settings,
  Building2,
  Sliders,
  Bell,
  Database,
  RotateCcw,
  Check,
  Server,
  Sparkles,
} from 'lucide-react';
import { Company } from '../types';

interface SettingsViewProps {
  company: Company;
  onUpdateCompany: (updated: Partial<Company>) => void;
  onResetAllData: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  company,
  onUpdateCompany,
  onResetAllData,
}) => {
  const [name, setName] = useState(company.name);
  const [industry, setIndustry] = useState(company.industry);
  const [highRiskThreshold, setHighRiskThreshold] = useState(65);
  const [medRiskThreshold, setMedRiskThreshold] = useState(35);
  const [notifyHighRisk, setNotifyHighRisk] = useState(true);
  const [notifyDailyDigest, setNotifyDailyDigest] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    onUpdateCompany({
      name,
      industry,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn pb-16">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#252525] tracking-tight">
          System Settings & Integrations
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          Configure risk thresholds, notification triggers, and API integration settings for {company.name}.
        </p>
      </div>

      {/* Organization Settings */}
      <div className="card-coral p-6 bg-white space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-coral-100">
          <Building2 className="w-5 h-5 text-coral-600" />
          <h3 className="text-base font-bold text-[#252525]">Organization Profile</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
              Organization Name
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-3.5 py-2 bg-gray-50 border border-coral-200 rounded-xl text-xs sm:text-sm font-semibold text-[#252525] focus:bg-white focus:outline-none focus:ring-1 focus:ring-coral-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
              Industry Sector
            </label>
            <input
              type="text"
              value={industry}
              onChange={e => setIndustry(e.target.value)}
              className="w-full px-3.5 py-2 bg-gray-50 border border-coral-200 rounded-xl text-xs sm:text-sm font-semibold text-[#252525] focus:bg-white focus:outline-none focus:ring-1 focus:ring-coral-500"
            />
          </div>
        </div>
      </div>

      {/* Risk Thresholds */}
      <div className="card-coral p-6 bg-white space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-coral-100">
          <Sliders className="w-5 h-5 text-coral-600" />
          <h3 className="text-base font-bold text-[#252525]">Model Risk Calibration</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-bold text-gray-700">High Risk Classification Cutoff</span>
              <span className="font-extrabold text-red-600">{highRiskThreshold}%</span>
            </div>
            <input
              type="range"
              min="50"
              max="90"
              value={highRiskThreshold}
              onChange={e => setHighRiskThreshold(Number(e.target.value))}
              className="w-full accent-coral-500 h-2 bg-gray-200 rounded-lg cursor-pointer"
            />
            <p className="text-[11px] text-gray-400">
              Customers with churn probability ≥ {highRiskThreshold}% receive immediate priority support alerts.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-bold text-gray-700">Medium Risk (Watchlist) Cutoff</span>
              <span className="font-extrabold text-amber-600">{medRiskThreshold}%</span>
            </div>
            <input
              type="range"
              min="20"
              max="60"
              value={medRiskThreshold}
              onChange={e => setMedRiskThreshold(Number(e.target.value))}
              className="w-full accent-coral-500 h-2 bg-gray-200 rounded-lg cursor-pointer"
            />
            <p className="text-[11px] text-gray-400">
              Customers between {medRiskThreshold}% and {highRiskThreshold - 1}% are placed in the proactive nurture list.
            </p>
          </div>
        </div>
      </div>

      {/* Notification Preferences */}
      <div className="card-coral p-6 bg-white space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-coral-100">
          <Bell className="w-5 h-5 text-coral-600" />
          <h3 className="text-base font-bold text-[#252525]">Alert Triggers</h3>
        </div>

        <div className="space-y-3">
          <label className="flex items-center justify-between p-3 rounded-xl bg-coral-50/40 border border-coral-100 cursor-pointer">
            <div>
              <p className="text-xs font-bold text-[#252525]">Instant High-Risk Flight Notifications</p>
              <p className="text-[11px] text-gray-500">Alert in-app when any customer crosses 80% flight probability</p>
            </div>
            <input
              type="checkbox"
              checked={notifyHighRisk}
              onChange={e => setNotifyHighRisk(e.target.checked)}
              className="w-4 h-4 accent-coral-500 rounded cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-xl bg-coral-50/40 border border-coral-100 cursor-pointer">
            <div>
              <p className="text-xs font-bold text-[#252525]">Dataset Ingestion & ML Training Summaries</p>
              <p className="text-[11px] text-gray-500">Receive status reports when new CSV files finish automated preprocessing</p>
            </div>
            <input
              type="checkbox"
              checked={notifyDailyDigest}
              onChange={e => setNotifyDailyDigest(e.target.checked)}
              className="w-4 h-4 accent-coral-500 rounded cursor-pointer"
            />
          </label>
        </div>
      </div>

      {/* Backend / API Status */}
      <div className="card-coral p-6 bg-white space-y-3">
        <div className="flex items-center gap-2.5 pb-2 border-b border-coral-100">
          <Server className="w-5 h-5 text-coral-600" />
          <h3 className="text-base font-bold text-[#252525]">Backend & API Architecture</h3>
        </div>

        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <div>
              <p className="font-bold text-emerald-950">Mock Service Layer Active (Stand-alone Prototype)</p>
              <p className="text-emerald-700 text-[11px]">Ready for drop-in FastAPI endpoints (`/companies`, `/analyze`, `/simulate`)</p>
            </div>
          </div>
          <span className="text-[11px] font-bold text-emerald-800 bg-white border border-emerald-200 px-2 py-0.5 rounded">
            v1.0.0
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
        <button
          type="button"
          onClick={() => {
            if (confirm('Are you sure you want to reset all data back to the default hackathon demo companies?')) {
              onResetAllData();
            }
          }}
          className="px-4 py-2 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 border border-red-200 transition-colors flex items-center gap-1.5 self-start sm:self-auto"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset All to Demo Defaults</span>
        </button>

        <button
          type="button"
          onClick={handleSave}
          className="px-6 py-2.5 rounded-xl bg-coral-500 hover:bg-coral-600 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md shadow-coral-500/25 transition-all active:scale-95"
        >
          {saved ? (
            <>
              <Check className="w-4 h-4" /> Saved Successfully!
            </>
          ) : (
            <span>Save Configuration</span>
          )}
        </button>
      </div>
    </div>
  );
};
