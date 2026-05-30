import { useState, useEffect, useCallback } from 'react'
import { toast } from 'react-toastify'
import api from '../../../services/api'
import AdminPagination from '../components/AdminPagination'
import { useAdminPagination, ADMIN_PAGE_SIZE } from '../hooks/useAdminPagination'
import styles from '../AdminCommon.module.css'

/* ── helpers ── */
const fmt    = (n) => n != null
  ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n)
  : '—'
const fmtDate = (v) => v ? new Date(v).toLocaleString('vi-VN') : '—'

const STATUS_MAP = {
  PAID:      { label: 'Đã thanh toán', bg: '#dcfce7', color: '#166534' },
  PENDING:   { label: 'Chờ thanh toán', bg: '#fef9c3', color: '#854d0e' },
  CANCELLED: { label: 'Đã huỷ',        bg: '#fee2e2', color: '#991b1b' },
}

function StatusBadge({ status }) {
  const s = STATUS_MAP[status] || { label: status, bg: '#f1f5f9', color: '#475569' }
  return (
    <span style={{
      background: s.bg, color: s.color,
      padding: '3px 12px', borderRadius: 20,
      fontSize: 12, fontWeight: 700,
    }}>{s.label}</span>
  )
}

export default function PaymentManager() {
  const [data,     setData]     = useState([])
  const [stats,    setStats]    = useState({ revenue: 0, paid: 0, pending: 0, cancelled: 0 })
  const [loading,  setLoading]  = useState(false)
  const [keyword,  setKeyword]  = useState('')
  const [status,   setStatus]   = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo,   setDateTo]   = useState('')
  const [detail,   setDetail]   = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = {
        keyword:  keyword  || undefined,
        status:   status   || undefined,
        dateFrom: dateFrom || undefined,
        dateTo:   dateTo   || undefined,
      }
      const [listRes, statsRes] = await Promise.all([
        api.get('/v1/invoices/all',   { params }),
        api.get('/v1/invoices/stats'),
      ])
      setData(Array.isArray(listRes.data) ? listRes.data : [])
      setStats(statsRes.data || stats)
    } catch { toast.error('Không tải được dữ liệu thanh toán') }
    finally  { setLoading(false) }
  }, [keyword, status, dateFrom, dateTo])

  useEffect(() => { load() }, [load])

  const { pageData, page, setPage, totalPages } = useAdminPagination(data, undefined, [keyword, status, dateFrom, dateTo])

  const hasFilter = keyword || status || dateFrom || dateTo

  return (
    <div className={styles.wrapper}>

      {/* ── Stat cards ── */}
      <div className={styles.statsRow} style={{ gridTemplateColumns: 'repeat(4,1fr)' }}>
        {[
          { icon: '💰', label: 'Doanh thu đã thu',  val: fmt(stats.revenue),    bg: '#eff6ff' },
          { icon: '✅', label: 'Đã thanh toán',      val: stats.paid,            bg: '#f0fdf4' },
          { icon: '⏳', label: 'Chờ thanh toán',     val: stats.pending,         bg: '#fef9c3' },
          { icon: '❌', label: 'Đã huỷ',             val: stats.cancelled,       bg: '#fef2f2' },
        ].map(c => (
          <div key={c.label} className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: c.bg }}>{c.icon}</div>
            <div>
              <div className={styles.statVal}>{c.val}</div>
              <div className={styles.statLabel}>{c.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Toolbar ── */}
      <div className={styles.toolbar}>
        <input
          className={styles.search}
          placeholder="🔍 Tìm tên bệnh nhân..."
          value={keyword}
          onChange={e => setKeyword(e.target.value)}
        />
        <select
          className={styles.select}
          value={status}
          onChange={e => setStatus(e.target.value)}
        >
          <option value="">Tất cả trạng thái</option>
          <option value="PAID">Đã thanh toán</option>
          <option value="PENDING">Chờ thanh toán</option>
          <option value="CANCELLED">Đã huỷ</option>
        </select>
        <input className={styles.dateInput} type="date" title="Từ ngày"
          value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
        <input className={styles.dateInput} type="date" title="Đến ngày"
          value={dateTo}   onChange={e => setDateTo(e.target.value)} />
        {hasFilter && (
          <button className={styles.btnSecondary}
            onClick={() => { setKeyword(''); setStatus(''); setDateFrom(''); setDateTo('') }}>
            Xóa lọc
          </button>
        )}
      </div>

      {/* ── Table ── */}
      <div className={styles.tableCard}>
        <div className={styles.tableHead}>
          <span className={styles.tableTitle}>Danh sách hóa đơn</span>
          <span className={styles.count}>{data.length} hóa đơn</span>
        </div>

        <div className={styles.tableWrap}>
          {loading ? (
            <div className={styles.empty}>
              <div className={styles.emptyIcon}>⏳</div>Đang tải...
            </div>
          ) : data.length === 0 ? (
            <div className={styles.empty}>
              <div className={styles.emptyIcon}>🧾</div>
              {hasFilter ? 'Không tìm thấy hóa đơn phù hợp' : 'Chưa có hóa đơn nào'}
            </div>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.numCell}>#</th>
                  <th>Mã hóa đơn</th>
                  <th>Bệnh nhân</th>
                  <th>Bác sĩ</th>
                  <th>Thực thu</th>
                  <th>Ngày tạo</th>
                  <th>Trạng thái</th>
                  <th>Mã GD VNPay</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {pageData.map((inv, i) => (
                  <tr key={inv.invoiceID}>
                    <td className={styles.numCell}>{page * ADMIN_PAGE_SIZE + i + 1}</td>
                    <td>
                      <span style={{ fontFamily: 'monospace', fontSize: 13, fontWeight: 700, color: '#2563eb' }}>
                        #INV-{inv.invoiceID}
                      </span>
                    </td>
                    <td className={styles.nameCell}>
                      <strong>{inv.patientName}</strong>
                    </td>
                    <td style={{ fontSize: 13, color: '#475569' }}>{inv.doctorName}</td>
                    <td className={styles.priceCell}>{fmt(inv.finalAmount)}</td>
                    <td style={{ fontSize: 13, color: '#64748b', whiteSpace: 'nowrap' }}>
                      {fmtDate(inv.createAt)}
                    </td>
                    <td><StatusBadge status={inv.status} /></td>
                    <td>
                      {inv.transactionId
                        ? <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#64748b' }}>
                            {inv.transactionId}
                          </span>
                        : <span className={styles.noSpec}>—</span>
                      }
                    </td>
                    <td>
                      <div className={styles.actionCell}>
                        <button className={styles.btnEdit} onClick={() => setDetail(inv)}>
                          🔍 Chi tiết
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        {!loading && data.length > 0 && (
          <AdminPagination page={page} totalPages={totalPages} onPageChange={setPage} />
        )}
      </div>

      {/* ── Modal chi tiết ── */}
      {detail && (
        <DetailModal invoice={detail} onClose={() => setDetail(null)} />
      )}
    </div>
  )
}

/* ════════════════════════════════════════
   Modal chi tiết hóa đơn
════════════════════════════════════════ */
function DetailModal({ invoice: inv, onClose }) {
  const fmt = (n) => n != null
    ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n)
    : '—'

  const rows = [
    ['💊 Phí khám bệnh',    fmt(inv.examinationFee)],
    ['🧪 Tiền thuốc',       fmt(inv.totalMedicineCost)],
    ['🏥 BHYT hỗ trợ',     `- ${fmt(inv.insuranceDiscount)}`],
  ]

  return (
    <div className={styles.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal} style={{ maxWidth: 560 }}>

        <div className={styles.modalHead}>
          <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#1e293b' }}>
            🧾 Hóa đơn #INV-{inv.invoiceID}
          </h3>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div className={styles.modalForm}>

          {/* Thông tin chung */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10,
            background: '#f8fafc', borderRadius: 10, padding: '14px 16px',
          }}>
            {[
              ['👤 Bệnh nhân',  inv.patientName],
              ['👨‍⚕️ Bác sĩ',   inv.doctorName],
              ['🔬 Chẩn đoán',  inv.diagnosis   || '—'],
              ['📅 Ngày tạo',   inv.createAt ? new Date(inv.createAt).toLocaleString('vi-VN') : '—'],
            ].map(([k, v]) => (
              <div key={k}>
                <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', marginBottom: 3 }}>{k}</div>
                <div style={{ fontSize: 14, color: '#1e293b', fontWeight: 600 }}>{v}</div>
              </div>
            ))}
          </div>

          {/* Chi tiết tiền */}
          <div style={{ border: '1.5px dashed #cbd5e1', borderRadius: 10, padding: '16px 18px' }}>
            {rows.map(([k, v]) => (
              <div key={k} style={{
                display: 'flex', justifyContent: 'space-between',
                padding: '7px 0', borderBottom: '1px solid #f1f5f9',
                fontSize: 14, color: '#475569',
              }}>
                <span>{k}</span>
                <span style={{ color: k.includes('BHYT') ? '#dc2626' : undefined }}>{v}</span>
              </div>
            ))}
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              paddingTop: 12, marginTop: 4,
              fontSize: '1.1rem', fontWeight: 800, color: '#059669',
              borderTop: '2px solid #1e293b',
            }}>
              <span>💳 Thực thu</span>
              <span>{fmt(inv.finalAmount)}</span>
            </div>
          </div>

          {/* Trạng thái + Mã GD */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div style={{ background: '#f8fafc', borderRadius: 8, padding: '10px 14px' }}>
              <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', marginBottom: 6 }}>
                Trạng thái
              </div>
              {(() => {
                const s = STATUS_MAP[inv.status] || { label: inv.status, bg: '#f1f5f9', color: '#475569' }
                return (
                  <span style={{
                    background: s.bg, color: s.color,
                    padding: '4px 14px', borderRadius: 20,
                    fontSize: 13, fontWeight: 700,
                  }}>{s.label}</span>
                )
              })()}
            </div>
            <div style={{ background: '#f8fafc', borderRadius: 8, padding: '10px 14px' }}>
              <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', marginBottom: 6 }}>
                Mã giao dịch VNPay
              </div>
              <span style={{ fontFamily: 'monospace', fontSize: 12, color: '#334155' }}>
                {inv.transactionId || '—'}
              </span>
            </div>
          </div>

          <div className={styles.modalActions}>
            <button className={styles.btnSecondary} onClick={onClose}>Đóng</button>
            <button className={styles.btnPrimary} onClick={() => window.print()}>
              🖨️ In hóa đơn
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}
