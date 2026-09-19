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
  FileSpreadsheet,
  Layers
} from 'lucide-react';
import { ProductItem } from '../../lib/types';

interface ProductQuantityFormProps {
  ventureName: string;
  companyName: string;
  phone: string;
  initialProducts?: string[];
  isSubmitting: boolean;
  onBack: () => void;
  onSubmit: (items: ProductItem[]) => void;
}

const COMMON_UNITS = ['Pcs', 'Kg'];

export const ProductQuantityForm: React.FC<ProductQuantityFormProps> = ({
  ventureName,
  companyName,
  phone,
  initialProducts,
  isSubmitting,
  onBack,
  onSubmit,
}) => {
  // Initialize items from initialProducts if provided, else generate 5 ready rows with default unit 'Pcs'
  const [items, setItems] = useState<ProductItem[]>(() => {
    if (initialProducts && initialProducts.length > 0) {
      return initialProducts.map((p, idx) => ({
        id: `item_${Date.now()}_${idx}`,
        name: p,
        quantity: '',
        unit: 'Pcs',
        notes: '',
      }));
    }
    // Default: 5 pre-populated empty rows for quick "one sheet" entry
    return Array.from({ length: 5 }, (_, idx) => ({
      id: `item_${Date.now()}_${idx}`,
      name: '',
      quantity: '',
      unit: 'Pcs',
      notes: '',
    }));
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleAddItems = (count = 1) => {
    setItems((prev) => [
      ...prev,
      ...Array.from({ length: count }, (_, idx) => ({
        id: `item_${Date.now()}_${prev.length + idx}`,
        name: '',
        quantity: '',
        unit: 'Pcs',
        notes: '',
      })),
    ]);
  };

  const handleRemoveItem = (indexToRemove: number) => {
    if (items.length <= 1) {
      setErrors({ form: 'Please keep at least one product row.' });
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

    // Filter out completely blank rows
    const filledItems = items.filter(
      (item) => item.name.trim() !== '' || String(item.quantity || '').trim() !== ''
    );

    if (filledItems.length === 0) {
      newErrors.form = 'Please enter at least one product name and quantity in the sheet.';
    } else {
      // Check each non-empty row for missing required fields
      filledItems.forEach((item) => {
        const originalIndex = items.findIndex((i) => i.id === item.id);
        if (!item.name.trim()) {
          newErrors[`name_${originalIndex}`] = 'Product name required';
        }
        if (!String(item.quantity || '').trim()) {
          newErrors[`quantity_${originalIndex}`] = 'Quantity required';
        }
      });
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      window.scrollTo({ top: 180, behavior: 'smooth' });
      return;
    }

    onSubmit(filledItems);
  };

  return (
    <div className="min-h-screen bg-slate-50/60 pb-16">
      {/* Top Brand Header */}
      <header className="bg-white border-b border-slate-200/80 sticky top-0 z-30 shadow-xs">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
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
                Step 2: Product & Quantity Sheet
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
      <main className="max-w-4xl mx-auto px-4 pt-6 sm:pt-8">
        {/* Step Header */}
        <div className="mb-6 bg-gradient-to-r from-emerald-800 via-emerald-700 to-emerald-900 text-white rounded-2xl p-6 shadow-md relative overflow-hidden">
          <div className="absolute -right-6 -bottom-6 w-36 h-36 bg-white/10 rounded-full blur-xl pointer-events-none" />
          
          <div className="relative z-10 space-y-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-emerald-500/30 text-emerald-100 text-xs font-medium border border-emerald-400/20">
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-300" />
                <span>Product Supply Sheet Entry</span>
              </div>

              <span className="text-xs font-mono font-semibold text-emerald-200">
                {items.length} Rows Ready
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              Product & Quantity Sheet
            </h1>
            
            <p className="text-xs sm:text-sm text-emerald-100/90 font-normal leading-relaxed max-w-2xl">
              Fill in your product names, quantities, and units (Pcs or Kg) directly into the sheet below.
            </p>
          </div>
        </div>

        {/* Vendor Profile Summary Strip */}
        <div className="mb-6 bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-50 rounded-xl text-emerald-700">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                Supplier Profile
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

        {/* Form Error Notification */}
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

        {/* Products Sheet Form */}
        <form onSubmit={validateAndSubmit} className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            {/* Sheet Header Banner */}
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold uppercase tracking-wider">
                  Product Entry Sheet
                </span>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">
                Fill in product details row by row
              </span>
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 text-xs font-bold border-b border-slate-200">
                    <th className="py-3 px-3 w-16 text-center">Sl No.</th>
                    <th className="py-3 px-4 min-w-[260px]">Product Name <span className="text-red-500">*</span></th>
                    <th className="py-3 px-3 w-36">Qty <span className="text-red-500">*</span></th>
                    <th className="py-3 px-3 w-32">Unit</th>
                    <th className="py-3 px-3 w-16 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-xs">
                  {items.map((item, idx) => {
                    const nameErr = errors[`name_${idx}`];
                    const qtyErr = errors[`quantity_${idx}`];

                    return (
                      <tr key={item.id} className="hover:bg-emerald-50/30 transition-colors">
                        {/* Sl No. */}
                        <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-500">
                          {idx + 1}
                        </td>

                        {/* Product Name */}
                        <td className="py-2.5 px-3">
                          <input
                            type="text"
                            value={item.name}
                            onChange={(e) => handleFieldChange(idx, 'name', e.target.value)}
                            placeholder="e.g. Basmati Rice"
                            className={`w-full px-3 py-2 text-xs bg-white border rounded-lg text-slate-800 placeholder:text-slate-400 outline-none transition-all ${
                              nameErr
                                ? 'border-red-400 ring-1 ring-red-200 bg-red-50/20'
                                : 'border-slate-200 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-200'
                            }`}
                          />
                          {nameErr && <p className="text-[10px] text-red-600 mt-0.5">{nameErr}</p>}
                        </td>

                        {/* Quantity */}
                        <td className="py-2.5 px-3">
                          <input
                            type="text"
                            value={item.quantity}
                            onChange={(e) => handleFieldChange(idx, 'quantity', e.target.value)}
                            placeholder="e.g. 50"
                            className={`w-full px-3 py-2 text-xs bg-white border rounded-lg text-slate-800 placeholder:text-slate-400 outline-none transition-all font-mono ${
                              qtyErr
                                ? 'border-red-400 ring-1 ring-red-200 bg-red-50/20'
                                : 'border-slate-200 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-200'
                            }`}
                          />
                          {qtyErr && <p className="text-[10px] text-red-600 mt-0.5">{qtyErr}</p>}
                        </td>

                        {/* Unit */}
                        <td className="py-2.5 px-3">
                          <select
                            value={item.unit}
                            onChange={(e) => handleFieldChange(idx, 'unit', e.target.value)}
                            className="w-full px-2.5 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 outline-none focus:border-emerald-600 cursor-pointer font-medium"
                          >
                            {COMMON_UNITS.map((u) => (
                              <option key={u} value={u}>
                                {u}
                              </option>
                            ))}
                          </select>
                        </td>

                        {/* Delete Row */}
                        <td className="py-2.5 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(idx)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                            title="Delete row"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List View */}
            <div className="block md:hidden p-3 space-y-3">
              {items.map((item, idx) => {
                const nameErr = errors[`name_${idx}`];
                const qtyErr = errors[`quantity_${idx}`];

                return (
                  <div
                    key={item.id}
                    className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5 relative"
                  >
                    <div className="flex items-center justify-between pb-1.5 border-b border-slate-200/60">
                      <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md font-mono">
                        Sl No. {idx + 1}
                      </span>
                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          className="text-xs text-red-600 font-semibold p-1 hover:bg-red-100 rounded transition-colors"
                        >
                          Delete
                        </button>
                      )}
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-700 block">
                        Product Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => handleFieldChange(idx, 'name', e.target.value)}
                        placeholder="e.g. Basmati Rice"
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 outline-none focus:border-emerald-600"
                      />
                      {nameErr && <p className="text-[10px] text-red-600">{nameErr}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-slate-700 block">
                          Quantity <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={item.quantity}
                          onChange={(e) => handleFieldChange(idx, 'quantity', e.target.value)}
                          placeholder="e.g. 50"
                          className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 outline-none focus:border-emerald-600 font-mono"
                        />
                        {qtyErr && <p className="text-[10px] text-red-600">{qtyErr}</p>}
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-slate-700 block">
                          Unit
                        </label>
                        <select
                          value={item.unit}
                          onChange={(e) => handleFieldChange(idx, 'unit', e.target.value)}
                          className="w-full px-2 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 outline-none focus:border-emerald-600 font-medium"
                        >
                          {COMMON_UNITS.map((u) => (
                            <option key={u} value={u}>
                              {u}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Add Rows Controls */}
            <div className="p-3 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleAddItems(1)}
                  className="px-3.5 py-2 bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-2xs transition-all"
                >
                  <Plus className="w-3.5 h-3.5 text-emerald-600" />
                  <span>+ Add Row</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleAddItems(5)}
                  className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all"
                >
                  <Layers className="w-3.5 h-3.5 text-emerald-700" />
                  <span>+ Add 5 Rows</span>
                </button>
              </div>

              <span className="text-xs text-slate-400 font-mono">
                Total Rows: {items.length}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 flex flex-col sm:flex-row items-center gap-3">
            <button
              type="button"
              onClick={onBack}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs border border-slate-200 flex items-center justify-center gap-2 transition-colors shadow-2xs"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>← Back to Step 1</span>
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
