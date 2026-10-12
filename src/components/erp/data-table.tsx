'use client';

// Tableau de données générique : recherche, tri, filtres, pagination.
import { useMemo, useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { EmptyState, inputClass } from './ui';

export interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  sortValue?: (row: T) => string | number;
  className?: string;
  hideOnMobile?: boolean;
}

export interface FilterDef<T> {
  key: string;
  label: string;
  options: { value: string; label: string }[];
  predicate: (row: T, value: string) => boolean;
}

export function DataTable<T extends { id: string }>({
  rows,
  columns,
  searchKeys,
  filters,
  onRowClick,
  emptyTitle = 'Aucun enregistrement',
  emptyDescription,
  pageSize = 10,
  searchPlaceholder = 'Rechercher…',
  initialFilter,
}: {
  rows: T[];
  columns: Column<T>[];
  searchKeys?: (row: T) => string;
  filters?: FilterDef<T>[];
  onRowClick?: (row: T) => void;
  emptyTitle?: string;
  emptyDescription?: string;
  pageSize?: number;
  searchPlaceholder?: string;
  initialFilter?: Record<string, string>;
}) {
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<{ key: string; dir: 1 | -1 } | null>(null);
  const [page, setPage] = useState(1);
  const [filterValues, setFilterValues] = useState<Record<string, string>>(
    initialFilter ?? {},
  );

  const filtered = useMemo(() => {
    let out = rows;
    if (search.trim() && searchKeys) {
      const q = search.trim().toLowerCase();
      out = out.filter((r) => searchKeys(r).toLowerCase().includes(q));
    }
    for (const f of filters ?? []) {
      const v = filterValues[f.key];
      if (v) out = out.filter((r) => f.predicate(r, v));
    }
    if (sort) {
      const col = columns.find((c) => c.key === sort.key);
      if (col?.sortValue) {
        out = [...out].sort((a, b) => {
          const va = col.sortValue!(a);
          const vb = col.sortValue!(b);
          return (va < vb ? -1 : va > vb ? 1 : 0) * sort.dir;
        });
      }
    }
    return out;
  }, [rows, search, searchKeys, filters, filterValues, sort, columns]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        {searchKeys && (
          <input
            type="search"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder={searchPlaceholder}
            className={cn(inputClass, 'max-w-xs')}
            aria-label="Rechercher dans le tableau"
          />
        )}
        {(filters ?? []).map((f) => (
          <select
            key={f.key}
            value={filterValues[f.key] ?? ''}
            onChange={(e) => {
              setFilterValues((v) => ({ ...v, [f.key]: e.target.value }));
              setPage(1);
            }}
            className={cn(inputClass, 'w-auto')}
            aria-label={f.label}
          >
            <option value="">{f.label} : tous</option>
            {f.options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        ))}
        <span className="ml-auto text-xs text-gray-400">
          {filtered.length} résultat{filtered.length > 1 ? 's' : ''}
        </span>
      </div>

      {filtered.length === 0 ? (
        <EmptyState title={emptyTitle} description={emptyDescription} />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-theme-xs">
          <table className="w-full min-w-max text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50/80 text-xs uppercase tracking-wide text-gray-500">
                {columns.map((c) => (
                  <th key={c.key} className={cn('px-4 py-3 font-medium', c.className, c.hideOnMobile && 'hidden md:table-cell')}>
                    {c.sortValue ? (
                      <button
                        className="inline-flex items-center gap-1 uppercase hover:text-gray-800"
                        onClick={() =>
                          setSort((s) =>
                            s?.key === c.key
                              ? { key: c.key, dir: s.dir === 1 ? -1 : 1 }
                              : { key: c.key, dir: 1 },
                          )
                        }
                      >
                        {c.header}
                        <span aria-hidden className="text-gray-400">
                          {sort?.key === c.key ? (sort.dir === 1 ? '↑' : '↓') : '↕'}
                        </span>
                      </button>
                    ) : (
                      c.header
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.map((row) => (
                <tr
                  key={row.id}
                  onClick={() => onRowClick?.(row)}
                  className={cn(
                    'border-b border-gray-100 last:border-0',
                    onRowClick && 'cursor-pointer hover:bg-cyan-50/40',
                  )}
                >
                  {columns.map((c) => (
                    <td key={c.key} className={cn('px-4 py-3 text-gray-700', c.className, c.hideOnMobile && 'hidden md:table-cell')}>
                      {c.render(row)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-3 flex items-center justify-between text-sm text-gray-500">
          <button
            className="rounded-lg px-3 py-1.5 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-40"
            disabled={safePage <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Précédent
          </button>
          <span>
            Page {safePage} / {totalPages}
          </span>
          <button
            className="rounded-lg px-3 py-1.5 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-40"
            disabled={safePage >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Suivant
          </button>
        </div>
      )}
    </div>
  );
}
