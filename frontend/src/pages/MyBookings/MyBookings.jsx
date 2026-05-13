import { useState, useEffect } from 'react';
import { appointmentService } from '../../services/appointmentService';
import { notificationService } from '../../services/notificationService';
import { medicalRecordService } from '../../services/medicalRecordService';
import { invoiceService } from '../../services/invoiceService';
import PatientModalPatient from '../PatientModalPatient/PatientModalPatient'; // Đảm bảo bạn đã import component này
import { toast } from 'react-toastify';
import styles from './MyBookings.module.css';

const STATUS_MAP = {
  PENDING: { label: 'Chờ xác nhận', color: '#F57C00', bg: '#FFF3E0' },
  CONFIRMED: { label: 'Đã xác nhận', color: '#2E7D32', bg: '#E8F5E9' },
  CANCELLED: { label: 'Đã huỷ',      color: '#C62828', bg: '#FFEBEE' },
  COMPLETED: { label: 'Hoàn thành',  color: '#1565C0', bg: '#E3F2FD' },
};

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // State cho Modal
  const [showModal, setShowModal] = useState(false);
  const [selectedData, setSelectedData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const userId = localStorage.getItem('userId');
      if (!userId) return;
      try {
        setLoading(true);
        const data = await appointmentService.getByPatient(userId);
        setBookings(data || []);

        const notiData = await notificationService.getByUserId(userId);
        setNotifications(notiData || []);
      } catch (err) {
        console.error("Lỗi tải dữ liệu:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Hàm xử lý lấy dữ liệu Bệnh án & Hóa đơn
  const handleOpenDetail = async (appointmentId) => {
    try {
      setLoading(true);
      // 1. Lấy bệnh án từ appointmentId
      const record = await medicalRecordService.getByAppointment(appointmentId);

      // 2. Lấy hóa đơn từ record.id
      let invoice = null;
      try {
        invoice = await invoiceService.getByMedicalRecord(record.id);
      } catch (e) {
        console.log("Chưa có hóa đơn cho bệnh án này");
      }

      // 3. Gộp data (Ưu tiên các trường từ Invoice cho phần thanh toán)
      const fullData = {
        ...record,
        ...invoice,
        // Đảm bảo lấy đúng ngày tạo bệnh án nếu hóa đơn chưa có ngày
        createAt: invoice?.createAt || record.createAt 
      };

      setSelectedData(fullData);
      setShowModal(true);
    } catch (error) {
      console.error(error);
      toast.info("Thông tin đang được bác sĩ cập nhật.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className={styles.loading}>Đang xử lý dữ liệu...</div>;

  return (
    <div className={styles.wrapper}>
      <h1 className={styles.title}>Danh sách bác sĩ đã đặt</h1>
      
      <div className={styles.list}>
        {bookings.map((b) => {
          const s = STATUS_MAP[b.status] || STATUS_MAP.PENDING;

          return (
            <div key={b.id} className={styles.card}>
              <div className={styles.cardLeft}>
                <div className={styles.avatar}>
                  {b.photoUrl ? (
                    <img src={b.photoUrl} alt={b.doctorName} className={styles.avatar} />
                  ) : (
                    <span className={styles.defaultIcon}>👨‍⚕️</span>
                  )}
                </div>
              </div>
              
              <div className={styles.cardBody}>
                <div className={styles.docName}>BS. {b.doctorName || "Chưa có tên"}</div>
                <div className={styles.docSpec}>{b.specialtyName}</div>
                
                <div className={styles.meta}>
                  <div>🏥 {b.clinicName}</div>
                  <div>📅 Ngày khám: <strong>{b.date}</strong></div>
                  <div>🕐 Giờ khám: <strong>{b.timeSlot?.replace('_', ' - ')}</strong></div>
                </div>

                <div className={styles.footerInfo}>
                  <span className={styles.code}>Mã phiếu: <strong>{b.queueNumber}</strong></span>
                </div>

                {/* THÊM NÚT XEM CHI TIẾT KHI ĐÃ HOÀN THÀNH */}
                {b.status === 'COMPLETED' && (
                  <div className={styles.actions}>
                    <button 
                      className={styles.btnDetail}
                      onClick={() => handleOpenDetail(b.id)}
                    >
                      📄 Xem bệnh án & Hóa đơn
                    </button>
                  </div>
                )}
              </div>

              <div className={styles.cardRight}>
                <span className={styles.status} style={{ color: s.color, background: s.bg }}>
                  {s.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* RENDER MODAL TẠI ĐÂY */}
      {showModal && (
        <PatientModalPatient 
          patient={selectedData} 
          onClose={() => setShowModal(false)} 
        />
      )}
    </div>
  );
}