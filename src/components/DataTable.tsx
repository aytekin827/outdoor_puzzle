"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Search, ChevronUp, ChevronDown } from "lucide-react";

interface Column<T> {
  key: keyof T;
  label: string;
  render?: (val: any, row: T) => React.ReactNode;
}

interface FilterOption {
  label: string;
  value: any;
}

interface FilterConfig<T> {
  key: keyof T;
  label: string;
  options: FilterOption[];
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  searchKeys: (keyof T)[];
  searchHelpText?: string;
  basePath: string; // e.g. "/admin/games" -> navigates to "/admin/games/[id]/detail"
  filters?: FilterConfig<T>[];
  defaultSort?: { key: keyof T; direction: 'asc' | 'desc' };
}

export function DataTable<T extends { id: string }>({ 
  data, 
  columns, 
  searchKeys, 
  searchHelpText,
  basePath, 
  filters,
  defaultSort
}: DataTableProps<T>) {
  const router = useRouter();
  const pathname = usePathname();
  const [search, setSearch] = useState("");
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({});
  const [sortConfig, setSortConfig] = useState<{ key: keyof T; direction: 'asc' | 'desc' } | null>(defaultSort || null);

  const handleSort = (key: keyof T) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  const handleFilterChange = (key: string, value: any) => {
    setActiveFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const filteredData = data.filter(item => {
    // Search filter across multiple keys
    const matchesSearch = search === "" || searchKeys.some(key => {
      const val = item[key];
      return typeof val === 'string' && val.toLowerCase().includes(search.toLowerCase());
    });

    if (!matchesSearch) return false;

    // Filter by columns
    for (const [key, value] of Object.entries(activeFilters)) {
      if (value === "" || value === undefined || value === null) continue;
      if (item[key as keyof T] !== value) return false;
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
      <div className="px-6 pb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="w-full max-w-sm">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-primary transition-colors"
            />
          </div>
          {searchHelpText && (
            <p className="text-[10px] text-slate-500 mt-1 ml-1">{searchHelpText}</p>
          )}
        </div>

        {/* Filters */}
        {filters && filters.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {filters.map(f => (
              <select
                key={String(f.key)}
                value={activeFilters[String(f.key)] || ""}
                onChange={(e) => handleFilterChange(String(f.key), e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-semibold text-slate-300 focus:outline-none focus:border-primary"
              >
                <option value="">{f.label}: 전체</option>
                {f.options.map(opt => (
                  <option key={String(opt.value)} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            ))}
          </div>
        )}
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
                onClick={() => router.push(`${basePath}/${row.id}/detail?returnTo=${encodeURIComponent(pathname)}`)}
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
