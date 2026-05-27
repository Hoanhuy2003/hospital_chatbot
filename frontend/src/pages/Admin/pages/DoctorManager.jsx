import { useState, useEffect, useCallback } from 'react'
import { toast } from 'react-toastify'
import AdminTable, { StatusBadge } from '../components/AdminTable'
import DoctorRegister from '../components/DoctorRegister'
import styles from '../AdminCommon.module.css'
import api from '../../../services/api'
import { clinicService } from '../../../services/clinicService'

// GIỮ NGUYÊN SERVICE CỦA HOÀN
const doctorService = {
  getAll: async (params) => (await api.get('/v1/doctors', { params })).data,
  toggleActive: async (id) => (await api.patch(`/v1/doctors/${id}/toggle-active`)).data,
  getSpecialties: async () => (await api.get('/v1/specialty')).data,
  getClinics: async () => {
    const res = await clinicService.getAll();
    const actualData = res?.data || res;
    return Array.isArray(actualData) ? actualData : (actualData.content || []);
  }
}

const EMPTY_FORM = {
  fullName: '', email: '', phone: '', specialtyId: '',
  clinicId: '', experienceYears: '', price: '', description: '',
  photoUrl: null // Thêm để nhận file ảnh
}

export default function DoctorManager() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [keyword, setKeyword] = useState('')
  const [specialtyId, setSpecialtyId] = useState('')
  const [specialties, setSpecialties] = useState([])
  const [clinics, setClinics] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      const res = await doctorService.getAll({ keyword, specialtyId })
      setData(Array.isArray(res) ? res : res.content || [])
    } catch (err) {
      toast.error('Không tải được danh sách bác sĩ')
    } finally {
      setLoading(false)
    }
  }, [keyword, specialtyId])

  useEffect(() => {
    load()
    const fetchMetadata = async () => {
      try {
        const [specRes, clinicRes] = await Promise.all([
          doctorService.getSpecialties(),
          doctorService.getClinics()
        ])
        setSpecialties(Array.isArray(specRes) ? specRes : (specRes.content || []))
        setClinics(clinicRes)
      } catch (err) {
        setSpecialties([]); setClinics([])
      }
    }
    fetchMetadata()
  }, [load])

  const openCreate = () => { setEditTarget(null); setForm(EMPTY_FORM); setShowModal(true) }
  
  const openEdit = (row) => {
    setEditTarget(row)
    setForm({
      fullName: row.fullName || '',
      email: row.email || '',
      phone: row.phone || '',
      specialtyId: row.specialtyId || '',
      clinicId: row.clinicId || '',
      experienceYears: row.experienceYears || '',
      price: row.price || '',
      description: row.description || '',
      photoUrl: null 
    })
    setShowModal(true)
  }

  // 💡 Đust ĐÃ THÊM: Hàm xử lý Xác minh thông qua API PUT bằng FormData
  async function handleVerify(row) {
    if (!window.confirm(`Xác minh hồ sơ cho BS. ${row.fullName}?`)) return
    try {
      setLoading(true)
      const formData = new FormData()
      
      // Giữ nguyên các thông tin hiện tại của bác sĩ
      formData.append('fullName', row.fullName || '')
      formData.append('email', row.email || '')
      formData.append('phone', row.phone || '')
      if (row.specialtyId) formData.append('specialtyId', Number(row.specialtyId))
      if (row.clinicId) formData.append('clinicId', Number(row.clinicId))
      if (row.experienceYears) formData.append('experienceYears', Number(row.experienceYears))
      if (row.price) formData.append('price', Number(row.price))
      formData.append('description', row.description || '')
      
      // Kích hoạt flag xác minh gửi lên DoctorDTO của Backend
      formData.append('isVerified', true)

      await api.put(`/v1/doctors/${row.id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      
      toast.success(`Đã phê duyệt & xác minh bác sĩ ${row.fullName}`)
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Xác minh thất bại')
    } finally {
      setLoading(false)
    }
  }

  async function handleSave(e) {
    e.preventDefault()
    if (!editTarget) return
    if (!form.fullName?.trim()) return toast.warning('Nhập họ tên bác sĩ')

    try {
      setSaving(true)
      const formData = new FormData()

      formData.append('fullName', form.fullName || '')
      formData.append('email', form.email || '')
      formData.append('phone', form.phone || '')
      if (form.specialtyId) formData.append('specialtyId', Number(form.specialtyId))
      if (form.clinicId) formData.append('clinicId', Number(form.clinicId))
      if (form.experienceYears) formData.append('experienceYears', Number(form.experienceYears))
      if (form.price) formData.append('price', Number(form.price))
      formData.append('description', form.description || '')
      if (form.photoUrl instanceof File) {
        formData.append('photoUrl', form.photoUrl)
      }

      await api.put(`/v1/doctors/${editTarget.id}`, formData)

      toast.success('Cập nhật bác sĩ thành công')
      setShowModal(false)
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Thao tác thất bại')
    } finally {
      setSaving(false)
    }
  }

  const handleToggle = async (row) => {
    try {
      await doctorService.toggleActive(row.id)
      toast.success(`Đã cập nhật trạng thái hoạt động BS. ${row.fullName}`)
      load()
    } catch { toast.error('Thao tác thất bại') }
  }

  const COLUMNS = [
    { key: 'fullName', label: 'Họ tên', render: v => <strong>{v}</strong> },
    { key: 'specialtyName', label: 'Chuyên khoa', render: v => <span className={styles.specBadge}>{v}</span> },
    { key: 'clinicName', label: 'Phòng khám' },
    { key: 'experienceYears', label: 'Kinh nghiệm', render: v => v ? `${v} năm` : '—' },
    { key: 'price', label: 'Giá khám', render: v => v ? `${Number(v).toLocaleString()}đ` : '—' },
    { key: 'isVerified', label: 'Trạng thái', render: v => <StatusBadge status={v ? 'ACTIVE' : 'INACTIVE'} /> },
    {
      key: 'id', label: '', width: 180, // Tăng nhẹ width để vừa vặn khi xuất hiện cả 3 nút
      render: (_, row) => (
        <div style={{ display: 'flex', gap: 4 }}>
          {/* 💡 ĐUST ĐÃ THÊM: Nút Xác minh ẩn/hiện dựa theo cột trạng thái isVerified */}
          {!row.isVerified && (
            <button 
              className={`${styles.btnSm} ${styles.btnGreen}`} 
              onClick={() => handleVerify(row)}
            >
              Duyệt
            </button>
          )}
          <button className={styles.btnSm} onClick={() => openEdit(row)}>Sửa</button>
          <button
            className={`${styles.btnSm} ${row.isActive ? styles.btnDanger : styles.btnGreen}`}
            onClick={() => handleToggle(row)}
          >
            {row.isActive ? 'Khoá' : 'Mở'}
          </button>
        </div>
      )
    },
  ]

  return (
    <div>
      <div className={styles.toolbar}>
        <input className={styles.searchInput} placeholder="Tìm bác sĩ..."
          value={keyword} onChange={e => setKeyword(e.target.value)} />
        <select className={styles.select} value={specialtyId}
          onChange={e => setSpecialtyId(e.target.value)}>
          <option value="">Tất cả chuyên khoa</option>
          {specialties.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <button className={styles.btnAdd} onClick={openCreate}>+ Thêm bác sĩ</button>
      </div>

      <div className={styles.card}>
        {loading
          ? <div className={styles.loading}><div className={styles.spinner}/>Đang tải...</div>
          : <AdminTable columns={COLUMNS} data={data} />
        }
      </div>

      {showModal && editTarget && (
        <div className={styles.overlay} onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHead}>
              <h3>Chỉnh sửa bác sĩ</h3>
              <button className={styles.closeBtn} onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSave} className={styles.modalForm}>
              <div className={styles.row2}>
                <div className={styles.field}><label>Họ tên *</label>
                  <input value={form.fullName} onChange={e => setForm({...form, fullName: e.target.value})} /></div>
                <div className={styles.field}><label>Email</label>
                  <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} /></div>
              </div>
              <div className={styles.row2}>
                <div className={styles.field}><label>Chuyên khoa *</label>
                  <select value={form.specialtyId} onChange={e => setForm({...form, specialtyId: e.target.value})}>
                    <option value="">-- Chọn khoa --</option>
                    {specialties.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select></div>
                <div className={styles.field}><label>Phòng khám</label>
                  <select value={form.clinicId} onChange={e => setForm({...form, clinicId: e.target.value})}>
                    <option value="">-- Chọn phòng khám --</option>
                    {clinics.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select></div>
              </div>
              <div className={styles.row2}>
                <div className={styles.field}><label>Số điện thoại</label>
                  <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} /></div>
                <div className={styles.field}><label>Kinh nghiệm</label>
                  <input type="number" value={form.experienceYears} onChange={e => setForm({...form, experienceYears: e.target.value})} /></div>
              </div>
              <div className={styles.row2}>
                <div className={styles.field}><label>Giá khám</label>
                  <input type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})} /></div>
                <div className={styles.field}><label>Ảnh chân dung</label>
                  <input type="file" accept="image/*" onChange={e => setForm({...form, photoUrl: e.target.files[0]})} /></div>
              </div>
              <div className={styles.field}><label>Mô tả</label>
                <textarea rows={3} value={form.description} onChange={e => setForm({...form, description: e.target.value})} /></div>
              <div className={styles.modalFooter}>
                <button type="button" className={styles.btnCancel} onClick={() => setShowModal(false)}>Huỷ</button>
                <button type="submit" className={styles.btnSubmit} disabled={saving}>{saving ? 'Đang lưu...' : 'Lưu dữ liệu'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showModal && !editTarget && (
        <DoctorRegister
          open
          onClose={() => setShowModal(false)}
          onSuccess={load}
          specialties={specialties}
          clinics={clinics}
        />
      )}
    </div>
  )
}