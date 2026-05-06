import { useState, useEffect } from 'react'
import { medicalRecordService } from '../../../services/medicalRecordService'
import { toast } from 'react-toastify'
import styles from './Shared.module.css'
import MedicalRecordDetailModal from './MedicalRecordDetailModal'   // ← Import component chi tiết

export default function RecordList({ openPatient }) {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [detailModalId, setDetailModalId] = useState(null)

  const openDetail = (id) => setDetailModalId(id)

  useEffect(() => {
    const fetchRecords = async () => {
      const doctorId = localStorage.getItem('userId')
      if (!doctorId) {
        setError("Không tìm thấy ID bác sĩ")
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)

        console.log(`Đang lấy bệnh án của bác sĩ ID: ${doctorId}`)
        
        const data = await medicalRecordService.getByDoctor(doctorId)
        
        console.log(`✅ Lấy được ${data?.length || 0} bệnh án`)
        
        setRecords(Array.isArray(data) ? data : [])
      } catch (err) {
        console.error("Lỗi lấy bệnh án:", err)
        toast.error("Không thể tải lịch sử bệnh án")
        setError("Không thể tải dữ liệu")
        setRecords([])
      } finally {
        setLoading(false)
      }
    }

    fetchRecords()
  }, [])

  if (loading) {
    return <div className={styles.loading}>Đang tải bệnh án...</div>
  }

  if (error) {
    return <div className={styles.error}>{error}</div>
  }

  return (
    <>
      <div className={styles.card}>
        <h3>Lịch sử khám bệnh</h3>
        
        {records.length === 0 ? (
          <p>Chưa có bệnh án nào cho bác sĩ này.</p>
        ) : (
          records.map(r => (
            <div key={r.id} className={styles.apptItem}>
              <div className={styles.apptInfo}>
                <strong>{r.patientName || r.patient_name || 'Bệnh nhân'}</strong> 
                <small> · {r.date}</small>
                <p>Chẩn đoán: {r.diagnosis || 'Chưa có chẩn đoán'}</p>
              </div>
              <div className={styles.apptActions}>
                <button 
                  className={styles.btnOutline} 
                  onClick={() => openDetail(r.id || r.appointmentId)}
                >
                  Chi tiết
                </button>
                {/* <button 
                  className={styles.btnPrimary} 
                  onClick={() => openPatient(r.appointmentId || r.id, 3)}
                >
                  Đơn thuốc
                </button> */}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal chi tiết bệnh án */}
      {detailModalId && (
        <MedicalRecordDetailModal 
          recordId={detailModalId} 
          onClose={() => setDetailModalId(null)} 
        />
      )}
    </>
  )
}