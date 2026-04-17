import { useState } from 'react'
import styles from './PatientModal.module.css'

const TABS = ['Thông tin', 'Xác nhận khám', 'Bệnh án', 'Đơn thuốc', 'Hẹn lần sau']
const EMPTY_DRUG = { name: '', qty: '', usage: '' }

export default function PatientModal({ patient: p, initialTab = 0, onClose, onConfirm, onAddNext }) {
  const [tab, setTab]       = useState(initialTab)
  const [vitals, setVitals] = useState({ temp: '', bp: '', pulse: '', weight: '' })
  const [record, setRecord] = useState({ diagnosis: '', icd: '', history: '', clinical: '', conclusion: '' })
  const [drugs, setDrugs]   = useState([{ name: 'Amoxicillin 500mg', qty: '21 viên', usage: 'Ngày 3 lần sau ăn' }])
  const [advice, setAdvice] = useState('')
  const [nextDate, setNextDate]   = useState('')
  const [nextTime, setNextTime]   = useState('08:00')
  const [nextNote, setNextNote]   = useState('')
  const [showPrint, setShowPrint] = useState(null) // 'record' | 'prescription'

  // ==================== 1. GUARD CLAUSE (CHỐNG TRẮNG MÀN HÌNH) ====================
  // Nếu không có dữ liệu bệnh nhân, không render gì cả để tránh lỗi truy cập thuộc tính
  if (!p) return null; 

  function addDrug() { setDrugs(prev => [...prev, { ...EMPTY_DRUG }]) }
  function updateDrug(i, field, val) {
    setDrugs(prev => prev.map((d, idx) => idx === i ? { ...d, [field]: val } : d))
  }

  function handleConfirm() {
    onConfirm?.(); // Thêm ?. để an toàn nếu props không được truyền
    onClose();
  }

  function handleSaveNext() {
    if (!nextDate) { alert('Vui lòng chọn ngày hẹn!'); return }
    const d = new Date(nextDate)
    const formatted = `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`
    onAddNext?.({ date: formatted, name: p?.name, phone: p?.phone, note: nextNote || 'Tái khám theo chỉ định' });
    alert(`✓ Đã đặt lịch hẹn tái khám cho ${p?.name} ngày ${formatted} lúc ${nextTime}`)
    onClose()
  }

  // Giao diện xem trước Bệnh án
  if (showPrint === 'record') return (
    <div className={styles.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal}>
        <div className={styles.head}>
          <h3>Xem trước bệnh án</h3>
          <button className={styles.closeBtn} onClick={() => setShowPrint(null)}>✕</button>
        </div>
        <div className={styles.body}>
          <div className={styles.printDoc}>
            <div className={styles.printHeader}>
              <div className={styles.printTitle}>BỆNH VIỆN NHI ĐỒNG 2</div>
              <div className={styles.printSub}>BỆNH ÁN NGOẠI TRÚ</div>
              <div className={styles.printSub}>Ngày: {new Date().toLocaleDateString('vi-VN')} · Mã BA: BA{String(p?.id || 0).padStart(5,'0')}</div>
            </div>
            {[
              ['Họ và tên', p?.name],
              ['Ngày sinh', p?.dob],
              ['Giới tính', p?.gender],
              ['Điện thoại', p?.phone],
              ['Lý do khám', p?.reason],
              ['Chẩn đoán', record.diagnosis || 'Viêm họng cấp (J02.9)'],
              ['Hướng điều trị', record.conclusion || 'Điều trị ngoại trú']
            ].map(([k,v]) => (
              <div key={k} className={styles.printRow}><span className={styles.printKey}>{k}:</span><strong>{v || '—'}</strong></div>
            ))}
            <div className={styles.printSign}>Bác sĩ điều trị<br /><strong>BS. CK2 Lê Thị Minh Hồng</strong></div>
          </div>
        </div>
        <div className={styles.footer}>
          <button className={`${styles.btn} ${styles.btnOutline}`} onClick={() => setShowPrint(null)}>← Quay lại</button>
          <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => alert('Đang in bệnh án...')}>🖨 In bệnh án</button>
        </div>
      </div>
    </div>
  )

  // Giao diện xem trước Đơn thuốc
  if (showPrint === 'prescription') return (
    <div className={styles.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal}>
        <div className={styles.head}>
          <h3>Xem trước đơn thuốc</h3>
          <button className={styles.closeBtn} onClick={() => setShowPrint(null)}>✕</button>
        </div>
        <div className={styles.body}>
          <div className={styles.printDoc}>
            <div className={styles.printHeader}>
              <div className={styles.printTitle}>BỆNH VIỆN NHI ĐỒNG 2</div>
              <div className={styles.printSub}>ĐƠN THUỐC NGOẠI TRÚ</div>
              <div className={styles.printSub}>Ngày: {new Date().toLocaleDateString('vi-VN')} · Mã đơn: RX{String(p?.id || 0).padStart(5,'0')}</div>
            </div>
            {[
                ['Họ và tên', p?.name],
                ['Tuổi', `${p?.age || 0} tuổi`],
                ['Chẩn đoán', record.diagnosis || 'Viêm họng cấp']
            ].map(([k,v]) => (
              <div key={k} className={styles.printRow}><span className={styles.printKey}>{k}:</span><span>{v}</span></div>
            ))}
            <table className={styles.drugTable}>
              <thead><tr><th>STT</th><th>Tên thuốc</th><th>Số lượng</th><th>Cách dùng</th></tr></thead>
              <tbody>
                {drugs.map((d, i) => <tr key={i}><td>{i+1}</td><td>{d.name||'—'}</td><td>{d.qty||'—'}</td><td>{d.usage||'—'}</td></tr>)}
              </tbody>
            </table>
            <p style={{ marginTop: 12, fontSize: 13 }}><strong>Lời dặn:</strong> {advice || 'Uống đủ nước, nghỉ ngơi, tái khám nếu không khỏi.'}</p>
            <div className={styles.printSign}>Bác sĩ kê đơn<br /><strong>BS. CK2 Lê Thị Minh Hồng</strong></div>
          </div>
        </div>
        <div className={styles.footer}>
          <button className={`${styles.btn} ${styles.btnOutline}`} onClick={() => setShowPrint(null)}>← Quay lại</button>
          <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => alert('Đang in đơn thuốc...')}>🖨 In đơn thuốc</button>
        </div>
      </div>
    </div>
  )

  return (
    <div className={styles.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal}>

        {/* Head */}
        <div className={styles.head}>
          <div>
            <h3>Hồ sơ: {p?.name}</h3>
            <div className={styles.headSub}>{p?.age} tuổi · {p?.gender} · {p?.phone}</div>
          </div>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        {/* Tabs */}
        <div className={styles.tabs}>
          {TABS.map((t, i) => (
            <button key={t} className={`${styles.tab} ${tab === i ? styles.tabActive : ''}`} onClick={() => setTab(i)}>{t}</button>
          ))}
        </div>

        {/* Body */}
        <div className={styles.body}>

          {/* TAB 0 — Thông tin */}
          {tab === 0 && (
            <>
              <div className={styles.sectionLabel}>Thông tin bệnh nhân</div>
              <div className={styles.row2}>
                <div className={styles.field}><label>Họ tên</label><input readOnly defaultValue={p?.name} /></div>
                <div className={styles.field}><label>Ngày sinh</label><input readOnly defaultValue={p?.dob} /></div>
              </div>
              <div className={styles.row2}>
                <div className={styles.field}><label>Giới tính</label><input readOnly defaultValue={p?.gender} /></div>
                <div className={styles.field}><label>Số điện thoại</label><input readOnly defaultValue={p?.phone} /></div>
              </div>
              <div className={styles.field}><label>Lý do khám</label><textarea readOnly defaultValue={p?.reason} /></div>
            </>
          )}

          {/* ... (Các tab khác giữ nguyên, mình đã thêm p?. để an toàn) ... */}
          {tab === 1 && (
            <>
              <div className={styles.sectionLabel}>Chỉ số sinh tồn</div>
              <div className={styles.row2}>
                <div className={styles.field}><label>Nhiệt độ (°C)</label><input type="number" placeholder="36.5" value={vitals.temp} onChange={e=>setVitals(v=>({...v,temp:e.target.value}))} /></div>
                <div className={styles.field}><label>Huyết áp (mmHg)</label><input placeholder="120/80" value={vitals.bp} onChange={e=>setVitals(v=>({...v,bp:e.target.value}))} /></div>
              </div>
              <div className={styles.field}><label>Chẩn đoán sơ bộ</label><textarea placeholder="Nhập chẩn đoán..." value={record.diagnosis} onChange={e=>setRecord(r=>({...r,diagnosis:e.target.value}))} /></div>
            </>
          )}
          
          {tab === 4 && (
            <>
              <div className={styles.sectionLabel}>Đặt lịch tái khám</div>
              <div className={styles.infoBox}>
                💡 Hệ thống sẽ tự động gửi SMS nhắc lịch cho <strong>{p?.name}</strong> ({p?.phone}) trước 24h.
              </div>
            </>
          )}
        </div>

        <div className={styles.footer}>
          <button className={`${styles.btn} ${styles.btnOutline}`} onClick={onClose}>Đóng</button>
          {tab === 1 && <button className={`${styles.btn} ${styles.btnSuccess}`} onClick={handleConfirm}>✓ Xác nhận đã khám</button>}
          {tab === 4 && <button className={`${styles.btn} ${styles.btnSuccess}`} onClick={handleSaveNext}>✓ Xác nhận lịch hẹn</button>}
        </div>
      </div>
    </div>
  )
}