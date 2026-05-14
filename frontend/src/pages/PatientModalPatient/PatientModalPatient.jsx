import React, { useState } from 'react';
import { paymentService } from '../../services/paymentService';
import { toast } from 'react-toastify';
import styles from './PatientModalPatient.module.css';

const TABS = ['Thông tin khám', 'Đơn thuốc', 'Hóa đơn'];

const STATUS_INVOICE = {
  PENDING: { label: 'Chờ thanh toán', cls: styles.statusPending },
  PAID:    { label: 'Đã thanh toán',  cls: styles.statusPaid    },
  CANCELLED: { label: 'Đã huỷ',      cls: styles.statusCancelled },
};

export default function PatientModalPatient({ patient, onClose }) {
  const [tab, setTab]         = useState(0);
  const [paying, setPaying]   = useState(false);

  if (!patient) return null;

  const formatVND = (amount) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);

  const invoiceStatus = STATUS_INVOICE[patient.status] || STATUS_INVOICE.PENDING;
  const canPay = patient.status === 'PENDING' && patient.invoiceID;

  const handlePay = async () => {
    if (!patient.invoiceID) return toast.error('Không tìm thấy mã hóa đơn!');
    setPaying(true);
    try {
      const paymentUrl = await paymentService.createPaymentUrl(patient.invoiceID);
      // Chuyển hướng toàn bộ trang sang VNPay
      window.location.href = paymentUrl;
    } catch (err) {
      toast.error(err.response?.data?.error || 'Không thể tạo liên kết thanh toán, thử lại sau.');
      setPaying(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <div>
            <h3>Chi tiết lịch khám: {new Date(patient.createAt).toLocaleDateString('vi-VN')}</h3>
            <p className={styles.subHeader}>Bác sĩ phụ trách: <strong>{patient.doctorName}</strong></p>
          </div>
          <button className={styles.closeX} onClick={onClose}>✕</button>
        </div>

        <div className={styles.tabs}>
          {TABS.map((t, i) => (
            <button
              key={t}
              className={`${styles.tab} ${tab === i ? styles.activeTab : ''}`}
              onClick={() => setTab(i)}
            >
              {t}
            </button>
          ))}
        </div>

        <div className={styles.content}>
          {/* ── TAB 0: THÔNG TIN KHÁM ── */}
          {tab === 0 && (
            <div className={styles.infoContent}>
              <div className={styles.patientBrief}>
                <div className={styles.briefItem}>
                  <span className={styles.label}>Bệnh nhân:</span>
                  <span className={styles.value}>{patient.patientName}</span>
                </div>
                <div className={styles.briefItem}>
                  <span className={styles.label}>Mã BHYT:</span>
                  <span className={styles.value}>{patient.healthInsuranceNumber || 'Không có'}</span>
                </div>
                <div className={styles.briefItem}>
                  <span className={styles.label}>Ngày khám:</span>
                  <span className={styles.value}>{new Date(patient.createAt).toLocaleDateString('vi-VN')}</span>
                </div>
              </div>

              <div className={styles.divider} />

              {patient.photoUrl && (
                <div className={styles.imageSection}>
                  <label className={styles.sectionTitle}>📷 Hình ảnh xét nghiệm / X-Quang</label>
                  <div className={styles.imageWrapper}>
                    <img
                      src={patient.photoUrl}
                      alt="Kết quả chẩn đoán hình ảnh"
                      className={styles.medicalImg}
                      onClick={() => window.open(patient.photoUrl, '_blank')}
                    />
                    <p className={styles.imgCaption}>Nhấn vào ảnh để xem kích thước đầy đủ</p>
                  </div>
                </div>
              )}

              <div className={styles.medicalDetail}>
                <div className={styles.infoBox}>
                  <label>Triệu chứng ghi nhận</label>
                  <p>{patient.symptoms || 'Bệnh nhân không có triệu chứng bất thường'}</p>
                </div>
                <div className={styles.infoBox}>
                  <label>Chẩn đoán xác định</label>
                  <p className={styles.diagnosisText}>{patient.diagnosis}</p>
                </div>
                <div className={styles.infoBox}>
                  <label>Hướng điều trị & Lời khuyên</label>
                  <p>{patient.treatment}</p>
                </div>
              </div>
            </div>
          )}

          {/* ── TAB 1: ĐƠN THUỐC ── */}
          {tab === 1 && (
            <div className={styles.prescriptionArea}>
              {patient.items?.length > 0 ? (
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Tên thuốc</th>
                      <th>Số lượng</th>
                      <th>Cách dùng (Ghi chú)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {patient.items.map((item, idx) => (
                      <tr key={idx}>
                        <td><strong>{item.medicine?.name}</strong></td>
                        <td>{item.quantity} {item.medicine?.unit}</td>
                        <td>{item.medicine?.dosage_instruction}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p style={{ color: '#94a3b8', textAlign: 'center', padding: '32px 0' }}>
                  Không có đơn thuốc
                </p>
              )}
            </div>
          )}

          {/* ── TAB 2: HÓA ĐƠN ── */}
          {tab === 2 && (
            <div className={styles.invoiceArea}>
              <div className={styles.invoiceHead}>
                <p>Mã hóa đơn: <strong>#INV-{patient.invoiceID}</strong></p>
                <span className={invoiceStatus.cls}>{invoiceStatus.label}</span>
              </div>

              <div className={styles.billLine}>
                <span>Phí khám bệnh:</span>
                <span>{formatVND(patient.examinationFee)}</span>
              </div>
              <div className={styles.billLine}>
                <span>Tiền thuốc:</span>
                <span>{formatVND(patient.totalMedicineCost)}</span>
              </div>
              <div className={styles.billLine}>
                <span>BHYT hỗ trợ:</span>
                <span className={styles.discount}>-{formatVND(patient.insuranceDiscount)}</span>
              </div>
              <div className={`${styles.billLine} ${styles.total}`}>
                <span>Số tiền bạn cần trả:</span>
                <span>{formatVND(patient.finalAmount)}</span>
              </div>

              {/* Nút thanh toán VNPay — chỉ hiện khi PENDING */}
              {canPay && (
                <div className={styles.vnpayWrap}>
                  <button
                    className={styles.btnVnpay}
                    onClick={handlePay}
                    disabled={paying}
                  >
                    {paying ? (
                      'Đang xử lý...'
                    ) : (
                      <>
                        <img
                          src="https://sandbox.vnpayment.vn/apis/assets/images/icon-vnpay-qr.svg"
                          alt="VNPay"
                          className={styles.vnpayLogo}
                          onError={e => { e.target.style.display = 'none'; }}
                        />
                        Thanh toán qua VNPay
                      </>
                    )}
                  </button>
                  <p className={styles.vnpayNote}>
                    Bạn sẽ được chuyển đến cổng thanh toán VNPay an toàn
                  </p>
                </div>
              )}

              {patient.status === 'PAID' && (
                <div className={styles.paidBanner}>
                  ✅ Hóa đơn đã được thanh toán thành công
                </div>
              )}
            </div>
          )}
        </div>

        <div className={styles.footer}>
          <button className={styles.btnClose} onClick={onClose}>Đóng</button>
          {/* Nút thanh toán cũng ở footer để luôn hiển thị */}
          {canPay && (
            <button
              className={styles.btnVnpayFooter}
              onClick={handlePay}
              disabled={paying}
            >
              {paying ? '⏳ Đang xử lý...' : '💳 Thanh toán VNPay'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
