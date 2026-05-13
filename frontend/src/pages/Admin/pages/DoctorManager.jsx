import { useState, useEffect, useCallback } from 'react'
import { toast } from 'react-toastify'
import AdminTable, { StatusBadge } from '../components/AdminTable'
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

  // SỬA CHÍNH TẠI ĐÂY: PHẦN CẬP NHẬT VÀ POST
  async function handleSave(e) {
    e.preventDefault();
    if (!form.fullName?.trim()) return toast.warning('Nhập họ tên bác sĩ');

    try {
      setSaving(true);

      // BẮT BUỘC dùng FormData vì Backend của Hoàn dùng Multipart
      const formData = new FormData();
      
      // Duyệt và append dữ liệu
      Object.keys(form).forEach(key => {
        if (form[key] !== null && form[key] !== undefined && form[key] !== '') {
          formData.append(key, form[key]);
        }
      });

      if (editTarget) {
        // Gửi PUT với FormData
        await api.put(`/v1/doctors/${editTarget.id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Cập nhật bác sĩ thành công');
      } else {
        // Gửi POST với FormData vào đúng link /promote
        await api.post('/v1/doctors/promote', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Thêm bác sĩ thành công');
      }

      setShowModal(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Thao tác thất bại');
    } finally {
      setSaving(false);
    }
  }

  const handleToggle = async (row) => {
    try {
      await doctorService.toggleActive(row.id)
      toast.success(`Đã cập nhật BS. ${row.fullName}`)
      load()
    } catch { toast.error('Thao tác thất bại') }
  }

  // Các COLUMNS giữ nguyên như cũ của Hoàn
  const COLUMNS = [
    { key: 'fullName', label: 'Họ tên', render: v => <strong>{v}</strong> },
    { key: 'specialtyName', label: 'Chuyên khoa', render: v => <span className={styles.specBadge}>{v}</span> },
    { key: 'clinicName', label: 'Phòng khám' },
    { key: 'experienceYears', label: 'Kinh nghiệm', render: v => v ? `${v} năm` : '—' },
    { key: 'price', label: 'Giá khám', render: v => v ? `${Number(v).toLocaleString()}đ` : '—' },
    { key: 'isActive', label: 'Trạng thái', render: v => <StatusBadge status={v ? 'ACTIVE' : 'INACTIVE'} /> },
    {
      key: 'id', label: '', width: 120,
      render: (_, row) => (
        <div style={{ display: 'flex', gap: 4 }}>
          <button className={styles.btnSm} onClick={() => openEdit(row)}>Sửa</button>
          <button
            className={`${styles.btnSm} ${row.isActive ? styles.btnDanger : styles.btnGreen}`}
            onClick={() => handleToggle(row)}
          >{row.isActive ? 'Khoá' : 'Mở'}</button>
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

      {showModal && (
        <div className={styles.overlay} onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHead}>
              <h3>{editTarget ? 'Chỉnh sửa bác sĩ' : 'Thêm bác sĩ mới'}</h3>
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
    </div>
  )
}