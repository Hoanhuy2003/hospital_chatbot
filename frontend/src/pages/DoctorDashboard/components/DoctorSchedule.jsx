import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { scheduleService } from '../../../services/scheduleService';
import styles from './DoctorSchedule.module.css';

// Tạo 15 khung giờ 07:00 → 22:00, mỗi ca 1 tiếng
const ALL_SLOTS = Array.from({ length: 15 }, (_, i) => {
  const s = i + 7;
  const e = s + 1;
  const f = (h) => (h < 10 ? `0${h}:00` : `${h}:00`);
  return `${f(s)}_${f(e)}`;
});

const formatSlot  = (slot) => slot.replace('_', ' - ');
const isMorning   = (slot) => parseInt(slot.split(':')[0]) < 12;

const STATUS_LABEL = { AVAILABLE: 'Còn chỗ', FULL: 'Đầy', EXPIRED: 'Hết giờ', LOCKED: 'Đã khóa' };
const STATUS_CLASS = { AVAILABLE: styles.tagAvail, FULL: styles.tagFull, EXPIRED: styles.tagExp, LOCKED: styles.tagLock };

export default function DoctorSchedule({ doctorId, clinicId }) {
  const today = new Date().toISOString().split('T')[0];

  // Nếu thiếu thông tin thiết yếu thì báo ngay
  if (!clinicId) {
    return (
      <div style={{
        padding: '32px', background: '#fff7ed', borderRadius: '12px',
        border: '1px solid #fed7aa', color: '#92400e', lineHeight: 1.6
      }}>
        <strong>Không tìm thấy thông tin phòng khám.</strong><br />
        Vui lòng <strong>đăng xuất và đăng nhập lại</strong> để hệ thống cập nhật thông tin mới nhất.<br />
        Nếu vẫn gặp lỗi, liên hệ Admin để được gán phòng khám.
      </div>
    );
  }

  // --- State form đăng ký ---
  const [date, setDate]               = useState(today);
  const [maxPatients, setMaxPatients] = useState(1);
  const [selectedSlots, setSelected]  = useState([]);
  const [submitting, setSubmitting]   = useState(false);

  // --- State xem lịch đã đăng ký ---
  const [viewDate, setViewDate]       = useState(today);
  const [existing, setExisting]       = useState({ morning: [], afternoon: [] });
  const [loadingView, setLoadingView] = useState(false);

  // --- Load lịch đã đăng ký ---
  const loadExisting = useCallback(async () => {
    if (!doctorId) return;
    setLoadingView(true);
    try {
      const data = await scheduleService.getGroupedSchedule(doctorId, viewDate);
      // API trả về List nên lấy phần tử đầu tiên
      setExisting(data[0] || { morning: [], afternoon: [] });
    } catch {
      setExisting({ morning: [], afternoon: [] });
    } finally {
      setLoadingView(false);
    }
  }, [doctorId, viewDate]);

  useEffect(() => { loadExisting(); }, [loadExisting]);

  // --- Toggle chọn slot ---
  const toggle = (slot) =>
    setSelected((prev) =>
      prev.includes(slot) ? prev.filter((s) => s !== slot) : [...prev, slot]
    );

  const toggleAll = (slots) => {
    const allSelected = slots.every((s) => selectedSlots.includes(s));
    if (allSelected) setSelected((prev) => prev.filter((s) => !slots.includes(s)));
    else setSelected((prev) => [...new Set([...prev, ...slots])]);
  };

  // --- Submit ---
  const handleSubmit = async () => {
    if (selectedSlots.length === 0) return toast.warning('Chọn ít nhất 1 khung giờ!');
    if (!clinicId)                  return toast.error('Không tìm thấy phòng khám. Vui lòng liên hệ admin.');

    setSubmitting(true);
    try {
      await scheduleService.createSchedule({
        doctor_id:   Number(doctorId),
        clinic_id:   Number(clinicId),
        date,
        timeSlots:   selectedSlots,
        maxPatients: Number(maxPatients),
      });
      toast.success(`Đã đăng ký ${selectedSlots.length} ca thành công!`);
      setSelected([]);
      if (viewDate === date) loadExisting();
    } catch (err) {
      toast.error(err.response?.data || 'Đăng ký thất bại, thử lại sau.');
    } finally {
      setSubmitting(false);
    }
  };

  const morningSlots   = ALL_SLOTS.filter(isMorning);
  const afternoonSlots = ALL_SLOTS.filter((s) => !isMorning(s));

  return (
    <div className={styles.wrapper}>

      {/* ========== PHẦN 1: ĐĂNG KÝ LỊCH MỚI ========== */}
      <section className={styles.card}>
        <div className={styles.cardHeader}>
          <h3 className={styles.cardTitle}>Đăng ký ca khám</h3>
          <p className={styles.cardSub}>Chọn ngày và các khung giờ bạn muốn nhận bệnh nhân</p>
        </div>

        <div className={styles.configRow}>
          <div className={styles.field}>
            <label className={styles.label}>Ngày trực</label>
            <input
              type="date"
              className={styles.dateInput}
              value={date}
              min={today}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Số bệnh nhân tối đa / ca</label>
            <input
              type="number"
              className={styles.dateInput}
              min={1}
              max={20}
              value={maxPatients}
              onChange={(e) => setMaxPatients(e.target.value)}
            />
          </div>
        </div>

        {/* Buổi sáng */}
        <div className={styles.session}>
          <div className={styles.sessionHeader}>
            <span className={styles.sessionLabel}>Buổi sáng (07:00 – 12:00)</span>
            <button className={styles.btnSelectAll} onClick={() => toggleAll(morningSlots)}>
              {morningSlots.every((s) => selectedSlots.includes(s)) ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
            </button>
          </div>
          <div className={styles.timeGrid}>
            {morningSlots.map((slot) => (
              <button
                key={slot}
                className={`${styles.timeItem} ${selectedSlots.includes(slot) ? styles.active : ''}`}
                onClick={() => toggle(slot)}
              >
                {formatSlot(slot)}
              </button>
            ))}
          </div>
        </div>

        {/* Buổi chiều */}
        <div className={styles.session}>
          <div className={styles.sessionHeader}>
            <span className={styles.sessionLabel}>Buổi chiều (12:00 – 22:00)</span>
            <button className={styles.btnSelectAll} onClick={() => toggleAll(afternoonSlots)}>
              {afternoonSlots.every((s) => selectedSlots.includes(s)) ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
            </button>
          </div>
          <div className={styles.timeGrid}>
            {afternoonSlots.map((slot) => (
              <button
                key={slot}
                className={`${styles.timeItem} ${selectedSlots.includes(slot) ? styles.active : ''}`}
                onClick={() => toggle(slot)}
              >
                {formatSlot(slot)}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.summary}>
          Đã chọn <strong>{selectedSlots.length}</strong> ca
        </div>

        <button
          className={styles.submitBtn}
          onClick={handleSubmit}
          disabled={submitting || selectedSlots.length === 0}
        >
          {submitting ? 'Đang lưu...' : `Lưu ${selectedSlots.length} ca trực`}
        </button>
      </section>

      {/* ========== PHẦN 2: XEM LỊCH ĐÃ ĐĂNG KÝ ========== */}
      <section className={styles.card}>
        <div className={styles.cardHeader}>
          <h3 className={styles.cardTitle}>Lịch đã đăng ký</h3>
        </div>

        <div className={styles.configRow}>
          <div className={styles.field}>
            <label className={styles.label}>Xem ngày</label>
            <input
              type="date"
              className={styles.dateInput}
              value={viewDate}
              onChange={(e) => setViewDate(e.target.value)}
            />
          </div>
        </div>

        {loadingView ? (
          <p className={styles.emptyText}>Đang tải...</p>
        ) : (
          <>
            <SlotGroup title="Buổi sáng" items={existing.morning} />
            <SlotGroup title="Buổi chiều" items={existing.afternoon} />
            {existing.morning.length === 0 && existing.afternoon.length === 0 && (
              <p className={styles.emptyText}>Chưa có lịch nào được đăng ký cho ngày này.</p>
            )}
          </>
        )}
      </section>
    </div>
  );
}

function SlotGroup({ title, items }) {
  if (!items || items.length === 0) return null;
  return (
    <div className={styles.session}>
      <span className={styles.sessionLabel}>{title}</span>
      <div className={styles.timeGrid}>
        {items.map((item) => (
          <div key={item.id} className={`${styles.timeItem} ${styles.readonly}`}>
            <span>{item.time}</span>
            <span className={STATUS_CLASS[item.status] || styles.tagAvail}>
              {STATUS_LABEL[item.status] || item.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
