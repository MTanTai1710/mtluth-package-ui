import { useEffect, useMemo, useState } from "react";
import { cn } from "../utils/cn.js";

/*
 * MPagination — pagination theo pattern Tailwick dashboard:
 *   "Showing N of Total" bên trái · Prev · 1 2 … 10 · Next bên phải.
 *
 * Dùng 2 cách:
 *
 *   1) Controlled (server-side hoặc tự manage state):
 *      <MPagination
 *        page={page}
 *        pageSize={10}
 *        total={123}
 *        onPageChange={setPage}
 *      />
 *
 *   2) Kèm hook `useMPagination(items, 10)` cho client-side slice:
 *      const { page, setPage, pageSize, pageCount, total, pageItems } =
 *        useMPagination(items, 10);
 *      ...
 *      {pageItems.map(...)}
 *      <MPagination
 *        page={page} pageCount={pageCount} pageSize={pageSize}
 *        total={total} onPageChange={setPage}
 *      />
 *
 * Props:
 *   page         số trang hiện tại (1-based)
 *   pageSize     số item/trang (bắt buộc)
 *   total        tổng số items
 *   pageCount    optional — nếu không truyền thì tự tính từ total/pageSize
 *   onPageChange (nextPage) → void
 *   siblings     số trang hiện 2 bên page hiện tại khi có ellipsis (default 1)
 *   showSummary  bật/tắt dòng "Showing N of Total" (default true)
 *   labels       { prev, next, resultsSingular, resultsPlural } để i18n
 *   className    class thêm cho wrapper
 *
 * Component tự ẩn khi total <= 0.
 */

const DEFAULT_LABELS = {
  prev: "Prev",
  next: "Next",
  showing: "Showing",
  of: "of",
  results: "Results",
};

function buildPageList(current, pageCount, siblings = 1) {
  if (pageCount <= 7) {
    return Array.from({ length: pageCount }, (_, i) => i + 1);
  }
  const first = 1;
  const last = pageCount;
  const start = Math.max(current - siblings, first + 1);
  const end = Math.min(current + siblings, last - 1);
  const out = [first];
  if (start > first + 1) out.push("…");
  for (let i = start; i <= end; i++) out.push(i);
  if (end < last - 1) out.push("…");
  out.push(last);
  return out;
}

function ChevronLeft(props) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

function ChevronRight(props) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

export function MPagination({
  page,
  pageSize,
  total,
  pageCount: pageCountProp,
  onPageChange,
  siblings = 1,
  showSummary = true,
  labels: labelsProp,
  className,
}) {
  if (!total || total <= 0) return null;

  const labels = { ...DEFAULT_LABELS, ...(labelsProp || {}) };
  const pageCount =
    pageCountProp ?? Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(1, page || 1), pageCount);
  const start = (safePage - 1) * pageSize + 1;
  const end = Math.min(safePage * pageSize, total);
  const pages = buildPageList(safePage, pageCount, siblings);

  const go = (next) => {
    if (next < 1 || next > pageCount || next === safePage) return;
    onPageChange?.(next);
  };

  const inactiveBtn =
    "inline-flex items-center justify-center h-7.5 min-w-7.5 px-2 rounded text-sm border border-default-200 text-default-600 bg-transparent hover:bg-primary/10 hover:text-primary hover:border-primary/10 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-default-600 disabled:hover:border-default-200 transition-colors";
  const activeBtn =
    "inline-flex items-center justify-center h-7.5 min-w-7.5 px-2 rounded text-sm bg-primary text-white border border-primary cursor-default";

  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-3 px-3.5 py-3",
        className,
      )}
    >
      {showSummary ? (
        <p className="text-sm text-default-500">
          {labels.showing}{" "}
          <b className="text-default-800">
            {start === end ? start : `${start}–${end}`}
          </b>{" "}
          {labels.of} <b className="text-default-800">{total}</b>{" "}
          {labels.results}
        </p>
      ) : (
        <span />
      )}
      <nav className="flex items-center gap-1.5" aria-label="Pagination">
        <button
          type="button"
          onClick={() => go(safePage - 1)}
          disabled={safePage <= 1}
          className={inactiveBtn}
          aria-label={labels.prev}
        >
          <ChevronLeft className="me-1" />
          {labels.prev}
        </button>
        {pages.map((p, idx) =>
          p === "…" ? (
            <span
              key={`e${idx}`}
              className="inline-flex items-center justify-center h-7.5 min-w-7.5 text-sm text-default-400"
              aria-hidden="true"
            >
              …
            </span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => go(p)}
              className={p === safePage ? activeBtn : inactiveBtn}
              aria-current={p === safePage ? "page" : undefined}
              aria-label={`Trang ${p}`}
            >
              {p}
            </button>
          ),
        )}
        <button
          type="button"
          onClick={() => go(safePage + 1)}
          disabled={safePage >= pageCount}
          className={inactiveBtn}
          aria-label={labels.next}
        >
          {labels.next}
          <ChevronRight className="ms-1" />
        </button>
      </nav>
    </div>
  );
}

/*
 * useMPagination — client-side slice. Auto reset page=1 khi `items`
 * đổi (filter/reload) khiến trang hiện tại vượt range.
 *
 * Return:
 *   page, setPage        trang hiện tại (1-based) + setter
 *   pageSize, setPageSize kích thước page (default = defaultSize)
 *   total                items.length
 *   pageCount            max(1, ceil(total / pageSize))
 *   pageItems            slice của items cho trang hiện tại
 */
export function useMPagination(items, defaultSize = 10) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultSize);

  const total = Array.isArray(items) ? items.length : 0;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));

  useEffect(() => {
    if (page > pageCount) setPage(1);
  }, [page, pageCount]);

  const pageItems = useMemo(() => {
    if (!Array.isArray(items)) return [];
    const start = (page - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, page, pageSize]);

  return {
    page,
    setPage,
    pageSize,
    setPageSize,
    total,
    pageCount,
    pageItems,
  };
}

export default MPagination;
