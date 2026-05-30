import { useState, useEffect } from 'react'
import { appointmentService } from '../../../services/appointmentService' 
import { medicalRecordService } from '../../../services/medicalRecordService'
import { medicineService } from '../../../services/medicineService'
import { invoiceService } from '../../../services/invoiceService'
import { toast } from 'react-toastify'
import styles from './PatientModal.module.css'

const TABS = ['Thông tin', 'Xác nhận khám', 'Bệnh án', 'Đơn thuốc', 'Hóa đơn']

function genderLabel(g) {
  if (!g) return '—'
  const m = { MALE: 'Nam', FEMALE: 'Nữ', OTHER: 'Khác' }
  return m[g] || g
}

function formatLocalDate(val) {
  if (val == null || val === '') return '—'
  if (typeof val === 'string') {
    const head = val.split('T')[0]
    const parts = head.split('-')
    if (parts.length === 3) {
      const [y, m, d] = parts
      return `${d}/${m}/${y}`
    }
    return val
  }
  if (Array.isArray(val) && val.length >= 3) {
    const [y, m, d] = val
    return `${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}/${y}`
  }
  return String(val)
}

export default function PatientModal({ patient: p, initialTab = 0, onClose, onConfirm }) {
  const [tab, setTab] = useState(initialTab)
  const [vitals, setVitals] = useState({ temp: '', bp: '', pulse: '', weight: '' })
  const [record, setRecord] = useState({ diagnosis: '', history: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [cancelReason, setCancelReason] = useState('')
  
  // Dữ liệu thuốc từ DB
  const [dbMedicines, setDbMedicines] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [photoUrl, setPhotoUrl] = useState('');

  const [invoiceData, setInvoiceData] = useState(null);


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

  useEffect(() => {
    setTab(initialTab)
  }, [initialTab])

 
  useEffect(() => {
    const fetchMedicines = async () => {
      if (tab !== 3) return

      try {
        let data = await medicineService.getForDoctor()
        if (!Array.isArray(data) || data.length === 0) {
          const specialtyId = p?.specialtyId || localStorage.getItem('specialtyId')
          if (specialtyId) {
            data = await medicineService.getBySpecialty(specialtyId)
          }
        }
        setDbMedicines(Array.isArray(data) ? data : [])
        if (!data?.length) {
          const specLabel = p?.specialtyName || 'chuyên khoa của bạn'
          toast.info(
            `Chưa có thuốc trong danh mục ${specLabel}. Vào Admin → Danh mục thuốc để thêm thuốc và chọn đúng chuyên khoa.`
          )
        }
      } catch (err) {
        console.error('Lỗi tải thuốc:', err)
        setDbMedicines([])
        const msg = err.response?.data?.message || err.response?.data || err.message
        toast.error(typeof msg === 'string' ? msg : 'Không thể tải danh sách thuốc')
      }
    }

    fetchMedicines()
  }, [tab, p?.specialtyId, p?.specialtyName, p?.id])
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

  const st = (p.status || '').toLowerCase()
  const canConfirmAppointment = st === 'pending'
  const canDoctorCancel = st === 'pending' || st === 'confirmed'

  async function handleDoctorCancel() {
    const reason = cancelReason.trim()
    if (!reason) {
      toast.warning('Vui lòng nhập lý do hủy lịch (bệnh nhân sẽ nhận được nội dung này).')
      return
    }
    try {
      setIsSubmitting(true)
      await appointmentService.updateStatus(p.id, 'CANCELLED', reason)
      toast.success('Đã hủy lịch và gửi lý do tới bệnh nhân.')
      setShowCancelDialog(false)
      setCancelReason('')
      if (onConfirm) await onConfirm()
      onClose()
    } catch (err) {
      const msg = err.response?.data || err.message || 'Không thể hủy lịch.'
      toast.error(typeof msg === 'string' ? msg : 'Không thể hủy lịch.')
    } finally {
      setIsSubmitting(false)
    }
  }

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

      // 1. Lưu bệnh án
      const savedRecord = await medicalRecordService.create(payload);
      toast.success("Đã lưu bệnh án thành công");

      // 2. Tạo hóa đơn (Truyền ID bệnh án vừa tạo)
      const invoiceResponse = await invoiceService.create({ medicalRecordId: savedRecord.id });

      // 3. Lấy chi tiết hóa đơn theo đúng cấu trúc JSON mẫu
      // Dùng invoiceResponse.id (hoặc invoiceResponse.invoiceID tùy vào Backend trả về cái nào)
      const fullInvoice = await invoiceService.getById(invoiceResponse.id || invoiceResponse.invoiceID);
      
      // 4. Gán data và chuyển Tab
      setInvoiceData(fullInvoice);
      setTab(4); 

      // Quan trọng: KHÔNG gọi onClose() ở đây để bác sĩ còn xem hóa đơn
      if (onConfirm) await onConfirm(); 
      
    } catch (error) {
      console.error(error);
      toast.error("Lỗi quy trình lưu bệnh án hoặc tạo hóa đơn");
    } finally {
      setIsSubmitting(false);
    }
  }
  const formatVND = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

  return (
    <div className={styles.overlay} onClick={e => e.target === e.currentTarget && !showCancelDialog && onClose()}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.head}>
          <div>
            <h3>Hồ sơ: {p.patientFullName || p.patientName || p.name}</h3>
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
              <div className={styles.sectionLabel}>Thông tin bệnh nhân</div>
              <div className={styles.patientInfoCard}>
                {p.patientAvatarUrl ? (
                  <img src={p.patientAvatarUrl} alt="" className={styles.patientAvatar} />
                ) : (
                  <div className={styles.patientAvatarPlaceholder}>
                    {(p.patientFullName || p.patientName || p.name || '?').trim().slice(0, 1)}
                  </div>
                )}
                <div className={styles.patientInfoMain}>
                  <div className={styles.patientNameRow}>
                    <strong>{p.patientFullName || p.patientName || p.name || '—'}</strong>
                    {p.patientId != null && (
                      <span className={styles.patientIdPill}>Mã BN #{p.patientId}</span>
                    )}
                  </div>
                  {p.patientName && p.patientFullName && p.patientName !== p.patientFullName && (
                    <div className={styles.patientNameNote}>
                      Tên trên phiếu khám: <strong>{p.patientName}</strong>
                    </div>
                  )}
                </div>
              </div>

              <div className={styles.patientInfoGrid}>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Điện thoại</span>
                  <span className={styles.infoValue}>{p.patientPhone || '—'}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Email</span>
                  <span className={styles.infoValue}>{p.patientEmail || '—'}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Ngày sinh</span>
                  <span className={styles.infoValue}>{formatLocalDate(p.patientDateOfBirth)}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Giới tính</span>
                  <span className={styles.infoValue}>{genderLabel(p.patientGender)}</span>
                </div>
                <div className={`${styles.infoItem} ${styles.infoItemWide}`}>
                  <span className={styles.infoLabel}>Địa chỉ</span>
                  <span className={styles.infoValue}>{p.patientAddress?.trim() || '—'}</span>
                </div>
              </div>

              <div className={styles.sectionLabel}>Bảo hiểm y tế</div>
              <div className={styles.patientInfoGrid}>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Số BHYT</span>
                  <span className={styles.infoValue}>{p.patientHealthInsuranceNumber || '—'}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Hạn thẻ</span>
                  <span className={styles.infoValue}>{formatLocalDate(p.patientInsuranceExpiryDate)}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Mức hưởng (%)</span>
                  <span className={styles.infoValue}>
                    {p.patientInsuranceBenefitLevel != null ? p.patientInsuranceBenefitLevel : '—'}
                  </span>
                </div>
              </div>

              <div className={styles.sectionLabel}>Lịch hẹn</div>
              <div className={styles.patientInfoGrid}>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Ngày khám</span>
                  <span className={styles.infoValue}>{p.date ? formatLocalDate(p.date) : '—'}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Khung giờ</span>
                  <span className={styles.infoValue}>
                    {p.timeSlot ? String(p.timeSlot).replace(/_/g, ' - ') : (p.time || '—')}
                  </span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Bác sĩ</span>
                  <span className={styles.infoValue}>{p.doctorName || '—'}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Chuyên khoa</span>
                  <span className={styles.infoValue}>{p.specialtyName || '—'}</span>
                </div>
                <div className={`${styles.infoItem} ${styles.infoItemWide}`}>
                  <span className={styles.infoLabel}>Phòng khám</span>
                  <span className={styles.infoValue}>{p.clinicName || '—'}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Hình thức</span>
                  <span className={styles.infoValue}>
                    {p.type === 'ONLINE_VIDEO' ? 'Tư vấn video' : p.type === 'ONLINE_CHAT' ? 'Chat trực tuyến' : 'Trực tiếp'}
                  </span>
                </div>
              </div>

              <div className={styles.sectionLabel}>Lý do khám</div>
              <div className={styles.field}>
                <textarea readOnly value={p.reason || '—'} rows={3} />
              </div>
            </div>
          )}

          {tab === 1 && (
            <div className={styles.tabContent}>
              {!canConfirmAppointment && st === 'confirmed' && (
                <p className={styles.confirmedNotice}>✓ Lịch khám đã được xác nhận. Bạn có thể tiếp tục nhập bệnh án ở các tab sau.</p>
              )}
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
              <div className={styles.sectionLabel}>
                Kê đơn thuốc điện tử
                {p?.specialtyName ? (
                  <span className={styles.specHint}> — chỉ thuốc khoa: {p.specialtyName}</span>
                ) : null}
              </div>
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
        
        {tab === 4 && invoiceData && (
  <div className={styles.invoiceContent}>
    <div className={styles.invoiceHeader}>
      <h4>HÓA ĐƠN THANH TOÁN</h4>
      <p>Số hóa đơn: #INV-{invoiceData.invoiceID}</p>
      <small>Ngày tạo: {new Date(invoiceData.createAt).toLocaleString('vi-VN')}</small>
    </div>

    <div className={styles.invoiceInfo}>
      <p><strong>Bệnh nhân:</strong> {invoiceData.patientName}</p>
      <p><strong>Bác sĩ:</strong> {invoiceData.doctorName}</p>
      <p><strong>Chẩn đoán:</strong> {invoiceData.diagnosis}</p>
      {invoiceData.healthInsuranceNumber && (
        <p><strong>Mã BHYT:</strong> {invoiceData.healthInsuranceNumber}</p>
      )}
    </div>

    <table className={styles.invoiceTable}>
      <thead>
        <tr>
          <th>Tên thuốc / Cách dùng</th>
          <th style={{ textAlign: 'center' }}>SL</th>
          <th style={{ textAlign: 'right' }}>Đơn giá</th>
          <th style={{ textAlign: 'right' }}>Thành tiền</th>
        </tr>
      </thead>
      <tbody>
        {invoiceData.items && invoiceData.items.map((item, idx) => (
          <tr key={idx}>
            <td>
              <div><strong>{item.medicine.name}</strong></div>
              <small style={{ color: '#666' }}>{item.medicine.dosage_instruction}</small>
            </td>
            <td style={{ textAlign: 'center' }}>{item.quantity}</td>
            <td style={{ textAlign: 'right' }}>{formatVND(item.medicine.price)}</td>
            <td style={{ textAlign: 'right' }}>{formatVND(item.subTotal)}</td>
          </tr>
        ))}
        <tr className={styles.feeRow}>
          <td colSpan="3">Phí khám bệnh</td>
          <td style={{ textAlign: 'right' }}>{formatVND(invoiceData.examinationFee)}</td>
        </tr>
      </tbody>
    </table>

    <div className={styles.invoiceSummary}>
      <div className={styles.summaryLine}>
        <span>Tiền thuốc:</span>
        <span>{formatVND(invoiceData.totalMedicineCost)}</span>
      </div>
      <div className={styles.summaryLine}>
        <span>Tổng chi phí:</span>
        <span>{formatVND(invoiceData.examinationFee + invoiceData.totalMedicineCost)}</span>
      </div>
      <div className={styles.summaryLine}>
        <span>BHYT chi trả:</span>
        <span className={styles.discount}>-{formatVND(invoiceData.insuranceDiscount)}</span>
      </div>
      <div className={`${styles.summaryLine} ${styles.finalAmount}`}>
        <span>Thực trả:</span>
        <span>{formatVND(invoiceData.finalAmount)}</span>
      </div>
    </div>
    
    <div className={styles.invoiceNote}>
      <p>Trạng thái: <span className={styles.statusBadge}>{invoiceData.status}</span></p>
      <p><i>Lưu ý: Phiếu này chỉ có giá trị thanh toán trong ngày.</i></p>
    </div>
  </div>
       )} </div>

        

        <div className={styles.footer}>
  <button className={`${styles.btn} ${styles.btnOutline}`} onClick={onClose} disabled={isSubmitting}>Đóng</button>

  {canDoctorCancel && (
    <button
      type="button"
      className={`${styles.btn} ${styles.btnDanger}`}
      onClick={() => setShowCancelDialog(true)}
      disabled={isSubmitting}
    >
      Từ chối / Hủy lịch
    </button>
  )}
  
  {tab === 1 && canConfirmAppointment && (
    <button
      className={`${styles.btn} ${styles.btnSuccess}`}
      onClick={handleConfirm}
      disabled={isSubmitting}
    >
      Xác nhận khám
    </button>
  )}
  
  {/* Sửa tab === 2 (Bệnh án) hoặc tab === 3 (Đơn thuốc) tùy theo Hoàn muốn hiện nút Lưu ở đâu */}
  {(tab === 2 || tab === 3) && (
    <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={handleSaveMedicalRecord} disabled={isSubmitting}>
      Lưu bệnh án & Tính tiền
    </button>
  )}

  {tab === 4 && (
    <button className={`${styles.btn} ${styles.btnSuccess}`} onClick={() => window.print()}>
      In phiếu thu tạm thời
    </button>
  )}
</div>

        {showCancelDialog && (
          <div
            className={styles.cancelNestedOverlay}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.cancelNestedBox}>
              <h4 className={styles.cancelNestedTitle}>Hủy lịch hẹn</h4>
              <p className={styles.cancelNestedHint}>
                Nhập lý do để gửi tới bệnh nhân (bắt buộc). Lịch sẽ được trả chỗ và bệnh nhân nhận thông báo.
              </p>
              <textarea
                className={styles.cancelNestedTextarea}
                rows={4}
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Ví dụ: Hết chỗ trong khung giờ, trùng lịch cấp cứu..."
                disabled={isSubmitting}
              />
              <div className={styles.cancelNestedActions}>
                <button
                  type="button"
                  className={`${styles.btn} ${styles.btnOutline}`}
                  onClick={() => {
                    setShowCancelDialog(false)
                    setCancelReason('')
                  }}
                  disabled={isSubmitting}
                >
                  Đóng
                </button>
                <button
                  type="button"
                  className={`${styles.btn} ${styles.btnDanger}`}
                  onClick={handleDoctorCancel}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Đang xử lý...' : 'Xác nhận hủy lịch'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}