import { useState, useEffect } from 'react'
import { medicalRecordService } from '../../../services/medicalRecordService'
import { toast } from 'react-toastify'
import styles from './Shared.module.css'

export default function MedicalRecordDetailModal({ recordId, onClose }) {
  const [record, setRecord] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true)
        // API này phải trả về đầy đủ: triệu chứng, chẩn đoán, đơn thuốc
        const data = await medicalRecordService.getById(recordId)
        setRecord(data)
      } catch (err) {
        toast.error("Không thể tải chi tiết bệnh án")
        onClose() // Đóng modal nếu lỗi
      } finally {
        setLoading(false)
      }
    }
    if (recordId) fetchDetail()
  }, [recordId])

  const handlePrint = () => window.print()

  // Hàm hiển thị đơn thuốc đẹp hơn
  const renderPrescription = (data) => {
    try {
      const drugs = typeof data === 'string' ? JSON.parse(data) : data;
      return drugs.map((d, i) => (
        <div key={i} style={{ marginBottom: '8px', borderBottom: '1px dashed #ddd', paddingBottom: '4px' }}>
          {i + 1}. <strong>{d.name}</strong> - SL: {d.quantity}
          <div style={{ fontSize: '12px', color: '#666', fontStyle: 'italic' }}>HD: {d.note}</div>
        </div>
      ));
    } catch (e) {
      return <pre style={{ whiteSpace: 'pre-wrap' }}>{data}</pre>;
    }
  }

  if (loading) return (
    <div className={styles.overlay}>
       <div className={styles.modal} style={{textAlign: 'center', padding: '40px'}}>Đang tải dữ liệu...</div>
    </div>
  )

  if (!record) return null;

  return (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal} style={{ maxWidth: '700px', width: '95%', animation: 'slideDown 0.3s ease' }}>
        
        {/* Header màu xanh giống ảnh Screenshot (981) */}
        <div style={{ background: '#1976D2', color: 'white', padding: '16px 24px', borderRadius: '12px 12px 0 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '18px' }}>Hồ sơ bệnh án: {record.patientName}</h3>
            <small style={{ opacity: 0.8 }}>Mã bệnh án: #{record.id}</small>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'white', fontSize: '20px', cursor: 'pointer' }}>✕</button>
        </div>

        <div className={styles.body} style={{ padding: '24px', maxHeight: '70vh', overflowY: 'auto' }}>
          
          {/* Thông tin hành chính */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px', padding: '15px', background: '#f8f9fa', borderRadius: '8px' }}>
             <div><strong>Ngày khám:</strong> {record.created_at}</div>
             <div><strong>Chẩn đoán:</strong> {record.diagnosis}</div>
          </div>

          {record.photoUrl && (
            <section style={{ marginBottom: '25px' }}>
              <h4 style={{ color: '#1976D2', borderBottom: '1px solid #eee', paddingBottom: '5px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                📷 Hình ảnh lâm sàng (X-Quang / Xét nghiệm)
              </h4>
              <div style={{ marginTop: '10px', textAlign: 'center', background: '#f0f0f0', padding: '10px', borderRadius: '10px' }}>
                <img 
                  src={record.photoUrl} 
                  alt="Ảnh chụp X-Quang" 
                  style={{ 
                    maxWidth: '100%', 
                    borderRadius: '8px', 
                    cursor: 'zoom-in', 
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    border: '2px solid white' 
                  }}
                  onClick={() => window.open(record.photoUrl, '_blank')} // Click để xem ảnh gốc to hơn
                  title="Click để phóng to ảnh"
                />
                <p style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>* Nhấp vào ảnh để xem kích thước đầy đủ</p>
              </div>
            </section>
          )}

          <section style={{ marginBottom: '20px' }}>
            <h4 style={{ color: '#1976D2', borderBottom: '1px solid #eee', paddingBottom: '5px' }}>Triệu chứng lâm sàng</h4>
            <p style={{ padding: '10px', background: '#fff', border: '1px solid #eee', borderRadius: '5px' }}>{record.symptoms || 'Không ghi nhận'}</p>
          </section>

          <section style={{ marginBottom: '20px' }}>
            <h4 style={{ color: '#1976D2', borderBottom: '1px solid #eee', paddingBottom: '5px' }}>Đơn thuốc kê kèm</h4>
            <div style={{ padding: '15px', background: '#f0f7ff', borderRadius: '8px' }}>
               {record.prescription ? renderPrescription(record.prescription) : 'Không có đơn thuốc'}
            </div>
          </section>

          {record.treatment && (
            <section>
              <h4 style={{ color: '#1976D2', borderBottom: '1px solid #eee', paddingBottom: '5px' }}>Lời dặn bác sĩ</h4>
              <p style={{ fontStyle: 'italic' }}>{record.treatment}</p>
            </section>
          )}
        </div>

        <div style={{ padding: '16px 24px', borderTop: '1px solid #eee', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button className={styles.btnOutline} onClick={onClose}>Đóng</button>
          <button 
            onClick={handlePrint}
            style={{ padding: '10px 20px', background: '#2e7d32', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            🖨️ In bệnh án
          </button>
        </div>
      </div>
    </div>
  )
}