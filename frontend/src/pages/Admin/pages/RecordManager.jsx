import { useState, useEffect, useCallback } from 'react'
import { toast } from 'react-toastify'
import { medicalRecordService } from '../../../services/medicalRecordService'
import styles from '../AdminCommon.module.css'

const fmtDate  = (v) => v ? new Date(v).toLocaleDateString('vi-VN') : '—'
const fmtTime  = (v) => v ? new Date(v).toLocaleString('vi-VN')     : '—'

/* ── parse đơn thuốc JSON ── */
function parsePrescription(json) {
  if (!json) return []
  try { return JSON.parse(json) } catch { return [] }
}

export default function RecordManager() {
  const [data,    setData]    = useState([])
  const [loading, setLoading] = useState(false)
  const [keyword, setKeyword] = useState('')
  const [date,    setDate]    = useState('')
  const [detail,  setDetail]  = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await medicalRecordService.getAll(keyword, date)
      setData(Array.isArray(res) ? res : [])
    } catch { toast.error('Không tải được danh sách bệnh án') }
    finally  { setLoading(false) }
  }, [keyword, date])

  useEffect(() => { load() }, [load])

  /* ── stats ── */
  const today       = new Date().toLocaleDateString('vi-VN')
  const todayCount  = data.filter(r => fmtDate(r.created_at) === today).length
  const followUps   = data.filter(r => r.follow_up_date).length

  return (
    <div className={styles.wrapper}>

      {/* ── Toolbar ── */}
      <div className={styles.toolbar}>
        <input
          className={styles.search}
          placeholder="🔍 Tìm bệnh nhân, chẩn đoán..."
          value={keyword}
          onChange={e => setKeyword(e.target.value)}
        />
        <input
          className={styles.dateInput}
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          title="Lọc theo ngày lập bệnh án"
        />
        {(keyword || date) && (
          <button
            className={styles.btnSecondary}
            onClick={() => { setKeyword(''); setDate('') }}
          >
            Xóa lọc
          </button>
        )}
      </div>

      {/* ── Stat cards ── */}
      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: '#eff6ff' }}>📋</div>
          <div>
            <div className={styles.statVal}>{data.length}</div>
            <div className={styles.statLabel}>Tổng bệnh án</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: '#f0fdf4' }}>📅</div>
          <div>
            <div className={styles.statVal}>{todayCount}</div>
            <div className={styles.statLabel}>Lập hôm nay</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: '#fef9c3' }}>🔁</div>
          <div>
            <div className={styles.statVal}>{followUps}</div>
            <div className={styles.statLabel}>Có lịch tái khám</div>
          </div>
        </div>
      </div>

      {/* ── Table card ── */}
      <div className={styles.tableCard}>
        <div className={styles.tableHead}>
          <span className={styles.tableTitle}>Danh sách bệnh án</span>
          <span className={styles.count}>{data.length} bệnh án</span>
        </div>

        <div className={styles.tableWrap}>
          {loading ? (
            <div className={styles.empty}>
              <div className={styles.emptyIcon}>⏳</div>
              Đang tải dữ liệu...
            </div>
          ) : data.length === 0 ? (
            <div className={styles.empty}>
              <div className={styles.emptyIcon}>📋</div>
              {keyword || date ? 'Không tìm thấy bệnh án phù hợp' : 'Chưa có bệnh án nào'}
            </div>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.numCell}>#</th>
                  <th>Bệnh nhân</th>
                  <th>Bác sĩ</th>
                  <th>Chẩn đoán</th>
                  <th>Ngày lập</th>
                  <th>Tái khám</th>
                  <th>Ảnh XN</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {data.map((r, i) => (
                  <tr key={r.id}>
                    <td className={styles.numCell}>{i + 1}</td>
                    <td className={styles.nameCell}>
                      <strong>{r.patient_name || r.patientName}</strong>
                    </td>
                    <td style={{ color: '#475569', fontSize: 13 }}>
                      {r.doctor_name || r.doctorName}
                    </td>
                    <td style={{ maxWidth: 200 }}>
                      <span className={styles.dosageCell}>
                        {r.diagnosis || '—'}
                      </span>
                    </td>
                    <td style={{ fontSize: 13, color: '#64748b', whiteSpace: 'nowrap' }}>
                      {fmtDate(r.created_at || r.createdAt)}
                    </td>
                    <td>
                      {r.follow_up_date || r.followUpDate
                        ? <span className={styles.specBadge}>
                            {fmtDate(r.follow_up_date || r.followUpDate)}
                          </span>
                        : <span className={styles.noSpec}>—</span>
                      }
                    </td>
                    <td>
                      {r.photo_url || r.photoUrl
                        ? <span className={styles.unitBadge}>📷 Có ảnh</span>
                        : <span className={styles.noSpec}>—</span>
                      }
                    </td>
                    <td>
                      <div className={styles.actionCell}>
                        <button className={styles.btnEdit} onClick={() => setDetail(r)}>
                          🔍 Xem
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ── Modal chi tiết ── */}
      {detail && (
        <DetailModal record={detail} onClose={() => setDetail(null)} />
      )}
    </div>
  )
}

/* ════════════════════════════════════════
   Modal xem chi tiết bệnh án
════════════════════════════════════════ */
function DetailModal({ record: r, onClose }) {
  const drugs = parsePrescription(r.prescription)
  const photoUrl = r.photo_url || r.photoUrl
  const fmtD  = (v) => v ? new Date(v).toLocaleDateString('vi-VN') : '—'
  const fmtDT = (v) => v ? new Date(v).toLocaleString('vi-VN')     : '—'

  return (
    <div className={styles.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal} style={{ maxWidth: 680 }}>

        {/* Header */}
        <div className={styles.modalHead}>
          <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#1e293b' }}>
            📋 Bệnh án — {r.patient_name || r.patientName}
          </h3>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div className={styles.modalForm}>

          {/* ── Thông tin cơ bản ── */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10,
            background: '#f8fafc', borderRadius: 10, padding: '14px 16px',
          }}>
            {[
              ['👤 Bệnh nhân',  r.patient_name || r.patientName],
              ['👨‍⚕️ Bác sĩ',   r.doctor_name  || r.doctorName],
              ['📅 Ngày lập',   fmtDT(r.created_at || r.createdAt)],
              ['🔁 Tái khám',   fmtD(r.follow_up_date || r.followUpDate)],
            ].map(([k, v]) => (
              <div key={k}>
                <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', marginBottom: 3 }}>{k}</div>
                <div style={{ fontSize: 14, color: '#1e293b', fontWeight: 600 }}>{v || '—'}</div>
              </div>
            ))}
          </div>

          {/* ── Nội dung chuyên môn ── */}
          {[
            ['🤒 Triệu chứng',           r.symptoms],
            ['🔬 Chẩn đoán xác định',    r.diagnosis],
            ['💊 Hướng điều trị',        r.treatment],
          ].map(([label, value]) => value && (
            <div key={label}>
              <div style={{
                fontSize: 11, fontWeight: 700, color: '#2563eb',
                textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6
              }}>{label}</div>
              <div style={{
                background: '#f8fafc', border: '1px solid #e2e8f0',
                borderRadius: 8, padding: '10px 14px', fontSize: 14,
                color: '#334155', lineHeight: 1.6,
              }}>{value}</div>
            </div>
          ))}

          {/* ── Đơn thuốc ── */}
          {drugs.length > 0 && (
            <div>
              <div style={{
                fontSize: 11, fontWeight: 700, color: '#2563eb',
                textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8
              }}>💊 Đơn thuốc ({drugs.length} loại)</div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: '#eff6ff' }}>
                    {['#', 'Tên thuốc', 'Số lượng', 'Cách dùng'].map(h => (
                      <th key={h} style={{
                        padding: '8px 12px', textAlign: 'left',
                        color: '#2563eb', fontSize: 11, fontWeight: 700,
                        textTransform: 'uppercase'
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {drugs.map((d, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '8px 12px', color: '#94a3b8' }}>{i + 1}</td>
                      <td style={{ padding: '8px 12px', fontWeight: 600, color: '#1e293b' }}>
                        {d.name || d.medicineName || '—'}
                      </td>
                      <td style={{ padding: '8px 12px' }}>{d.quantity || '—'}</td>
                      <td style={{ padding: '8px 12px', color: '#64748b' }}>
                        {d.note || d.usageInstruction || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ── Ảnh xét nghiệm ── */}
          {photoUrl && (
            <div>
              <div style={{
                fontSize: 11, fontWeight: 700, color: '#2563eb',
                textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8
              }}>📷 Hình ảnh xét nghiệm / X-Quang</div>
              <div style={{
                background: '#000', borderRadius: 10, padding: 8,
                border: '2px solid #e2e8f0', textAlign: 'center',
              }}>
                <img
                  src={photoUrl}
                  alt="Kết quả XN"
                  style={{ maxWidth: '100%', maxHeight: 300, borderRadius: 6, cursor: 'zoom-in' }}
                  onClick={() => window.open(photoUrl, '_blank')}
                />
                <p style={{ color: '#94a3b8', fontSize: 11, margin: '6px 0 0' }}>
                  Nhấn vào ảnh để xem kích thước đầy đủ
                </p>
              </div>
            </div>
          )}

          {/* ── Footer ── */}
          <div className={styles.modalActions}>
            <button className={styles.btnSecondary} onClick={onClose}>Đóng</button>
            <button className={styles.btnPrimary} onClick={() => window.print()}>
              🖨️ In bệnh án
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}
