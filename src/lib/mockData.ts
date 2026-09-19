import { FormQuestion, VendorSubmission } from './types';

export const DEFAULT_QUESTIONS: FormQuestion[] = [
  {
    id: 'venture_name',
    label: 'Vendor Name',
    type: 'text',
    placeholder: 'e.g. Malabar Organic Harvests',
    helper_text: 'Vendor trade name or brand',
    required: true,
    is_default: true,
    order_index: 0,
    created_at: new Date().toISOString()
  },
  {
    id: 'company_name',
    label: 'Distribution',
    type: 'text',
    placeholder: 'e.g. Malabar Agro & Distribution Pvt Ltd',
    helper_text: 'Distribution network or registered company name',
    required: true,
    is_default: true,
    order_index: 1,
    created_at: new Date().toISOString()
  },
  {
    id: 'phone',
    label: 'Phone',
    type: 'text',
    placeholder: '+91 98470 12345',
    helper_text: 'Direct contact number for Purchase Order approvals',
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

