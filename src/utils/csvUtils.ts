export const jsonToCsvBlob = (data: any[]): Blob => {
  if (!data || !data.length) return new Blob(["No Data"], { type: 'text/csv' });
  
  // Extract headers dynamically from all objects to ensure no columns are missed
  const headerSet = new Set<string>();
  data.forEach(row => Object.keys(row).forEach(k => headerSet.add(k)));
  const headers = Array.from(headerSet).filter(h => h !== '__v' && h !== 'password');
  
  const csvRows = [headers.join(',')];
  
  for (const row of data) {
    const values = headers.map(header => {
      const val = row[header];
      let strVal = '';
      
      if (Array.isArray(val)) {
        strVal = val.map(item => {
          if (typeof item === 'object' && item !== null) {
            return item.name ? `${item.name}${item.quantity ? ` (Qty: ${item.quantity})` : ''}` : JSON.stringify(item);
          }
          return String(item);
        }).join('; ');
      } else if (typeof val === 'object' && val !== null) {
        if (val.name) {
          strVal = val.name;
          if (val.phone_number) strVal += ` - ${val.phone_number}`;
        } else {
          // If the object only contains an ID, we might not have populated it, fallback to ID or stringify
          strVal = val._id || val.id || JSON.stringify(val);
        }
      } else {
        strVal = String(val ?? '');
      }
      
      // Escape quotes by doubling them
      return `"${strVal.replace(/"/g, '""')}"`;
    });
    csvRows.push(values.join(','));
  }
  
  return new Blob([csvRows.join('\n')], { type: 'text/csv' });
};
