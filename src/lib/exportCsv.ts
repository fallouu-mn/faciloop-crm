// Export CSV côté client
// TODO: Quand le backend sera branché, l'export se fera via un endpoint API
// (GET /api/export/factures?period=3m&format=csv)

export function downloadCsv(filename: string, headers: string[], rows: string[][]): void {
  const BOM = '﻿';
  const separator = ';';
  const headerLine = headers.join(separator);
  const bodyLines = rows.map(row =>
    row.map(cell => `"${(cell || '').replace(/"/g, '""')}"`).join(separator)
  );
  const content = BOM + [headerLine, ...bodyLines].join('\r\n');

  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
