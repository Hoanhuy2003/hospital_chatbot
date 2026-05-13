import { useEffect, useState } from 'react'
import DoctorSidebar from './components/DoctorSidebar'
import DoctorTopbar from './components/DoctorTopbar'
import DashboardHome from './components/DashboardHome'
import ScheduleList from './components/ScheduleList'
import PatientModal from './components/PatientModal'
import RecordList from './components/RecordList'
import NextAppointments from './components/NextAppointments'
//import DoctorSchedule from './components/DoctorSchedule'
import { appointmentService } from '../../services/appointmentService'
import { medicalRecordService } from '../../services/medicalRecordService' // Thêm service này
import { toast } from 'react-toastify'
import styles from './DoctorDashboard.module.css'

const PAGE_TITLES = {
  dashboard: 'Tổng quan',
  schedule:  'Lịch khám hôm nay',
 // register_schedule: 'Đăng ký lịch trực',
  patients:  'Danh sách bệnh nhân',
  records:   'Bệnh án',
  next:      'Lịch hẹn lần sau',
}

export default function DoctorDashboard() {
  const [page, setPage]             = useState('dashboard')
  const [appointments, setAppts]    = useState([])
  const [nextAppts, setNextAppts]   = useState([]) // Dữ liệu lịch tái khám
  const [selectedPatient, setSelPt] = useState(null)
  const [modalTab, setModalTab]     = useState(0)
  const [loading, setLoading]       = useState(true)

  // 1. Load lịch khám hôm nay và lịch hẹn tái khám
  const loadData = async () => {
    const doctorId = localStorage.getItem('userId');
    if (!doctorId) return;

    try {
      setLoading(true);
      // Gọi song song cả 2 API để tối ưu tốc độ
      const [resToday, resNext] = await Promise.all([
        appointmentService.getByDoctor(doctorId),
        medicalRecordService.getNextAppointment(doctorId)
      ]);

      // Format lịch hôm nay
      const formattedToday = resToday.map(item => ({
        id: item.id,
        time: item.timeSlot?.split('_')[0] || '00:00',
        name: item.patientName,
        reason: item.reason,
        status: item.status.toLowerCase(), 
        date: item.date,
        queueNumber: item.queueNumber,
        specialtyId: item.doctor?.specialtyId || null
      }));

      setAppts(formattedToday);
      setNextAppts(resNext); // Gán dữ liệu tái khám từ API vào đây
      
    } catch (err) {
      console.error("Lỗi load dữ liệu:", err);
      toast.error("Không thể tải dữ liệu Dashboard");
    } finally {
      setLoading(false)
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // CHỈ GIỮ LẠI 1 HÀM openPatient NÀY
  function openPatient(id, tab = 0) {
    const selected = appointments.find(a => a.id === id);
    if (selected) {
      setSelPt({
        ...selected,
        specialtyId: selected.specialtyId
      });
      setModalTab(tab);
    }
  }

  // Xác nhận khám
  async function confirmExam(id) {
    try {
      await appointmentService.updateStatus(id, 'CONFIRMED'); 
      toast.success("Xác nhận khám thành công!");
      await loadData(); 
      setSelPt(null);
    } catch (err) {
      toast.error("Lỗi khi cập nhật trạng thái!");
    }
  }

  // Hàm này dùng khi bác sĩ vừa lập bệnh án xong và muốn thấy lịch hẹn mới hiện lên ngay
  function addNextAppt(appt) {
    setNextAppts(prev => [appt, ...prev]);
    // Hoặc tốt nhất là gọi lại loadData() để đảm bảo đồng bộ DB
    // loadData(); 
  }

  const pageProps = { appointments, nextAppts, openPatient, setPage }

  return (
    <div className={styles.shell}>
      <DoctorSidebar page={page} setPage={setPage} />
      <div className={styles.main}>
        <DoctorTopbar title={PAGE_TITLES[page]} />
        <div className={styles.content}>
          {loading ? (
            <div className={styles.loading}>Đang tải dữ liệu...</div>
          ) : (
            <>
              {page === 'dashboard' && <DashboardHome {...pageProps} />}
              {page === 'schedule'  && <ScheduleList  {...pageProps} />}
              {/* {page === 'patients'  && <RecordList    {...pageProps} />}  */}
              {page === 'records'   && <RecordList    {...pageProps} />}
              {page === 'next' && <NextAppointments list={nextAppts} />}
            </>
          )}
        </div>
      </div>

      {selectedPatient && (
        <PatientModal
          patient={selectedPatient}
          initialTab={modalTab}
          onClose={() => setSelPt(null)}
          onConfirm={loadData}
          onAddNext={addNextAppt} 
        />
      )}
    </div>
  )
}