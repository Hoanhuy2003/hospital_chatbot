import { useState, useEffect } from 'react'
import { appointmentService } from '../../../services/appointmentService' 
import { medicalRecordService } from '../../../services/medicalRecordService'
import { medicineService } from '../../../services/medicineService' // Đảm bảo đã import service này
import { toast } from 'react-toastify'
import styles from './PatientModal.module.css'

const TABS = ['Thông tin', 'Xác nhận khám', 'Bệnh án', 'Đơn thuốc', 'Hẹn lần sau']

export default function PatientModal({ patient: p, initialTab = 0, onClose, onConfirm }) {
  const [tab, setTab] = useState(initialTab)
  const [vitals, setVitals] = useState({ temp: '', bp: '', pulse: '', weight: '' })
  const [record, setRecord] = useState({ diagnosis: '', history: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Dữ liệu thuốc từ DB
  const [dbMedicines, setDbMedicines] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [photoUrl, setPhotoUrl] = useState('');

  // Cấu trúc drugs mới có medicine_id
  const [drugs, setDrugs] = useState([
    { medicine_id: '', name: '', quantity: '', note: '' }
  ]);

  const [medRecord, setMedRecord] = useState({
    symptoms: '',
    diagnosis: '',
    treatment: '',
    followUpDate: ''
  })

 
 // Lấy danh sách thuốc khi vào Tab "Đơn thuốc"
// Lấy danh sách thuốc khi vào Tab "Đơn thuốc"
// ================== PHẦN LẤY THUỐC ==================
// ================== LẤY DANH SÁCH THUỐC ==================
useEffect(() => {
  const fetchMedicines = async () => {
    if (tab !== 3) return;     // Chỉ load khi ở tab "Đơn thuốc"

    try {
      console.log("🔍 ID chuyên khoa nhận được:", p?.specialtyId || "NULL");

      let data = [];

      // Ưu tiên lấy theo chuyên khoa
      if (p?.specialtyId) {
        console.log(`📌 Đang gọi API lấy thuốc theo chuyên khoa ID = ${p.specialtyId}`);
        data = await medicineService.getBySpecialty(p.specialtyId);
      }

      // Nếu không có specialtyId hoặc lấy theo khoa bị rỗng → lấy tất cả
      if (!data || data.length === 0) {
        console.warn("⚠️ Không có dữ liệu theo chuyên khoa → Lấy tất cả thuốc");
        data = await medicineService.getAll();
      }

      console.log(`✅ Thành công! Đã lấy được ${data.length} loại thuốc`);
      setDbMedicines(data || []);
    } catch (err) {
      console.error("❌ Lỗi khi lấy danh sách thuốc:", err);

      // Fallback lấy tất cả thuốc
      try {
        console.log("🔄 Thử lấy tất cả thuốc làm fallback...");
        const allData = await medicineService.getAll();
        setDbMedicines(allData || []);
        console.log(`✅ Fallback thành công: ${allData.length} thuốc`);
      } catch (fallbackErr) {
        console.error("❌ Fallback cũng thất bại:", fallbackErr);
        setDbMedicines([]);
        toast.error("Không thể tải danh sách thuốc");
      }
    }
  };

  fetchMedicines();
}, [tab, p?.specialtyId]);   // Phụ thuộc vào tab và specialtyId // Quan trọng: phụ thuộc vào tab và specialtyId// Quan trọng: theo dõi tab và specialtyId
  if (!p) return null;

  // --- LOGIC ĐƠN THUỐC ---
  const addDrug = () => {
    setDrugs([...drugs, { medicine_id: '', name: '', quantity: '', note: '' }]);
  };

  const removeDrug = (index) => {
    if (drugs.length > 1) {
      setDrugs(drugs.filter((_, i) => i !== index));
    }
  };

  // Hàm quan trọng: Cập nhật khi chọn thuốc từ dropdown
  const handleSelectMedicine = (index, medId) => {
    const selected = dbMedicines.find(m => m.id === parseInt(medId));
    if (selected) {
      const newDrugs = [...drugs];
      newDrugs[index] = { 
        ...newDrugs[index], 
        medicine_id: selected.id, 
        name: selected.name 
      };
      setDrugs(newDrugs);
    }
  };

  const updateDrugDetail = (index, field, value) => {
    const newDrugs = [...drugs];
    newDrugs[index][field] = value;
    setDrugs(newDrugs);
  };

  const handleUploadPhoto = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      setIsUploading(true);
      const url = await medicalRecordService.uploadPhoto(file);
      setPhotoUrl(url);
      toast.success("Tải ảnh thành công!");
    } catch (err) {
      toast.error("Lỗi upload ảnh");
    } finally {
      setIsUploading(false);
    }
  };

  async function handleConfirm() {
    try {
      setIsSubmitting(true);
      await appointmentService.updateStatus(p.id, 'CONFIRMED');
      toast.success(`Đã xác nhận lịch khám cho: ${p.patientName || p.name}`);
      if (onConfirm) await onConfirm(); 
      onClose();
    } catch (err) {
      toast.error("Lỗi xác nhận");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSaveMedicalRecord() {
    if(!medRecord.diagnosis) return toast.warning("Vui lòng nhập chẩn đoán bệnh");

    try {
      setIsSubmitting(true);
      const validDrugs = drugs.filter(d => d.medicine_id !== '');
      
      const payload = {
        appointment_id: p.id,
        symptoms: medRecord.symptoms,
        diagnosis: medRecord.diagnosis,
        treatment: medRecord.treatment,
        prescription: JSON.stringify(validDrugs),
        photo_url: photoUrl,
        follow_up_date: medRecord.followUpDate || null
      };

      await medicalRecordService.create(payload);
      toast.success("Đã lưu bệnh án thành công");
      if (onConfirm) await onConfirm(); 
      onClose();
    } catch (error) {
      toast.error("Lỗi lưu bệnh án");
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className={styles.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal}>
        <div className={styles.head}>
          <div>
            <h3>Hồ sơ: {p.patientName || p.name}</h3>
            <div className={styles.headSub}>Mã phiếu: <strong>{p.queueNumber}</strong></div>
          </div>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

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

        <div className={styles.body}>
          {tab === 0 && (
            <div className={styles.tabContent}>
              <div className={styles.sectionLabel}>Thông tin lịch hẹn</div>
              <div className={styles.field}><label>Bệnh nhân</label><input readOnly value={p.patientName || p.name} /></div>
              <div className={styles.field}><label>Lý do</label><textarea readOnly value={p.reason || "N/A"} /></div>
            </div>
          )}

          {tab === 1 && (
            <div className={styles.tabContent}>
              <div className={styles.sectionLabel}>Khám sàng lọc</div>
              <div className={styles.row2}>
                <div className={styles.field}><label>Nhiệt độ (°C)</label><input type="number" value={vitals.temp} onChange={e => setVitals({...vitals, temp: e.target.value})} /></div>
                <div className={styles.field}><label>Huyết áp</label><input value={vitals.bp} onChange={e => setVitals({...vitals, bp: e.target.value})} /></div>
              </div>
            </div>
          )}

          {tab === 2 && (
            <div className={styles.recordForm}>
              <div className={styles.sectionLabel}>Nội dung khám bệnh</div>
              <div className={styles.field}>
                <label>Triệu chứng lâm sàng</label>
                <textarea 
                  placeholder="Mô tả triệu chứng..."
                  value={medRecord.symptoms}
                  onChange={e => setMedRecord({...medRecord, symptoms: e.target.value})}
                />
              </div>

              {/* PHẦN CHỌN ẢNH XÉT NGHIỆM */}
              <div className={styles.field}>
                <label>Ảnh xét nghiệm / X-Quang</label>
                <div className={styles.uploadBox}>
                  <input type="file" onChange={handleUploadPhoto} accept="image/*" />
                  {isUploading && <p>Đang tải...</p>}
                  {photoUrl && <img src={photoUrl} alt="Preview" className={styles.previewImg} />}
                </div>
              </div>

              <div className={styles.row2}>
                <div className={styles.field}><label>Chẩn đoán</label><input value={medRecord.diagnosis} onChange={e => setMedRecord({...medRecord, diagnosis: e.target.value})} /></div>
                <div className={styles.field}><label>Ngày tái khám</label><input type="date" value={medRecord.followUpDate} onChange={e => setMedRecord({...medRecord, followUpDate: e.target.value})} /></div>
              </div>
              <div className={styles.field}><label>Hướng điều trị</label><textarea value={medRecord.treatment} onChange={e => setMedRecord({...medRecord, treatment: e.target.value})} /></div>
            </div>
          )}

          {tab === 3 && (
            <div className={styles.recordForm}>
              <div className={styles.sectionLabel}>Kê đơn thuốc điện tử</div>
              <div className={styles.drugHeader}>
                <span>Tên thuốc / Hàm lượng</span>
                <span>Số lượng</span>
                <span>Cách dùng & Ghi chú</span>
              </div>

              <div className={styles.drugList}>
                {drugs.map((drug, index) => (
                  <div key={index} className={styles.drugRow}>
                    {/* DROP DOWN CHỌN THUỐC */}
                    <select 
                      className={styles.medicineSelect}
                      value={drug.medicine_id}
                      onChange={(e) => handleSelectMedicine(index, e.target.value)}
                    >
                      <option value="">-- Chọn thuốc từ kho --</option>
                      {dbMedicines.map(m => (
                        <option key={m.id} value={m.id}>{m.name} ({m.unit})</option>
                      ))}
                    </select>

                    <input 
                      className={styles.quantityInput}
                      placeholder="SL" 
                      value={drug.quantity}
                      onChange={(e) => updateDrugDetail(index, 'quantity', e.target.value)}
                    />
                    <div style={{ display: 'flex', gap: '8px', flex: 1 }}>
                      <input 
                        className={styles.noteInput}
                        placeholder="Ghi chú dùng..." 
                        value={drug.note}
                        onChange={(e) => updateDrugDetail(index, 'note', e.target.value)}
                        style={{ flex: 1 }}
                      />
                      {drugs.length > 1 && (
                        <button type="button" className={styles.btnDanger} onClick={() => removeDrug(index)}>✕</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <button className={styles.btnAdd} onClick={addDrug}>+ Thêm loại thuốc</button>
              
              <div className={styles.tabActions}>
                <button type="button" className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => setTab(2)}>
                  Tiếp tục: Xác nhận bệnh án →
                </button>
              </div>
            </div>
          )}
        </div>

        <div className={styles.footer}>
          <button className={`${styles.btn} ${styles.btnOutline}`} onClick={onClose}>Đóng</button>
          {tab === 1 && <button className={`${styles.btn} ${styles.btnSuccess}`} onClick={handleConfirm} disabled={isSubmitting}>Xác nhận khám</button>}
          {tab === 2 && <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={handleSaveMedicalRecord} disabled={isSubmitting}>Lưu bệnh án</button>}
        </div>
      </div>
    </div>
  )
}