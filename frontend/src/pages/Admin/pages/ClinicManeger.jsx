import { useState, useEffect, useCallback } from 'react'
import { toast } from 'react-toastify'
import AdminTable, { StatusBadge } from '../components/AdminTable'
import { specialtyService } from '../../../services/api'
import styles from '../AdminCommon.module.css'
import api from '../../../services/api'

const clinicService = {
  getAll:  async (params) => (await api.get('/v1/clinics', { params })).data,
  getClinicStat: async (params) => (await api.get(`/v1/clinics/statistics`,{params})).data,
  create:  async (data)   => (await api.post('/v1/clinics', data)).data,
  update:  async (id, d)  => (await api.put(`/v1/clinics/${id}`, d)).data,
  delete:  async (id)     => (await api.delete(`/v1/clinics/${id}`)).data,
  getSpecialties: async() => (await api.get(`/v1/specialty`)).data
}

const EMPTY = { name: '', address: '', phone: '', specialtyId: '', description: '' }

export default function ClinicManager() {
  const [data,      setData]      = useState([])
  const [loading,   setLoading]   = useState(false)
  const [keyword,   setKeyword]   = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editTarget,setEditTarget]= useState(null)
  const [form,      setForm]      = useState(EMPTY)
  const [saving,    setSaving]    = useState(false)
  const [specialties, setSpecialties] = useState([]);

  const load = useCallback(async () => {
    try {
      setLoading(true)
      const res = await clinicService.getClinicStat({ keyword })
      setData(Array.isArray(res) ? res : res.content || [])
    } catch { toast.error('Không tải được phòng khám') }
    finally  { setLoading(false) }
  }, [keyword])

  useEffect(() => {
     load();
     const fetchSpecilties = async () =>{
      try {
        const res = await specialtyService.getAll();
        setSpecialties(Array.isArray(res) ? res : res.content || [])
        
      } catch (error) {
        console.error("Không thể tải");
        
      }
     };
     fetchSpecilties();



   }, [load])

  function openCreate() { setEditTarget(null); setForm(EMPTY); setShowModal(true) }
  function openEdit(row) {
    setEditTarget(row)
    setForm({ name: row.name||'', address: row.address||'', phone: row.phone||'',
      specialtyId: row.specialtyId||'', description: row.description||'' })
    setShowModal(true)
  }

  async function handleSave(e) {
    e.preventDefault()
    if (!form.name.trim()) { toast.warning('Nhập tên phòng khám'); return }
    try {
      setSaving(true)
      editTarget
        ? await clinicService.update(editTarget.id, form)
        : await clinicService.create(form)
      toast.success(editTarget ? 'Đã cập nhật phòng khám' : 'Đã thêm phòng khám mới')
      setShowModal(false); load()
    } catch (err) { toast.error(err.response?.data?.message || 'Lưu thất bại') }
    finally { setSaving(false) }
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
                <input placeholder="VD: Phòng khám Nhi Mỹ Mỹ"
                  value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} />
              </div>
              <div className={styles.row2}>
                <div className={styles.field}>
                  <label>Số điện thoại</label>
                  <input placeholder="028 1234 5678"
                    value={form.phone} onChange={e => setForm(f => ({...f, phone: e.target.value}))} />
                </div>
                <div className={styles.field}>
                 <label>Chuyên khoa <span className={styles.req}>*</span></label>
    <select 
        className={styles.select} // Hoàn có thể dùng class styles.select hoặc styles.input
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
                <label>Địa chỉ</label>
                <input placeholder="105/10 Nguyễn Thị Tú, Q.Bình Tân"
                  value={form.address} onChange={e => setForm(f => ({...f, address: e.target.value}))} />
              </div>
              <div className={styles.field}>
                <label>Mô tả</label>
                <textarea rows={3} placeholder="Giới thiệu về phòng khám..."
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