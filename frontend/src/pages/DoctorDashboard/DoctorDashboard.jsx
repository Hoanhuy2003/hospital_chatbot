import { useEffect, useState } from 'react'
import DoctorSidebar from './components/DoctorSidebar'
import DoctorTopbar from './components/DoctorTopbar'
import DashboardHome from './components/DashboardHome'
import ScheduleList from './components/ScheduleList'
import PatientModal from './components/PatientModal'
import RecordList from './components/RecordList'
import NextAppointments from './components/NextAppointments'
import { appointmentService } from '../../services/appointmentService'
import { toast } from 'react-toastify' // QUAN TRỌNG: Nhớ thêm dòng này
import styles from './DoctorDashboard.module.css'

const PAGE_TITLES = {
  dashboard: 'Tổng quan',
  schedule:  'Lịch khám hôm nay',
  patients:  'Danh sách bệnh nhân',
  records:   'Bệnh án',
  next:      'Lịch hẹn lần sau',
}

export default function DoctorDashboard() {
  const [page, setPage]             = useState('dashboard')
  const [appointments, setAppts]    = useState([])
  const [nextAppts, setNextAppts]   = useState([])
  const [selectedPatient, setSelPt] = useState(null)
  const [modalTab, setModalTab]     = useState(0)
  const [loading, setLoading]       = useState(true)
  const [currentDoctor, setCurrentDoctor] = useState(null);

  // 1. Hàm load dữ liệu tách riêng để có thể gọi lại sau khi confirm
  const loadData = async () => {
    const doctorId = localStorage.getItem('userId');
    if (!doctorId) return;

    try {
      setLoading(true);
      const data = await appointmentService.getByDoctor(doctorId);

      const formattedData = data.map(item => ({
        id: item.id,
        time: item.timeSlot?.split('_')[0] || '00:00',
        name: item.patientName, // Khớp với trường patientName ở Backend
        reason: item.reason,
        status: item.status.toLowerCase(), 
        date: item.date,
        queueNumber: item.queueNumber,
        specialtyId: item.doctor?.specialtyId || null
        

        
        
      }));

      setAppts(formattedData);
    } catch (err) { // Đã sửa từ error thành err cho khớp console.log
      console.error("Lỗi load lịch bác sĩ:", err);
      toast.error("Không thể tải danh sách lịch khám");
    } finally {
      setLoading(false)
    }
  };

  function openPatient(id, tab = 0) {
  const selected = appointments.find(a => a.id === id);
  if (selected) {
    console.log("📋 Bệnh nhân được chọn:", selected);
    
    setSelPt({
      ...selected,
      specialtyId: selected.specialtyId   // Lấy từ doctor
    });
    
    setModalTab(tab);
  }
}

  useEffect(() => {
    loadData();
  }, []);

  function openPatient(id, tab = 0) {
    setSelPt(appointments.find(a => a.id === id))
    setModalTab(tab)
  }

  // 2. Hàm xác nhận khám CẦN GỌI BACKEND
  async function confirmExam(id) {
    try {
      // Gửi yêu cầu lên server để đổi trạng thái thành CONFIRMED hoặc DONE
      await appointmentService.updateStatus(id, 'CONFIRMED'); 
      toast.success("Xác nhận khám thành công!");
      
      // Load lại toàn bộ dữ liệu mới nhất từ Backend
      await loadData(); 
      setSelPt(null);
    } catch (err) {
      toast.error("Lỗi khi cập nhật trạng thái khám!");
    }
  }

  function addNextAppt(appt) {
    setNextAppts(prev => [...prev, appt])
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
              {page === 'patients'  && <PatientModal  {...pageProps} />}
              {page === 'records'   && <RecordList    {...pageProps} />}
              {page === 'next'      && <NextAppointments nextAppts={nextAppts} />}
            </>
          )}
        </div>
      </div>

      {selectedPatient && (
        <PatientModal
         patient={selectedPatient}
          initialTab={modalTab}
          onClose={() => setSelPt(null)}
          // onConfirm={() => confirmExam(selectedPatient.id)}
          // onAddNext={addNextAppt}
          onConfirm={loadData}
          onAddNext={addNextAppt} 
          
        />
      )}
    </div>
  )
}