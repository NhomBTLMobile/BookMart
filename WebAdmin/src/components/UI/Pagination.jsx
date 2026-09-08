import { LuChevronLeft, LuChevronRight } from 'react-icons/lu'

export default function Pagination({ meta, page, setPage }) {
  if (!meta || meta.totalPages <= 1) return null
  const { totalPages, total, limit } = meta
  const from = (page - 1) * limit + 1
  const to   = Math.min(page * limit, total)

  const pages = []
  const delta = 1
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= page - delta && i <= page + delta)) {
      pages.push(i)
    } else if (pages[pages.length - 1] !== '...') {
      pages.push('...')
    }
  }

  return (
    <div className="pagination">
      <span className="page-info">
        {from}–{to} / {total} bản ghi
      </span>
      <button className="page-btn" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
        <LuChevronLeft size={14} />
      </button>
      {pages.map((p, i) =>
        p === '...'
          ? <span key={i} style={{ color: 'var(--text-muted)', padding: '0 4px' }}>…</span>
          : <button
              key={p}
              className={`page-btn${p === page ? ' active' : ''}`}
              onClick={() => setPage(p)}
            >
              {p}
            </button>
      )}
      <button className="page-btn" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
        <LuChevronRight size={14} />
      </button>
    </div>
  )
}
