import { useState, useEffect, useCallback } from 'react'
import { toast } from 'react-toastify'
import AdminTable, { StatusBadge } from '../components/AdminTable'
import styles from '../AdminCommon.module.css'
import api from '../../../services/api'

const doctorService = {
  getAll:        async (params) => (await api.get('/v1/doctors', { params })).data,
  toggleActive:  async (id)     => (await api.patch(`/v1/doctors/${id}/toggle-active`)).data,
  delete:        async (id)     => (await api.delete(`/v1/doctors/${id}`)).data,
}

const EMPTY_FORM = {
  fullName: '', email: '', phone: '', specialtyId: '',
  clinicId: '', experienceYears: '', price: '', description: '',
}

export default function DoctorManager() {
  const [data,       setData]       = useState([])
  const [loading,    setLoading]    = useState(false)
  const [keyword,    setKeyword]    = useState('')
  const [specialtyId,setSpecialtyId]= useState('')
  const [showModal,  setShowModal]  = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [form,       setForm]       = useState(EMPTY_FORM)
  const [saving,     setSaving]     = useState(false)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      const res = await doctorService.getAll({ keyword, specialtyId })
      setData(Array.isArray(res) ? res : res.content || [])
    } catch { toast.error('Không tải được danh sách bác sĩ') }
    finally  { setLoading(false) }
  }, [keyword, specialtyId])

  useEffect(() => { load() }, [load])

  function openCreate() { setEditTarget(null); setForm(EMPTY_FORM); setShowModal(true) }
  function openEdit(row) {
    setEditTarget(row)
    setForm({
      fullName:        row.fullName        || '',
      email:           row.email           || '',
      phone:           row.phone           || '',
      specialtyId:     row.specialtyId     || '',
      clinicId:        row.clinicId        || '',
      experienceYears: row.experienceYears || '',
      price:           row.price           || '',
      description:     row.description     || '',
    })
    setShowModal(true)
  }

  async function handleSave(e) {
    e.preventDefault()
    if (!form.fullName.trim()) { toast.warning('Nhập họ tên bác sĩ'); return }
    try {
      setSaving(true)
      if (editTarget) {
        await api.put(`/v1/doctors/${editTarget.id}`, form)
        toast.success('Đã cập nhật bác sĩ')
      } else {
        await api.post('/v1/doctors', form)
        toast.success('Đã thêm bác sĩ mới')
      }
      setShowModal(false)
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lưu thất bại')
    } finally { setSaving(false) }
  }

  async function handleToggle(row) {
    try {
      await doctorService.toggleActive(row.id)
      toast.success(`Đã ${row.isActive ? 'khoá' : 'mở khoá'} BS. ${row.fullName}`)
      load()
    } catch { toast.error('Thao tác thất bại') }
  }

  const COLUMNS = [
    { key: 'fullName',       label: 'Họ tên',        render: v => <strong>{v}</strong> },
    { key: 'specialtyName',  label: 'Chuyên khoa',   render: v => <span className={styles.specBadge}>{v}</span> },
    { key: 'clinicName',     label: 'Phòng khám' },
    { key: 'experienceYears',label: 'Kinh nghiệm',   render: v => v ? `${v} năm` : '—' },
    { key: 'price',          label: 'Giá khám',      render: v => v ? `${Number(v).toLocaleString('vi-VN')}đ` : '—' },
    { key: 'isActive',       label: 'Trạng thái',    render: v => <StatusBadge status={v ? 'ACTIVE' : 'INACTIVE'} /> },
    {
      key: 'id', label: '', width: 120,
      render: (_, row) => (
        <div style={{ display: 'flex', gap: 4 }}>
          <button className={styles.btnSm} onClick={() => openEdit(row)}>Sửa</button>
          <button
            className={`${styles.btnSm} ${row.isActive ? styles.btnDanger : styles.btnGreen}`}
            onClick={() => handleToggle(row)}
          >{row.isActive ? 'Khoá' : 'Mở khoá'}</button>
        </div>
      )
    },
  ]

  return (
    <div>
      <div className={styles.toolbar}>
        <input className={styles.searchInput} placeholder="Tìm tên bác sĩ..."
          value={keyword} onChange={e => setKeyword(e.target.value)} />
        <select className={styles.select} value={specialtyId}
          onChange={e => setSpecialtyId(e.target.value)}>
          <option value="">Tất cả chuyên khoa</option>
        </select>
        <button className={styles.btnPrimary} onClick={openCreate}>+ Thêm bác sĩ</button>
      </div>

      <div className={styles.card}>
        {loading
          ? <div className={styles.loading}><div className={styles.spinner}/>Đang tải...</div>
          : <AdminTable columns={COLUMNS} data={data} />
        }
      </div>

      {/* Modal thêm/sửa */}
      {showModal && (
        <div className={styles.overlay} onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className={styles.modal}>
            <div className={styles.modalHead}>
              <h3>{editTarget ? 'Chỉnh sửa bác sĩ' : 'Thêm bác sĩ mới'}</h3>
              <button className={styles.closeBtn} onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSave} className={styles.modalForm}>
              <div className={styles.row2}>
                <div className={styles.field}>
                  <label>Họ tên <span className={styles.req}>*</span></label>
                  <input placeholder="BS. Nguyễn Văn A"
                    value={form.fullName} onChange={e => setForm(f => ({...f, fullName: e.target.value}))} />
                </div>
                <div className={styles.field}>
                  <label>Email</label>
                  <input type="email" placeholder="doctor@hospital.com"
                    value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))} />
                </div>
              </div>
              <div className={styles.row2}>
                <div className={styles.field}>
                  <label>Số điện thoại</label>
                  <input placeholder="0901234567"
                    value={form.phone} onChange={e => setForm(f => ({...f, phone: e.target.value}))} />
                </div>
                <div className={styles.field}>
                  <label>Số năm kinh nghiệm</label>
                  <input type="number" min="0" placeholder="10"
                    value={form.experienceYears} onChange={e => setForm(f => ({...f, experienceYears: e.target.value}))} />
                </div>
              </div>
              <div className={styles.row2}>
                <div className={styles.field}>
                  <label>Chuyên khoa</label>
                  <input placeholder="ID chuyên khoa"
                    value={form.specialtyId} onChange={e => setForm(f => ({...f, specialtyId: e.target.value}))} />
                </div>
                <div className={styles.field}>
                  <label>Phòng khám</label>
                  <input placeholder="ID phòng khám"
                    value={form.clinicId} onChange={e => setForm(f => ({...f, clinicId: e.target.value}))} />
                </div>
              </div>
              <div className={styles.field}>
                <label>Giá khám (VNĐ)</label>
                <input type="number" min="0" placeholder="200000"
                  value={form.price} onChange={e => setForm(f => ({...f, price: e.target.value}))} />
              </div>
              <div className={styles.field}>
                <label>Mô tả / Giới thiệu</label>
                <textarea rows={3} placeholder="Kinh nghiệm, chuyên môn..."
                  value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} />
              </div>
              <div className={styles.modalFooter}>
                <button type="button" className={styles.btnCancel} onClick={() => setShowModal(false)}>Huỷ</button>
                <button type="submit" className={styles.btnPrimary} disabled={saving}>
                  {saving ? 'Đang lưu...' : editTarget ? 'Cập nhật' : 'Thêm bác sĩ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}