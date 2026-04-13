import { useState } from 'react'
import DoctorSidebar from './components/DoctorSidebar'
import DoctorTopbar from './components/DoctorTopbar'
import DashboardHome from './components/DashboardHome'
import ScheduleList from './components/ScheduleList'
import PatientModal from './components/PatientModal'
import RecordList from './components/RecordList'
import NextAppointments from './components/NextAppointments'
import styles from './DoctorDashboard.module.css'

export const MOCK_APPOINTMENTS = [
  { id:1, time:'07:30', name:'Nguyễn Văn An',   age:34, gender:'Nam', dob:'15/03/1990', phone:'0901 234 567', reason:'Ho kéo dài, khó thở',        status:'confirm' },
  { id:2, time:'08:00', name:'Trần Thị Bích',    age:28, gender:'Nữ',  dob:'20/07/1996', phone:'0912 345 678', reason:'Sốt cao 3 ngày',               status:'wait'    },
  { id:3, time:'08:30', name:'Lê Minh Khoa',     age:7,  gender:'Nam', dob:'05/11/2017', phone:'0923 456 789', reason:'Viêm họng, chảy mũi',           status:'wait'    },
  { id:4, time:'09:00', name:'Phạm Thị Dung',    age:45, gender:'Nữ',  dob:'12/06/1979', phone:'0934 567 890', reason:'Khám tổng quát định kỳ',        status:'done'    },
  { id:5, time:'09:30', name:'Hoàng Văn Em',     age:12, gender:'Nam', dob:'30/09/2012', phone:'0945 678 901', reason:'Dị ứng, nổi mề đay',            status:'wait'    },
  { id:6, time:'10:00', name:'Ngô Thị Phương',   age:55, gender:'Nữ',  dob:'08/02/1969', phone:'0956 789 012', reason:'Tái khám sau điều trị',         status:'cancel'  },
  { id:7, time:'14:00', name:'Bùi Thanh Giang',  age:22, gender:'Nam', dob:'14/08/2002', phone:'0967 890 123', reason:'Đau bụng, tiêu chảy',           status:'confirm' },
  { id:8, time:'14:30', name:'Võ Thị Hoa',       age:38, gender:'Nữ',  dob:'25/12/1986', phone:'0978 901 234', reason:'Khó ngủ, đau đầu mãn tính',    status:'wait'    },
]

export const MOCK_NEXT = [
  { id:1, date:'20/04/2026', name:'Nguyễn Văn An',  phone:'0901 234 567', note:'Tái khám kiểm tra phổi'             },
  { id:2, date:'22/04/2026', name:'Trần Thị Bích',   phone:'0912 345 678', note:'Xét nghiệm máu lần 2'               },
  { id:3, date:'25/04/2026', name:'Lê Minh Khoa',    phone:'0923 456 789', note:'Theo dõi sau điều trị viêm họng'    },
  { id:4, date:'28/04/2026', name:'Hoàng Văn Em',    phone:'0945 678 901', note:'Kiểm tra kết quả test dị ứng'        },
]

const PAGE_TITLES = {
  dashboard: 'Tổng quan',
  schedule:  'Lịch khám hôm nay',
  patients:  'Danh sách bệnh nhân',
  records:   'Bệnh án',
  next:      'Lịch hẹn lần sau',
}

export default function DoctorDashboard() {
  const [page, setPage]             = useState('dashboard')
  const [appointments, setAppts]    = useState(MOCK_APPOINTMENTS)
  const [nextAppts, setNextAppts]   = useState(MOCK_NEXT)
  const [selectedPatient, setSelPt] = useState(null)
  const [modalTab, setModalTab]     = useState(0)

  function openPatient(id, tab = 0) {
    setSelPt(appointments.find(a => a.id === id))
    setModalTab(tab)
  }

  function confirmExam(id) {
    setAppts(prev => prev.map(a => a.id === id ? { ...a, status: 'done' } : a))
    setSelPt(null)
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
          {page === 'dashboard' && <DashboardHome {...pageProps} />}
          {page === 'schedule'  && <ScheduleList  {...pageProps} />}
          {page === 'patients'  && <PatientModal  {...pageProps} />}
          {page === 'records'   && <RecordList    {...pageProps} />}
          {page === 'next'      && <NextAppointments nextAppts={nextAppts} />}
        </div>
      </div>

      {selectedPatient && (
        <PatientModal
          patient={selectedPatient}
          initialTab={modalTab}
          onClose={() => setSelPt(null)}
          onConfirm={() => confirmExam(selectedPatient.id)}
          onAddNext={addNextAppt}
        />
      )}
    </div>
  )
}