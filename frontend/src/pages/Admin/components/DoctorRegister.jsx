import { useState, useEffect, useCallback, useMemo } from 'react'
import { toast } from 'react-toastify'
import api from '../../../services/api'
import styles from '../AdminCommon.module.css'
import regStyles from './DoctorRegister.module.css'

const EMPTY = {
  userId: '',
  specialtyId: '',
  clinicId: '',
  qualification: '',
  biography: '',
  experienceYears: '',
  rating: '5',
  supportsOnline: true,
  price: '',
  practiceLicenseNumber: '',
  licenseFile: null,
  photoFile: null,
}

const LICENSE_ACCEPT = 'image/jpeg,image/png,image/webp,image/gif'

/**
 * Đăng ký bác sĩ: chọn user có sẵn (ưu tiên PATIENT) → POST /v1/doctors/promote (multipart).
 */
export default function DoctorRegister({ open, onClose, onSuccess, specialties = [], clinics = [] }) {
  const [form, setForm] = useState(EMPTY)
  const [users, setUsers] = useState([])
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [userFilter, setUserFilter] = useState('')
  const [saving, setSaving] = useState(false)

  const loadUsers = useCallback(async () => {
    try {
      setLoadingUsers(true)
      const res = await api.get('/v1/users', { params: { page: 0, size: 1000 } })
      const page = res.data
      const list = page?.content || []
      setUsers(Array.isArray(list) ? list : [])
    } catch {
      toast.error('Không tải được danh sách người dùng')
      setUsers([])
    } finally {
      setLoadingUsers(false)
    }
  }, [])

  useEffect(() => {
    if (!open) return
    setForm(EMPTY)
    setUserFilter('')
    loadUsers()
  }, [open, loadUsers])

  const eligibleUsers = useMemo(() => {
    const q = userFilter.trim().toLowerCase()
    return users.filter((u) => {
      const role = (u.role_name || u.roleName || '').toString().toUpperCase()
      if (role !== 'PATIENT') return false
      if (!q) return true
      const name = (u.fullName || u.full_name || '').toLowerCase()
      const phone = (u.phone || '').toLowerCase()
      const email = (u.email || '').toLowerCase()
      const idStr = String(u.id || '')
      return name.includes(q) || phone.includes(q) || email.includes(q) || idStr.includes(q)
    })
  }, [users, userFilter])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.userId) return toast.warning('Chọn người dùng cần cấp quyền bác sĩ')
    if (!form.specialtyId) return toast.warning('Chọn chuyên khoa')
    if (!form.clinicId) return toast.warning('Chọn phòng khám')
    if (!form.photoFile) return toast.warning('Vui lòng chọn ảnh chân dung')
    const licenseNo = (form.practiceLicenseNumber || '').trim()
    if (!licenseNo) return toast.warning('Vui lòng nhập số chứng chỉ hành nghề')
    if (!form.licenseFile) return toast.warning('Vui lòng tải lên file chứng chỉ hành nghề')

    try {
      setSaving(true)
      const fd = new FormData()
      fd.append('userId', String(form.userId))
      fd.append('specialtyId', String(form.specialtyId))
      fd.append('clinicId', String(form.clinicId))
      fd.append('qualification', (form.qualification || '').trim() || 'Bác sĩ')
      fd.append('biography', (form.biography || '').trim() || '')
      if (form.experienceYears !== '' && form.experienceYears != null) {
        fd.append('experienceYears', String(parseInt(form.experienceYears, 10) || 0))
      } else {
        fd.append('experienceYears', '0')
      }
      fd.append('rating', String(form.rating != null ? Number(form.rating) : 5))
      fd.append('supportsOnline', form.supportsOnline ? 'true' : 'false')
      fd.append('price', String(form.price != null ? Number(form.price) : 0))
      fd.append('practiceLicenseNumber', licenseNo)
      fd.append('practiceLicenseUrl', form.licenseFile)
      fd.append('photoUrl', form.photoFile)

      await api.post('/v1/doctors/promote', fd)
      toast.success('Đã cấp quyền bác sĩ và tạo hồ sơ thành công')
      onSuccess?.()
      onClose?.()
    } catch (err) {
      const msg = err.response?.data
      toast.error(typeof msg === 'string' ? msg : msg?.message || 'Đăng ký bác sĩ thất bại')
    } finally {
      setSaving(false)
    }
  }

  if (!open) return null

  return (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`${styles.modal} ${regStyles.wide}`} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHead}>
          <h3>Đăng ký bác sĩ (cấp quyền từ tài khoản có sẵn)</h3>
          <button type="button" className={styles.closeBtn} onClick={onClose}>
            ✕
          </button>
        </div>
        <form onSubmit={handleSubmit} className={styles.modalForm}>
          <p className={regStyles.hint}>
            Chọn <strong>tài khoản Bệnh nhân (PATIENT)</strong> trong hệ thống. Sau khi xác nhận, tài khoản sẽ được
            gán vai trò bác sĩ và có hồ sơ chuyên môn tương ứng.
          </p>

          <div className={styles.field}>
            <label>
              Người dùng <span className={styles.req}>*</span>
            </label>
            <input
              className={regStyles.filterInput}
              type="search"
              placeholder="Lọc theo tên, SĐT, email hoặc ID..."
              value={userFilter}
              onChange={(e) => setUserFilter(e.target.value)}
            />
            <select
              className={regStyles.userSelect}
              value={form.userId}
              onChange={(e) => setForm({ ...form, userId: e.target.value })}
              required
              disabled={loadingUsers}
            >
              <option value="">
                {loadingUsers ? 'Đang tải danh sách...' : '-- Chọn tên người dùng --'}
              </option>
              {eligibleUsers.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.fullName || u.full_name || 'Không tên'} — {u.phone || '—'} — {u.email || '—'} (ID:{' '}
                  {u.id})
                </option>
              ))}
            </select>
            {!loadingUsers && eligibleUsers.length === 0 && (
              <span className={regStyles.warn}>Không có tài khoản PATIENT phù hợp. Thử bỏ bộ lọc hoặc tạo user mới.</span>
            )}
          </div>

          <div className={styles.row2}>
            <div className={styles.field}>
              <label>
                Chuyên khoa <span className={styles.req}>*</span>
              </label>
              <select
                value={form.specialtyId}
                onChange={(e) => setForm({ ...form, specialtyId: e.target.value })}
                required
              >
                <option value="">-- Chọn khoa --</option>
                {specialties.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div className={styles.field}>
              <label>
                Phòng khám <span className={styles.req}>*</span>
              </label>
              <select
                value={form.clinicId}
                onChange={(e) => setForm({ ...form, clinicId: e.target.value })}
                required
              >
                <option value="">-- Chọn phòng khám --</option>
                {clinics.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className={styles.row2}>
            <div className={styles.field}>
              <label>Trình độ / Chức danh</label>
              <input
                value={form.qualification}
                onChange={(e) => setForm({ ...form, qualification: e.target.value })}
                placeholder="Ví dụ: Bác sĩ chuyên khoa II"
              />
            </div>
            <div className={styles.field}>
              <label>Số năm kinh nghiệm</label>
              <input
                type="number"
                min={0}
                value={form.experienceYears}
                onChange={(e) => setForm({ ...form, experienceYears: e.target.value })}
                placeholder="0"
              />
            </div>
          </div>

          <div className={styles.field}>
            <label>Tiểu sử / Giới thiệu chuyên môn</label>
            <textarea
              rows={3}
              value={form.biography}
              onChange={(e) => setForm({ ...form, biography: e.target.value })}
              placeholder="Mô tả ngắn về quá trình công tác, chuyên môn..."
            />
          </div>

          <div className={styles.row2}>
            <div className={styles.field}>
              <label>Giá khám (đồng)</label>
              <input
                type="number"
                min={0}
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                placeholder="250000"
              />
            </div>
            <div className={styles.field}>
              <label>Đánh giá ban đầu (sao)</label>
              <input
                type="number"
                min={0}
                max={5}
                step={0.1}
                value={form.rating}
                onChange={(e) => setForm({ ...form, rating: e.target.value })}
              />
            </div>
          </div>

          <div className={styles.field}>
            <label className={regStyles.checkboxLabel}>
              <input
                type="checkbox"
                checked={form.supportsOnline}
                onChange={(e) => setForm({ ...form, supportsOnline: e.target.checked })}
              />
              Hỗ trợ khám / tư vấn trực tuyến
            </label>
          </div>

          <div className={regStyles.licenseSection}>
            <div className={regStyles.licenseTitle}>Chứng chỉ hành nghề</div>
            <div className={styles.field}>
              <label>
                Số chứng chỉ <span className={styles.req}>*</span>
              </label>
              <input
                value={form.practiceLicenseNumber}
                onChange={(e) => setForm({ ...form, practiceLicenseNumber: e.target.value })}
                placeholder="Ví dụ: 12345/BYT-CCHN"
                maxLength={100}
              />
            </div>
            <div className={styles.field}>
              <label>
                File chứng chỉ (ảnh) <span className={styles.req}>*</span>
              </label>
              <label
                className={`${regStyles.dropZone} ${form.licenseFile ? regStyles.dropZoneFilled : ''}`}
              >
                <input
                  type="file"
                  className={regStyles.fileInputHidden}
                  accept={LICENSE_ACCEPT}
                  onChange={(e) => setForm({ ...form, licenseFile: e.target.files?.[0] || null })}
                />
                {form.licenseFile ? (
                  <>
                    <span className={regStyles.fileName}>📄 {form.licenseFile.name}</span>
                    <span className={regStyles.fileHint}>Bấm để chọn file khác</span>
                  </>
                ) : (
                  <>
                    <span className={regStyles.dropIcon}>📎</span>
                    <span>Kéo thả hoặc bấm để chọn ảnh chứng chỉ</span>
                    <span className={regStyles.fileHint}>JPG, PNG, WEBP, GIF — tối đa 100MB</span>
                  </>
                )}
              </label>
            </div>
          </div>

          <div className={styles.field}>
            <label>
              Ảnh chân dung <span className={styles.req}>*</span>
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setForm({ ...form, photoFile: e.target.files?.[0] || null })}
            />
          </div>

          <div className={styles.modalFooter}>
            <button type="button" className={styles.btnCancel} onClick={onClose}>
              Huỷ
            </button>
            <button type="submit" className={styles.btnSubmit} disabled={saving}>
              {saving ? 'Đang xử lý...' : 'Cấp quyền & tạo hồ sơ bác sĩ'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
