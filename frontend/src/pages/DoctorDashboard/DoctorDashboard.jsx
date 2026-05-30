import { useEffect, useState } from 'react'
import DoctorSidebar from './components/DoctorSidebar'
import DoctorTopbar from './components/DoctorTopbar'
import DashboardHome from './components/DashboardHome'
import ScheduleList from './components/ScheduleList'
import PatientModal from './components/PatientModal'
import RecordList from './components/RecordList'
import NextAppointments from './components/NextAppointments'
import DoctorSchedule from './components/DoctorSchedule'
import DoctorProfile from './components/DoctorProfile'
import { appointmentService } from '../../services/appointmentService'
import { medicalRecordService } from '../../services/medicalRecordService' // Thêm service này
import { toast } from 'react-toastify'
import styles from './DoctorDashboard.module.css'

const PAGE_TITLES = {
  dashboard:         'Tổng quan',
  schedule:          'Lịch khám hôm nay',
  register_schedule: 'Đăng ký lịch khám',
  patients:          'Danh sách bệnh nhân',
  records:           'Bệnh án',
  next:              'Lịch hẹn lần sau',
  profile:           'Thông tin cá nhân',
}

/** Gộp dòng danh sách + GET /appointments/{id} để luôn có đủ thông tin bệnh nhân. */
function mergeAppointmentForModal(listRow, detail) {
  const row = listRow || {}
  const d = detail || {}
  const st = String(d.status || row.status || 'PENDING').toLowerCase()
  const timeFromSlot = d.timeSlot ? String(d.timeSlot).split('_')[0] : null

  return {
    id: d.id ?? row.id,
    time: timeFromSlot || row.time || '00:00',
    name: d.patientName || row.name,
    patientName: d.patientName ?? row.patientName,
    reason: d.reason ?? row.reason,
    status: st,
    date: d.date ?? row.date,
    queueNumber: d.queueNumber ?? row.queueNumber,
    specialtyId: row.specialtyId ?? d.specialtyId ?? null,
    patientId: d.patientId,
    patientFullName: d.patientFullName,
    patientPhone: d.patientPhone,
    patientEmail: d.patientEmail,
    patientDateOfBirth: d.patientDateOfBirth,
    patientGender: d.patientGender,
    patientAddress: d.patientAddress,
    patientHealthInsuranceNumber: d.patientHealthInsuranceNumber,
    patientInsuranceExpiryDate: d.patientInsuranceExpiryDate,
    patientInsuranceBenefitLevel: d.patientInsuranceBenefitLevel,
    patientAvatarUrl: d.patientAvatarUrl,
    doctorName: d.doctorName,
    clinicName: d.clinicName,
    specialtyName: d.specialtyName,
    timeSlot: d.timeSlot ?? row.timeSlot,
    type: d.type ?? row.type,
  }
}

export default function DoctorDashboard() {
  // userId dùng cho AppointmentService (backend query bằng User.id)
  const userId         = localStorage.getItem('userId');
  // doctorId dùng cho ScheduleService (backend query bằng Doctor.id)
  const scheduleDoctorId = localStorage.getItem('doctorId') || userId;
  const clinicId       = localStorage.getItem('clinicId');

  const [page, setPage]             = useState('dashboard')
  const [appointments, setAppts]    = useState([])
  const [nextAppts, setNextAppts]   = useState([])
  const [selectedPatient, setSelPt] = useState(null)
  const [modalTab, setModalTab]     = useState(0)
  const [loading, setLoading]       = useState(true)

  // 1. Load lịch khám hôm nay và lịch hẹn tái khám
  const loadData = async () => {
    if (!userId) return;

    try {
      setLoading(true);
      // Gọi song song cả 2 API để tối ưu tốc độ
      const [resToday, resNext] = await Promise.all([
        appointmentService.getByDoctor(userId),
        medicalRecordService.getNextAppointment(userId)
      ]);

      // Format lịch hôm nay (kèm thông tin hồ sơ bệnh nhân từ API)
      const formattedToday = resToday.map(item => ({
        id: item.id,
        time: item.timeSlot?.split('_')[0] || '00:00',
        name: item.patientName,
        patientName: item.patientName,
        reason: item.reason,
        status: String(item.status || 'PENDING').toLowerCase(),
        date: item.date,
        queueNumber: item.queueNumber,
        specialtyId: item.specialtyId ?? null,
        patientId: item.patientId,
        patientFullName: item.patientFullName,
        patientPhone: item.patientPhone,
        patientEmail: item.patientEmail,
        patientDateOfBirth: item.patientDateOfBirth,
        patientGender: item.patientGender,
        patientAddress: item.patientAddress,
        patientHealthInsuranceNumber: item.patientHealthInsuranceNumber,
        patientInsuranceExpiryDate: item.patientInsuranceExpiryDate,
        patientInsuranceBenefitLevel: item.patientInsuranceBenefitLevel,
        patientAvatarUrl: item.patientAvatarUrl,
        doctorName: item.doctorName,
        clinicName: item.clinicName,
        specialtyName: item.specialtyName,
        timeSlot: item.timeSlot,
        type: item.type,
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

  async function openPatient(id, tab = 0) {
    if (!id) return
    const selected = appointments.find(a => a.id === id)
    if (selected?.status === 'cancelled') {
      toast.warning('Lịch hẹn này đã bị hủy, không thể tiến hành khám.')
      return
    }

    setModalTab(tab)

    try {
      const detail = await appointmentService.getById(id)
      const merged = mergeAppointmentForModal(selected, detail)
      if (merged.status === 'cancelled') {
        toast.warning('Lịch hẹn này đã bị hủy, không thể tiến hành khám.')
        return
      }
      setSelPt(merged)
    } catch (err) {
      console.error(err)
      toast.error('Không tải được chi tiết lịch khám. Kiểm tra kết nối hoặc quyền truy cập.')
      if (selected) setSelPt(selected)
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
              {page === 'dashboard'         && <DashboardHome {...pageProps} />}
              {page === 'schedule'          && <ScheduleList  {...pageProps} />}
              {page === 'register_schedule' && (
                <DoctorSchedule doctorId={scheduleDoctorId} clinicId={clinicId} />
              )}
              {page === 'records'           && <RecordList    {...pageProps} />}
              {page === 'next'              && <NextAppointments list={nextAppts} />}
              {page === 'profile'           && <DoctorProfile />}
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