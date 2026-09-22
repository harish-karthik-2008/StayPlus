import React, { useState } from 'react';
import { X, FileSpreadsheet, FileText, Download, Check, Printer } from 'lucide-react';
import { Company } from '../../types';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  company: Company;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  company,
}) => {
  const [format, setFormat] = useState<'csv' | 'pdf' | 'risk_list' | 'recs'>('csv');
  const [isExporting, setIsExporting] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  if (!isOpen) return null;

  const handleExport = () => {
    setIsExporting(true);

    setTimeout(() => {
      if (format === 'csv' || format === 'risk_list') {
        // Build CSV content
        const rows = company.customers.map(c => [
          c.customer_id,
          `"${c.name}"`,
          c.plan,
          c.monthly_bill,
          c.tenure_months,
          `${c.churn_probability}%`,
          c.risk_level,
          c.segment,
          `"${c.main_driver}"`,
          `"${c.recommended_action}"`,
        ].join(','));

        const csvString = [
          'customer_id,name,plan,monthly_bill,tenure_months,churn_probability,risk_level,segment,main_driver,recommended_action',
          ...rows,
        ].join('\n');

        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${company.name.toLowerCase().replace(/\s+/g, '_')}_${format}_report.csv`;
        link.click();
        URL.revokeObjectURL(url);
      } else if (format === 'recs') {
        const rows = company.customers.flatMap(c => 
          c.recommendations.map(r => [
            c.customer_id,
            `"${c.name}"`,
            `"${r.title}"`,
            `"${r.category}"`,
            `"${r.impactEstimate}"`,
            r.urgency,
          ].join(','))
        );
        const csvString = [
          'customer_id,customer_name,recommendation_title,category,impact_estimate,urgency',
          ...rows,
        ].join('\n');

        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${company.name.toLowerCase().replace(/\s+/g, '_')}_retention_recommendations.csv`;
        link.click();
        URL.revokeObjectURL(url);
      } else if (format === 'pdf') {
        // Trigger print dialog
        window.print();
      }

      setIsExporting(false);
      setDownloaded(true);
      setTimeout(() => {
        setDownloaded(false);
        onClose();
      }, 1200);
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
      <div
        className="bg-white rounded-2xl shadow-2xl border border-coral-200 w-full max-w-lg overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-coral-100 flex items-center justify-between bg-coral-50/50">
          <div>
            <h3 className="text-lg font-bold text-[#252525]">Export Executive Intelligence Report</h3>
            <p className="text-xs text-gray-500 mt-0.5">{company.name} • Data Snapshot</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
            Select Export Package
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setFormat('csv')}
              className={`p-3.5 rounded-xl border text-left transition-all flex items-start gap-3 ${
                format === 'csv'
                  ? 'border-coral-500 bg-coral-50/70 shadow-sm ring-1 ring-coral-500'
                  : 'border-coral-100 hover:border-coral-200 hover:bg-coral-50/30'
              }`}
            >
              <FileSpreadsheet className="w-5 h-5 text-coral-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-bold text-[#252525]">Full Dataset & Predictions</p>
                <p className="text-xs text-gray-500 mt-0.5">Comprehensive customer records with ML predictions (CSV)</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setFormat('risk_list')}
              className={`p-3.5 rounded-xl border text-left transition-all flex items-start gap-3 ${
                format === 'risk_list'
                  ? 'border-coral-500 bg-coral-50/70 shadow-sm ring-1 ring-coral-500'
                  : 'border-coral-100 hover:border-coral-200 hover:bg-coral-50/30'
              }`}
            >
              <FileSpreadsheet className="w-5 h-5 text-coral-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-bold text-[#252525]">High-Risk Attention Roster</p>
                <p className="text-xs text-gray-500 mt-0.5">Filtered list of at-risk accounts for customer success (CSV)</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setFormat('recs')}
              className={`p-3.5 rounded-xl border text-left transition-all flex items-start gap-3 ${
                format === 'recs'
                  ? 'border-coral-500 bg-coral-50/70 shadow-sm ring-1 ring-coral-500'
                  : 'border-coral-100 hover:border-coral-200 hover:bg-coral-50/30'
              }`}
            >
              <FileText className="w-5 h-5 text-coral-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-bold text-[#252525]">Retention Strategy Roster</p>
                <p className="text-xs text-gray-500 mt-0.5">Personalized rule-based actions mapped to customers</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setFormat('pdf')}
              className={`p-3.5 rounded-xl border text-left transition-all flex items-start gap-3 ${
                format === 'pdf'
                  ? 'border-coral-500 bg-coral-50/70 shadow-sm ring-1 ring-coral-500'
                  : 'border-coral-100 hover:border-coral-200 hover:bg-coral-50/30'
              }`}
            >
              <Printer className="w-5 h-5 text-coral-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-bold text-[#252525]">Executive PDF / Print</p>
                <p className="text-xs text-gray-500 mt-0.5">Clean visual briefing with KPI snapshot & graphs</p>
              </div>
            </button>
          </div>

          <div className="bg-coral-50/60 border border-coral-100 rounded-xl p-3 text-xs text-gray-600">
            <span className="font-semibold text-coral-700">Snapshot Summary: </span>
            {company.customerCount.toLocaleString()} total customers • {company.churnRate}% churn rate • ₹
            {(company.revenueAtRisk / 100000).toFixed(1)}L revenue at risk.
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t border-coral-100 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleExport}
            disabled={isExporting}
            className="px-5 py-2.5 rounded-xl bg-coral-500 hover:bg-coral-600 text-white font-semibold text-xs flex items-center gap-2 shadow-sm shadow-coral-500/30 transition-all disabled:opacity-60"
          >
            {downloaded ? (
              <>
                <Check className="w-4 h-4 text-white" /> Downloaded!
              </>
            ) : isExporting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" /> Export Report
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
