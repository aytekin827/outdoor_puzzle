"use client";

import { Search, ChevronUp, ChevronDown } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

interface Column<T> {
  key: keyof T;
  label: string;
  render?: (val: unknown, row: T) => React.ReactNode;
}

interface FilterOption {
  label: string;
  value: string | number | boolean;
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
  searchPlaceholder?: string;
  basePath: string;
  filters?: FilterConfig<T>[];
  defaultSort?: { key: keyof T; direction: "asc" | "desc" };
  disableRowClick?: boolean;
  emptyText?: string;
}

export function DataTable<T extends { id: string }>({
  data,
  columns,
  searchKeys,
  searchHelpText,
  searchPlaceholder,
  basePath,
  filters,
  defaultSort,
  disableRowClick,
  emptyText,
}: DataTableProps<T>) {
  const router = useRouter();
  const pathname = usePathname();
  const [search, setSearch] = useState("");
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
  const [sortConfig, setSortConfig] = useState<{ key: keyof T; direction: "asc" | "desc" } | null>(
    defaultSort || null,
  );

  const handleSort = (key: keyof T) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const handleFilterChange = (key: string, value: string) => {
    setActiveFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const filteredData = data.filter((item) => {
    const matchesSearch =
      search === "" ||
      searchKeys.some((key) => {
        const value = item[key];
        return typeof value === "string" && value.toLowerCase().includes(search.toLowerCase());
      });

    if (!matchesSearch) {
      return false;
    }

    for (const [key, value] of Object.entries(activeFilters)) {
      if (!value) {
        continue;
      }

      if (String(item[key as keyof T] ?? "") !== value) {
        return false;
      }
    }

    return true;
  });

  const sortedData = [...filteredData].sort((left, right) => {
    if (!sortConfig) {
      return 0;
    }

    const { key, direction } = sortConfig;
    const leftValue = left[key] as string | number | boolean | null | undefined;
    const rightValue = right[key] as string | number | boolean | null | undefined;

    if (leftValue == null && rightValue == null) {
      return 0;
    }
    if (leftValue == null) {
      return 1;
    }
    if (rightValue == null) {
      return -1;
    }
    if (leftValue < rightValue) {
      return direction === "asc" ? -1 : 1;
    }
    if (leftValue > rightValue) {
      return direction === "asc" ? 1 : -1;
    }
    return 0;
  });

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col pt-4">
      <div className="px-6 pb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="w-full max-w-sm">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder={searchPlaceholder || "검색어를 입력하세요"}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-primary transition-colors"
            />
          </div>
          {searchHelpText ? <p className="text-[10px] text-slate-500 mt-1 ml-1">{searchHelpText}</p> : null}
        </div>

        {filters && filters.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {filters.map((filter) => (
              <select
                key={String(filter.key)}
                value={activeFilters[String(filter.key)] || ""}
                onChange={(event) => handleFilterChange(String(filter.key), event.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-semibold text-slate-300 focus:outline-none focus:border-primary"
              >
                <option value="">{filter.label}: 전체</option>
                {filter.options.map((option) => (
                  <option key={String(option.value)} value={String(option.value)}>
                    {option.label}
                  </option>
                ))}
              </select>
            ))}
          </div>
        ) : null}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-slate-950/50 text-slate-400 text-xs uppercase font-semibold border-y border-slate-800">
            <tr>
              {columns.map((column) => (
                <th
                  key={String(column.key)}
                  className="px-6 py-4 cursor-pointer hover:text-white transition-colors"
                  onClick={() => handleSort(column.key)}
                >
                  <div className="flex items-center gap-2">
                    {column.label}
                    {sortConfig?.key === column.key ? (
                      sortConfig.direction === "asc" ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )
                    ) : null}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {sortedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-8 text-center text-slate-500">
                  {emptyText || "표시할 데이터가 없습니다."}
                </td>
              </tr>
            ) : (
              sortedData.map((row) => (
                <tr
                  key={row.id}
                  onClick={
                    disableRowClick
                      ? undefined
                      : () => router.push(`${basePath}/${row.id}/detail?returnTo=${encodeURIComponent(pathname)}`)
                  }
                  className={`transition-colors ${disableRowClick ? "" : "hover:bg-slate-800/50 cursor-pointer"}`}
                >
                  {columns.map((column) => (
                    <td key={String(column.key)} className="px-6 py-4 truncate max-w-[240px]">
                      {column.render ? column.render(row[column.key], row) : String(row[column.key] ?? "-")}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
