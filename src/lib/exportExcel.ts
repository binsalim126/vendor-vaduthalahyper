import * as XLSX from 'xlsx';
import { FormQuestion, VendorSubmission } from './types';

export function exportSubmissionsToExcel(submissions: VendorSubmission[], questions: FormQuestion[], filenamePrefix = 'Vaduthala_Vendor_Submissions') {
  if (!submissions || submissions.length === 0) {
    alert('No submissions available to export.');
    return;
  }

  // Find all custom questions that are non-default
  const customQuestions = questions.filter(q => !q.is_default);

  // Map each submission to an Excel row object
  const rows = submissions.map((sub, idx) => {
    const dateObj = new Date(sub.created_at);
    const dateFormatted = dateObj.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
    const timeFormatted = dateObj.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });

    // Format itemized products with quantities
    const productItemsFormatted = sub.product_items && sub.product_items.length > 0
      ? sub.product_items.map((i) => `${i.name} (${i.quantity} ${i.unit}${i.notes ? ` - ${i.notes}` : ''})`).join('; ')
      : (Array.isArray(sub.products) ? sub.products.join(', ') : sub.products);

    const rowData: Record<string, any> = {
      'Sl. No.': idx + 1,
      'Submission ID': sub.id,
      'Date': dateFormatted,
      'Time': timeFormatted,
      'Venture Name': sub.venture_name,
      'Company Name': sub.company_name,
      'Phone Number': sub.phone,
      'Products & Quantities': productItemsFormatted,
      'Product Categories': Array.isArray(sub.products) ? sub.products.join(', ') : sub.products,
      'Status': (sub.status || 'new').toUpperCase(),
      'Admin Notes': sub.notes || ''
    };

    // Dynamically populate custom questions
    customQuestions.forEach(q => {
      const ans = sub.custom_answers?.[q.id];
      let formattedAns = '';
      if (ans === undefined || ans === null) {
        formattedAns = '-';
      } else if (typeof ans === 'boolean') {
        formattedAns = ans ? 'Yes' : 'No';
      } else if (Array.isArray(ans)) {
        formattedAns = ans.join(', ');
      } else {
        formattedAns = String(ans);
      }
      rowData[q.label] = formattedAns;
    });

    return rowData;
  });

  // Create worksheet
  const worksheet = XLSX.utils.json_to_sheet(rows);

  // Calculate auto column widths
  const columnKeys = Object.keys(rows[0] || {});
  const colWidths = columnKeys.map(key => {
    let maxLen = key.length;
    rows.forEach(r => {
      const valStr = String(r[key] || '');
      if (valStr.length > maxLen) {
        maxLen = valStr.length;
      }
    });
    return { wch: Math.min(Math.max(maxLen + 3, 12), 45) };
  });

  worksheet['!cols'] = colWidths;

  // Create workbook
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Vendor Submissions');

  // Generate filename with timestamp
  const dateStamp = new Date().toISOString().slice(0, 10);
  const fullFilename = `${filenamePrefix}_${dateStamp}.xlsx`;

  // Write and download
  XLSX.writeFile(workbook, fullFilename);
}
