import { useState, useEffect, useCallback } from 'react'
import { toast } from 'react-toastify'
import AdminTable, { StatusBadge } from '../components/AdminTable'
import AdminPagination from '../components/AdminPagination'
import { useAdminPagination } from '../hooks/useAdminPagination'
import { specialtyService } from '../../../services/api'
import styles from '../AdminCommon.module.css'
import api from '../../../services/api'

const clinicService = {
  getAll:   async (params) => (await api.get('/v1/clinics', { params })).data,
  getClinicStat: async (params) => (await api.get(`/v1/clinics/statistics`, { params })).data,
  
  // Gửi FormData qua phương thức POST (Thêm mới) và PUT (Cập nhật)
  create:   async (formData) => (await api.post('/v1/clinics', formData)).data,
  update:   async (id, formData) => (await api.put(`/v1/clinics/${id}`, formData)).data,
  toggleActive: async (id) => (await api.patch(`/v1/clinics/${id}/toggle-active`)).data,
  delete:   async (id) => (await api.delete(`/v1/clinics/${id}`)).data,
  getSpecialties: async () => (await api.get(`/v1/specialty`)).data
}

const EMPTY = {
  name: '',
  address: '',
  phone: '',
  specialtyId: '',
  description: '',
  imageFile: null,
  isActive: true,
}

