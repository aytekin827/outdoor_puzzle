"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, ChevronUp, ChevronDown } from "lucide-react";

interface Column<T> {
  key: keyof T;
  label: string;
  render?: (val: any, row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  searchKey: keyof T;
  basePath: string; // e.g. "/admin/games" -> navigates to "/admin/games/[id]/detail"
}

export function DataTable<T extends { id: string }>({ data, columns, searchKey, basePath }: DataTableProps<T>) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [sortConfig, setSortConfig] = useState<{ key: keyof T; direction: 'asc' | 'desc' } | null>(null);

  const handleSort = (key: keyof T) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  const filteredData = data.filter(item => {
    const val = item[searchKey];
    if (typeof val === 'string') {
      return val.toLowerCase().includes(search.toLowerCase());
    }
    return true;
  });

  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortConfig) return 0;
    const { key, direction } = sortConfig;
    const aVal = a[key] as any;
    const bVal = b[key] as any;
    
    if (aVal < bVal) return direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return direction === 'asc' ? 1 : -1;
    return 0;
  });

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col pt-4">
      {/* Search & Filter Bar */}
      <div className="px-6 pb-4 flex items-center justify-between gap-4">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input 
            type="text" 
            placeholder="Search..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-primary transition-colors"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-slate-950/50 text-slate-400 text-xs uppercase font-semibold border-y border-slate-800">
            <tr>
              {columns.map(col => (
                <th 
                  key={String(col.key)} 
                  className="px-6 py-4 cursor-pointer hover:text-white transition-colors"
                  onClick={() => handleSort(col.key)}
                >
                  <div className="flex items-center gap-2">
                    {col.label}
                    {sortConfig?.key === col.key && (
                      sortConfig.direction === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {sortedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-8 text-center text-slate-500">
                  No data found.
                </td>
              </tr>
            ) : sortedData.map((row) => (
              <tr 
                key={row.id} 
                onClick={() => router.push(`${basePath}/${row.id}/detail`)}
                className="hover:bg-slate-800/50 transition-colors cursor-pointer"
              >
                {columns.map(col => (
                  <td key={String(col.key)} className="px-6 py-4 truncate max-w-[200px]">
                    {col.render ? col.render(row[col.key], row) : (row[col.key] as any)?.toString()}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
