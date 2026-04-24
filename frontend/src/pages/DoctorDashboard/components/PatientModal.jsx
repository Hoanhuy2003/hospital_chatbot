import { useState } from 'react'
import { appointmentService } from '../../../services/appointmentService' 
import { medicalRecordService } from '../../../services/medicalRecordService'
import { toast } from 'react-toastify'
import styles from './PatientModal.module.css'

const TABS = ['Thông tin', 'Xác nhận khám', 'Bệnh án', 'Đơn thuốc', 'Hẹn lần sau']

export default function PatientModal({ patient: p, initialTab = 0, onClose, onConfirm }) {
  const [tab, setTab] = useState(initialTab)
  const [vitals, setVitals] = useState({ temp: '', bp: '', pulse: '', weight: '' })
  const [record, setRecord] = useState({ diagnosis: '', history: '' })
  const [isSubmitting, setIsSubmitting] = useState(false) // Thêm trạng thái loading cho nút bấm


  const [medRecord, setMedRecord] = useState({
    symptoms: '',
    diagnosis: '',
    treatment: '',
    followUpDate: ''
  })

  if (!p) return null;

  // ==================== HÀM XỬ LÝ XÁC NHẬN KHÁM ====================
  async function handleConfirm() {
    try {
      setIsSubmitting(true);

      // 1. Gọi API: PUT /v1/appointments/{id}/status?status=CONFIRMED
      // Lưu ý: service của bạn đã dùng .toUpperCase() nên truyền 'confirmed' hay 'CONFIRMED' đều được
      await appointmentService.updateStatus(p.id, 'CONFIRMED');
      
      toast.success(`Đã xác nhận lịch khám cho: ${p.patientName || p.name}`);
      
      // 2. Chạy callback onConfirm (hàm loadData ở file DoctorDashboard)
      // Việc này giúp các con số thống kê ở Dashboard nhảy ngay lập tức
      if (onConfirm) await onConfirm(); 
      
      // 3. Đóng modal sau khi xong
      onClose();
    } catch (err) {
      console.error("Lỗi xác nhận:", err);
      toast.error("Không thể cập nhật trạng thái. Vui lòng kiểm tra lại kết nối!");
    } finally {
      setIsSubmitting(false);
    }
  }

  
  // hàm nhập vào lưu thông tin bệnh án
  async function handleSaveMedicalRecord() {
    if(!medRecord.diagnosis) {
      return toast.warning("Vui lòng nhập chẩn đoán bệnh") // Sửa chính tả "chuẩn đoàn" -> "chẩn đoán"
    }

    try {
      setIsSubmitting(true);
      
      const payload = {
        appointment_id: p.id,
        symptoms: medRecord.symptoms,
        diagnosis: medRecord.diagnosis,
        treatment: medRecord.treatment,
        prescription: "[]", 
        follow_up_date: medRecord.followUpDate || null // Sửa lỗi: follow_up_ate -> follow_up_date
      };

      console.log("Dữ liệu gửi đi:", payload); // Thêm dòng này để kiểm tra ở Console F12

      await medicalRecordService.create(payload);
      toast.success("Đã lưu bệnh án, Ca khám hoàn tất");

      // Sau khi lưu thành công, báo cho Dashboard load lại dữ liệu
      if (onConfirm) {
        await onConfirm(); 
      }
      onClose();

    } catch (error) {
      console.error("Lỗi API:", error.response?.data || error.message);
      toast.error("Lỗi: Không thể lưu bệnh án. Hãy kiểm tra Console!");
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className={styles.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal}>
        {/* Header */}
        <div className={styles.head}>
          <div>
            <h3>Hồ sơ: {p.patientName || p.name}</h3>
            <div className={styles.headSub}>Mã phiếu: <strong>{p.queueNumber}</strong></div>
          </div>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        {/* Tabs Navigation */}
        <div className={styles.tabs}>
          {TABS.map((t, i) => (
            <button 
              key={t} 
              className={`${styles.tab} ${tab === i ? styles.tabActive : ''}`} 
              onClick={() => setTab(i)}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Content Body */}
        <div className={styles.body}>
          {/* TAB 0: Thông tin tổng quan */}
          {tab === 0 && (
            <div className={styles.tabContent}>
              <div className={styles.sectionLabel}>Thông tin lịch hẹn</div>
              <div className={styles.field}>
                <label>Bệnh nhân</label>
                <input readOnly value={p.patientName || p.name} />
              </div>
              <div className={styles.row2}>
                <div className={styles.field}>
                   <label>Ngày khám</label>
                   <input readOnly value={p.date} />
                </div>
                <div className={styles.field}>
                   <label>Giờ đặt</label>
                   <input readOnly value={p.timeSlot?.replace('_', ' - ')} />
                </div>
              </div>
              <div className={styles.field}>
                <label>Lý do từ bệnh nhân</label>
                <textarea readOnly value={p.reason || "Không có lý do cụ thể"} />
              </div>
            </div>
          )}

          {/* TAB 1: Xác nhận & Chẩn đoán sơ bộ */}
          {tab === 1 && (
            <div className={styles.tabContent}>
              <div className={styles.sectionLabel}>Khám sàng lọc</div>
              <div className={styles.row2}>
                <div className={styles.field}>
                  <label>Nhiệt độ (°C)</label>
                  <input 
                    type="number" 
                    placeholder="" 
                    value={vitals.temp} 
                    onChange={e => setVitals(v => ({...v, temp: e.target.value}))} 
                  />
                </div>
                <div className={styles.field}>
                  <label>Huyết áp (mmHg)</label>
                  <input 
                    placeholder="" 
                    value={vitals.bp} 
                    onChange={e => setVitals(v => ({...v, bp: e.target.value}))} 
                  />
                </div>
              </div>
              <div className={styles.field}>
                <label>Ghi chú bác sĩ / Chẩn đoán sơ bộ</label>
                <textarea 
                  placeholder="Nhập nội dung chẩn đoán để lưu vào hồ sơ..." 
                  value={record.diagnosis} 
                  onChange={e => setRecord(r => ({...r, diagnosis: e.target.value}))} 
                />
              </div>
              <div className={styles.infoBox}>
                🔔 <strong>Thông báo:</strong> Khi xác nhận, hệ thống sẽ gửi tin nhắn đến bệnh nhân thông qua danh sách thông báo của họ.
              </div>
            </div>
          )}

        {/**BỆNH ÁN */}
          {tab === 2 && (
            <div className={styles.recordForm}>
              <div className={styles.sectionLabel}>Nội dung khám bệnh</div>
              <div className={styles.field}>
                <label>Triệu chứng lâm sàng</label>
                <textarea 
                  placeholder="Mô tả các triệu chứng bác sĩ quan sát được..."
                  value={medRecord.symptoms}
                  onChange={e => setMedRecord({...medRecord, symptoms: e.target.value})}
                />
              </div>
              <div className={styles.row2}>
                <div className={styles.field}>
                  <label>Chẩn đoán xác định</label>
                  <input 
                    placeholder="Tên bệnh (Ví dụ: Viêm dạ dày)"
                    value={medRecord.diagnosis}
                    onChange={e => setMedRecord({...medRecord, diagnosis: e.target.value})}
                  />
                </div>
                <div className={styles.field}>
                  <label>Ngày hẹn tái khám</label>
                  <input 
                    type="date"
                    value={medRecord.followUpDate}
                    onChange={e => setMedRecord({...medRecord, followUpDate: e.target.value})}
                  />
                </div>
              </div>
              <div className={styles.field}>
                <label>Hướng điều trị / Lời khuyên</label>
                <textarea 
                  placeholder="Chế độ ăn uống, nghỉ ngơi..."
                  value={medRecord.treatment}
                  onChange={e => setMedRecord({...medRecord, treatment: e.target.value})}
                />
              </div>
            </div>
          )}
          
          {/* Các tab khác (Bệnh án, Đơn thuốc...) Hoàn có thể phát triển thêm sau */}
          {[ 3, 4].includes(tab) && (
            <div className={styles.emptyTab}>Tính năng đang được phát triển đồng bộ với hồ sơ bệnh án.</div>
          )}
        </div>

        {/* Footer Actions */}
        <div className={styles.footer}>
          <button className={`${styles.btn} ${styles.btnOutline}`} onClick={onClose} disabled={isSubmitting}>
            Đóng
          </button>
          
          {tab === 1 && (
            <button 
              className={`${styles.btn} ${styles.btnSuccess}`} 
              onClick={handleConfirm}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Đang xử lý...' : '✓ Xác nhận lịch khám'}
            </button>
          )}
          {tab === 2 && (
            <button
             className={`${styles.btn} ${styles.btnPrimary}`}
             onClick={handleSaveMedicalRecord}
             disabled={isSubmitting}
            >
              {isSubmitting ? 'Đang lưu...' : ' Lưu bệnh án & Kết thúc'}
            </button>
            
          )}
        </div>
      </div>
    </div>
  )
}