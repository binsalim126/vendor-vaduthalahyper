import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Building2, 
  Store, 
  Phone, 
  ArrowRight,
  HelpCircle, 
  CheckSquare, 
  Sparkles, 
  Info, 
  ShieldCheck, 
  Lock,
  Layers
} from 'lucide-react';
import { FormQuestion, ProductItem, VendorSubmission } from '../../lib/types';
import { ProductTagInput } from './ProductTagInput';
import { createVendorSubmission } from '../../lib/supabase';
import { ProductQuantityForm } from './ProductQuantityForm';
import { SubmissionSuccess } from './SubmissionSuccess';

interface VendorFormProps {
  questions: FormQuestion[];
  onSubmissionSuccess?: (sub: VendorSubmission) => void;
  onOpenAdminLogin?: () => void;
}

export const VendorForm: React.FC<VendorFormProps> = ({
  questions,
  onSubmissionSuccess,
  onOpenAdminLogin,
}) => {
  // Wizard Step State: 1 = Identity & Products, 2 = Quantities & Specs
  const [step, setStep] = useState<1 | 2>(1);

  // Form Data State
  const [ventureName, setVentureName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [phone, setPhone] = useState('');
  const [products, setProducts] = useState<string[]>([]);
  const [customAnswers, setCustomAnswers] = useState<Record<string, any>>({});

  // UI / Status states
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedData, setSubmittedData] = useState<VendorSubmission | null>(null);

  // Custom questions filter (non-defaults)
  const customQuestions = questions
    .filter((q) => !q.is_default)
    .sort((a, b) => a.order_index - b.order_index);

  // Handle custom answer changes
  const handleCustomChange = (questionId: string, value: any) => {
    setCustomAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
    // Clear error if present
    if (errors[questionId]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[questionId];
        return next;
      });
    }
  };

  // Step 1 Validation
  const validateStep1 = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!ventureName.trim()) {
      newErrors.venture_name = 'Venture / Brand name is required';
    }

    if (!companyName.trim()) {
      newErrors.company_name = 'Company registered legal name is required';
    }

    const cleanedPhone = phone.replace(/[\s()-]/g, '');
    if (!cleanedPhone) {
      newErrors.phone = 'Phone number is required';
    } else if (cleanedPhone.length < 8) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (!products || products.length === 0) {
      newErrors.products = 'Please add at least one product or category';
    }

    // Validate required custom questions
    customQuestions.forEach((q) => {
      if (q.required) {
        const val = customAnswers[q.id];
        if (
          val === undefined ||
          val === null ||
          val === '' ||
          (Array.isArray(val) && val.length === 0)
        ) {
          newErrors[q.id] = `${q.label} is required`;
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Step 1 Form Handler -> advance to Step 2
  const handleProceedToStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep1()) {
      window.scrollTo({ top: 120, behavior: 'smooth' });
      return;
    }
    setStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Step 2 Submission Handler -> Save to Supabase & Generate Slip
  const handleFinalSubmit = async (productItems: ProductItem[]) => {
    setIsSubmitting(true);
    try {
      // Gather all distinct product names from items and tags
      const itemNames = productItems.map((item) => item.name.trim()).filter(Boolean);
      const combinedProductTags = Array.from(new Set([...products, ...itemNames]));

      const submission = await createVendorSubmission({
        venture_name: ventureName.trim(),
        company_name: companyName.trim(),
        phone: phone.trim(),
        products: combinedProductTags,
        product_items: productItems,
        custom_answers: customAnswers,
      });

      setSubmittedData(submission);
      if (onSubmissionSuccess) {
        onSubmissionSuccess(submission);
      }
    } catch (err: any) {
      console.error('Submission error:', err);
      alert('An error occurred while submitting your registration. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setVentureName('');
    setCompanyName('');
    setPhone('');
    setProducts([]);
    setCustomAnswers({});
    setErrors({});
    setStep(1);
    setSubmittedData(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Final Slip View
  if (submittedData) {
    return <SubmissionSuccess submission={submittedData} onReset={handleResetForm} />;
  }

  // Step 2: Product & Quantity Entry Form
  if (step === 2) {
    return (
      <ProductQuantityForm
        ventureName={ventureName}
        companyName={companyName}
        phone={phone}
        initialProducts={products}
        isSubmitting={isSubmitting}
        onBack={() => {
          setStep(1);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onSubmit={handleFinalSubmit}
      />
    );
  }

  // Step 1: Initial Business Identity & Product Tag Selection
  return (
    <div className="min-h-screen bg-slate-50/60 pb-16">
      {/* Top Brand Banner */}
      <header className="bg-white border-b border-slate-200/80 sticky top-0 z-30 shadow-xs">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="Vaduthala Hyper Shopee"
              className="h-10 w-auto object-contain"
            />
            <div className="hidden sm:block border-l border-slate-200 pl-3">
              <span className="text-xs font-bold text-slate-800 tracking-wide uppercase block">
                Vendor Control
              </span>
              <span className="text-[11px] text-slate-500">
                Supplier Onboarding Portal
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenAdminLogin && (
              <button
                type="button"
                onClick={onOpenAdminLogin}
                className="text-xs font-semibold text-slate-600 hover:text-emerald-700 bg-slate-100 hover:bg-emerald-50 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-emerald-200 transition-colors flex items-center gap-1.5"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Admin Login</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-3xl mx-auto px-4 pt-6 sm:pt-8">
        {/* Intro Header */}
        <div className="mb-6 bg-gradient-to-r from-emerald-800 via-emerald-700 to-emerald-900 text-white rounded-2xl p-6 shadow-md relative overflow-hidden">
          <div className="absolute -right-6 -bottom-6 w-36 h-36 bg-white/10 rounded-full blur-xl pointer-events-none" />
          <div className="relative z-10 space-y-1.5">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-emerald-500/30 text-emerald-100 text-xs font-medium border border-emerald-400/20">
                <Sparkles className="w-3 h-3 text-emerald-300" />
                <span>Official Supplier Registration</span>
              </div>
              <span className="text-xs font-mono font-semibold text-emerald-200">
                Step 1 of 2: Vendor Profile
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              Supplier & Vendor Registration Form
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/90 font-normal leading-relaxed max-w-xl">
              Partner with Vaduthala Hyper Shopee. Submit your venture details, contact information, and catalogue to begin the onboarding and procurement evaluation process.
            </p>
          </div>
        </div>

        {/* The Registration Form */}
        <form onSubmit={handleProceedToStep2} noValidate className="space-y-6">
          {/* Section 1: Business Identity */}
          <section className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-5">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <Store className="w-4 h-4 text-emerald-600" />
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                1. Business & Contact Information
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Venture Name */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Venture / Brand Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={ventureName}
                    onChange={(e) => {
                      setVentureName(e.target.value);
                      if (errors.venture_name) setErrors({ ...errors, venture_name: '' });
                    }}
                    placeholder="e.g. Malabar Organic Harvests"
                    className={`w-full px-3.5 py-2.5 text-sm bg-white border rounded-xl text-slate-800 placeholder:text-slate-400 outline-none transition-all ${
                      errors.venture_name
                        ? 'border-red-400 ring-2 ring-red-100 bg-red-50/20'
                        : 'border-slate-200 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100'
                    }`}
                  />
                </div>
                <p className="text-[11px] text-slate-400">
                  Brand or trading name you market under
                </p>
                {errors.venture_name && (
                  <p className="text-xs text-red-600 font-medium">{errors.venture_name}</p>
                )}
              </div>

              {/* Company Name */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Registered Legal Company Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => {
                      setCompanyName(e.target.value);
                      if (errors.company_name) setErrors({ ...errors, company_name: '' });
                    }}
                    placeholder="e.g. Malabar Agro & Dairy Pvt Ltd"
                    className={`w-full px-3.5 py-2.5 text-sm bg-white border rounded-xl text-slate-800 placeholder:text-slate-400 outline-none transition-all ${
                      errors.company_name
                        ? 'border-red-400 ring-2 ring-red-100 bg-red-50/20'
                        : 'border-slate-200 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100'
                    }`}
                  />
                </div>
                <p className="text-[11px] text-slate-400">
                  Legal entity name as registered for billing/GST
                </p>
                {errors.company_name && (
                  <p className="text-xs text-red-600 font-medium">{errors.company_name}</p>
                )}
              </div>
            </div>

            {/* Phone Number */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                Primary Phone / WhatsApp Number <span className="text-red-500">*</span>
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 text-slate-400 pointer-events-none">
                  <Phone className="w-4 h-4 text-emerald-600" />
                </div>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    if (errors.phone) setErrors({ ...errors, phone: '' });
                  }}
                  placeholder="+91 98470 12345 / 94470 00000"
                  className={`w-full pl-10 pr-3.5 py-2.5 text-sm bg-white border rounded-xl text-slate-800 placeholder:text-slate-400 outline-none transition-all font-mono ${
                    errors.phone
                      ? 'border-red-400 ring-2 ring-red-100 bg-red-50/20'
                      : 'border-slate-200 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100'
                  }`}
                />
              </div>
              <p className="text-[11px] text-slate-400">
                Direct mobile number for Purchase Order approvals and dispatch updates
              </p>
              {errors.phone && (
                <p className="text-xs text-red-600 font-medium">{errors.phone}</p>
              )}
            </div>
          </section>

          {/* Section 2: Products Offered */}
          <section className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <Building2 className="w-4 h-4 text-emerald-600" />
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                2. Products & Catalogue Lines <span className="text-red-500">*</span>
              </h2>
            </div>

            <div className="space-y-1.5">
              <ProductTagInput
                value={products}
                onChange={(tags) => {
                  setProducts(tags);
                  if (errors.products) setErrors({ ...errors, products: '' });
                }}
                error={errors.products}
              />
              <p className="text-[11px] text-slate-400">
                You will enter exact quantities & packaging details for each item in the next step.
              </p>
            </div>
          </section>

          {/* Section 3: Dynamic Custom Questions (Admin-created) */}
          {customQuestions.length > 0 && (
            <section className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-5">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-emerald-600" />
                  <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                    3. Additional Operational Details
                  </h2>
                </div>
                <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                  {customQuestions.length} Questions
                </span>
              </div>

              <div className="space-y-5">
                {customQuestions.map((q) => {
                  const hasError = Boolean(errors[q.id]);
                  const currentValue = customAnswers[q.id];

                  return (
                    <div key={q.id} className="space-y-1.5">
                      <label className="block text-xs font-semibold text-slate-700">
                        {q.label} {q.required && <span className="text-red-500">*</span>}
                      </label>

                      {/* Render according to type */}
                      {q.type === 'text' && (
                        <input
                          type="text"
                          value={currentValue || ''}
                          onChange={(e) => handleCustomChange(q.id, e.target.value)}
                          placeholder={q.placeholder || 'Enter details...'}
                          className={`w-full px-3.5 py-2.5 text-sm bg-white border rounded-xl text-slate-800 placeholder:text-slate-400 outline-none transition-all ${
                            hasError
                              ? 'border-red-400 ring-2 ring-red-100 bg-red-50/20'
                              : 'border-slate-200 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100'
                          }`}
                        />
                      )}

                      {q.type === 'textarea' && (
                        <textarea
                          rows={3}
                          value={currentValue || ''}
                          onChange={(e) => handleCustomChange(q.id, e.target.value)}
                          placeholder={q.placeholder || 'Provide detailed information...'}
                          className={`w-full px-3.5 py-2.5 text-sm bg-white border rounded-xl text-slate-800 placeholder:text-slate-400 outline-none transition-all resize-y ${
                            hasError
                              ? 'border-red-400 ring-2 ring-red-100 bg-red-50/20'
                              : 'border-slate-200 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100'
                          }`}
                        />
                      )}

                      {q.type === 'number' && (
                        <input
                          type="number"
                          value={currentValue !== undefined ? currentValue : ''}
                          onChange={(e) => handleCustomChange(q.id, e.target.value ? Number(e.target.value) : '')}
                          placeholder={q.placeholder || '0'}
                          className={`w-full px-3.5 py-2.5 text-sm bg-white border rounded-xl text-slate-800 placeholder:text-slate-400 outline-none transition-all ${
                            hasError
                              ? 'border-red-400 ring-2 ring-red-100 bg-red-50/20'
                              : 'border-slate-200 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100'
                          }`}
                        />
                      )}

                      {q.type === 'select' && (
                        <select
                          value={currentValue || ''}
                          onChange={(e) => handleCustomChange(q.id, e.target.value)}
                          className={`w-full px-3.5 py-2.5 text-sm bg-white border rounded-xl text-slate-800 outline-none transition-all cursor-pointer ${
                            hasError
                              ? 'border-red-400 ring-2 ring-red-100 bg-red-50/20'
                              : 'border-slate-200 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100'
                          }`}
                        >
                          <option value="">-- Select an option --</option>
                          {(q.options || []).map((opt, oIdx) => (
                            <option key={oIdx} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      )}

                      {q.type === 'multiselect' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                          {(q.options || []).map((opt, oIdx) => {
                            const selectedArray = Array.isArray(currentValue) ? currentValue : [];
                            const isChecked = selectedArray.includes(opt);
                            return (
                              <button
                                key={oIdx}
                                type="button"
                                onClick={() => {
                                  if (isChecked) {
                                    handleCustomChange(
                                      q.id,
                                      selectedArray.filter((item: string) => item !== opt)
                                    );
                                  } else {
                                    handleCustomChange(q.id, [...selectedArray, opt]);
                                  }
                                }}
                                className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-left text-xs font-medium transition-all ${
                                  isChecked
                                    ? 'bg-emerald-50 border-emerald-500 text-emerald-900 ring-1 ring-emerald-400'
                                    : 'bg-white border-slate-200 text-slate-700 hover:border-emerald-300'
                                }`}
                              >
                                <div
                                  className={`w-4 h-4 rounded flex items-center justify-center border shrink-0 ${
                                    isChecked
                                      ? 'bg-emerald-600 border-emerald-600 text-white'
                                      : 'border-slate-300 bg-white'
                                  }`}
                                >
                                  {isChecked && <CheckSquare className="w-3.5 h-3.5" />}
                                </div>
                                <span className="truncate">{opt}</span>
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {q.type === 'boolean' && (
                        <div className="flex items-center gap-3 pt-1">
                          <button
                            type="button"
                            onClick={() => handleCustomChange(q.id, true)}
                            className={`flex-1 py-2 px-3 rounded-xl border text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                              currentValue === true
                                ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            <span>Yes</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleCustomChange(q.id, false)}
                            className={`flex-1 py-2 px-3 rounded-xl border text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                              currentValue === false
                                ? 'bg-slate-800 text-white border-slate-800 shadow-xs'
                                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            <span>No</span>
                          </button>
                        </div>
                      )}

                      {/* Helper text & validation error */}
                      {q.helper_text && (
                        <p className="text-[11px] text-slate-400 flex items-center gap-1">
                          <Info className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{q.helper_text}</span>
                        </p>
                      )}
                      {hasError && (
                        <p className="text-xs text-red-600 font-medium">{errors[q.id]}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Bottom Proceed Bar */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-sm tracking-wide shadow-lg shadow-emerald-700/20 flex items-center justify-center gap-2 transition-all transform active:scale-[0.99]"
            >
              <span>Continue to Product & Quantity Details</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <div className="mt-3 text-center text-xs text-slate-400 flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Vaduthala Hyper Shopee Procurement & Vendor Control Desk</span>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
};
