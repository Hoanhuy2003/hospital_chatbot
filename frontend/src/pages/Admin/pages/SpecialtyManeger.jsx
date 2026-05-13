import { useState, useEffect, useCallback } from 'react'
import { toast } from 'react-toastify'
import AdminTable from '../components/AdminTable'
import styles from '../AdminCommon.module.css'
import api from '../../../services/api'

const specialtyService = {
  getAll:  async (params) => (await api.get('/v1/specialty/statistics', { params })).data,
  create:  async (data)   => (await api.post('/v1/specialty', data)).data,
  update:  async (id, d)  => (await api.put(`/v1/specialty/${id}`, d)).data,
  delete:  async (id)     => (await api.delete(`/v1/specialty/${id}`)).data,
}

const EMPTY = { name: '', icon: '', description: '' }

export default function SpecialtyManager() {
  const [data,      setData]      = useState([])
  const [loading,   setLoading]   = useState(false)
  const [keyword,   setKeyword]   = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editTarget,setEditTarget]= useState(null)
  const [form,      setForm]      = useState(EMPTY)
  const [saving,    setSaving]    = useState(false)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      const res = await specialtyService.getAll({ keyword })
      setData(Array.isArray(res) ? res : res.content || [])
    } catch { toast.error('Không tải được chuyên khoa') }
    finally  { setLoading(false) }
  }, [keyword])

  useEffect(() => { load() }, [load])

  function openCreate() { setEditTarget(null); setForm(EMPTY); setShowModal(true) }
  function openEdit(row) {
    setEditTarget(row)
    setForm({ name: row.name||'', icon: row.icon||'', description: row.description||'' })
    setShowModal(true)
  }

  async function handleSave(e) {
    e.preventDefault()
    if (!form.name.trim()) { toast.warning('Nhập tên chuyên khoa'); return }
    try {
      setSaving(true)
      editTarget
        ? await specialtyService.update(editTarget.id, form)
        : await specialtyService.create(form)
      toast.success(editTarget ? 'Đã cập nhật' : 'Đã thêm chuyên khoa mới')
      setShowModal(false); load()
    } catch (err) { toast.error(err.response?.data?.message || 'Lưu thất bại') }
    finally { setSaving(false) }
  }

  async function handleDelete(row) {
    if (!window.confirm(`Xoá chuyên khoa "${row.name}"?`)) return
    try { await specialtyService.delete(row.id); toast.success('Đã xoá'); load() }
    catch { toast.error('Xoá thất bại') }
  }

  const COLUMNS = [
   { 
    key: 'icon', 
    label: 'ICON', 
    width: 80, 
    // Thay vì render trực tiếp giá trị v, ta bọc nó vào thẻ img
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
        onError={(e) => { e.target.src = 'https://via.placeholder.com/40?text=No+Icon'; }} // Ảnh dự phòng nếu link lỗi
      />
    ) : '—'
  },
    { key: 'name',        label: 'Tên chuyên khoa', render: v => <strong>{v}</strong> },
    { key: 'doctorCount', label: 'Số bác sĩ',       render: v => `${v || 0} BS` },
    { key: 'clinicCount', label: 'Số phòng khám',   render: v => `${v || 0} PK` },
    { 
        key: 'totalAppointments', 
        label: 'Tổng lượt khám', 
        render: v => <strong>{(v || 0).toLocaleString('vi-VN')}</strong> 
    },
    { key: 'description', label: 'Mô tả',           render: v => <span style={{ color: '#637381' }}>{v || '—'}</span> },
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
          : <AdminTable columns={COLUMNS} data={data} />
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
              <div className={styles.row2}>
                <div className={styles.field}>
                  <label>Tên chuyên khoa <span className={styles.req}>*</span></label>
                  <input placeholder="VD: Nhi khoa"
                    value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} />
                </div>
                <div className={styles.field}>
                  <label>Icon (emoji)</label>
                  <input placeholder="🩺" maxLength={4}
                    value={form.icon} onChange={e => setForm(f => ({...f, icon: e.target.value}))} />
                </div>
              </div>
              <div className={styles.field}>
                <label>Mô tả</label>
                <textarea rows={3} placeholder="Chuyên điều trị..."
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