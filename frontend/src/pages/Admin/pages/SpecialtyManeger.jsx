import { useState, useEffect, useCallback } from 'react'
import { toast } from 'react-toastify'
import AdminTable from '../components/AdminTable'
import AdminPagination from '../components/AdminPagination'
import { useAdminPagination } from '../hooks/useAdminPagination'
import styles from '../AdminCommon.module.css'
import api from '../../../services/api'

const specialtyService = {
  getAll:   async (params) => (await api.get('/v1/specialty/statistics', { params })).data,
  create:   async (formData) => (await api.post('/v1/specialty', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })).data,
  update:   async (id, formData) => (await api.put(`/v1/specialty/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })).data,
  delete:   async (id) => (await api.delete(`/v1/specialty/${id}`)).data,
}

// 💡 ĐÃ ĐỔI: Sử dụng tên iconUrl làm giá trị lưu file tạm thời luôn cho đồng bộ
const EMPTY = { name: '', description: '', iconUrl: null }

export default function SpecialtyManager() {
  const [data,      setData]      = useState([])
  const [loading,   setLoading]   = useState(false)
  const [keyword,   setKeyword]   = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [form,      setForm]      = useState(EMPTY)
  const [saving,    setSaving]    = useState(false)

  const { pageData, page, setPage, totalPages } = useAdminPagination(data, undefined, [keyword])

  const load = useCallback(async () => {
    try {
      setLoading(true)
      const res = await specialtyService.getAll({ keyword })
      setData(Array.isArray(res) ? res : res.content || [])
    } catch { 
      toast.error('Không tải được chuyên khoa') 
    } finally { 
      setLoading(false) 
    }
  }, [keyword])

  useEffect(() => { load() }, [load])

  function openCreate() { setEditTarget(null); setForm(EMPTY); setShowModal(true) }
  
  function openEdit(row) {
    setEditTarget(row)
    setForm({ 
      name: row.name || '', 
      description: row.description || '', 
      iconUrl: null // Khi sửa, mặc định chưa chọn lại file ảnh mới thì để null
    })
    setShowModal(true)
  }

  async function handleSave(e) {
    e.preventDefault()
    if (!form.name.trim()) return toast.warning('Nhập tên chuyên khoa')
    
    try {
      setSaving(true)
      const formData = new FormData()
      
      formData.append('name', form.name.trim())
      formData.append('description', form.description || '')
      
      // 💡 ĐÃ ĐỒNG BỘ: Lấy thẳng form.iconUrl để append với key 'iconUrl'
      // Khớp 100% với thuộc tính private MultipartFile iconUrl; bên Java DTO của bạn
      if (form.iconUrl) {
        formData.append('iconUrl', form.iconUrl)
      }

      if (editTarget) {
        await specialtyService.update(editTarget.id, formData)
        toast.success('Đã cập nhật chuyên khoa')
      } else {
        await specialtyService.create(formData)
        toast.success('Đã thêm chuyên khoa mới')
      }
      
      setShowModal(false)
      load()
    } catch (err) { 
      toast.error(err.response?.data?.message || 'Lưu thất bại') 
    } finally { 
      setSaving(false) 
    }
  }

  async function handleDelete(row) {
    if (!window.confirm(`Xoá chuyên khoa "${row.name}"?`)) return
    try { 
      await specialtyService.delete(row.id)
      toast.success('Đã xoá thành công')
      load() 
    } catch { 
      toast.error('Xoá thất bại') 
    }
  }

  const COLUMNS = [
    { 
      key: 'icon', 
      label: 'ICON', 
      width: 80, 
      render: v => v ? (
        <img 
          src={v} 
          alt="icon" 
          style={{ 
            width: '40px', 
            height: '40px', 
            objectFit: 'cover', 
            borderRadius: '4px',
            display: 'block'
          }} 
          onError={(e) => { e.target.src = 'https://via.placeholder.com/40?text=No+Icon'; }} 
        />
      ) : '—'
    },
    { key: 'name',         label: 'Tên chuyên khoa', render: v => <strong>{v}</strong> },
    { key: 'doctorCount',  label: 'Số bác sĩ',       render: v => `${v || 0} BS` },
    { key: 'clinicCount',  label: 'Số phòng khám',   render: v => `${v || 0} PK` },
    { 
        key: 'totalAppointments', 
        label: 'Tổng lượt khám', 
        render: v => <strong>{(v || 0).toLocaleString('vi-VN')}</strong> 
    },
    { key: 'description',  label: 'Mô tả',           render: v => <span style={{ color: '#637381' }}>{v || '—'}</span> },
    {
      key: 'id', label: '', width: 110,
      render: (_, row) => (
        <div style={{ display: 'flex', gap: 4 }}>
          <button className={styles.btnSm} onClick={() => openEdit(row)}>Sửa</button>
          <button className={`${styles.btnSm} ${styles.btnDanger}`} onClick={() => handleDelete(row)}>Xoá</button>
        </div>
      )
    },
  ]

  return (
    <div>
      <div className={styles.toolbar}>
        <input className={styles.searchInput} placeholder="Tìm chuyên khoa..."
          value={keyword} onChange={e => setKeyword(e.target.value)} />
        <button className={styles.btnAdd} onClick={openCreate}>+ Thêm chuyên khoa</button>
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
          <div className={styles.modal} style={{ maxWidth: 440 }}>
            <div className={styles.modalHead}>
              <h3>{editTarget ? 'Chỉnh sửa chuyên khoa' : 'Thêm chuyên khoa mới'}</h3>
              <button className={styles.closeBtn} onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSave} className={styles.modalForm}>
              
              <div className={styles.field}>
                <label>Tên chuyên khoa <span className={styles.req}>*</span></label>
                <input placeholder="VD: Nhi khoa, Tim mạch..."
                  value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} />
              </div>

              {/* 💡 ĐÃ SỬA: OnChange ghi đè file vừa chọn trực tiếp vào form.iconUrl */}
              <div className={styles.field}>
                <label>Hình ảnh Icon chuyên khoa</label>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={e => setForm({...form, iconUrl: e.target.files[0]})} 
                />
              </div>

              <div className={styles.field}>
                <label>Mô tả</label>
                <textarea rows={3} placeholder="Mô tả tóm tắt về chuyên khoa điều trị..."
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