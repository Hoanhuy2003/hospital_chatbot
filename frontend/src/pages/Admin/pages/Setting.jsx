import { useState } from 'react'
import { toast } from 'react-toastify'
import styles from '../AdminCommon.module.css'
import settingStyles from './Settings.module.css'
import api from '../../../services/api'

const NOTIFICATION_SETTINGS = [
  { key: 'smsConfirm',    label: 'Gửi SMS xác nhận lịch khám',    desc: 'Tự động gửi SMS sau khi bác sĩ xác nhận' },
  { key: 'emailReminder', label: 'Email nhắc lịch khám',           desc: 'Gửi email trước 24h' },
  { key: 'pushNotif',     label: 'Push notification',              desc: 'Thông báo đẩy trên app' },
  { key: 'autoReport',    label: 'Báo cáo doanh thu tự động',      desc: 'Gửi báo cáo cuối tháng về email admin' },
]

export default function Settings() {
  const [sysForm, setSysForm] = useState({
    systemName: 'MedCare Hospital',
    supportEmail: 'support@medcare.vn',
    hotline: '1900-2805',
    timezone: 'UTC+7',
    address: 'TP. Hồ Chí Minh, Việt Nam',
  })

  const [notifs, setNotifs] = useState({
    smsConfirm: true, emailReminder: true, pushNotif: false, autoReport: true,
  })

  const [pwForm, setPwForm] = useState({ current: '', newPw: '', confirm: '' })
  const [savingSys, setSavingSys] = useState(false)
  const [savingPw,  setSavingPw]  = useState(false)

  async function handleSaveSys(e) {
    e.preventDefault()
    try {
      setSavingSys(true)
      await api.put('/v1/admin/settings', sysForm)
      toast.success('Đã lưu thông tin hệ thống')
    } catch { toast.error('Lưu thất bại') }
    finally { setSavingSys(false) }
  }

  async function handleSaveNotifs() {
    try {
      await api.put('/v1/admin/settings/notifications', notifs)
      toast.success('Đã lưu cài đặt thông báo')
    } catch { toast.error('Lưu thất bại') }
  }

  async function handleChangePassword(e) {
    e.preventDefault()
    if (!pwForm.current) { toast.warning('Nhập mật khẩu hiện tại'); return }
    if (pwForm.newPw.length < 6) { toast.warning('Mật khẩu mới ít nhất 6 ký tự'); return }
    if (pwForm.newPw !== pwForm.confirm) { toast.warning('Mật khẩu xác nhận không khớp'); return }
    try {
      setSavingPw(true)
      await api.put('/v1/admin/change-password', { currentPassword: pwForm.current, newPassword: pwForm.newPw })
      toast.success('Đã đổi mật khẩu thành công')
      setPwForm({ current: '', newPw: '', confirm: '' })
    } catch (err) { toast.error(err.response?.data?.message || 'Đổi mật khẩu thất bại') }
    finally { setSavingPw(false) }
  }

  return (
    <div className={settingStyles.grid}>

      {/* Thông tin hệ thống */}
      <div className={settingStyles.section}>
        <div className={settingStyles.sectionTitle}>Thông tin hệ thống</div>
        <form onSubmit={handleSaveSys} className={styles.modalForm}>
          {[
            ['systemName',   'Tên hệ thống',      'text',  'MedCare Hospital'     ],
            ['supportEmail', 'Email hỗ trợ',       'email', 'support@medcare.vn'   ],
            ['hotline',      'Hotline',            'text',  '1900-2805'            ],
            ['address',      'Địa chỉ',            'text',  'TP. Hồ Chí Minh'     ],
          ].map(([key, label, type, ph]) => (
            <div key={key} className={styles.field}>
              <label>{label}</label>
              <input type={type} placeholder={ph}
                value={sysForm[key]}
                onChange={e => setSysForm(f => ({...f, [key]: e.target.value}))} />
            </div>
          ))}
          <button type="submit" className={styles.btnPrimary} disabled={savingSys} style={{ marginTop: 4 }}>
            {savingSys ? 'Đang lưu...' : 'Lưu thông tin'}
          </button>
        </form>
      </div>

      {/* Cài đặt thông báo */}
      <div className={settingStyles.section}>
        <div className={settingStyles.sectionTitle}>Cài đặt thông báo</div>
        {NOTIFICATION_SETTINGS.map(n => (
          <div key={n.key} className={settingStyles.toggleRow}>
            <div className={settingStyles.toggleInfo}>
              <div className={settingStyles.toggleLabel}>{n.label}</div>
              <div className={settingStyles.toggleDesc}>{n.desc}</div>
            </div>
            <label className={settingStyles.toggle}>
              <input type="checkbox" checked={notifs[n.key]}
                onChange={e => setNotifs(v => ({...v, [n.key]: e.target.checked}))} />
              <span className={settingStyles.toggleSlider} />
            </label>
          </div>
        ))}
        <button className={styles.btnPrimary} style={{ marginTop: 14 }} onClick={handleSaveNotifs}>
          Lưu cài đặt
        </button>
      </div>

      {/* Đổi mật khẩu */}
      <div className={settingStyles.section}>
        <div className={settingStyles.sectionTitle}>Đổi mật khẩu admin</div>
        <form onSubmit={handleChangePassword} className={styles.modalForm}>
          {[
            ['current', 'Mật khẩu hiện tại',   'Nhập mật khẩu hiện tại'],
            ['newPw',   'Mật khẩu mới',         'Ít nhất 6 ký tự'],
            ['confirm', 'Xác nhận mật khẩu mới','Nhập lại mật khẩu mới'],
          ].map(([key, label, ph]) => (
            <div key={key} className={styles.field}>
              <label>{label}</label>
              <input type="password" placeholder={ph}
                value={pwForm[key]}
                onChange={e => setPwForm(f => ({...f, [key]: e.target.value}))} />
            </div>
          ))}
          <button type="submit" className={styles.btnPrimary} disabled={savingPw}>
            {savingPw ? 'Đang lưu...' : 'Đổi mật khẩu'}
          </button>
        </form>
      </div>

      {/* Thông tin version */}
      <div className={settingStyles.section}>
        <div className={settingStyles.sectionTitle}>Thông tin hệ thống</div>
        {[
          ['Phiên bản', 'v2.1.0'],
          ['Framework', 'Spring Boot 3.x + React 18'],
          ['Database',  'MySQL 8.0'],
          ['Server',    'localhost:8080'],
          ['Frontend',  'localhost:3000'],
        ].map(([k, v]) => (
          <div key={k} className={settingStyles.infoRow}>
            <span className={settingStyles.infoKey}>{k}</span>
            <span className={settingStyles.infoVal}>{v}</span>
          </div>
        ))}
      </div>

    </div>
  )
}