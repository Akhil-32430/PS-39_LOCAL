export const toCSV = (items = [], fields = []) => {
  if (!items || items.length === 0) return "";
  const headers = fields.length ? fields : Object.keys(items[0]);
  const escape = (v) => {
    if (v === null || v === undefined) return "";
    const s = String(v).replace(/"/g, '""');
    return `"${s}"`;
  };
  const rows = [headers.map((h) => escape(h)).join(",")];
  for (const it of items) {
    const row = headers.map((h) => escape(it[h] ?? "")).join(",");
    rows.push(row);
  }
  return rows.join("\n");
};

export const downloadCSV = (filename, items, fields) => {
  const csv = toCSV(items, fields);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};
