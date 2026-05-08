import styles from './AdminTable.module.css'

export default function AdminTable({ columns, data, onAction }) {
  return (
    <div className={styles.wrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            {columns.map(col => (
              <th key={col.key} style={{ width: col.width }}>{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr><td colSpan={columns.length} className={styles.empty}>Không có dữ liệu</td></tr>
          ) : (
            data.map((row, i) => (
              <tr key={row.id || i}>
                {columns.map(col => (
                  <td key={col.key}>
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}

export function StatusBadge({ status }) {
  const map = {
    ACTIVE:     { label: 'Hoạt động', cls: 'green' },
    INACTIVE:   { label: 'Vô hiệu',   cls: 'red'   },
    PENDING:    { label: 'Chờ',        cls: 'amber' },
    CONFIRMED:  { label: 'Xác nhận',  cls: 'blue'  },
    DONE:       { label: 'Hoàn thành',cls: 'green' },
    CANCELLED:  { label: 'Đã huỷ',    cls: 'red'   },
    IN_STOCK:   { label: 'Còn hàng',  cls: 'green' },
    OUT_OF_STOCK:{ label: 'Hết hàng', cls: 'red'   },
  }
  const s = map[status] || { label: status, cls: 'amber' }
  return <span className={`${styles.badge} ${styles[s.cls]}`}>{s.label}</span>
}