import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ page, pages, total, limit, onPageChange }) {
  if (pages <= 1) return null;

  const pageNumbers = [];
  for (let i = 1; i <= pages; i += 1) {
    if (i === 1 || i === pages || Math.abs(i - page) <= 2) pageNumbers.push(i);
  }

  const items = [];
  let prev = 0;
  pageNumbers.forEach((p) => {
    if (p - prev > 1) items.push('...');
    items.push(p);
    prev = p;
  });

  return (
    <div className="flex flex-col gap-2" style={{ alignItems: 'center', marginTop: '20px' }}>
      <div className="pagination">
        <button className="page-btn" disabled={page <= 1} onClick={() => onPageChange(page - 1)} aria-label="Previous Page">
          <ChevronLeft size={16} />
        </button>
        {items.map((it, idx) =>
          it === '...' ? (
            <span key={`e${idx}`} className="muted px-1">
              …
            </span>
          ) : (
            <button
              key={it}
              className={`page-btn ${it === page ? 'active' : ''}`}
              onClick={() => onPageChange(it)}
            >
              {it}
            </button>
          )
        )}
        <button className="page-btn" disabled={page >= pages} onClick={() => onPageChange(page + 1)} aria-label="Next Page">
          <ChevronRight size={16} />
        </button>
      </div>
      <span className="muted" style={{ fontSize: '0.82rem' }}>
        Showing page <strong>{page}</strong> of <strong>{pages}</strong> ({total} total providers)
      </span>
    </div>
  );
}