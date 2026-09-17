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
    created_at: new Date(Date.now() - 30 * 86400000).toISOString()
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
    created_at: new Date(Date.now() - 30 * 86400000).toISOString()
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
    created_at: new Date(Date.now() - 30 * 86400000).toISOString()
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
    created_at: new Date(Date.now() - 30 * 86400000).toISOString()
  },
  {
    id: 'cust_delivery_lead_time',
    label: 'Expected Delivery Lead Time',
    type: 'select',
    options: ['Same Day (< 6 Hours)', 'Next Day (24 Hours)', '2 - 3 Days', 'Weekly Scheduled Batch'],
    helper_text: 'Standard turnaround time from Purchase Order issue to Vaduthala Hyper Shopee loading dock',
    required: false,
    is_default: false,
    order_index: 4,
    created_at: new Date(Date.now() - 10 * 86400000).toISOString()
  },
  {
    id: 'cust_vendor_tier',
    label: 'Vendor Category',
    type: 'select',
    options: ['Direct Manufacturer / Producer', 'Authorized Super Stockist', 'Regional Wholesale Distributor', 'Direct Farm Producer / FPO'],
    helper_text: 'Your position in the supply chain',
    required: true,
    is_default: false,
    order_index: 5,
    created_at: new Date(Date.now() - 10 * 86400000).toISOString()
  },
  {
    id: 'cust_fssai_gst',
    label: 'GST / FSSAI License Number',
    type: 'text',
    placeholder: 'e.g. 32AAAAA0000A1Z5 / 10020042000123',
    helper_text: 'Mandatory for food, grocery, and packaged retail items',
    required: false,
    is_default: false,
    order_index: 6,
    created_at: new Date(Date.now() - 8 * 86400000).toISOString()
  },
  {
    id: 'cust_sample_availability',
    label: 'Can provide product samples for QC inspection?',
    type: 'boolean',
    helper_text: 'Free samples required for in-house quality assurance testing before listing',
    required: false,
    is_default: false,
    order_index: 7,
    created_at: new Date(Date.now() - 5 * 86400000).toISOString()
  }
];

const now = new Date();
const todayMorning = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 9, 30);
const todayNoon = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 11, 45);
const todayAfternoon = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 14, 15);
const yesterday1 = new Date(Date.now() - 86400000 + 3600000 * 2);
const yesterday2 = new Date(Date.now() - 86400000 + 3600000 * 5);
const twoDaysAgo = new Date(Date.now() - 86400000 * 2 + 3600000 * 3);
const threeDaysAgo = new Date(Date.now() - 86400000 * 3 + 3600000 * 4);

