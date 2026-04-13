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

  function addDrug() { setDrugs(prev => [...prev, { ...EMPTY_DRUG }]) }
  function updateDrug(i, field, val) {
    setDrugs(prev => prev.map((d, idx) => idx === i ? { ...d, [field]: val } : d))
  }

  function handleConfirm() {
    onConfirm()
    onClose()
  }

  function handleSaveNext() {
    if (!nextDate) { alert('Vui lòng chọn ngày hẹn!'); return }
    const d = new Date(nextDate)
    const formatted = `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`
    onAddNext({ date: formatted, name: p.name, phone: p.phone, note: nextNote || 'Tái khám theo chỉ định' })
    alert(`✓ Đã đặt lịch hẹn tái khám cho ${p.name} ngày ${formatted} lúc ${nextTime}`)
    onClose()
  }

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
              <div className={styles.printSub}>Ngày: {new Date().toLocaleDateString('vi-VN')} · Mã BA: BA{String(p.id).padStart(5,'0')}</div>
            </div>
            {[['Họ và tên', p.name],['Ngày sinh', p.dob],['Giới tính', p.gender],['Điện thoại', p.phone],['Lý do khám', p.reason],['Chẩn đoán', record.diagnosis || 'Viêm họng cấp (J02.9)'],['Hướng điều trị', record.conclusion || 'Điều trị ngoại trú']].map(([k,v]) => (
              <div key={k} className={styles.printRow}><span className={styles.printKey}>{k}:</span><strong>{v}</strong></div>
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
              <div className={styles.printSub}>Ngày: {new Date().toLocaleDateString('vi-VN')} · Mã đơn: RX{String(p.id).padStart(5,'0')}</div>
            </div>
            {[['Họ và tên', p.name],['Tuổi', `${p.age} tuổi`],['Chẩn đoán', record.diagnosis || 'Viêm họng cấp']].map(([k,v]) => (
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
            <h3>Hồ sơ: {p.name}</h3>
            <div className={styles.headSub}>{p.age} tuổi · {p.gender} · {p.phone}</div>
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
                <div className={styles.field}><label>Họ tên</label><input readOnly defaultValue={p.name} /></div>
                <div className={styles.field}><label>Ngày sinh</label><input readOnly defaultValue={p.dob} /></div>
              </div>
              <div className={styles.row2}>
                <div className={styles.field}><label>Giới tính</label><input readOnly defaultValue={p.gender} /></div>
                <div className={styles.field}><label>Số điện thoại</label><input readOnly defaultValue={p.phone} /></div>
              </div>
              <div className={styles.field}><label>Lý do khám</label><textarea readOnly defaultValue={p.reason} /></div>
            </>
          )}

          {/* TAB 1 — Xác nhận khám */}
          {tab === 1 && (
            <>
              <div className={styles.sectionLabel}>Chỉ số sinh tồn</div>
              <div className={styles.row2}>
                <div className={styles.field}><label>Nhiệt độ (°C)</label><input type="number" placeholder="36.5" value={vitals.temp} onChange={e=>setVitals(v=>({...v,temp:e.target.value}))} /></div>
                <div className={styles.field}><label>Huyết áp (mmHg)</label><input placeholder="120/80" value={vitals.bp} onChange={e=>setVitals(v=>({...v,bp:e.target.value}))} /></div>
              </div>
              <div className={styles.row2}>
                <div className={styles.field}><label>Nhịp tim (lần/phút)</label><input type="number" placeholder="80" value={vitals.pulse} onChange={e=>setVitals(v=>({...v,pulse:e.target.value}))} /></div>
                <div className={styles.field}><label>Cân nặng (kg)</label><input type="number" placeholder="60" value={vitals.weight} onChange={e=>setVitals(v=>({...v,weight:e.target.value}))} /></div>
              </div>
              <div className={styles.sectionLabel}>Ghi nhận khám</div>
              <div className={styles.field}><label>Triệu chứng chính</label><textarea placeholder="Mô tả triệu chứng..." value={record.history} onChange={e=>setRecord(r=>({...r,history:e.target.value}))} /></div>
              <div className={styles.field}><label>Chẩn đoán sơ bộ</label><textarea placeholder="Nhập chẩn đoán..." value={record.diagnosis} onChange={e=>setRecord(r=>({...r,diagnosis:e.target.value}))} /></div>
            </>
          )}

          {/* TAB 2 — Bệnh án */}
          {tab === 2 && (
            <>
              <div className={styles.sectionLabel}>Bệnh án điện tử</div>
              <div className={styles.row2}>
                <div className={styles.field}><label>Chẩn đoán xác định</label><input placeholder="VD: Viêm họng cấp" value={record.diagnosis} onChange={e=>setRecord(r=>({...r,diagnosis:e.target.value}))} /></div>
                <div className={styles.field}><label>Mã ICD-10</label><input placeholder="J02.9" value={record.icd} onChange={e=>setRecord(r=>({...r,icd:e.target.value}))} /></div>
              </div>
              <div className={styles.field}><label>Bệnh sử</label><textarea placeholder="Quá trình bệnh..." value={record.history} onChange={e=>setRecord(r=>({...r,history:e.target.value}))} /></div>
              <div className={styles.field}><label>Khám lâm sàng</label><textarea placeholder="Kết quả khám thực thể..." value={record.clinical} onChange={e=>setRecord(r=>({...r,clinical:e.target.value}))} /></div>
              <div className={styles.field}><label>Kết luận & hướng điều trị</label><textarea placeholder="Phương hướng điều trị..." value={record.conclusion} onChange={e=>setRecord(r=>({...r,conclusion:e.target.value}))} /></div>
              <button className={styles.btnPrint} onClick={() => setShowPrint('record')}>🖨 Xuất bệnh án PDF</button>
            </>
          )}

          {/* TAB 3 — Đơn thuốc */}
          {tab === 3 && (
            <>
              <div className={styles.sectionLabel}>Kê đơn thuốc</div>
              <div className={styles.drugHeader}>
                <span>Tên thuốc</span><span>Số lượng</span><span>Cách dùng</span>
              </div>
              {drugs.map((d, i) => (
                <div key={i} className={styles.drugRow}>
                  <input placeholder="Tên thuốc, hàm lượng" value={d.name} onChange={e=>updateDrug(i,'name',e.target.value)} />
                  <input placeholder="Số lượng" value={d.qty} onChange={e=>updateDrug(i,'qty',e.target.value)} />
                  <input placeholder="Cách dùng" value={d.usage} onChange={e=>updateDrug(i,'usage',e.target.value)} />
                </div>
              ))}
              <button className={styles.btnAdd} onClick={addDrug}>+ Thêm thuốc</button>
              <div className={styles.field}><label>Lời dặn bác sĩ</label><textarea placeholder="Uống nhiều nước, nghỉ ngơi..." value={advice} onChange={e=>setAdvice(e.target.value)} /></div>
              <button className={styles.btnPrint} onClick={() => setShowPrint('prescription')}>🖨 Xuất đơn thuốc PDF</button>
            </>
          )}

          {/* TAB 4 — Hẹn lần sau */}
          {tab === 4 && (
            <>
              <div className={styles.sectionLabel}>Đặt lịch tái khám</div>
              <div className={styles.row2}>
                <div className={styles.field}><label>Ngày hẹn</label><input type="date" value={nextDate} onChange={e=>setNextDate(e.target.value)} /></div>
                <div className={styles.field}><label>Khung giờ</label>
                  <select value={nextTime} onChange={e=>setNextTime(e.target.value)}>
                    {['07:30','08:00','08:30','09:00','09:30','14:00','14:30','15:00'].map(t=><option key={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div className={styles.field}><label>Mục đích tái khám</label><textarea placeholder="Kiểm tra kết quả điều trị..." value={nextNote} onChange={e=>setNextNote(e.target.value)} /></div>
              <div className={styles.infoBox}>
                💡 Hệ thống sẽ tự động gửi SMS nhắc lịch cho <strong>{p.name}</strong> ({p.phone}) trước 24h.
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <button className={`${styles.btn} ${styles.btnOutline}`} onClick={onClose}>Đóng</button>
          {tab === 1 && <button className={`${styles.btn} ${styles.btnDanger}`} onClick={()=>alert('Đã hủy lịch!')}>Hủy lịch</button>}
          {tab === 1 && <button className={`${styles.btn} ${styles.btnSuccess}`} onClick={handleConfirm}>✓ Xác nhận đã khám</button>}
          {tab === 2 && <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={()=>setTab(3)}>Kê đơn thuốc →</button>}
          {tab === 3 && <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={()=>setTab(4)}>Hẹn tái khám →</button>}
          {tab === 4 && <button className={`${styles.btn} ${styles.btnSuccess}`} onClick={handleSaveNext}>✓ Xác nhận lịch hẹn</button>}
        </div>
      </div>
    </div>
  )
}