import React, { useState } from 'react';
import {
  Cpu,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Award,
  Sparkles,
  BarChart2,
  Code2,
  RefreshCw,
} from 'lucide-react';
import { Company, ModelMetric } from '../types';

interface ModelPerformanceViewProps {
  company: Company;
}

export const ModelPerformanceView: React.FC<ModelPerformanceViewProps> = ({
  company,
}) => {
  const [selectedModelName, setSelectedModelName] = useState<string>(company.selectedModel || 'XGBoost');

  const models = company.models;
  const cm = company.confusionMatrix;

  const totalEvaluated = cm.truePositive + cm.falsePositive + cm.trueNegative + cm.falseNegative;

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-coral-100 text-coral-700 text-xs font-bold mb-1.5">
            <Cpu className="w-3.5 h-3.5" />
            <span>Machine Learning Evaluation Benchmark</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#252525] tracking-tight">
            ML Model Performance
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Comparative evaluation of supervised classifiers trained on {company.name}&apos;s customer activity data.
          </p>
        </div>

        {/* Selected Model Tag */}
        <div className="flex items-center gap-2 p-2 px-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold shadow-2xs">
          <Award className="w-4 h-4 text-emerald-600" />
          <span>Active Champion Model: XGBoost (Optimized)</span>
        </div>
      </div>

      {/* Backend Integration Readiness Banner (Section 29) */}
      <div className="p-4 rounded-2xl bg-coral-50/70 border border-coral-200 flex items-start gap-3">
        <Code2 className="w-5 h-5 text-coral-600 shrink-0 mt-0.5" />
        <div className="text-xs text-gray-700 leading-relaxed">
          <p className="font-bold text-[#252525] mb-0.5">
            FastAPI / Python ML Backend Contract Ready
          </p>
          The evaluation metrics and confusion matrix below are decoupled and formatted to bind seamlessly to{' '}
          <code className="bg-white border border-coral-200 px-1 py-0.5 rounded font-mono text-coral-700">
            GET /companies/{'{company_id}'}/model-performance
          </code>
          . Currently operating on calibrated validation holdout partitions.
        </div>
      </div>

      {/* Model Comparison Table (Section 29) */}
      <div className="card-coral p-5 bg-white space-y-4">
        <div>
          <h3 className="text-base font-bold text-[#252525]">
            Algorithm Comparison Matrix
          </h3>
          <p className="text-xs text-gray-500">
            Holdout validation benchmark comparing baseline vs tree-based ensemble classifiers
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-coral-100 text-[11px] font-bold uppercase tracking-wider text-gray-400 bg-coral-50/40">
                <th className="py-3 px-4 rounded-l-xl">Model Architecture</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Accuracy</th>
                <th className="py-3 px-4">Precision</th>
                <th className="py-3 px-4">Recall</th>
                <th className="py-3 px-4">F1 Score</th>
                <th className="py-3 px-4">ROC-AUC</th>
                <th className="py-3 px-4 rounded-r-xl text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-coral-50">
              {models.map(m => {
                const isChampion = m.name.includes('XGBoost');
                return (
                  <tr
                    key={m.name}
                    className={`hover:bg-coral-50/50 transition-colors ${
                      isChampion ? 'bg-coral-50/30 font-semibold' : ''
                    }`}
                  >
                    <td className="py-3 px-4 font-bold text-gray-900 flex items-center gap-2">
                      {isChampion && (
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      )}
                      <span>{m.name}</span>
                    </td>
                    <td className="py-3 px-4 text-gray-500">{m.type}</td>
                    <td className="py-3 px-4 font-medium text-gray-800">{m.accuracy}%</td>
                    <td className="py-3 px-4 font-medium text-gray-800">{m.precision}%</td>
                    <td className="py-3 px-4 font-medium text-gray-800">{m.recall}%</td>
                    <td className="py-3 px-4 font-extrabold text-coral-600">{m.f1}%</td>
                    <td className="py-3 px-4 font-black text-[#252525]">{m.rocAuc}</td>
                    <td className="py-3 px-4 text-right">
                      {isChampion ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100/80 px-2.5 py-1 rounded-full border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Selected
                        </span>
                      ) : (
                        <span className="text-[11px] text-gray-400">Baseline</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Row 2: Confusion Matrix + Key Metric Gauges */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Confusion Matrix (7 cols) */}
        <div className="lg:col-span-7 card-coral p-5 bg-white space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-coral-100">
            <div>
              <h3 className="text-base font-bold text-[#252525]">
                Confusion Matrix (Holdout Test Set)
              </h3>
              <p className="text-xs text-gray-500">
                Evaluation across {totalEvaluated.toLocaleString()} ground-truth customer records
              </p>
            </div>
            <span className="text-xs font-bold text-coral-600 bg-coral-50 px-2.5 py-1 rounded-lg border border-coral-200">
              Selected: XGBoost
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            {/* True Positive */}
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-left">
              <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
                True Positives (Correct Churn)
              </span>
              <p className="text-2xl font-black text-emerald-950 mt-1">
                {cm.truePositive.toLocaleString()}
              </p>
              <span className="text-xs text-emerald-700">
                High-risk customers successfully flagged
              </span>
            </div>

            {/* False Positive */}
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-left">
              <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">
                False Positives (False Alarm)
              </span>
              <p className="text-2xl font-black text-amber-950 mt-1">
                {cm.falsePositive.toLocaleString()}
              </p>
              <span className="text-xs text-amber-700">
                Retained users flagged for outreach
              </span>
            </div>

            {/* False Negative */}
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-left">
              <span className="text-[11px] font-bold text-rose-800 uppercase tracking-wider">
                False Negatives (Missed Churn)
              </span>
              <p className="text-2xl font-black text-rose-950 mt-1">
                {cm.falseNegative.toLocaleString()}
              </p>
              <span className="text-xs text-rose-700">
                Churned customers not caught in advance
              </span>
            </div>

            {/* True Negative */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left">
              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                True Negatives (Correct Retain)
              </span>
              <p className="text-2xl font-black text-slate-900 mt-1">
                {cm.trueNegative.toLocaleString()}
              </p>
              <span className="text-xs text-slate-600">
                Healthy loyal accounts accurately identified
              </span>
            </div>
          </div>
        </div>

        {/* Feature Importance Rankings (5 cols) */}
        <div className="lg:col-span-5 card-coral p-5 bg-white space-y-4">
          <div className="pb-3 border-b border-coral-100">
            <h3 className="text-base font-bold text-[#252525]">
              Global Feature Importance (Gini)
            </h3>
            <p className="text-xs text-gray-500">
              Top predictive factors across the trained XGBoost model
            </p>
          </div>

          <div className="space-y-3 pt-1">
            {[
              { feature: 'usage_change_pct', importance: 31, label: 'Usage Velocity' },
              { feature: 'complaint_count', importance: 24, label: 'Support Escalations' },
              { feature: 'payment_delay_days', importance: 18, label: 'Billing Friction' },
              { feature: 'engagement_score', importance: 13, label: 'Feature Adoption' },
              { feature: 'tenure_months', importance: 9, label: 'Customer Lifecycle' },
              { feature: 'monthly_bill', importance: 5, label: 'Account Size' },
            ].map(f => (
              <div key={f.feature} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="font-mono text-gray-800">{f.feature}</span>
                  <span className="text-coral-600 font-bold">{f.importance}%</span>
                </div>
                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden border border-coral-100">
                  <div
                    className="bg-coral-500 h-2 rounded-full"
                    style={{ width: `${f.importance * 3}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
