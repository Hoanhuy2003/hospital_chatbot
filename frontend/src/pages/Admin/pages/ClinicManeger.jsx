import { useState, useEffect, useCallback } from 'react'
import { toast } from 'react-toastify'
import AdminTable, { StatusBadge } from '../components/AdminTable'
import { specialtyService } from '../../../services/api'
import styles from '../AdminCommon.module.css'
import api from '../../../services/api'

const clinicService = {
  getAll:   async (params) => (await api.get('/v1/clinics', { params })).data,
  getClinicStat: async (params) => (await api.get(`/v1/clinics/statistics`, { params })).data,
  
  // Gửi FormData qua phương thức POST (Thêm mới) và PUT (Cập nhật)
  create:   async (formData) => (await api.post('/v1/clinics', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })).data,
  
  update:   async (id, formData) => (await api.put(`/v1/clinics/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })).data,
  
  delete:   async (id) => (await api.delete(`/v1/clinics/${id}`)).data,
  getSpecialties: async () => (await api.get(`/v1/specialty`)).data
}

const EMPTY = { name: '', address: '', phone: '', specialtyId: '', description: '', imageFile: null }

export default function ClinicManager() {
  const [data,      setData]      = useState([])
  const [loading,   setLoading]   = useState(false)
  const [keyword,   setKeyword]   = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [form,      setForm]      = useState(EMPTY)
  const [saving,    setSaving]    = useState(false)
  const [specialties, setSpecialties] = useState([]);

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
      specialtyId: row.specialtyId || '', 
      description: row.description || '',
      imageFile: null 
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

  // 💡 ĐÃ SỬA CHÍNH: Thay đổi trạng thái hoạt động thông qua hàm PUT cũ
  async function handleToggleActive(row) {
    try {
      setLoading(true);
      const formData = new FormData();
      
      // Đổ đầy đủ thông tin cũ của phòng khám vào gói FormData
      formData.append('name', row.name);
      formData.append('address', row.address || '');
      formData.append('phone', row.phone || '');
      formData.append('specialtyId', Number(row.specialtyId));
      formData.append('description', row.description || '');
      
      // Khớp chính xác với cấu trúc định danh @JsonProperty("is_active") trong ClinicDTO
      formData.append('isActive', !row.isActive); 

      // Gọi API PUT (Hệ thống đã được phân quyền Admin sẵn từ trước nên sẽ ăn ngay)
      await clinicService.update(row.id, formData);
      
      toast.success(`Đã ${row.isActive ? 'khóa' : 'mở khóa'} phòng khám "${row.name}" thành công`);
      load(); 
    } catch (err) {
      toast.error('Cập nhật trạng thái thất bại');
    } finally {
      setLoading(false);
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
    { key: 'isActive',     label: 'Trạng thái',      render: v => <StatusBadge status={v ? 'ACTIVE' : 'INACTIVE'} /> },
    {
      key: 'id', label: '', width: 160, 
      render: (_, row) => (
        <div style={{ display: 'flex', gap: 4 }}>
          <button className={styles.btnSm} onClick={() => openEdit(row)}>Sửa</button>
          <button
            className={`${styles.btnSm} ${!row.isActive ? styles.btnGreen : styles.btnDanger}`}
            onClick={() => handleToggleActive(row)}
          >
            {row.isActive ? 'Khoá' : 'Mở khoá'}
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
          : <AdminTable columns={COLUMNS} data={data} />
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