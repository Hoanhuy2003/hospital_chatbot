import { useState, useEffect, useCallback } from 'react'
import { toast } from 'react-toastify'
import AdminTable, { StatusBadge } from '../components/AdminTable'
import styles from '../AdminCommon.module.css'
import api from '../../../services/api'

const userService = {
  getAll: async (params) => (await api.get('/v1/users', { params })).data,
  toggleActive: async (id) => (await api.patch(`/v1/users/${id}/toggle-active`)).data,
}

export default function UserManager() {
  const [data,    setData]    = useState([])
  const [loading, setLoading] = useState(false)
  const [keyword, setKeyword] = useState('')
  const [role,    setRole]    = useState('')

  const load = useCallback(async () => {
    try {
      setLoading(true)
      const res = await userService.getAll({ keyword, role })
      setData(Array.isArray(res) ? res : res.content || [])
    } catch { toast.error('Không tải được người dùng') }
    finally { setLoading(false) }
  }, [keyword, role])

  useEffect(() => { load() }, [load])

  async function handleToggle(user) {
    try {
      await userService.toggleActive(user.id)
      toast.success(`Đã ${user.isActive ? 'khoá' : 'mở khoá'} tài khoản ${user.fullName}`)
      load()
    } catch { toast.error('Thao tác thất bại') }
  }

  const COLUMNS = [
    { key: 'fullName', label: 'Họ tên',    render: v => <strong>{v}</strong> },
    { key: 'email',    label: 'Email' },
    { key: 'phone',    label: 'SĐT' },
    { key: 'role',     label: 'Vai trò',   render: v => <span className={styles.specBadge}>{v}</span> },
    { key: 'isActive', label: 'Trạng thái',render: v => <StatusBadge status={v ? 'ACTIVE' : 'INACTIVE'} /> },
    {
      key: 'id', label: '', width: 100,
      render: (_, row) => (
        <div style={{ display: 'flex', gap: 4 }}>
          <button className={styles.btnSm}>Sửa</button>
          <button
            className={`${styles.btnSm} ${!row.isActive ? styles.btnGreen : styles.btnDanger}`}
            onClick={() => handleToggle(row)}
          >{row.isActive ? 'Khoá' : 'Mở khoá'}</button>
        </div>
      )
    },
  ]

  return (
    <div>
      <div className={styles.toolbar}>
        <input className={styles.searchInput} placeholder="Tìm tên, email, SĐT..."
          value={keyword} onChange={e => setKeyword(e.target.value)} />
        <select className={styles.select} value={role} onChange={e => setRole(e.target.value)}>
          <option value="">Tất cả vai trò</option>
          <option value="PATIENT">Bệnh nhân</option>
          <option value="DOCTOR">Bác sĩ</option>
          <option value="ADMIN">Admin</option>
        </select>
        <button className={styles.btnPrimary}>+ Thêm người dùng</button>
      </div>
      <div className={styles.card}>
        {loading
          ? <div className={styles.loading}><div className={styles.spinner}/>Đang tải...</div>
          : <AdminTable columns={COLUMNS} data={data} />
        }
      </div>
    </div>
  )
}