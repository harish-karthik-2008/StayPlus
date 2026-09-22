import React, { useState, useEffect } from 'react';
import {
  Sliders,
  Sparkles,
  ArrowRight,
  TrendingDown,
  RotateCcw,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  Zap,
} from 'lucide-react';
import { Company, Customer } from '../types';
import { RiskGauge } from '../components/common/RiskGauge';
import { simulateCustomerRisk, SimulationParams } from '../services/recommendationEngine';
import { RiskBadge } from '../components/common/RiskBadge';

interface WhatIfSimulatorViewProps {
  company: Company;
  preselectedCustomer?: Customer | null;
  onSelectCustomer360?: (customer: Customer) => void;
}

export const WhatIfSimulatorView: React.FC<WhatIfSimulatorViewProps> = ({
  company,
  preselectedCustomer,
  onSelectCustomer360,
}) => {
  // Find initial customer (default to Arun Kumar C1024 or preselected)
  const initialCustomer =
    preselectedCustomer ||
    company.customers.find(c => c.customer_id === 'C1024') ||
    company.customers[0];

  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(
    initialCustomer?.customer_id || ''
  );

  const currentCustomer =
    company.customers.find(c => c.customer_id === selectedCustomerId) ||
    company.customers[0];

  // Sliders state
  const [usageChangePct, setUsageChangePct] = useState<number>(
    currentCustomer?.usage_change_pct || -43
  );
  const [complaintCount, setComplaintCount] = useState<number>(
    currentCustomer?.complaint_count || 4
  );
  const [paymentDelayDays, setPaymentDelayDays] = useState<number>(
    currentCustomer?.payment_delay_days || 15
  );
  const [engagementScore, setEngagementScore] = useState<number>(
    currentCustomer?.engagement_score || 38
  );

  // Sync sliders when selected customer changes
  useEffect(() => {
    if (currentCustomer) {
      setUsageChangePct(currentCustomer.usage_change_pct);
      setComplaintCount(currentCustomer.complaint_count);
      setPaymentDelayDays(currentCustomer.payment_delay_days);
      setEngagementScore(currentCustomer.engagement_score);
    }
  }, [currentCustomer?.customer_id]);

  // Real-time calculation
  const simulation = simulateCustomerRisk(currentCustomer, {
    usageChangePct,
    complaintCount,
    paymentDelayDays,
    engagementScore,
  });

  // Presets
  const applyPresetBestCase = () => {
    setUsageChangePct(20);
    setComplaintCount(0);
    setPaymentDelayDays(0);
    setEngagementScore(85);
  };

  const applyPresetQuickWin = () => {
    setUsageChangePct(Math.min(10, currentCustomer.usage_change_pct + 25));
    setComplaintCount(Math.max(0, currentCustomer.complaint_count - 2));
    setPaymentDelayDays(0);
    setEngagementScore(Math.min(90, currentCustomer.engagement_score + 20));
  };

  const handleReset = () => {
    setUsageChangePct(currentCustomer.usage_change_pct);
    setComplaintCount(currentCustomer.complaint_count);
    setPaymentDelayDays(currentCustomer.payment_delay_days);
    setEngagementScore(currentCustomer.engagement_score);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-16">
      {/* Header (Section 27) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-coral-100 text-coral-700 text-xs font-bold mb-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Interactive Scenario Modeler</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#252525] tracking-tight">
            Retention What-if Simulator
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Explore how changes in customer behaviour could affect the model&apos;s predicted churn risk.
          </p>
        </div>

        {/* Customer Switcher */}
        <div className="flex items-center gap-2 bg-white p-2 rounded-2xl border border-coral-200 shadow-2xs">
          <span className="text-xs font-semibold text-gray-500 pl-2">Customer:</span>
          <select
            value={selectedCustomerId}
            onChange={e => setSelectedCustomerId(e.target.value)}
            className="bg-coral-50/70 border border-coral-200 rounded-xl px-3 py-1.5 text-xs font-bold text-gray-800 focus:outline-none focus:ring-1 focus:ring-coral-500"
          >
            {company.customers.map(c => (
              <option key={c.customer_id} value={c.customer_id}>
                {c.customer_id} — {c.name} ({c.churn_probability}% risk)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Prominent Official Disclaimer Box (Section 27) */}
      <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-900 leading-relaxed">
          <strong>Official Prediction Model Notice: </strong>
          Scenario simulation based on the prediction model. Counter-factual projections reflect the ML model&apos;s sensitivity parameters and are not a guaranteed business outcome.
        </div>
      </div>

      {/* Main Simulator Card Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Sliders (7 cols) */}
        <div className="lg:col-span-7 card-coral p-6 bg-white space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-coral-100">
            <div>
              <h3 className="text-base font-bold text-[#252525]">
                Adjust Behavioural Variables
              </h3>
              <p className="text-xs text-gray-500">
                Drag the sliders to test intervention outcomes for {currentCustomer.name}
              </p>
            </div>

            {/* Quick Presets */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={applyPresetQuickWin}
                className="px-2.5 py-1 rounded-lg bg-coral-50 hover:bg-coral-100 text-coral-700 font-bold text-[11px] border border-coral-200 transition-colors"
                title="Simulate quick customer success win"
              >
                Quick Win
              </button>
              <button
                type="button"
                onClick={applyPresetBestCase}
                className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-[11px] border border-emerald-200 transition-colors"
                title="Full retention turnaround"
              >
                Max Effort
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg"
                title="Reset sliders to actual baseline"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Sliders Form */}
          <div className="space-y-6">
            {/* 1. Monthly Usage Delta Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-gray-700">
                  Monthly Usage Trend:
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-gray-400">Baseline: {currentCustomer.usage_change_pct}%</span>
                  <span>→</span>
                  <span
                    className={`font-black text-sm px-2 py-0.5 rounded-md ${
                      usageChangePct >= 0
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-red-50 text-red-700'
                    }`}
                  >
                    {usageChangePct > 0 ? `+${usageChangePct}%` : `${usageChangePct}%`}
                  </span>
                </div>
              </div>
              <input
                type="range"
                min="-60"
                max="60"
                step="5"
                value={usageChangePct}
                onChange={e => setUsageChangePct(Number(e.target.value))}
                className="w-full accent-coral-500 h-2 bg-gray-200 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-gray-400">
                <span>-60% (Severe Drop)</span>
                <span>0% (Stable)</span>
                <span>+60% (High Growth)</span>
              </div>
            </div>

            {/* 2. Complaints Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-gray-700">
                  Active Support Complaints:
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-gray-400">Baseline: {currentCustomer.complaint_count}</span>
                  <span>→</span>
                  <span
                    className={`font-black text-sm px-2 py-0.5 rounded-md ${
                      complaintCount === 0
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-red-50 text-red-700'
                    }`}
                  >
                    {complaintCount} tickets
                  </span>
                </div>
              </div>
              <input
                type="range"
                min="0"
                max="8"
                step="1"
                value={complaintCount}
                onChange={e => setComplaintCount(Number(e.target.value))}
                className="w-full accent-coral-500 h-2 bg-gray-200 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-gray-400">
                <span>0 (All Resolved)</span>
                <span>4 tickets</span>
                <span>8 tickets (Severe Friction)</span>
              </div>
            </div>

            {/* 3. Payment Delay Days Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-gray-700">
                  Payment Settlement Delay:
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-gray-400">Baseline: {currentCustomer.payment_delay_days}d</span>
                  <span>→</span>
                  <span
                    className={`font-black text-sm px-2 py-0.5 rounded-md ${
                      paymentDelayDays === 0
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-amber-50 text-amber-800'
                    }`}
                  >
                    {paymentDelayDays} days
                  </span>
                </div>
              </div>
              <input
                type="range"
                min="0"
                max="30"
                step="1"
                value={paymentDelayDays}
                onChange={e => setPaymentDelayDays(Number(e.target.value))}
                className="w-full accent-coral-500 h-2 bg-gray-200 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-gray-400">
                <span>0 days (Auto-Paid)</span>
                <span>15 days</span>
                <span>30 days (Delinquent)</span>
              </div>
            </div>

            {/* 4. Platform Engagement Score Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-gray-700">
                  Product Engagement Score:
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-gray-400">Baseline: {currentCustomer.engagement_score}%</span>
                  <span>→</span>
                  <span
                    className={`font-black text-sm px-2 py-0.5 rounded-md ${
                      engagementScore >= 70
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-amber-50 text-amber-800'
                    }`}
                  >
                    {engagementScore}%
                  </span>
                </div>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                step="5"
                value={engagementScore}
                onChange={e => setEngagementScore(Number(e.target.value))}
                className="w-full accent-coral-500 h-2 bg-gray-200 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-gray-400">
                <span>10% (Dormant)</span>
                <span>50% (Moderate)</span>
                <span>100% (Power User)</span>
              </div>
            </div>
          </div>

          {/* Scenario Summary Pills */}
          <div className="pt-4 border-t border-coral-100">
            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2">
              Active Scenario Modifications:
            </p>
            <div className="flex flex-wrap gap-2">
              {simulation.factors.map((f, i) => (
                <span
                  key={i}
                  className={`text-xs font-semibold px-2.5 py-1 rounded-lg border ${
                    f.direction === 'better'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : f.direction === 'worse'
                      ? 'bg-rose-50 text-rose-800 border-rose-200'
                      : 'bg-gray-50 text-gray-700 border-gray-200'
                  }`}
                >
                  {f.changeText}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Simulated Risk Gauge & Delta Result (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Main Outcome Card */}
          <div className="card-coral p-6 bg-white flex flex-col justify-between flex-1">
            <div className="text-center">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Simulated Outcome For {currentCustomer.name}
              </span>
              <h3 className="text-xl font-extrabold text-[#252525] mt-1">
                Recalculated Flight Risk
              </h3>
            </div>

            {/* Dynamic Risk Gauge */}
            <div className="my-4 flex justify-center">
              <RiskGauge
                score={simulation.simulatedRisk}
                previousScore={currentCustomer.churn_probability}
                showDelta={true}
                size={230}
              />
            </div>

            {/* Before vs After Card (Section 27 format) */}
            <div className="p-4 rounded-2xl bg-coral-50/60 border border-coral-200 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500 font-semibold">Baseline Risk:</span>
                <span className="text-base font-extrabold text-red-600">
                  {currentCustomer.churn_probability}%
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500 font-semibold">Simulated Risk:</span>
                <span className="text-base font-extrabold text-coral-600">
                  {simulation.simulatedRisk}%
                </span>
              </div>

              <div className="pt-2 border-t border-coral-200/80 flex items-center justify-between">
                <span className="text-xs font-bold text-gray-800">Net Risk Impact:</span>
                <span
                  className={`text-sm font-black px-2.5 py-0.5 rounded-full ${
                    simulation.riskDelta < 0
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {simulation.riskDelta < 0
                    ? `${Math.abs(simulation.riskDelta)} percentage-point drop`
                    : `+${simulation.riskDelta} percentage-point increase`}
                </span>
              </div>
            </div>

            {/* Button to view 360 profile */}
            <div className="mt-4 text-center">
              {onSelectCustomer360 && (
                <button
                  type="button"
                  onClick={() => onSelectCustomer360(currentCustomer)}
                  className="text-xs font-bold text-coral-600 hover:text-coral-700 inline-flex items-center gap-1"
                >
                  <span>View Customer 360 Profile</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
