import { useState, useEffect, useCallback } from 'react'
import { toast } from 'react-toastify'
import AdminTable, { StatusBadge } from '../components/AdminTable'
import { appointmentService } from '../../../services/appointmentService'
import styles from '../AdminCommon.module.css'

export default function AppointmentManager() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [keyword, setKeyword] = useState('')
  const [status, setStatus] = useState('')
  const [date, setDate] = useState('')
  
  // 1. Thêm state để quản lý Modal chi tiết
  const [selectedItem, setSelectedItem] = useState(null)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      // Đảm bảo ở backend/service bạn đã viết hàm getAll này
      const res = await appointmentService.getAll?.({ keyword, status, date }) || []
      setData(Array.isArray(res) ? res : res.content || [])
    } catch {
      toast.error('Không tải được dữ liệu')
    } finally {
      setLoading(false)
    }
  }, [keyword, status, date])

  useEffect(() => { load() }, [load])

  const COLUMNS = [
    { key: 'queueNumber', label: 'Mã phiếu', width: 90 },
    { key: 'patientName', label: 'Bệnh nhân', render: v => <strong>{v}</strong> },
    { key: 'doctorName', label: 'Bác sĩ' },
    { key: 'date', label: 'Ngày' },
    { key: 'timeSlot', label: 'Giờ', render: v => v?.replace('_', ' - ') },
    { key: 'status', label: 'Trạng thái', render: v => <StatusBadge status={v} /> },
    {
      key: 'id', label: '', width: 80,
      render: (_, row) => (
        <div style={{ display: 'flex', gap: 4 }}>
          {/* 2. Gán sự kiện onClick để mở Modal */}
          <button className={styles.btnSm} onClick={() => setSelectedItem(row)}>
            Chi tiết
          </button>
        </div>
      )
    },
  ]

  return (
    <div>
      <div className={styles.toolbar}>
        <input className={styles.searchInput} placeholder="Tìm bệnh nhân, bác sĩ..."
          value={keyword} onChange={e => setKeyword(e.target.value)} />
        <select className={styles.select} value={status} onChange={e => setStatus(e.target.value)}>
          <option value="">Tất cả trạng thái</option>
          <option value="PENDING">Chờ xác nhận</option>
          <option value="CONFIRMED">Đã xác nhận</option>
          <option value="DONE">Hoàn thành</option>
          <option value="CANCELLED">Đã huỷ</option>
        </select>
        <input className={styles.dateInput} type="date"
          value={date} onChange={e => setDate(e.target.value)} />
      </div>

      <div className={styles.card}>
        {loading
          ? <div className={styles.loading}><div className={styles.spinner} /> Đang tải...</div>
          : <AdminTable columns={COLUMNS} data={data} />
        }
      </div>

      {/* 3. HIỂN THỊ MODAL CHI TIẾT */}
      {selectedItem && (
        <div className={styles.overlay} onClick={() => setSelectedItem(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHead}>
              <h3>Chi tiết cuộc hẹn #{selectedItem.queueNumber}</h3>
              <button className={styles.closeBtn} onClick={() => setSelectedItem(null)}>×</button>
            </div>
            
            <div className={styles.modalForm}>
              <div className={styles.detailRow}>
                <span className={styles.detailKey}>Bệnh nhân:</span>
                <span className={styles.detailVal}>{selectedItem.patientName}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailKey}>Bác sĩ:</span>
                <span className={styles.detailVal}>{selectedItem.doctorName}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailKey}>Chuyên khoa:</span>
                <span className={styles.detailVal}>{selectedItem.specialtyName}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailKey}>Thời gian:</span>
                <span className={styles.detailVal}>{selectedItem.timeSlot?.replace('_', ' - ')} - {selectedItem.date}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailKey}>Lý do khám:</span>
                <span className={styles.detailVal}>{selectedItem.reason || 'Không có'}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailKey}>Trạng thái:</span>
                <span className={styles.detailVal}><StatusBadge status={selectedItem.status} /></span>
              </div>

              <div className={styles.modalFooter}>
                <button className={styles.btnCancel} onClick={() => setSelectedItem(null)}>Đóng</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}