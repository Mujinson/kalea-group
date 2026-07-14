import { ReactNode, useMemo, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowUpDown, ArrowUp, ArrowDown, Search } from 'lucide-react';
import EmptyState from './EmptyState';
import { cn } from '@/lib/utils';

export interface DataTableColumn<T> {
  key: string;
  header: string;
  accessor?: (row: T) => unknown;
  cell?: (row: T) => ReactNode;
  sortable?: boolean;
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: DataTableColumn<T>[];
  loading?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
  searchKeys?: (keyof T | string)[];
  onRowClick?: (row: T) => void;
  emptyTitle?: string;
  emptyDescription?: string;
  pageSize?: number;
  toolbar?: ReactNode;
  rowKey?: (row: T, idx: number) => string | number;
}

function get(obj: any, path: string) {
  return path.split('.').reduce((o, k) => (o == null ? o : o[k]), obj);
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  loading = false,
  searchable = true,
  searchPlaceholder = 'Cerca…',
  searchKeys,
  onRowClick,
  emptyTitle = 'Nessun dato',
  emptyDescription = 'Non ci sono record da mostrare.',
  pageSize = 25,
  toolbar,
  rowKey,
}: DataTableProps<T>) {
  const [query, setQuery] = useState('');
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    if (!query.trim()) return data;
    const q = query.toLowerCase();
    const keys = (searchKeys && searchKeys.length ? searchKeys : columns.map((c) => c.key)) as string[];
    return data.filter((row) =>
      keys.some((k) => {
        const v = get(row, k as string);
        return v != null && String(v).toLowerCase().includes(q);
      }),
    );
  }, [data, query, searchKeys, columns]);

  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    const col = columns.find((c) => c.key === sortKey);
    const arr = [...filtered];
    arr.sort((a, b) => {
      const va = col?.accessor ? col.accessor(a) : get(a, sortKey);
      const vb = col?.accessor ? col.accessor(b) : get(b, sortKey);
      if (va == null) return 1;
      if (vb == null) return -1;
      if (typeof va === 'number' && typeof vb === 'number') return sortDir === 'asc' ? va - vb : vb - va;
      return sortDir === 'asc'
        ? String(va).localeCompare(String(vb))
        : String(vb).localeCompare(String(va));
    });
    return arr;
  }, [filtered, sortKey, sortDir, columns]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paged = sorted.slice((safePage - 1) * pageSize, safePage * pageSize);

  const toggleSort = (key: string) => {
    if (sortKey !== key) {
      setSortKey(key);
      setSortDir('asc');
    } else {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    }
  };

  return (
    <div className="crm-card overflow-hidden">
      {(searchable || toolbar) && (
        <div className="flex items-center gap-3 p-3 border-b border-crm-border">
          {searchable && (
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-crm-ink-subtle pointer-events-none" />
              <Input
                placeholder={searchPlaceholder}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setPage(1);
                }}
                className="pl-9 h-9 bg-white border-crm-border"
              />
            </div>
          )}
          {toolbar}
        </div>
      )}

      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            {columns.map((c) => (
              <TableHead
                key={c.key}
                className={cn(
                  "text-[11px] uppercase tracking-wider text-crm-ink-muted font-semibold",
                  c.sortable && "cursor-pointer select-none",
                  c.className,
                )}
                onClick={() => c.sortable && toggleSort(c.key)}
              >
                <span className="inline-flex items-center gap-1.5">
                  {c.header}
                  {c.sortable &&
                    (sortKey !== c.key ? (
                      <ArrowUpDown className="w-3 h-3 opacity-50" />
                    ) : sortDir === 'asc' ? (
                      <ArrowUp className="w-3 h-3 text-crm-primary" />
                    ) : (
                      <ArrowDown className="w-3 h-3 text-crm-primary" />
                    ))}
                </span>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                {columns.map((c) => (
                  <TableCell key={c.key}>
                    <Skeleton className="h-4 w-full" />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : paged.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length} className="p-0">
                <EmptyState title={emptyTitle} description={emptyDescription} />
              </TableCell>
            </TableRow>
          ) : (
            paged.map((row, i) => (
              <TableRow
                key={rowKey ? rowKey(row, i) : (row as any).id ?? i}
                className={cn(onRowClick && 'cursor-pointer')}
                onClick={() => onRowClick?.(row)}
              >
                {columns.map((c) => (
                  <TableCell key={c.key} className={cn('text-[13px] text-crm-ink', c.className)}>
                    {c.cell ? c.cell(row) : (c.accessor ? (c.accessor(row) as ReactNode) : (get(row, c.key) as ReactNode)) ?? '—'}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {!loading && sorted.length > pageSize && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-crm-border bg-crm-bg-soft">
          <span className="text-[12px] text-crm-ink-muted">
            {(safePage - 1) * pageSize + 1}–{Math.min(safePage * pageSize, sorted.length)} di {sorted.length}
          </span>
          <div className="flex items-center gap-2">
            <button
              className="px-3 h-8 text-[12px] rounded-crm-sm border border-crm-border bg-white text-crm-ink-muted hover:text-crm-ink hover:border-crm-border-strong hover:bg-crm-bg-soft disabled:opacity-40 disabled:pointer-events-none transition"
              disabled={safePage === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Prec
            </button>
            <span className="text-[12px] text-crm-ink-muted tabular-nums">
              {safePage} / {totalPages}
            </span>
            <button
              className="px-3 h-8 text-[12px] rounded-crm-sm border border-crm-border bg-white text-crm-ink-muted hover:text-crm-ink hover:border-crm-border-strong hover:bg-crm-bg-soft disabled:opacity-40 disabled:pointer-events-none transition"
              disabled={safePage === totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Succ
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default DataTable;

