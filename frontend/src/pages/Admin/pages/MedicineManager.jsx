import { useState, useEffect, useCallback } from 'react'
import { toast } from 'react-toastify'
import { medicineService } from '../../../services/medicineService'
import api from '../../../services/api'
import AdminPagination from '../components/AdminPagination'
import { useAdminPagination, ADMIN_PAGE_SIZE } from '../hooks/useAdminPagination'
import styles from '../AdminCommon.module.css'

const EMPTY = { name: '', unit: '', price: '', dosageInstruction: '', specialtyId: '' }

const fmt = (n) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n || 0)

export default function MedicineManager() {
  const [data,        setData]        = useState([])
  const [loading,     setLoading]     = useState(false)
  const [keyword,     setKeyword]     = useState('')
  const [modal,       setModal]       = useState(null)   // null | { mode:'add'|'edit', item }
  const [form,        setForm]        = useState(EMPTY)
  const [saving,      setSaving]      = useState(false)
  const [specialties, setSpecialties] = useState([])

  const load = useCallback(async () => {
    try {
      setLoading(true)
      const res = await medicineService.getAll()
      setData(Array.isArray(res) ? res : [])
    } catch { toast.error('Không tải được danh sách thuốc') }
    finally  { setLoading(false) }
  }, [])

  useEffect(() => {
    load()
    api.get('/v1/specialty').then(r => setSpecialties(r.data || [])).catch(() => {})
  }, [load])

  const filtered = data.filter(m =>
    !keyword || m.name?.toLowerCase().includes(keyword.toLowerCase())
  )

  const { pageData, page, setPage, totalPages } = useAdminPagination(filtered, undefined, [keyword])

  function openAdd() {
    setForm(EMPTY)
    setModal({ mode: 'add' })
  }

  function openEdit(item) {
    setForm({
      name:              item.name               || '',
      unit:              item.unit               || '',
      price:             item.price              ?? '',
      dosageInstruction: item.dosage_instruction || item.dosageInstruction || '',
      specialtyId:       item.specialtyId        || item.specialty_id || '',
    })
    setModal({ mode: 'edit', item })
  }

  async function handleSave() {
    if (!form.name.trim())               return toast.warning('Tên thuốc không được để trống')
    if (!form.unit.trim())               return toast.warning('Đơn vị không được để trống')
    if (!form.price || isNaN(form.price)) return toast.warning('Giá không hợp lệ')
    if (!form.specialtyId)              return toast.warning('Vui lòng chọn chuyên khoa cho thuốc')

    const payload = {
      name:               form.name,
      unit:               form.unit,
      price:              Number(form.price),
      dosage_instruction: form.dosageInstruction,
      specialty_id:       form.specialtyId ? Number(form.specialtyId) : null,
    }

    setSaving(true)
    try {
      if (modal.mode === 'add') {
        await api.post('/v1/medicines', payload)
        toast.success('Thêm thuốc thành công!')
      } else {
        await api.put(`/v1/medicines/${modal.item.id}`, payload)
        toast.success('Cập nhật thuốc thành công!')
      }
      setModal(null)
      load()
    } catch (err) {
      toast.error(err.response?.data || 'Lưu thất bại, thử lại sau')
    } finally { setSaving(false) }
  }

  /* ── Stats ── */
  const totalCount = data.length
  const avgPrice   = data.length
    ? Math.round(data.reduce((s, m) => s + (m.price || 0), 0) / data.length)
    : 0
  const specCount  = new Set(data.map(m => m.specialtyId || m.specialty_id).filter(Boolean)).size

  return (
    <div className={styles.wrapper}>

      {/* ── Toolbar ── */}
      <div className={styles.toolbar}>
        <input
          className={styles.search}
          placeholder="🔍 Tìm tên thuốc..."
          value={keyword}
          onChange={e => setKeyword(e.target.value)}
        />
        <button className={styles.btnAdd} onClick={openAdd}>
          + Thêm thuốc
        </button>
      </div>

      {/* ── Stats cards ── */}
      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: '#eff6ff' }}>💊</div>
          <div className={styles.statInfo}>
            <div className={styles.statVal}>{totalCount}</div>
            <div className={styles.statLabel}>Tổng số thuốc</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: '#f0fdf4' }}>💰</div>
          <div className={styles.statInfo}>
            <div className={styles.statVal}>{fmt(avgPrice)}</div>
            <div className={styles.statLabel}>Giá trung bình</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: '#fdf4ff' }}>🏷️</div>
          <div className={styles.statInfo}>
            <div className={styles.statVal}>{specCount}</div>
            <div className={styles.statLabel}>Chuyên khoa có thuốc</div>
          </div>
        </div>
      </div>

      {/* ── Table ── */}
      <div className={styles.tableCard}>
        <div className={styles.tableHead}>
          <span className={styles.tableTitle}>Danh sách thuốc</span>
          <span className={styles.count}>{filtered.length} thuốc</span>
        </div>

        <div className={styles.tableWrap}>
          {loading ? (
            <div className={styles.empty}>
              <div className={styles.emptyIcon}>⏳</div>
              Đang tải dữ liệu...
            </div>
          ) : filtered.length === 0 ? (
            <div className={styles.empty}>
              <div className={styles.emptyIcon}>💊</div>
              {keyword ? `Không tìm thấy thuốc "${keyword}"` : 'Chưa có thuốc nào trong danh mục'}
            </div>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.numCell}>#</th>
                  <th>Tên thuốc</th>
                  <th>Đơn vị</th>
                  <th>Giá</th>
                  <th>Cách dùng</th>
                  <th>Chuyên khoa</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {pageData.map((m, i) => {
                  const specName = specialties.find(
                    s => s.id === (m.specialtyId || m.specialty_id)
                  )?.name
                  return (
                    <tr key={m.id}>
                      <td className={styles.numCell}>{page * ADMIN_PAGE_SIZE + i + 1}</td>
                      <td className={styles.nameCell}>
                        <strong>{m.name}</strong>
                      </td>
                      <td>
                        <span className={styles.unitBadge}>{m.unit}</span>
                      </td>
                      <td className={styles.priceCell}>{fmt(m.price)}</td>
                      <td className={styles.dosageCell}>
                        {m.dosage_instruction || m.dosageInstruction || '—'}
                      </td>
                      <td>
                        {specName
                          ? <span className={styles.specBadge}>{specName}</span>
                          : <span className={styles.noSpec}>—</span>
                        }
                      </td>
                      <td>
                        <div className={styles.actionCell}>
                          <button className={styles.btnEdit} onClick={() => openEdit(m)}>
                            ✏️ Sửa
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
        {!loading && filtered.length > 0 && (
          <AdminPagination page={page} totalPages={totalPages} onPageChange={setPage} />
        )}
      </div>

      {/* ── Modal thêm / sửa ── */}
      {modal && (
        <div className={styles.overlay} onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div className={styles.modal}>
            <div className={styles.modalHead}>
              <span>{modal.mode === 'add' ? '💊 Thêm thuốc mới' : '✏️ Chỉnh sửa thuốc'}</span>
              <button className={styles.closeBtn} onClick={() => setModal(null)}>✕</button>
            </div>

            <div className={styles.modalForm}>
              <div className={styles.field}>
                <label>Tên thuốc *</label>
                <input
                  placeholder="VD: Paracetamol 500mg"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                />
              </div>

              <div className={styles.row2}>
                <div className={styles.field}>
                  <label>Đơn vị *</label>
                  <input
                    placeholder="VD: viên, mg, ml, gói"
                    value={form.unit}
                    onChange={e => setForm(f => ({ ...f, unit: e.target.value }))}
                  />
                </div>
                <div className={styles.field}>
                  <label>Giá (VNĐ) *</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="VD: 5000"
                    value={form.price}
                    onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                  />
                </div>
              </div>

              <div className={styles.field}>
                <label>Cách dùng / Liều lượng</label>
                <input
                  placeholder="VD: Uống 2 viên / lần, 3 lần / ngày sau ăn"
                  value={form.dosageInstruction}
                  onChange={e => setForm(f => ({ ...f, dosageInstruction: e.target.value }))}
                />
              </div>

              <div className={styles.field}>
                <label>Chuyên khoa</label>
                <select
                  value={form.specialtyId}
                  onChange={e => setForm(f => ({ ...f, specialtyId: e.target.value }))}
                >
                  <option value="">— Tất cả chuyên khoa —</option>
                  {specialties.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div className={styles.modalActions}>
                <button
                  className={styles.btnSecondary}
                  onClick={() => setModal(null)}
                  disabled={saving}
                >
                  Hủy
                </button>
                <button
                  className={styles.btnPrimary}
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? 'Đang lưu...' : modal.mode === 'add' ? 'Thêm thuốc' : 'Lưu thay đổi'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
