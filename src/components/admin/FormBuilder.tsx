import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Trash2, 
  Lock, 
  Sparkles, 
  Layers, 
  CheckCircle2, 
  HelpCircle, 
  Type, 
  AlignLeft, 
  Hash, 
  ListOrdered, 
  CheckSquare, 
  ToggleLeft,
  Smartphone,
  Eye,
  ArrowUpDown,
  AlertCircle
} from 'lucide-react';
import { FormQuestion, QuestionType } from '../../lib/types';
import { saveFormQuestion, deleteFormQuestion } from '../../lib/supabase';

interface FormBuilderProps {
  questions: FormQuestion[];
  onQuestionsChange: (questions: FormQuestion[]) => void;
}

const FIELD_TYPES: { type: QuestionType; label: string; icon: any; description: string }[] = [
  { type: 'text', label: 'Single Line Text', icon: Type, description: 'Short answers, identifiers, licenses' },
  { type: 'textarea', label: 'Multi-line Paragraph', icon: AlignLeft, description: 'Detailed descriptions, terms' },
  { type: 'number', label: 'Number', icon: Hash, description: 'Quantity, years in business, pricing' },
  { type: 'select', label: 'Dropdown Select', icon: ListOrdered, description: 'Choose one option from a list' },
  { type: 'multiselect', label: 'Multiple Choice (Checkboxes)', icon: CheckSquare, description: 'Select multiple items from a list' },
  { type: 'boolean', label: 'Yes / No Toggle', icon: ToggleLeft, description: 'Binary agreement or confirmation' },
];