export const INITIAL_SUBMISSIONS: VendorSubmission[] = [
  {
    id: 'VHS-20260917-8492',
    venture_name: 'GreenValley Spices & Condiments',
    company_name: 'GreenValley Agro Processing LLP',
    phone: '+91 98471 22345',
    products: ['Organic Cardamom', 'Black Pepper Whole', 'Wayanad Turmeric Powder', 'Pure Clove Bud Oil'],
    custom_answers: {
      cust_delivery_lead_time: 'Next Day (24 Hours)',
      cust_vendor_tier: 'Direct Manufacturer / Producer',
      cust_fssai_gst: '32AABCG1234F1Z8',
      cust_sample_availability: true
    },
    status: 'new',
    notes: 'Submitted via supplier outreach WhatsApp campaign. Quality sample kits ready.',
    created_at: todayAfternoon.toISOString()
  },
  {
    id: 'VHS-20260917-7104',
    venture_name: 'Highland Dairy Fresh',
    company_name: 'Highland Milk Producers Co-op Ltd',
    phone: '+91 94470 99881',
    products: ['Fresh Farm Cow Milk (500ml/1L)', 'Cultured Butter', 'Paneer (200g/1kg)', 'A2 Pure Ghee'],
    custom_answers: {
      cust_delivery_lead_time: 'Same Day (< 6 Hours)',
      cust_vendor_tier: 'Direct Farm Producer / FPO',
      cust_fssai_gst: '10019042000889',
      cust_sample_availability: true
    },
    status: 'in_review',
    notes: 'Daily early morning delivery slot requested for fresh milk batch.',
    created_at: todayNoon.toISOString()
  },
  {
    id: 'VHS-20260917-6320',
    venture_name: 'OceanFresh Seafoods',
    company_name: 'Munambam Catch Trading Co.',
    phone: '+91 98950 55432',
    products: ['King Fish Steaks', 'Prawns Cleaned & Deveined', 'Sardines Fresh Catch', 'Pomfret Whole'],
    custom_answers: {
      cust_delivery_lead_time: 'Same Day (< 6 Hours)',
      cust_vendor_tier: 'Authorized Super Stockist',
      cust_fssai_gst: '32AAECP5432Q1Z3',
      cust_sample_availability: true
    },
    status: 'contacted',
    notes: 'Met with procurement manager on call. Ice box packaging compliant.',
    created_at: todayMorning.toISOString()
  },
  {
    id: 'VHS-20260916-5219',
    venture_name: 'BakeCraft Gourmet Confectionery',
    company_name: 'BakeCraft Bakers & Distributors',
    phone: '+91 97455 66778',
    products: ['Whole Wheat Artisanal Bread', 'Butter Rusks', 'Plum Cake (Eggless)', 'Assorted Cookies'],
    custom_answers: {
      cust_delivery_lead_time: 'Next Day (24 Hours)',
      cust_vendor_tier: 'Direct Manufacturer / Producer',
      cust_fssai_gst: '10021042000345',
      cust_sample_availability: true
    },
    status: 'approved',
    notes: 'Approved for Hyper Shopee Bakery Section shelf space.',
    created_at: yesterday2.toISOString()
  },
  {
    id: 'VHS-20260916-4108',
    venture_name: 'CleanMax Hygiene Essentials',
    company_name: 'Southern Chemicals & Detergents Ltd',
    phone: '+91 94000 11223',
    products: ['Floor Cleaner Pine 5L', 'Dishwashing Liquid Lemon', 'Bleach & Disinfectant', 'Garbage Bags Biodegradable'],
    custom_answers: {
      cust_delivery_lead_time: '2 - 3 Days',
      cust_vendor_tier: 'Regional Wholesale Distributor',
      cust_fssai_gst: '32AACSC7788P1Z1',
      cust_sample_availability: false
    },
    status: 'in_review',
    notes: 'Bulk discount margin schedule provided. Evaluating profit margins.',
    created_at: yesterday1.toISOString()
  },
  {
    id: 'VHS-20260915-3094',
    venture_name: 'Tropical Beverages & Juices',
    company_name: 'Tropical Agro Botanicals Pvt Ltd',
    phone: '+91 98460 33445',
    products: ['Tender Coconut Water (Bottle)', 'Passion Fruit Nectar', 'Kokum Sharbat Concentrate', 'Mango Pulp Tin'],
    custom_answers: {
      cust_delivery_lead_time: '2 - 3 Days',
      cust_vendor_tier: 'Direct Manufacturer / Producer',
      cust_fssai_gst: '10018042000112',
      cust_sample_availability: true
    },
    status: 'contacted',
    notes: 'Sent initial contract draft for seasonal beverage display rack.',
    created_at: twoDaysAgo.toISOString()
  },
  {
    id: 'VHS-20260914-2081',
    venture_name: 'Prime Mill Rice Traders',
    company_name: 'Prime Agro Commodities Corp',
    phone: '+91 98472 88990',
    products: ['Jaya Rice Matta (10kg/25kg)', 'Biryani Kaima Rice', 'Sonamasuri Rice', 'Idli Rice Premium'],
    custom_answers: {
      cust_delivery_lead_time: 'Weekly Scheduled Batch',
      cust_vendor_tier: 'Authorized Super Stockist',
      cust_fssai_gst: '32AABCP9900L1ZX',
      cust_sample_availability: true
    },
    status: 'approved',
    notes: 'Bulk grain bay vendor onboarded. 30 days credit terms agreed.',
    created_at: threeDaysAgo.toISOString()
  }
];
