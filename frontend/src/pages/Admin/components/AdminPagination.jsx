import styles from '../AdminCommon.module.css'

export default function AdminPagination({ page, totalPages, onPageChange }) {
  if (!totalPages || totalPages <= 1) return null

  return (
    <div className={styles.pagination}>
      <button
        type="button"
        className={styles.paginationBtn}
        disabled={page === 0}
        onClick={() => onPageChange(page - 1)}
      >
        ◀ Trước
      </button>
      {[...Array(totalPages).keys()].map((num) => (
        <button
          type="button"
          key={num}
          className={`${styles.paginationBtn} ${page === num ? styles.paginationBtnActive : ''}`}
          onClick={() => onPageChange(num)}
        >
          {num + 1}
        </button>
      ))}
      <button
        type="button"
        className={styles.paginationBtn}
        disabled={page >= totalPages - 1}
        onClick={() => onPageChange(page + 1)}
      >
        Sau ▶
      </button>
    </div>
  )
}
