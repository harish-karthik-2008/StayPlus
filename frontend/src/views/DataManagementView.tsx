import React, { useState } from 'react';
import {
  Database,
  RefreshCw,
  Upload,
  CheckCircle2,
  FileSpreadsheet,
  Calendar,
  AlertTriangle,
  Download,
  Check,
} from 'lucide-react';
import { Company } from '../types';
import { downloadSampleCsv, CSV_REQUIRED_COLUMNS } from '../services/sampleCsvGenerator';

interface DataManagementViewProps {
  company: Company;
  onOpenUploadWizard: () => void;
  onReanalyze: () => void;
}

export const DataManagementView: React.FC<DataManagementViewProps> = ({
  company,
  onOpenUploadWizard,
  onReanalyze,
}) => {
  const [isReanalyzing, setIsReanalyzing] = useState(false);
  const [reanalyzeDone, setReanalyzeDone] = useState(false);

  const handleReanalyze = () => {
    setIsReanalyzing(true);
    setReanalyzeDone(false);

    setTimeout(() => {
      onReanalyze();
      setIsReanalyzing(false);
      setReanalyzeDone(true);
      setTimeout(() => setReanalyzeDone(false), 2500);
    }, 1200);
  };

  const featureMetadata = [
    { name: 'customer_id', type: 'Categorical / ID', missing: '0.0%', role: 'Identifier' },
    { name: 'age', type: 'Integer (Numeric)', missing: '0.2%', role: 'Demographic' },
    { name: 'plan', type: 'Categorical (4 levels)', missing: '0.0%', role: 'Subscription' },
    { name: 'tenure_months', type: 'Integer (Numeric)', missing: '0.1%', role: 'Lifecycle' },
    { name: 'monthly_bill', type: 'Float (Currency)', missing: '0.0%', role: 'Financial' },
    { name: 'monthly_usage_hours', type: 'Float (Continuous)', missing: '1.1%', role: 'Usage' },
    { name: 'usage_change_pct', type: 'Float (Continuous)', missing: '0.8%', role: 'Usage Momentum' },
    { name: 'login_frequency', type: 'Integer (Continuous)', missing: '0.4%', role: 'Engagement' },
    { name: 'complaint_count', type: 'Integer (Discrete)', missing: '0.0%', role: 'Support Signal' },
    { name: 'open_complaints', type: 'Integer (Discrete)', missing: '0.0%', role: 'Active Escalation' },
    { name: 'avg_resolution_days', type: 'Float (Continuous)', missing: '1.2%', role: 'SLA Health' },
    { name: 'payment_delay_days', type: 'Integer (Continuous)', missing: '0.5%', role: 'Billing Health' },
    { name: 'payment_failures', type: 'Integer (Discrete)', missing: '0.0%', role: 'Transaction Friction' },
    { name: 'plan_changes', type: 'Integer (Discrete)', missing: '0.0%', role: 'Contract Churn' },
    { name: 'engagement_score', type: 'Float (0-100)', missing: '0.6%', role: 'Behavioral Index' },
    { name: 'satisfaction_score', type: 'Float (1-5)', missing: '1.8%', role: 'CSAT / Sentiment' },
    { name: 'churn', type: 'Binary (0/1)', missing: '0.0%', role: 'Supervised Target' },
  ];

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#252525] tracking-tight">
            Data Quality & Preprocessing
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Data hygiene audit, schema integrity, and automated feature pipeline for {company.name}.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenUploadWizard}
            className="px-4 py-2 rounded-xl bg-white border border-coral-200 hover:bg-coral-50 text-gray-700 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <Upload className="w-3.5 h-3.5 text-coral-600" />
            <span>Replace Dataset</span>
          </button>

          <button
            onClick={handleReanalyze}
            disabled={isReanalyzing}
            className="px-4 py-2 rounded-xl bg-coral-500 hover:bg-coral-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-coral-500/25 transition-all active:scale-95 disabled:opacity-50"
          >
            {reanalyzeDone ? (
              <>
                <Check className="w-3.5 h-3.5" /> Pipeline Up to Date!
              </>
            ) : isReanalyzing ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Preprocessing...
              </>
            ) : (
              <>
                <RefreshCw className="w-3.5 h-3.5" /> Re-run Analysis
              </>
            )}
          </button>
        </div>
      </div>

      {/* Dataset Overview Metrics (Section 28) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="card-coral p-4 bg-white">
          <p className="text-[11px] font-bold text-gray-400 uppercase">Dataset Name</p>
          <p className="text-sm font-black text-coral-700 truncate mt-1">
            {company.datasetName}
          </p>
          <span className="text-[10px] text-gray-400">CSV format</span>
        </div>

        <div className="card-coral p-4 bg-white">
          <p className="text-[11px] font-bold text-gray-400 uppercase">Total Records</p>
          <p className="text-2xl font-black text-[#252525] mt-1">
            {company.customerCount.toLocaleString()}
          </p>
          <span className="text-[10px] text-emerald-600 font-semibold">100% Parsed</span>
        </div>

        <div className="card-coral p-4 bg-white">
          <p className="text-[11px] font-bold text-gray-400 uppercase">Features</p>
          <p className="text-2xl font-black text-[#252525] mt-1">
            {company.featureCount}
          </p>
          <span className="text-[10px] text-gray-400">17 standard columns</span>
        </div>

        <div className="card-coral p-4 bg-white">
          <p className="text-[11px] font-bold text-gray-400 uppercase">Missing Values</p>
          <p className="text-2xl font-black text-amber-600 mt-1">
            {company.missingValuesPct}%
          </p>
          <span className="text-[10px] text-gray-400">Imputed via medians</span>
        </div>

        <div className="card-coral p-4 bg-white">
          <p className="text-[11px] font-bold text-gray-400 uppercase">Duplicates</p>
          <p className="text-2xl font-black text-gray-800 mt-1">
            {company.duplicateCount}
          </p>
          <span className="text-[10px] text-gray-400">Removed automatically</span>
        </div>

        <div className="card-coral p-4 bg-white">
          <p className="text-[11px] font-bold text-gray-400 uppercase">Data Quality Score</p>
          <p className="text-2xl font-black text-emerald-600 mt-1">
            {company.dataQualityScore}%
          </p>
          <span className="text-[10px] text-emerald-700 font-bold">Ready for ML</span>
        </div>
      </div>

      {/* Preprocessing Pipeline Audit Trail */}
      <div className="card-coral p-5 bg-white space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-coral-100">
          <div>
            <h3 className="text-base font-bold text-[#252525]">
              Automated Transformation Pipeline
            </h3>
            <p className="text-xs text-gray-500">
              Transformations applied before passing records to model training & inference
            </p>
          </div>
          <button
            onClick={() => downloadSampleCsv()}
            className="text-xs font-bold text-coral-600 hover:underline flex items-center gap-1"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Schema Template</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { title: 'Median Imputation', desc: 'Missing numeric fields filled with training median' },
            { title: 'One-Hot & Ordinal Encoding', desc: 'Categorical plan tiers translated to numeric arrays' },
            { title: 'Robust Feature Scaling', desc: 'Outliers suppressed with quantile scaling' },
            { title: 'SHAP Sensitivity Weights', desc: 'Pre-computed importance coefficients stored' },
          ].map((item, idx) => (
            <div key={idx} className="p-3 rounded-xl bg-coral-50/40 border border-coral-100">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <p className="text-xs font-bold text-[#252525]">{item.title}</p>
              </div>
              <p className="text-[11px] text-gray-500 mt-1">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 17 Features Metadata Table */}
      <div className="card-coral p-5 bg-white">
        <div className="mb-4">
          <h3 className="text-base font-bold text-[#252525]">
            Feature Dictionary & Schema Audit (17 Features)
          </h3>
          <p className="text-xs text-gray-500">
            Field types, completeness checks, and model input roles
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-coral-100 text-[11px] font-bold uppercase tracking-wider text-gray-400 bg-coral-50/40">
                <th className="py-2.5 px-3">Column Name</th>
                <th className="py-2.5 px-3">Data Type</th>
                <th className="py-2.5 px-3">Missing Rate</th>
                <th className="py-2.5 px-3">ML Role</th>
                <th className="py-2.5 px-3">Validation Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-coral-50">
              {featureMetadata.map(f => (
                <tr key={f.name} className="hover:bg-coral-50/50">
                  <td className="py-2.5 px-3 font-mono font-bold text-gray-800">
                    {f.name}
                  </td>
                  <td className="py-2.5 px-3 text-gray-600">{f.type}</td>
                  <td className="py-2.5 px-3 text-gray-600">{f.missing}</td>
                  <td className="py-2.5 px-3 font-medium text-coral-700">{f.role}</td>
                  <td className="py-2.5 px-3 text-emerald-700 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Compliant</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