export const FormBuilder: React.FC<FormBuilderProps> = ({
  questions,
  onQuestionsChange,
}) => {
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  // New Question Form State
  const [label, setLabel] = useState('');
  const [type, setType] = useState<QuestionType>('text');
  const [placeholder, setPlaceholder] = useState('');
  const [helperText, setHelperText] = useState('');
  const [required, setRequired] = useState(false);
  const [options, setOptions] = useState<string[]>(['Option 1', 'Option 2']);
  const [newOptionInput, setNewOptionInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Sorting
  const sortedQuestions = [...questions].sort((a, b) => a.order_index - b.order_index);

  const handleOpenAddModal = () => {
    setLabel('');
    setType('text');
    setPlaceholder('');
    setHelperText('');
    setRequired(false);
    setOptions(['Option 1', 'Option 2']);
    setNewOptionInput('');
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleAddOption = () => {
    if (!newOptionInput.trim()) return;
    if (options.includes(newOptionInput.trim())) return;
    setOptions([...options, newOptionInput.trim()]);
    setNewOptionInput('');
  };

  const handleRemoveOption = (index: number) => {
    if (options.length <= 1) {
      alert('Dropdown & Multiple Choice questions need at least one option.');
      return;
    }
    setOptions(options.filter((_, i) => i !== index));
  };

  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim()) {
      setErrorMsg('Please enter a question label.');
      return;
    }

    if ((type === 'select' || type === 'multiselect') && options.length === 0) {
      setErrorMsg('Please add at least one option for choice fields.');
      return;
    }

    setIsSubmitting(true);
    try {
      const newQuestionId = `cust_${Date.now()}`;
      const newQuestion: FormQuestion = {
        id: newQuestionId,
        label: label.trim(),
        type,
        placeholder: placeholder.trim() || undefined,
        helper_text: helperText.trim() || undefined,
        required,
        is_default: false,
        options: type === 'select' || type === 'multiselect' ? options : undefined,
        order_index: questions.length,
        created_at: new Date().toISOString(),
      };

      const saved = await saveFormQuestion(newQuestion);
      onQuestionsChange([...questions, saved]);
      setIsModalOpen(false);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error saving question.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    const q = questions.find((item) => item.id === questionId);
    if (q?.is_default) {
      alert('Default system questions cannot be removed.');
      return;
    }

    if (window.confirm(`Delete question "${q?.label}"? This will immediately remove it from the vendor submission form.`)) {
      await deleteFormQuestion(questionId);
      onQuestionsChange(questions.filter((item) => item.id !== questionId));
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-600" />
            <span>Dynamic Form Builder</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Customize the vendor onboarding form. Changes sync in real-time to the live submission portal.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setPreviewMode(!previewMode)}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all border ${
              previewMode
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-xs'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
            <span>{previewMode ? 'Hide Form Preview' : 'Show Live Preview'}</span>
          </button>

          <button
            type="button"
            onClick={handleOpenAddModal}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-emerald-700/20 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add Custom Question</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Form Elements List + Optional Live Preview Drawer */}
      <div className={`grid grid-cols-1 ${previewMode ? 'lg:grid-cols-12' : ''} gap-6`}>
        {/* Questions Manager Column */}
        <div className={`${previewMode ? 'lg:col-span-7' : 'w-full'} space-y-3`}>
          {/* Default System Questions Section */}
          <div className="bg-slate-100/70 rounded-2xl p-4 border border-slate-200/60 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-slate-500" />
                <span>Default Core Fields (Protected)</span>
              </span>
              <span className="text-[11px] text-slate-400 font-medium">
                4 Core Requirements
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {sortedQuestions
                .filter((q) => q.is_default)
                .map((q) => (
                  <div
                    key={q.id}
                    className="p-3 bg-white rounded-xl border border-slate-200/80 flex items-center justify-between shadow-2xs"
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-800">{q.label}</span>
                        <span className="text-[10px] text-red-500 font-bold">*</span>
                      </div>
                      <span className="text-[10px] text-slate-400 capitalize">
                        {q.type} • Core Identity
                      </span>
                    </div>
                    <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md font-semibold flex items-center gap-1">
                      <Lock className="w-2.5 h-2.5" />
                      Locked
                    </span>
                  </div>
                ))}
            </div>
          </div>

          {/* Custom Questions Section */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Custom Questions & Dynamic Criteria
                </h3>
              </div>
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
                {sortedQuestions.filter((q) => !q.is_default).length} Active Questions
              </span>
            </div>

            {sortedQuestions.filter((q) => !q.is_default).length === 0 ? (
              <div className="text-center py-10 px-4 border-2 border-dashed border-slate-200 rounded-2xl">
                <HelpCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-700">No Custom Questions Added Yet</p>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  Click the "Add Custom Question" button above to request specific details like lead times, certifications, or packaging types.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {sortedQuestions
                  .filter((q) => !q.is_default)
                  .map((q, idx) => (
                    <motion.div
                      key={q.id}
                      layout
                      className="p-4 rounded-xl border border-slate-200 hover:border-emerald-300 bg-slate-50/50 hover:bg-white transition-all space-y-2 group shadow-2xs"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-bold text-slate-800">
                              {idx + 1}. {q.label}
                            </span>
                            {q.required && (
                              <span className="px-1.5 py-0.5 text-[10px] font-bold bg-red-50 text-red-600 border border-red-200 rounded">
                                Required
                              </span>
                            )}
                            <span className="px-2 py-0.5 text-[10px] font-semibold bg-slate-100 text-slate-600 rounded-md uppercase tracking-wider">
                              {q.type}
                            </span>
                          </div>

                          {q.helper_text && (
                            <p className="text-[11px] text-slate-500 font-normal">
                              {q.helper_text}
                            </p>
                          )}

                          {q.options && q.options.length > 0 && (
                            <div className="flex flex-wrap gap-1 pt-1">
                              {q.options.map((opt, oIdx) => (
                                <span
                                  key={oIdx}
                                  className="text-[10px] px-2 py-0.5 bg-white border border-slate-200 text-slate-600 rounded-md font-medium"
                                >
                                  {opt}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleDeleteQuestion(q.id)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete custom question"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
              </div>
            )}
          </div>
        </div>

        {/* Live Mobile Form Preview Pane */}
        {previewMode && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="lg:col-span-5 space-y-3"
          >
            <div className="sticky top-20 bg-slate-900 text-white rounded-3xl p-5 shadow-2xl border border-slate-700">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                    Live Vendor Form Preview
                  </span>
                </div>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold">
                  Interactive
                </span>
              </div>

              <div className="mt-4 max-h-[600px] overflow-y-auto pr-1 space-y-4 text-slate-800">
                {/* Simulated vendor form box */}
                <div className="bg-white rounded-2xl p-4 space-y-3.5 shadow-md">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                    <img src="/logo.png" alt="Logo" className="h-6 w-auto" />
                    <span className="text-xs font-bold text-slate-700">Supplier Registration</span>
                  </div>

                  {/* Render simulated fields */}
                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">
                        Venture Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        disabled
                        placeholder="e.g. Malabar Organic Harvests"
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                      />
                    </div>

                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">
                        Company Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        disabled
                        placeholder="e.g. Malabar Agro & Dairy Pvt Ltd"
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                      />
                    </div>

                    {/* Custom questions render */}
                    {sortedQuestions
                      .filter((q) => !q.is_default)
                      .map((q) => (
                        <div key={q.id} className="pt-1 border-t border-slate-100">
                          <label className="font-semibold text-slate-700 block mb-1">
                            {q.label} {q.required && <span className="text-red-500">*</span>}
                          </label>
                          {q.type === 'select' ? (
                            <select disabled className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs">
                              <option>-- Select an option --</option>
                              {q.options?.map((o, idx) => (
                                <option key={idx}>{o}</option>
                              ))}
                            </select>
                          ) : q.type === 'multiselect' ? (
                            <div className="flex flex-wrap gap-1">
                              {q.options?.map((o, idx) => (
                                <span key={idx} className="px-2 py-0.5 bg-slate-100 rounded text-[10px]">
                                  {o}
                                </span>
                              ))}
                            </div>
                          ) : q.type === 'boolean' ? (
                            <div className="flex gap-2">
                              <span className="px-3 py-1 bg-slate-100 rounded text-xs font-semibold">Yes</span>
                              <span className="px-3 py-1 bg-slate-100 rounded text-xs font-semibold">No</span>
                            </div>
                          ) : (
                            <input
                              type="text"
                              disabled
                              placeholder={q.placeholder || 'Enter value...'}
                              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                            />
                          )}
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Add Custom Question Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden"
            >
              {/* Modal Header */}
              <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-emerald-600 rounded-xl">
                    <Plus className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white">Add Custom Question</h2>
                    <p className="text-xs text-slate-400">Configure new dynamic field for vendor form</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                >
                  <Trash2 className="hidden" />
                  ✕
                </button>
              </div>

              {/* Modal Form */}
              <form onSubmit={handleSaveQuestion} className="p-6 space-y-5">
                {errorMsg && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {/* Field Label */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Question Label / Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    placeholder="e.g. Expected Lead Time / GST Certificate Number"
                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none"
                    required
                  />
                </div>

                {/* Field Type Selector */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Input Type
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {FIELD_TYPES.map((ft) => {
                      const IconComponent = ft.icon;
                      const isSelected = type === ft.type;
                      return (
                        <button
                          key={ft.type}
                          type="button"
                          onClick={() => setType(ft.type)}
                          className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                            isSelected
                              ? 'bg-emerald-50 border-emerald-500 ring-1 ring-emerald-500 text-emerald-950'
                              : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                          }`}
                        >
                          <IconComponent className={`w-4 h-4 mb-1.5 ${isSelected ? 'text-emerald-600' : 'text-slate-400'}`} />
                          <span className="text-xs font-bold leading-tight">{ft.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Options Builder for Select / Multiselect */}
                {(type === 'select' || type === 'multiselect') && (
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Choice Options List
                    </label>

                    <div className="space-y-1.5">
                      {options.map((opt, oIdx) => (
                        <div key={oIdx} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={opt}
                            onChange={(e) => {
                              const updated = [...options];
                              updated[oIdx] = e.target.value;
                              setOptions(updated);
                            }}
                            className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg outline-none focus:border-emerald-600"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveOption(oIdx)}
                            className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="text"
                        value={newOptionInput}
                        onChange={(e) => setNewOptionInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddOption();
                          }
                        }}
                        placeholder="Add another option..."
                        className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg outline-none focus:border-emerald-600"
                      />
                      <button
                        type="button"
                        onClick={handleAddOption}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                )}

                {/* Placeholder & Helper Text */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-700">
                      Placeholder Hint (Optional)
                    </label>
                    <input
                      type="text"
                      value={placeholder}
                      onChange={(e) => setPlaceholder(e.target.value)}
                      placeholder="e.g. Enter certificate code..."
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl outline-none focus:border-emerald-600"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-700">
                      Helper Instruction (Optional)
                    </label>
                    <input
                      type="text"
                      value={helperText}
                      onChange={(e) => setHelperText(e.target.value)}
                      placeholder="e.g. Mandatory for F&B items"
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl outline-none focus:border-emerald-600"
                    />
                  </div>
                </div>

                {/* Required Toggle */}
                <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">Required Question</span>
                    <span className="text-[11px] text-slate-500">Vendors must answer this question before submitting</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={required}
                    onChange={(e) => setRequired(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-emerald-700/20 active:scale-95"
                  >
                    {isSubmitting ? 'Saving...' : 'Add Question'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
