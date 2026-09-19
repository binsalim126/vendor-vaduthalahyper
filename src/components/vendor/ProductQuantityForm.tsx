import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Trash2, 
  ArrowLeft, 
  CheckCircle2, 
  Loader2, 
  AlertCircle, 
  Building2, 
  Phone, 
  Scale
} from 'lucide-react';
import { ProductItem } from '../../lib/types';

interface ProductQuantityFormProps {
  ventureName: string;
  companyName: string;
  phone: string;
  initialProducts: string[];
  isSubmitting: boolean;
  onBack: () => void;
  onSubmit: (items: ProductItem[]) => void;
}

const COMMON_UNITS = [
  'Kg',
  'Pieces / Units',
  'Boxes / Cartons',
  'Packets (Pkt)',
  'Litres (L)',
  'Bags / Sacks',
  'Gram (g)',
  'Millilitres (ml)',
  'Dozen',
  'Tons / Quintal',
  'Trays',
  'Crates',
  'Bottles / Jars',
  'Bundles',
  'Custom'
];

export const ProductQuantityForm: React.FC<ProductQuantityFormProps> = ({
  ventureName,
  companyName,
  phone,
  initialProducts,
  isSubmitting,
  onBack,
  onSubmit,
}) => {
  // Initialize items from the selected products or default to 1 empty row
  const [items, setItems] = useState<ProductItem[]>(() => {
    if (initialProducts && initialProducts.length > 0) {
      return initialProducts.map((p, idx) => ({
        id: `item_${Date.now()}_${idx}`,
        name: p,
        quantity: '',
        unit: 'Kg',
        notes: '',
      }));
    }
    return [
      {
        id: `item_${Date.now()}_0`,
        name: '',
        quantity: '',
        unit: 'Kg',
        notes: '',
      },
    ];
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      {
        id: `item_${Date.now()}_${prev.length}`,
        name: '',
        quantity: '',
        unit: 'Kg',
        notes: '',
      },
    ]);
  };

  const handleRemoveItem = (indexToRemove: number) => {
    if (items.length <= 1) {
      setErrors({ form: 'Please specify at least one product and quantity.' });
      return;
    }
    setItems((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleFieldChange = (index: number, field: keyof ProductItem, value: any) => {
    setItems((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });

    if (errors[`${field}_${index}`] || errors.form) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[`${field}_${index}`];
        delete next.form;
        return next;
      });
    }
  };

  const validateAndSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (items.length === 0) {
      newErrors.form = 'Please add at least one product with quantity.';
    }

    items.forEach((item, idx) => {
      if (!item.name.trim()) {
        newErrors[`name_${idx}`] = 'Product name is required';
      }
      if (!item.quantity || String(item.quantity).trim() === '') {
        newErrors[`quantity_${idx}`] = 'Quantity is required';
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      window.scrollTo({ top: 180, behavior: 'smooth' });
      return;
    }

    onSubmit(items);
  };

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
                Step 2: Product & Quantity Specifications
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onBack}
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg border border-slate-200 flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Step 1</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-3xl mx-auto px-4 pt-6 sm:pt-8">
        {/* Step Progress Header */}
        <div className="mb-6 bg-gradient-to-r from-emerald-800 via-emerald-700 to-emerald-900 text-white rounded-2xl p-6 shadow-md relative overflow-hidden">
          <div className="absolute -right-6 -bottom-6 w-36 h-36 bg-white/10 rounded-full blur-xl pointer-events-none" />
          
          <div className="relative z-10 space-y-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-emerald-500/30 text-emerald-100 text-xs font-medium border border-emerald-400/20">
                <Scale className="w-3 h-3 text-emerald-300" />
                <span>Step 2 of 2: Product & Quantity Entry</span>
              </div>

              <span className="text-xs font-mono font-semibold text-emerald-200">
                {items.length} {items.length === 1 ? 'Product Line' : 'Product Lines'}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              Enter Product Quantities & Supply Terms
            </h1>
            
            <p className="text-xs sm:text-sm text-emerald-100/90 font-normal leading-relaxed max-w-xl">
              Specify your estimated supply quantities, measurement units (e.g. Kg, Units, Boxes), and packaging specifications to generate your official registration slip.
            </p>
          </div>
        </div>

        {/* Vendor Summary Strip */}
        <div className="mb-6 bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-50 rounded-xl text-emerald-700">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                Registered Vendor
              </span>
              <span className="font-bold text-slate-800">{ventureName}</span>
              <span className="text-slate-400 mx-1.5">•</span>
              <span className="text-slate-600">{companyName}</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 font-mono text-slate-700 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
            <Phone className="w-3.5 h-3.5 text-emerald-600" />
            <span>{phone}</span>
          </div>
        </div>

        {/* Form Error Alert */}
        {errors.form && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-5 p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2"
          >
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{errors.form}</span>
          </motion.div>
        )}

        {/* Products & Quantity Form */}
        <form onSubmit={validateAndSubmit} className="space-y-4">
          <div className="space-y-3">
            <AnimatePresence>
              {items.map((item, idx) => {
                const nameErr = errors[`name_${idx}`];
                const qtyErr = errors[`quantity_${idx}`];

                return (
                  <motion.div
                    key={item.id || idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-3.5 relative hover:border-emerald-200 transition-all"
                  >
                    {/* Row Header */}
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                          Product Item #{idx + 1}
                        </span>
                      </div>

                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          className="text-xs font-semibold text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-lg transition-colors flex items-center gap-1"
                          title="Remove this product item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline text-[11px]">Remove</span>
                        </button>
                      )}
                    </div>

                    {/* Inputs Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                      {/* Product Name */}
                      <div className="sm:col-span-6 space-y-1">
                        <label className="block text-xs font-semibold text-slate-700">
                          Product Name / Item Description <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) => handleFieldChange(idx, 'name', e.target.value)}
                          placeholder="e.g. Basmati Rice 5kg / Fresh Cow Milk"
                          className={`w-full px-3.5 py-2 text-sm bg-white border rounded-xl text-slate-800 placeholder:text-slate-400 outline-none transition-all ${
                            nameErr
                              ? 'border-red-400 ring-2 ring-red-100 bg-red-50/20'
                              : 'border-slate-200 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100'
                          }`}
                        />
                        {nameErr && <p className="text-xs text-red-600 font-medium">{nameErr}</p>}
                      </div>

                      {/* Quantity */}
                      <div className="sm:col-span-3 space-y-1">
                        <label className="block text-xs font-semibold text-slate-700">
                          Quantity / Capacity <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={item.quantity}
                          onChange={(e) => handleFieldChange(idx, 'quantity', e.target.value)}
                          placeholder="e.g. 100, 500"
                          className={`w-full px-3.5 py-2 text-sm bg-white border rounded-xl text-slate-800 placeholder:text-slate-400 outline-none transition-all font-mono ${
                            qtyErr
                              ? 'border-red-400 ring-2 ring-red-100 bg-red-50/20'
                              : 'border-slate-200 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100'
                          }`}
                        />
                        {qtyErr && <p className="text-xs text-red-600 font-medium">{qtyErr}</p>}
                      </div>

                      {/* Measurement Unit */}
                      <div className="sm:col-span-3 space-y-1">
                        <label className="block text-xs font-semibold text-slate-700">
                          Unit <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={item.unit}
                          onChange={(e) => handleFieldChange(idx, 'unit', e.target.value)}
                          className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl text-slate-800 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 cursor-pointer font-medium"
                        >
                          {COMMON_UNITS.map((u) => (
                            <option key={u} value={u}>
                              {u}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Packaging Specs & Notes */}
                    <div className="space-y-1">
                      <label className="block text-[11px] font-semibold text-slate-500">
                        Packaging / Specifications / Supply Frequency (Optional)
                      </label>
                      <input
                        type="text"
                        value={item.notes || ''}
                        onChange={(e) => handleFieldChange(idx, 'notes', e.target.value)}
                        placeholder="e.g. 500g vacuum pouch, Grade A certified, Available for daily/weekly delivery"
                        className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 placeholder:text-slate-400 outline-none focus:bg-white focus:border-emerald-600"
                      />
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Add Product Line Button */}
          <div className="pt-1">
            <button
              type="button"
              onClick={handleAddItem}
              className="w-full py-3 px-4 bg-white hover:bg-emerald-50/60 text-emerald-700 font-semibold text-xs rounded-2xl border-2 border-dashed border-emerald-300 hover:border-emerald-500 flex items-center justify-center gap-2 transition-all shadow-2xs group"
            >
              <Plus className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
              <span>+ Add Another Product / Line Item</span>
            </button>
          </div>

          {/* Bottom Action Bar */}
          <div className="pt-4 flex flex-col sm:flex-row items-center gap-3">
            <button
              type="button"
              onClick={onBack}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs border border-slate-200 flex items-center justify-center gap-2 transition-colors shadow-2xs"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>← Back to Business Details</span>
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 w-full py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-sm tracking-wide shadow-lg shadow-emerald-700/20 flex items-center justify-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed transform active:scale-[0.99]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Submitting & Generating Slip...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Submit Application & Generate Slip</span>
                </>
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};
