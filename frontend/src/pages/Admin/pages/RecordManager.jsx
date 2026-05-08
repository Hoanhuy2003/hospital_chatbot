import { useState, useEffect, useCallback } from 'react'
import { toast } from 'react-toastify'
import AdminTable from '../components/AdminTable'
import { medicalRecordService } from '../../../services/medicalRecordService'
import styles from '../AdminCommon.module.css'

export default function RecordManager() {
  const [data,      setData]      = useState([])
  const [loading,   setLoading]   = useState(false)
  const [keyword,   setKeyword]   = useState('')
  const [date,      setDate]      = useState('')
  const [detail,    setDetail]    = useState(null)  // record đang xem chi tiết

  const load = useCallback(async () => {
    try {
      setLoading(true)
      const res = await medicalRecordService.getHistory?.({ keyword, date }) || []
      setData(Array.isArray(res) ? res : res.content || [])
    } catch { toast.error('Không tải được bệnh án') }
    finally  { setLoading(false) }
  }, [keyword, date])

  useEffect(() => { load() }, [load])

  const COLUMNS = [
    { key: 'patientName', label: 'Bệnh nhân',  render: v => <strong>{v}</strong> },
    { key: 'doctorName',  label: 'Bác sĩ' },
    { key: 'diagnosis',   label: 'Chẩn đoán' },
    { key: 'createdAt',   label: 'Ngày lập',
      render: v => v ? new Date(v).toLocaleDateString('vi-VN') : '—' },
    { key: 'followUpDate',label: 'Tái khám',
      render: v => v ? new Date(v).toLocaleDateString('vi-VN') : '—' },
    { key: 'photoUrls',   label: 'Ảnh XN',
      render: v => {
        const arr = Array.isArray(v) ? v : []
        return arr.length > 0
          ? <span className={styles.specBadge}>{arr.length} ảnh</span>
          : <span style={{ color: '#637381' }}>—</span>
      }
    },
    {
      key: 'id', label: '', width: 80,
      render: (_, row) => (
        <button className={styles.btnSm} onClick={() => setDetail(row)}>Xem</button>
      )
    },
  ]

  return (
    <div>
      <div className={styles.toolbar}>
        <input className={styles.searchInput} placeholder="Tìm bệnh nhân, chẩn đoán..."
          value={keyword} onChange={e => setKeyword(e.target.value)} />
        <input className={styles.dateInput} type="date"
          value={date} onChange={e => setDate(e.target.value)} />
      </div>

      <div className={styles.card}>
        {loading
          ? <div className={styles.loading}><div className={styles.spinner}/>Đang tải...</div>
          : <AdminTable columns={COLUMNS} data={data} />
        }
      </div>

      {/* Chi tiết bệnh án */}
      {detail && (
        <div className={styles.overlay} onClick={e => e.target === e.currentTarget && setDetail(null)}>
          <div className={styles.modal}>
            <div className={styles.modalHead}>
              <h3>Chi tiết bệnh án — {detail.patientName}</h3>
              <button className={styles.closeBtn} onClick={() => setDetail(null)}>✕</button>
            </div>
            <div className={styles.modalForm}>
              {[
                ['Bệnh nhân',   detail.patientName],
                ['Bác sĩ',      detail.doctorName],
                ['Triệu chứng', detail.symptoms],
                ['Chẩn đoán',   detail.diagnosis],
                ['Điều trị',    detail.treatment],
                ['Tái khám',    detail.followUpDate
                  ? new Date(detail.followUpDate).toLocaleDateString('vi-VN')
                  : '—'],
              ].map(([k, v]) => (
                <div key={k} className={styles.detailRow}>
                  <span className={styles.detailKey}>{k}</span>
                  <span className={styles.detailVal}>{v || '—'}</span>
                </div>
              ))}

              {/* Ảnh xét nghiệm */}
              {Array.isArray(detail.photoUrls) && detail.photoUrls.length > 0 && (
                <div className={styles.field} style={{ marginTop: 12 }}>
                  <label>Ảnh kết quả xét nghiệm</label>
                  <div className={styles.photoGrid}>
                    {detail.photoUrls.map((url, i) => (
                      <img key={i} src={url} alt={`xn-${i}`}
                        className={styles.photoThumb}
                        onClick={() => window.open(url, '_blank')} />
                    ))}
                  </div>
                </div>
              )}

              {/* Toa thuốc */}
              {detail.prescription && (() => {
                try {
                  const drugs = JSON.parse(detail.prescription)
                  if (drugs.length === 0) return null
                  return (
                    <div className={styles.field} style={{ marginTop: 12 }}>
                      <label>Đơn thuốc</label>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                        <thead>
                          <tr style={{ background: '#F0F7FF' }}>
                            {['Tên thuốc','Số lượng','Cách dùng'].map(h => (
                              <th key={h} style={{ padding: '6px 10px', textAlign: 'left', color: '#1565C0', fontSize: 11 }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {drugs.map((d, i) => (
                            <tr key={i} style={{ borderBottom: '1px solid #e8ecf0' }}>
                              <td style={{ padding: '7px 10px' }}>{d.medicine || d.medicineName}</td>
                              <td style={{ padding: '7px 10px' }}>{d.quantity}</td>
                              <td style={{ padding: '7px 10px', color: '#637381' }}>{d.note || d.usageInstruction}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )
                } catch { return null }
              })()}

              <div className={styles.modalFooter}>
                <button className={styles.btnCancel} onClick={() => setDetail(null)}>Đóng</button>
                <button className={styles.btnPrimary} onClick={() => window.print()}>🖨 In bệnh án</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}