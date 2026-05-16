import { useState, useEffect } from 'react';
import { appointmentService } from '../../services/appointmentService';
import { notificationService } from '../../services/notificationService';
import { medicalRecordService } from '../../services/medicalRecordService';
import { invoiceService } from '../../services/invoiceService';
import PatientModalPatient from '../PatientModalPatient/PatientModalPatient'; 
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

  // Tách hàm lấy dữ liệu ra ngoài để tái sử dụng khi cần refresh danh sách
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

  useEffect(() => {
    fetchData();
  }, []);

  // Cải tiến hàm kiểm tra điều kiện dựa trên dữ liệu phẳng b (date, timeSlot) từ API của bạn
  const canCancel = (appointment) => {
    if (appointment.status !== 'PENDING') return false;

    try {
      // Vì b.timeSlot của bạn dạng "08:00_09:00", ta lấy "08:00"
      const startTimeStr = appointment.timeSlot.split('_')[0];
      const appointmentDateTime = new Date(`${appointment.date}T${startTimeStr}`);
        
      const now = new Date();
      const diffInMs = appointmentDateTime - now;
      const diffInHours = diffInMs / (1000 * 60 * 60);

      return diffInHours >= 1; // Thỏa mãn điều kiện trước 1 tiếng
    } catch (error) {
      return false;
    }
  };

  const handleCancelClick = async (appointmentId) => {
    if (window.confirm("Bạn có chắc chắn muốn hủy lịch khám này không?")) {
        try {
            setLoading(true); // Bật hiệu ứng chờ khi gọi API
            const userId = localStorage.getItem('userId');
            await appointmentService.cancelAppointment(appointmentId, userId);
            
            toast.success("Hủy lịch thành công!");
            await fetchData(); // Gọi lại hàm để cập nhật lại danh sách mới từ database
        } catch (error) {
            // Lấy chuỗi thông báo lỗi chi tiết từ backend nếu có
            toast.error(error.message || error || "Hủy lịch thất bại"); 
        } finally {
            setLoading(false);
        }
    }
  };

  // Hàm xử lý lấy dữ liệu Bệnh án & Hóa đơn
  const handleOpenDetail = async (appointmentId) => {
    try {
      setLoading(true);
      const record = await medicalRecordService.getByAppointment(appointmentId);

      let invoice = null;
      try {
        invoice = await invoiceService.getByMedicalRecord(record.id);
      } catch {
        // Không có hóa đơn vẫn mở được bệnh án thường
      }

      const fullData = {
        ...record,
        ...(invoice || {}),
        createAt: invoice?.createAt || record.createAt,
      };

      setSelectedData(fullData);
      setShowModal(true);
    } catch (error) {
      const status = error.response?.status;
      if (status === 404) {
        toast.info("Bác sĩ chưa tạo bệnh án cho lần khám này.");
      } else if (status === 403) {
        toast.error("Bạn không có quyền xem bệnh án này. Vui lòng đăng nhập lại.");
      } else {
        toast.error("Không thể tải bệnh án, vui lòng thử lại sau.");
      }
      console.error("handleOpenDetail error:", error);
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

                {/* --- KHU VỰC CHỨA CÁC NÚT HÀNH ĐỘNG (ACTIONS) --- */}
                <div className={styles.actions}>
                  {/* Nút Xem bệnh án & Hóa đơn (Chỉ hiện khi trạng thái COMPLETED) */}
                  {b.status === 'COMPLETED' && (
                    <button 
                      className={styles.btnDetail}
                      onClick={() => handleOpenDetail(b.id)}
                    >
                      📄 Xem bệnh án & Hóa đơn
                    </button>
                  )}

                  {/* NÚT HỦY LỊCH KHÁM MỚI THÊM VÀO (Chỉ hiện khi đủ điều kiện canCancel) */}
                  {canCancel(b) && (
                    <button 
                      className={styles.btnCancel}
                      onClick={() => handleCancelClick(b.id)}
                    >
                      ❌ Hủy lịch khám
                    </button>
                  )}
                </div>
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

      {/* RENDER MODAL */}
      {showModal && (
        <PatientModalPatient 
          patient={selectedData} 
          onClose={() => setShowModal(false)} 
        />
      )}
    </div>
  );
}