import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { userService } from '../../services/userService';
import { useAuth } from '../../context/AuthContext';
import styles from './ProfileModal.module.css';

const GENDER_LABEL = { MALE: 'Nam', FEMALE: 'Nữ', OTHER: 'Khác' };

const initial = (name) => (name || 'U').split(' ').pop()[0].toUpperCase();

function buildForm(data) {
  return {
    fullName:               data.fullName                 || '',
    phone:                  data.phone                    || '',
    email:                  data.email                    || '',
    dateOfBirth:            data.date_of_birth            || '',
    address:                data.address                  || '',
    healthInsuranceNumber:  data.health_insurance_number  || '',
    insuranceExpiryDate:    data.insurance_expiry_date    || '',
    insuranceBenefitLevel:  data.insurance_benefit_level  ?? '',
  };
}

export default function ProfileModal({ onClose }) {
  const { user, updateUser } = useAuth();
  const userId = localStorage.getItem('userId');

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving,  setSaving]  = useState(false);
  const [form,    setForm]    = useState({});

  useEffect(() => {
    if (!userId) return;
    userService.getById(userId)
      .then((data) => {
        setProfile(data);
        setForm(buildForm(data));
      })
      .catch(() => toast.error('Không thể tải thông tin hồ sơ'))
      .finally(() => setLoading(false));
  }, [userId]);

  const handleOverlay = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    if (!form.fullName.trim()) return toast.warning('Họ tên không được để trống');
    setSaving(true);
    try {
      const updated = await userService.update(userId, form);
      setProfile(updated);
      setForm(buildForm(updated));
      updateUser({ fullName: updated.fullName });
      setEditing(false);
      toast.success('Cập nhật hồ sơ thành công!');
    } catch (err) {
      toast.error(err.response?.data || 'Lưu thất bại, thử lại sau.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={handleOverlay}>
      <div className={styles.modal}>

        <div className={styles.header}>
          <h2 className={styles.title}>Hồ sơ của tôi</h2>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        {loading ? (
          <div className={styles.loading}>Đang tải...</div>
        ) : (
          <div className={styles.body}>

            {/* ---- Avatar + tên ---- */}
            <div className={styles.avatarSection}>
              <div className={styles.avatarCircle}>
                {initial(profile?.fullName)}
              </div>
              <div>
                <div className={styles.avatarName}>{profile?.fullName}</div>
                <div className={styles.avatarRole}>
                  {GENDER_LABEL[profile?.gender] || ''}
                  {profile?.gender && profile?.roleName ? ' · ' : ''}
                  {profile?.roleName === 'PATIENT' ? 'Bệnh nhân'
                    : profile?.roleName === 'DOCTOR' ? 'Bác sĩ'
                    : profile?.roleName || ''}
                </div>
              </div>
            </div>

            {/* ---- Chế độ XEM ---- */}
            {!editing ? (
              <>
                {/* Thông tin cá nhân */}
                <div className={styles.sectionLabel}>Thông tin cá nhân</div>
                <div className={styles.infoGrid}>
                  <InfoRow icon="👤" label="Họ và tên"      value={profile?.fullName} />
                  <InfoRow icon="📞" label="Số điện thoại"  value={profile?.phone} />
                  <InfoRow icon="✉️"  label="Email"          value={profile?.email} />
                  <InfoRow icon="🎂" label="Ngày sinh"      value={fmtDate(profile?.date_of_birth)} />
                  <InfoRow icon="⚧"  label="Giới tính"      value={GENDER_LABEL[profile?.gender] || '—'} />
                  <InfoRow icon="📍" label="Địa chỉ"        value={profile?.address} />
                </div>

                {/* Bảo hiểm y tế */}
                <div className={styles.sectionLabel}>Bảo hiểm y tế</div>
                <div className={styles.infoGrid}>
                  <InfoRow icon="🏥" label="Số thẻ BHYT"
                    value={profile?.health_insurance_number} />
                  <InfoRow icon="📅" label="Ngày hết hạn"
                    value={fmtDate(profile?.insurance_expiry_date)} />
                  <InfoRow icon="💯" label="Mức hưởng"
                    value={profile?.insurance_benefit_level != null
                      ? `${profile.insurance_benefit_level}%` : '—'} />
                </div>

                <div className={styles.footer}>
                  <button className={styles.btnEdit} onClick={() => setEditing(true)}>
                    Chỉnh sửa hồ sơ
                  </button>
                </div>
              </>
            ) : (
              /* ---- Chế độ CHỈNH SỬA ---- */
              <>
                <div className={styles.sectionLabel}>Thông tin cá nhân</div>
                <div className={styles.form}>
                  <Field label="Họ và tên *"     name="fullName"    value={form.fullName}    onChange={handleChange} />
                  <Field label="Số điện thoại"   name="phone"       value={form.phone}       onChange={handleChange} />
                  <Field label="Email"            name="email"       value={form.email}       onChange={handleChange} type="email" />
                  <Field label="Ngày sinh"        name="dateOfBirth" value={form.dateOfBirth} onChange={handleChange} type="date" />
                  <Field label="Địa chỉ"          name="address"     value={form.address}     onChange={handleChange} full />
                </div>

                <div className={styles.sectionLabel}>Bảo hiểm y tế</div>
                <div className={styles.form}>
                  <Field
                    label="Số thẻ BHYT"
                    name="healthInsuranceNumber"
                    value={form.healthInsuranceNumber}
                    onChange={handleChange}
                    placeholder="VD: HS4012345678901"
                    maxLength={15}
                  />
                  <Field
                    label="Ngày hết hạn thẻ"
                    name="insuranceExpiryDate"
                    value={form.insuranceExpiryDate}
                    onChange={handleChange}
                    type="date"
                  />
                  <SelectField
                    label="Mức hưởng BHYT"
                    name="insuranceBenefitLevel"
                    value={form.insuranceBenefitLevel}
                    onChange={handleChange}
                    options={[
                      { value: '',   label: '— Chưa xác định —' },
                      { value: '80', label: '80%' },
                      { value: '95', label: '95%' },
                      { value: '100', label: '100%' },
                    ]}
                  />
                </div>

                <div className={styles.footer}>
                  <button className={styles.btnCancel} onClick={() => setEditing(false)} disabled={saving}>
                    Hủy
                  </button>
                  <button className={styles.btnSave} onClick={handleSave} disabled={saving}>
                    {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                  </button>
                </div>
              </>
            )}

          </div>
        )}
      </div>
    </div>
  );
}

/* ---- Sub-components ---- */
function InfoRow({ icon, label, value }) {
  return (
    <div className={styles.infoRow}>
      <span className={styles.infoIcon}>{icon}</span>
      <div>
        <div className={styles.infoLabel}>{label}</div>
        <div className={styles.infoValue}>{value || '—'}</div>
      </div>
    </div>
  );
}

function Field({ label, name, value, onChange, type = 'text', full, placeholder, maxLength }) {
  return (
    <div className={`${styles.fieldWrap} ${full ? styles.fieldFull : ''}`}>
      <label className={styles.fieldLabel}>{label}</label>
      <input
        className={styles.fieldInput}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder || ''}
        maxLength={maxLength}
      />
    </div>
  );
}

function SelectField({ label, name, value, onChange, options }) {
  return (
    <div className={styles.fieldWrap}>
      <label className={styles.fieldLabel}>{label}</label>
      <select className={styles.fieldInput} name={name} value={value} onChange={onChange}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}

function fmtDate(dateStr) {
  if (!dateStr) return '—';
  const [y, m, d] = String(dateStr).split('-');
  return d ? `${d}/${m}/${y}` : dateStr;
}
