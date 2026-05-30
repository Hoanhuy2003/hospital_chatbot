import { useState, useEffect, useMemo } from 'react'

export const ADMIN_PAGE_SIZE = 10

/** Phân trang phía client; reset về trang 1 khi đổi bộ lọc (resetDeps). */
export function useAdminPagination(items, pageSize = ADMIN_PAGE_SIZE, resetDeps = []) {
  const [page, setPage] = useState(0)

  useEffect(() => {
    setPage(0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, resetDeps)

  const totalPages = Math.max(1, Math.ceil((items?.length || 0) / pageSize))

  useEffect(() => {
    if (page > totalPages - 1) {
      setPage(Math.max(0, totalPages - 1))
    }
  }, [page, totalPages])

  const pageData = useMemo(() => {
    const list = items || []
    const start = page * pageSize
    return list.slice(start, start + pageSize)
  }, [items, page, pageSize])

  return { pageData, page, setPage, totalPages, pageSize }
}