export default function ClinicManager() {
  const [data,      setData]      = useState([])
  const [loading,   setLoading]   = useState(false)
  const [keyword,   setKeyword]   = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [form,      setForm]      = useState(EMPTY)
  const [saving,    setSaving]    = useState(false)
  const [specialties, setSpecialties] = useState([]);

  const { pageData, page, setPage, totalPages } = useAdminPagination(data, undefined, [keyword])

  const load = useCallback(async () => {
    try {
      setLoading(true)
      const res = await clinicService.getClinicStat({ keyword: keyword || '' })
      setData(Array.isArray(res) ? res : res.content || [])
    } catch { 
      toast.error('Không tải được phòng khám') 
    } finally { 
      setLoading(false) 
    }
  }, [keyword])

  useEffect(() => {
    load();
    const fetchSpecialties = async () => {
      try {
        const res = await specialtyService.getAll();
        setSpecialties(Array.isArray(res) ? res : res.content || [])
      } catch (error) {
        console.error("Không thể tải chuyên khoa");
      }
    };
    fetchSpecialties();
  }, [load])

  function openCreate() { setEditTarget(null); setForm(EMPTY); setShowModal(true) }
  
  function openEdit(row) {
    setEditTarget(row)
    setForm({ 
      name: row.name || '', 
      address: row.address || '', 
      phone: row.phone || '',
      specialtyId: row.specialtyId || row.specialty_id || '',
      description: row.description || '',
      imageFile: null,
      isActive: row.isActive !== false && row.is_active !== false,
    })
    setShowModal(true)
  }

  // Hàm xử lý lưu form khi thêm mới hoặc chỉnh sửa (Dùng PUT/POST mẫu cũ)
  async function handleSave(e) {
    e.preventDefault()
    if (!form.name.trim()) return toast.warning('Nhập tên phòng khám')
    if (!form.address.trim()) return toast.warning('Nhập địa chỉ phòng khám')
    if (!form.specialtyId) return toast.warning('Vui lòng chọn chuyên khoa')
    
    try {
      setSaving(true)
      const formData = new FormData()
      
      formData.append('name', form.name.trim())
      formData.append('address', form.address.trim())
      formData.append('phone', form.phone || '')
      formData.append('specialtyId', Number(form.specialtyId)) 
      formData.append('description', form.description || '')
      
      if (form.imageFile) {
        formData.append('photoUrl', form.imageFile)
      }
      formData.append('isActive', form.isActive ? 'true' : 'false')

      if (editTarget) {
        await clinicService.update(editTarget.id, formData)
        toast.success('Đã cập nhật phòng khám')
      } else {
        await clinicService.create(formData)
        toast.success('Đã thêm phòng khám mới')
      }
      
      setShowModal(false)
      load()
    } catch (err) { 
      toast.error(err.response?.data?.message || err.response?.data || 'Thao tác lưu thất bại') 
    } finally { 
      setSaving(false) 
    }
  }

  async function handleToggleActive(row) {
    const active = row.isActive !== false && row.is_active !== false
    try {
      await clinicService.toggleActive(row.id)
      toast.success(`Đã ${active ? 'khóa' : 'mở khóa'} phòng khám "${row.name}" thành công`)
      load()
    } catch (err) {
      const msg = err.response?.data
      toast.error(typeof msg === 'string' ? msg : msg?.message || 'Cập nhật trạng thái thất bại')
    }
  }

  async function handleDelete(row) {
    if (!window.confirm(`Xoá phòng khám "${row.name}"?`)) return
    try {
      await clinicService.delete(row.id)
      toast.success('Đã xoá phòng khám'); load()
    } catch { toast.error('Xoá thất bại') }
  }

  const COLUMNS = [
    { key: 'name',         label: 'Tên phòng khám', render: v => <strong>{v}</strong> },
    { key: 'specialtyName',label: 'Chuyên khoa',    render: v => <span className={styles.specBadge}>{v}</span> },
    { key: 'address',      label: 'Địa chỉ' },
    { key: 'phone',        label: 'SĐT' },
    { key: 'doctorCount',  label: 'Bác sĩ',          render: v => `${v || 0} BS` },
    {
      key: 'isActive',
      label: 'Trạng thái',
      render: (v, row) => {
        const active = v !== false && row?.is_active !== false
        return <StatusBadge status={active ? 'ACTIVE' : 'INACTIVE'} />
      },
    },
    {
      key: 'id', label: '', width: 160, 
      render: (_, row) => (
        <div style={{ display: 'flex', gap: 4 }}>
          <button className={styles.btnSm} onClick={() => openEdit(row)}>Sửa</button>
          <button
            className={`${styles.btnSm} ${row.isActive === false || row.is_active === false ? styles.btnGreen : styles.btnDanger}`}
            onClick={() => handleToggleActive(row)}
          >
            {row.isActive === false || row.is_active === false ? 'Mở khoá' : 'Khoá'}
          </button>
          <button className={`${styles.btnSm} ${styles.btnDanger}`} onClick={() => handleDelete(row)}>Xoá</button>
        </div>
      )
    },
  ]

  return (
    <div>
      <div className={styles.toolbar}>
        <input className={styles.searchInput} placeholder="Tìm tên, địa chỉ..."
          value={keyword} onChange={e => setKeyword(e.target.value)} />
        <button className={styles.btnAdd} onClick={openCreate}>+ Thêm phòng khám</button>
      </div>

      <div className={styles.card}>
        {loading
          ? <div className={styles.loading}><div className={styles.spinner}/>Đang tải...</div>
          : (
            <>
              <AdminTable columns={COLUMNS} data={pageData} />
              <AdminPagination page={page} totalPages={totalPages} onPageChange={setPage} />
            </>
          )
        }
      </div>

      {showModal && (
        <div className={styles.overlay} onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className={styles.modal}>
            <div className={styles.modalHead}>
              <h3>{editTarget ? 'Chỉnh sửa phòng khám' : 'Thêm phòng khám mới'}</h3>
              <button className={styles.closeBtn} onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSave} className={styles.modalForm}>
              <div className={styles.field}>
                <label>Tên phòng khám <span className={styles.req}>*</span></label>
                <input placeholder="VD: Phòng khám Tiêu hóa - Gan mật"
                  value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} />
              </div>
              <div className={styles.row2}>
                <div className={styles.field}>
                  <label>Số điện thoại</label>
                  <input placeholder="024 3869 3731"
                    value={form.phone} onChange={e => setForm(f => ({...f, phone: e.target.value}))} />
                </div>
                <div className={styles.field}>
                  <label>Chuyên khoa <span className={styles.req}>*</span></label>
                  <select 
                    className={styles.select} 
                    value={form.specialtyId} 
                    onChange={e => setForm({...form, specialtyId: e.target.value})}
                  >
                    <option value="">-- Chọn chuyên khoa --</option>
                    {specialties.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className={styles.field}>
                <label>Hình ảnh phòng khám</label>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={e => setForm({...form, imageFile: e.target.files[0]})} 
                />
              </div>

              <div className={styles.field}>
                <label>Địa chỉ <span className={styles.req}>*</span></label>
                <input placeholder="VD: Tầng 2, Tòa nhà hành chính"
                  value={form.address} onChange={e => setForm(f => ({...f, address: e.target.value}))} />
              </div>
              <div className={styles.field}>
                <label>Mô tả</label>
                <textarea rows={3} placeholder="Giới thiệu sơ bộ về chức năng phòng khám..."
                  value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} />
              </div>
              <div className={styles.field}>
                <label className={styles.checkboxRow}>
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                  />
                  Phòng khám đang hoạt động (bỏ chọn = khóa phòng)
                </label>
              </div>
              <div className={styles.modalFooter}>
                <button type="button" className={styles.btnCancel} onClick={() => setShowModal(false)}>Huỷ</button>
                <button type="submit" className={styles.btnPrimary} disabled={saving}>
                  {saving ? 'Đang lưu...' : editTarget ? 'Cập nhật' : 'Thêm mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}