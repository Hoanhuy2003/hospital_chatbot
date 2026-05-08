import { useState, useEffect, useCallback } from 'react'
import { toast } from 'react-toastify'
import AdminTable, { StatusBadge } from '../components/AdminTable'
import StatCard from '../components/StatCard'
import styles from '../AdminCommon.module.css'
import api from '../../../services/api'

const paymentService = {
  getAll:  async (params) => (await api.get('/v1/payments', { params })).data,
  getStats:async ()       => (await api.get('/v1/payments/stats')).data,
  refund:  async (id)     => (await api.patch(`/v1/payments/${id}/refund`)).data,
}

export default function PaymentManager() {
  const [data,    setData]    = useState([])
  const [stats,   setStats]   = useState({ total: 0, paid: 0, pending: 0, refunded: 0 })
  const [loading, setLoading] = useState(false)
  const [keyword, setKeyword] = useState('')
  const [status,  setStatus]  = useState('')
  const [dateFrom,setDateFrom]= useState('')
  const [dateTo,  setDateTo]  = useState('')

  const load = useCallback(async () => {
    try {
      setLoading(true)
      const [res, st] = await Promise.all([
        paymentService.getAll({ keyword, status, dateFrom, dateTo }),
        paymentService.getStats(),
      ])
      setData(Array.isArray(res) ? res : res.content || [])
      setStats(st || stats)
    } catch { toast.error('Không tải được dữ liệu') }
    finally  { setLoading(false) }
  }, [keyword, status, dateFrom, dateTo])

  useEffect(() => { load() }, [load])

  async function handleRefund(row) {
    if (!window.confirm(`Hoàn tiền cho đơn ${row.code}?`)) return
    try {
      await paymentService.refund(row.id)
      toast.success('Đã xử lý hoàn tiền'); load()
    } catch { toast.error('Hoàn tiền thất bại') }
  }

  const COLUMNS = [
    { key: 'code',        label: 'Mã đơn',     render: v => <span style={{ fontFamily: 'monospace', fontSize: 12 }}>{v}</span> },
    { key: 'patientName', label: 'Bệnh nhân',  render: v => <strong>{v}</strong> },
    { key: 'service',     label: 'Dịch vụ' },
    { key: 'amount',      label: 'Số tiền',
      render: v => <span style={{ fontWeight: 700, color: '#2E7D32' }}>
        {v ? Number(v).toLocaleString('vi-VN') + 'đ' : '—'}
      </span>
    },
    { key: 'method',      label: 'Hình thức',  render: v => v || 'Tiền mặt' },
    { key: 'paidAt',      label: 'Ngày TT',
      render: v => v ? new Date(v).toLocaleDateString('vi-VN') : '—' },
    { key: 'status',      label: 'Trạng thái', render: v => <StatusBadge status={v} /> },
    {
      key: 'id', label: '', width: 90,
      render: (_, row) => row.status === 'PAID'
        ? <button className={`${styles.btnSm} ${styles.btnDanger}`} onClick={() => handleRefund(row)}>Hoàn tiền</button>
        : null
    },
  ]

  return (
    <div>
      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 18 }}>
        <StatCard label="Doanh thu tháng"  value={`${(stats.total/1e6).toFixed(1)}M đ`} color="blue"  />
        <StatCard label="Đã thanh toán"    value={stats.paid}                             color="green" />
        <StatCard label="Chờ thanh toán"   value={stats.pending}                          color="amber" />
        <StatCard label="Đã hoàn tiền"     value={stats.refunded}                         color="red"   />
      </div>

      <div className={styles.toolbar}>
        <input className={styles.searchInput} placeholder="Tìm bệnh nhân, mã đơn..."
          value={keyword} onChange={e => setKeyword(e.target.value)} />
        <select className={styles.select} value={status} onChange={e => setStatus(e.target.value)}>
          <option value="">Tất cả trạng thái</option>
          <option value="PAID">Đã thanh toán</option>
          <option value="PENDING">Chờ thanh toán</option>
          <option value="REFUNDED">Đã hoàn tiền</option>
        </select>
        <input className={styles.dateInput} type="date" placeholder="Từ ngày"
          value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
        <input className={styles.dateInput} type="date" placeholder="Đến ngày"
          value={dateTo} onChange={e => setDateTo(e.target.value)} />
        <button className={styles.btnPrimary} onClick={() => window.print()}>
          Xuất báo cáo
        </button>
      </div>

      <div className={styles.card}>
        {loading
          ? <div className={styles.loading}><div className={styles.spinner}/>Đang tải...</div>
          : <AdminTable columns={COLUMNS} data={data} />
        }
      </div>
    </div>
  )
}