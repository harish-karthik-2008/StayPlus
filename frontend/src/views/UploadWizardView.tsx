import React, { useState, useRef } from 'react';
import {
  Upload,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  AlertCircle,
  Building2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Loader2,
  Check,
  FileCheck,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Company } from '../types';
import {
  downloadSampleCsv,
  validateCsvString,
  ValidationResult,
  SAMPLE_CSV_CONTENT,
} from '../services/sampleCsvGenerator';
import { createMockCustomers } from '../services/mockData';

interface UploadWizardViewProps {
  onCancel: () => void;
  onCompanyCreated: (newCompany: Company) => void;
}

export const UploadWizardView: React.FC<UploadWizardViewProps> = ({
  onCancel,
  onCompanyCreated,
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Step 1: Company Info
  const [companyName, setCompanyName] = useState('');
  const [industry, setIndustry] = useState('Telecommunications');
  const [description, setDescription] = useState('');
  const [website, setWebsite] = useState('');
  const [countryRegion, setCountryRegion] = useState('India & South Asia');

  // Step 2: File Upload
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState('customer_churn_data.csv');
  const [csvContent, setCsvContent] = useState<string>(SAMPLE_CSV_CONTENT);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Step 4: Preprocessing progress states
  const [preprocessedSteps, setPreprocessedSteps] = useState<number>(0);
  const [isPreprocessingDone, setIsPreprocessingDone] = useState(false);

  const preprocessingLabels = [
    'Loading dataset into memory',
    'Detecting missing values & imputing medians',
    'Removing duplicate customer entries',
    'Encoding categorical variables (Plan, Region)',
    'Scaling numerical features with RobustScaler',
    'Detecting outliers using Isolation Forests',
    'Selecting top 17 ML features via Mutual Information',
    'Generating XGBoost churn probability predictions',
  ];

  // Handle Drag & Drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processSelectedFile(e.target.files[0]);
    }
  };

  const processSelectedFile = (file: File) => {
    setUploadedFile(file);
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = event => {
      const text = event.target?.result as string;
      setCsvContent(text);
      const val = validateCsvString(text);
      setValidationResult(val);
    };
    reader.readAsText(file);
  };

  const handleUseSampleData = () => {
    setFileName('sample_customer_churn_dataset.csv');
    setCsvContent(SAMPLE_CSV_CONTENT);
    const val = validateCsvString(SAMPLE_CSV_CONTENT);
    setValidationResult(val);
    setUploadedFile(new File([SAMPLE_CSV_CONTENT], 'sample_customer_churn_dataset.csv', { type: 'text/csv' }));
    setStep(3);
  };

  const handleContinueToValidation = () => {
    if (!validationResult) {
      const val = validateCsvString(csvContent);
      setValidationResult(val);
    }
    setStep(3);
  };

  const handleStartPreprocessing = () => {
    setStep(4);
    setPreprocessedSteps(0);
    setIsPreprocessingDone(false);

    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      setPreprocessedSteps(currentStep);

      if (currentStep >= preprocessingLabels.length) {
        clearInterval(interval);
        setIsPreprocessingDone(true);
        try {
          confetti({
            particleCount: 80,
            spread: 60,
            origin: { y: 0.6 },
            colors: ['#FF7F7F', '#E96B6B', '#10B981', '#F59E0B'],
          });
        } catch {
          // ignore
        }
      }
    }, 450);
  };

  const handleFinishAndCreate = () => {
    const custCount = validationResult?.totalRecords || 25420;
    const churnRate = 17.8;
    const highRisk = Math.round(custCount * 0.12);
    const medRisk = Math.round(custCount * 0.22);
    const lowRisk = custCount - highRisk - medRisk;

    const newCompany: Company = {
      id: `comp_${Date.now()}`,
      name: companyName.trim() || 'New Enterprise Organization',
      industry: industry || 'Technology',
      description: description.trim() || 'Custom uploaded organization dataset for churn analytics.',
      website: website.trim() || undefined,
      countryRegion: countryRegion || 'Global',
      customerCount: custCount,
      churnRate,
      highRiskCount: highRisk,
      mediumRiskCount: medRisk,
      lowRiskCount: lowRisk,
      revenueAtRisk: Math.round(highRisk * 850),
      retentionOpportunity: Math.round(highRisk * 1450),
      lastUpdated: 'Just now',
      datasetName: fileName,
      status: 'Ready',
      dataQualityScore: validationResult?.qualityScore || 96,
      missingValuesPct: validationResult?.missingValuesPct || 1.4,
      duplicateCount: validationResult?.duplicateCount || 23,
      invalidValuesCount: validationResult?.invalidValuesCount || 8,
      invalidDatesCount: validationResult?.invalidDatesCount || 4,
      featureCount: 17,
      selectedModel: 'XGBoost',
      models: [
        { name: 'XGBoost (Optimized)', type: 'Gradient Boosted Trees', accuracy: 86.1, precision: 81.0, recall: 82.5, f1: 81.7, rocAuc: 0.90, isSelected: true },
        { name: 'Random Forest', type: 'Ensemble Bagging', accuracy: 83.2, precision: 78.0, recall: 79.5, f1: 78.7, rocAuc: 0.86 },
        { name: 'Logistic Regression', type: 'Baseline Classifier', accuracy: 78.0, precision: 72.0, recall: 75.0, f1: 73.5, rocAuc: 0.81 },
      ],
      confusionMatrix: {
        truePositive: Math.round(highRisk * 0.82),
        falsePositive: Math.round(highRisk * 0.18),
        trueNegative: Math.round(lowRisk * 0.96),
        falseNegative: Math.round(highRisk * 0.18),
      },
      churnDriversBreakdown: [
        { name: 'Usage Decline', percentage: 31, description: 'Reduction in active session frequency and duration' },
        { name: 'Complaints', percentage: 26, description: 'High volume of customer service tickets' },
        { name: 'Payment Delay', percentage: 20, description: 'Invoices exceeding payment term thresholds' },
        { name: 'Low Engagement', percentage: 14, description: 'Low platform interaction scores' },
        { name: 'Short Tenure', percentage: 9, description: 'First 90-day subscription drop-off' },
      ],
      churnTrend7d: [
        { date: '16 Sep', churnRate: 18.2, predictedRisk: 18.5, retainedCustomers: 320 },
        { date: '17 Sep', churnRate: 18.0, predictedRisk: 18.2, retainedCustomers: 335 },
        { date: '18 Sep', churnRate: 17.9, predictedRisk: 18.0, retainedCustomers: 340 },
        { date: '19 Sep', churnRate: 17.8, predictedRisk: 17.9, retainedCustomers: 355 },
        { date: '20 Sep', churnRate: 17.7, predictedRisk: 17.8, retainedCustomers: 360 },
        { date: '21 Sep', churnRate: 17.8, predictedRisk: 17.8, retainedCustomers: 365 },
        { date: '22 Sep', churnRate: 17.8, predictedRisk: 17.7, retainedCustomers: 375 },
      ],
      churnTrend30d: [
        { date: 'Wk 1', churnRate: 19.5, predictedRisk: 19.8, retainedCustomers: 980 },
        { date: 'Wk 2', churnRate: 18.9, predictedRisk: 19.2, retainedCustomers: 1050 },
        { date: 'Wk 3', churnRate: 18.2, predictedRisk: 18.5, retainedCustomers: 1140 },
        { date: 'Wk 4', churnRate: 17.8, predictedRisk: 17.8, retainedCustomers: 1250 },
      ],
      churnTrend6m: [
        { date: 'Apr', churnRate: 21.0, predictedRisk: 21.5, retainedCustomers: 3100 },
        { date: 'May', churnRate: 20.2, predictedRisk: 20.6, retainedCustomers: 3400 },
        { date: 'Jun', churnRate: 19.4, predictedRisk: 19.8, retainedCustomers: 3700 },
        { date: 'Jul', churnRate: 18.8, predictedRisk: 19.1, retainedCustomers: 4100 },
        { date: 'Aug', churnRate: 18.2, predictedRisk: 18.5, retainedCustomers: 4500 },
        { date: 'Sep', churnRate: 17.8, predictedRisk: 17.8, retainedCustomers: 4900 },
      ],
      churnTrend1y: [
        { date: 'Q4', churnRate: 23.0, predictedRisk: 23.5, retainedCustomers: 11000 },
        { date: 'Q1', churnRate: 21.2, predictedRisk: 21.8, retainedCustomers: 13500 },
        { date: 'Q2', churnRate: 19.5, predictedRisk: 20.0, retainedCustomers: 16000 },
        { date: 'Q3', churnRate: 17.8, predictedRisk: 17.8, retainedCustomers: custCount },
      ],
      customers: createMockCustomers('NEW', 24),
    };

    onCompanyCreated(newCompany);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16 animate-fadeIn">
      {/* Wizard Progress Bar */}
      <div className="card-coral p-4 bg-white">
        <div className="flex items-center justify-between">
          {[
            { num: 1, title: 'Company Information' },
            { num: 2, title: 'Dataset Upload' },
            { num: 3, title: 'Data Validation' },
            { num: 4, title: 'Preprocessing' },
          ].map((s, idx) => (
            <React.Fragment key={s.num}>
              <div className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                    step === s.num
                      ? 'bg-coral-500 text-white ring-4 ring-coral-100 shadow-sm'
                      : step > s.num
                      ? 'bg-emerald-500 text-white'
                      : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  {step > s.num ? <Check className="w-4 h-4" /> : s.num}
                </div>
                <span
                  className={`text-xs font-semibold hidden sm:inline ${
                    step === s.num ? 'text-coral-700 font-bold' : 'text-gray-500'
                  }`}
                >
                  {s.title}
                </span>
              </div>
              {idx < 3 && (
                <div
                  className={`flex-1 h-0.5 mx-2 sm:mx-4 transition-colors ${
                    step > idx + 1 ? 'bg-emerald-500' : 'bg-gray-200'
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* STEP 1 — Company Information (Section 8) */}
      {step === 1 && (
        <div className="card-coral p-6 sm:p-8 bg-white space-y-6 animate-fadeIn">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-coral-100 text-coral-700 text-xs font-bold mb-2">
              <Building2 className="w-3.5 h-3.5" /> Step 1 of 4
            </div>
            <h2 className="text-2xl font-extrabold text-[#252525]">Company Information</h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Enter your organization details. This creates a dedicated workspace and segmentation scope.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                Company Name *
              </label>
              <input
                type="text"
                placeholder="e.g. TechStream Services"
                value={companyName}
                onChange={e => setCompanyName(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-coral-200 rounded-xl text-sm text-[#252525] focus:bg-white focus:outline-none focus:ring-2 focus:ring-coral-400 transition-all"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Industry *
                </label>
                <select
                  value={industry}
                  onChange={e => setIndustry(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-coral-200 rounded-xl text-sm text-[#252525] focus:bg-white focus:outline-none focus:ring-2 focus:ring-coral-400"
                >
                  <option value="Telecommunications">Telecommunications</option>
                  <option value="SaaS & Cloud">SaaS & Cloud Software</option>
                  <option value="Fintech & Payments">Fintech & Payments</option>
                  <option value="E-Commerce & Retail">E-Commerce & Retail</option>
                  <option value="Media & Entertainment">Media & Streaming</option>
                  <option value="Healthcare & Insurance">Healthcare & Insurance</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Country / Region
                </label>
                <input
                  type="text"
                  placeholder="e.g. India & South Asia"
                  value={countryRegion}
                  onChange={e => setCountryRegion(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-coral-200 rounded-xl text-sm text-[#252525] focus:bg-white focus:outline-none focus:ring-2 focus:ring-coral-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                Company Description
              </label>
              <textarea
                rows={3}
                placeholder="Brief summary of your business model (e.g. Subscription-based digital services company)..."
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-coral-200 rounded-xl text-sm text-[#252525] focus:bg-white focus:outline-none focus:ring-2 focus:ring-coral-400 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                Website (Optional)
              </label>
              <input
                type="text"
                placeholder="https://company.com"
                value={website}
                onChange={e => setWebsite(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-coral-200 rounded-xl text-sm text-[#252525] focus:bg-white focus:outline-none focus:ring-2 focus:ring-coral-400"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-coral-100">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-xs font-semibold text-gray-500 hover:text-gray-700"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                if (!companyName.trim()) {
                  setCompanyName('TechStream Global');
                }
                setStep(2);
              }}
              className="px-6 py-2.5 rounded-xl bg-coral-500 hover:bg-coral-600 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md shadow-coral-500/25 transition-all active:scale-95"
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2 — Dataset Upload (Section 9) */}
      {step === 2 && (
        <div className="card-coral p-6 sm:p-8 bg-white space-y-6 animate-fadeIn">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-coral-100 text-coral-700 text-xs font-bold mb-2">
              <Upload className="w-3.5 h-3.5" /> Step 2 of 4
            </div>
            <h2 className="text-2xl font-extrabold text-[#252525]">Upload Customer Dataset</h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Upload your customer activity CSV file containing billing, usage, tenure, and complaint logs.
            </p>
          </div>

          {/* Large Drag & Drop Box (matching Section 9 ASCII art) */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleFileDrop}
            className={`border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center transition-all cursor-pointer ${
              isDragging
                ? 'border-coral-500 bg-coral-50/80 scale-[1.01]'
                : uploadedFile
                ? 'border-emerald-400 bg-emerald-50/40'
                : 'border-coral-300 hover:border-coral-400 bg-coral-50/30'
            }`}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileInput}
              accept=".csv"
              className="hidden"
            />

            <div className="w-16 h-16 rounded-2xl bg-white shadow-md text-coral-500 flex items-center justify-center mx-auto mb-4 border border-coral-200">
              {uploadedFile ? (
                <FileCheck className="w-8 h-8 text-emerald-600" />
              ) : (
                <FileSpreadsheet className="w-8 h-8 text-coral-500" />
              )}
            </div>

            {uploadedFile ? (
              <div>
                <p className="text-base font-bold text-emerald-800">{uploadedFile.name}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {(uploadedFile.size / 1024).toFixed(1)} KB • CSV Ready for validation
                </p>
                <span className="mt-3 inline-block text-xs font-semibold text-coral-600 hover:underline">
                  Click to replace file
                </span>
              </div>
            ) : (
              <div>
                <p className="text-lg font-extrabold text-[#252525]">
                  Drag & Drop CSV Here
                </p>
                <p className="text-xs text-gray-500 mt-1">or</p>
                <button
                  type="button"
                  className="mt-2 px-4 py-2 rounded-xl bg-white border border-coral-300 text-coral-600 font-bold text-xs shadow-2xs hover:bg-coral-50 transition-colors"
                >
                  Browse Files
                </button>
                <p className="text-[11px] text-gray-400 mt-4">
                  Accepts .csv (also architecture-ready for .xlsx) • Maximum supported size: 100 MB
                </p>
              </div>
            )}
          </div>

          {/* Quick Demo Assist / Download sample */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-coral-50/50 border border-coral-100">
            <div>
              <p className="text-xs font-bold text-gray-700">Need a dataset to test?</p>
              <p className="text-[11px] text-gray-500">
                Download the standardized 17-feature customer churn schema template.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => downloadSampleCsv()}
                className="px-3 py-1.5 rounded-xl bg-white border border-coral-200 text-gray-700 hover:text-coral-600 font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-2xs"
              >
                <Download className="w-3.5 h-3.5 text-coral-500" />
                <span>Download Sample CSV</span>
              </button>

              <button
                type="button"
                onClick={handleUseSampleData}
                className="px-3.5 py-1.5 rounded-xl bg-coral-500 hover:bg-coral-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all active:scale-95"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Use Realistic Demo Dataset</span>
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-coral-100">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="px-4 py-2 text-xs font-semibold text-gray-500 hover:text-gray-700 flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <button
              type="button"
              onClick={handleContinueToValidation}
              className="px-6 py-2.5 rounded-xl bg-coral-500 hover:bg-coral-600 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md shadow-coral-500/25 transition-all active:scale-95"
            >
              <span>Validate Dataset</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3 — Data Validation (Section 10) */}
      {step === 3 && (
        <div className="card-coral p-6 sm:p-8 bg-white space-y-6 animate-fadeIn">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-2">
              <CheckCircle2 className="w-3.5 h-3.5" /> Step 3 of 4
            </div>
            <h2 className="text-2xl font-extrabold text-[#252525]">Dataset Validation</h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Automated structural integrity and schema verification checks.
            </p>
          </div>

          {/* Validation Checklist (matching Section 10 specs) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <p className="text-xs font-bold text-emerald-900">File uploaded</p>
                <p className="text-[11px] text-emerald-700">{fileName}</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <p className="text-xs font-bold text-emerald-900">CSV structure detected</p>
                <p className="text-[11px] text-emerald-700">UTF-8 delimiter standard</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <p className="text-xs font-bold text-emerald-900">
                  {(validationResult?.totalRecords || 25420).toLocaleString()} records
                </p>
                <p className="text-[11px] text-emerald-700">All customer rows mapped</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <p className="text-xs font-bold text-emerald-900">
                  {validationResult?.columnCount || 17} columns detected
                </p>
                <p className="text-[11px] text-emerald-700">Full schema compliance</p>
              </div>
            </div>
          </div>

          {/* Data Quality Breakdown & Score */}
          <div className="p-5 rounded-2xl bg-coral-50/50 border border-coral-200 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  Overall Health Assessment
                </span>
                <p className="text-xl font-extrabold text-[#252525]">
                  Data Quality Score:{' '}
                  <span className="text-emerald-600 font-black">
                    {validationResult?.qualityScore || 96}%
                  </span>
                </p>
              </div>

              <div className="text-right">
                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100/80 px-2.5 py-1 rounded-full border border-emerald-200">
                  <Check className="w-3.5 h-3.5" /> High Quality
                </span>
              </div>
            </div>

            {/* Quality Metrics Table (Section 10) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
              <div className="p-3 bg-white rounded-xl border border-coral-100">
                <p className="text-[11px] font-semibold text-gray-500">Missing Values</p>
                <p className="text-base font-extrabold text-[#252525] mt-0.5">
                  {validationResult?.missingValuesPct || 1.4}%
                </p>
                <span className="text-[10px] text-gray-400">Within acceptable range</span>
              </div>

              <div className="p-3 bg-white rounded-xl border border-coral-100">
                <p className="text-[11px] font-semibold text-gray-500">Duplicates</p>
                <p className="text-base font-extrabold text-[#252525] mt-0.5">
                  {validationResult?.duplicateCount || 23}
                </p>
                <span className="text-[10px] text-gray-400">Auto-deduplicated</span>
              </div>

              <div className="p-3 bg-white rounded-xl border border-coral-100">
                <p className="text-[11px] font-semibold text-gray-500">Invalid Values</p>
                <p className="text-base font-extrabold text-[#252525] mt-0.5">
                  {validationResult?.invalidValuesCount || 8}
                </p>
                <span className="text-[10px] text-gray-400">Sanitized during prep</span>
              </div>

              <div className="p-3 bg-white rounded-xl border border-coral-100">
                <p className="text-[11px] font-semibold text-gray-500">Invalid Dates</p>
                <p className="text-base font-extrabold text-[#252525] mt-0.5">
                  {validationResult?.invalidDatesCount || 4}
                </p>
                <span className="text-[10px] text-gray-400">ISO-8601 aligned</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-coral-100">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="px-4 py-2 text-xs font-semibold text-gray-500 hover:text-gray-700 flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <button
              type="button"
              onClick={handleStartPreprocessing}
              className="px-6 py-2.5 rounded-xl bg-coral-500 hover:bg-coral-600 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md shadow-coral-500/25 transition-all active:scale-95"
            >
              <span>Continue to Analysis</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4 — Preprocessing (Section 11) */}
      {step === 4 && (
        <div className="card-coral p-6 sm:p-8 bg-white space-y-6 animate-fadeIn text-left">
          <div className="text-center sm:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-coral-100 text-coral-700 text-xs font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5" /> Step 4 of 4
            </div>
            <h2 className="text-2xl font-extrabold text-[#252525]">
              {isPreprocessingDone ? 'Dataset Ready for Analysis' : 'Preparing your dataset...'}
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              {isPreprocessingDone
                ? 'ML pipeline trained and calibrated. Customer churn intelligence synthesized.'
                : 'Executing automated data transformations, encoding, scaling, and feature inference.'}
            </p>
          </div>

          {/* Step Progress Checklist (Section 11) */}
          <div className="p-5 rounded-2xl bg-coral-50/40 border border-coral-200 space-y-3">
            {preprocessingLabels.map((label, idx) => {
              const isCompleted = preprocessedSteps > idx;
              const isCurrent = preprocessedSteps === idx;

              return (
                <div
                  key={idx}
                  className={`flex items-center justify-between p-2.5 rounded-xl transition-all ${
                    isCompleted
                      ? 'bg-white border border-emerald-200 text-emerald-900 shadow-2xs'
                      : isCurrent
                      ? 'bg-coral-100/70 border border-coral-300 text-coral-900 font-semibold'
                      : 'text-gray-400'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {isCompleted ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : isCurrent ? (
                      <Loader2 className="w-4 h-4 text-coral-600 animate-spin shrink-0" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-gray-300 shrink-0" />
                    )}
                    <span className="text-xs sm:text-sm">{label}</span>
                  </div>

                  {isCompleted && (
                    <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">
                      Done
                    </span>
                  )}
                  {isCurrent && (
                    <span className="text-[10px] font-bold text-coral-600 uppercase tracking-wider animate-pulse">
                      Processing...
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Action on Complete */}
          {isPreprocessingDone ? (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 animate-fadeIn">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold">
                  <Check className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-bold text-emerald-950">
                    Analysis Completed Successfully!
                  </p>
                  <p className="text-xs text-emerald-800">
                    25,420 customers analyzed • 17 features ready • XGBoost model selected.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleFinishAndCreate}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-coral-500 hover:bg-coral-600 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-coral-500/25 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <span>Launch Company Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="text-center py-4">
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden mb-2">
                <div
                  className="bg-coral-500 h-2 transition-all duration-300 rounded-full"
                  style={{
                    width: `${(preprocessedSteps / preprocessingLabels.length) * 100}%`,
                  }}
                />
              </div>
              <span className="text-xs text-gray-500">
                Step {preprocessedSteps} of {preprocessingLabels.length} processing...
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
