import { FormQuestion, VendorSubmission } from './types';

export const DEFAULT_QUESTIONS: FormQuestion[] = [
  {
    id: 'venture_name',
    label: 'Venture Name',
    type: 'text',
    placeholder: 'e.g. Malabar Organic Harvests',
    helper_text: 'The trade name or brand under which you market products',
    required: true,
    is_default: true,
    order_index: 0,
    created_at: new Date().toISOString()
  },
  {
    id: 'company_name',
    label: 'Company Name',
    type: 'text',
    placeholder: 'e.g. Malabar Agro & Dairy Private Limited',
    helper_text: 'Registered legal entity name as per GST / Trade License',
    required: true,
    is_default: true,
    order_index: 1,
    created_at: new Date().toISOString()
  },
  {
    id: 'phone',
    label: 'Phone Number',
    type: 'text',
    placeholder: '+91 98470 12345',
    helper_text: 'Primary business contact for procurement & purchasing team',
    required: true,
    is_default: true,
    order_index: 2,
    created_at: new Date().toISOString()
  },
  {
    id: 'products',
    label: 'Products Offered',
    type: 'multiselect',
    placeholder: 'Type product category or name and press Enter',
    helper_text: 'List your key items, brands, or product categories',
    required: true,
    is_default: true,
    order_index: 3,
    created_at: new Date().toISOString()
  }
];

export const INITIAL_SUBMISSIONS: VendorSubmission[] = [];

