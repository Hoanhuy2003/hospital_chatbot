import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import styles from './PaymentReturn.module.css';

const VNP_CODES = {
  '00': 'Giao dịch thành công',
  '07': 'Trừ tiền thành công nhưng nghi ngờ gian lận',
  '09': 'Thẻ/Tài khoản chưa đăng ký dịch vụ InternetBanking',
  '10': 'Xác thực thông tin thẻ/tài khoản quá 3 lần',
  '11': 'Đã hết hạn chờ thanh toán',
  '12': 'Thẻ/Tài khoản bị khoá',
  '13': 'Sai mật khẩu OTP',
  '24': 'Giao dịch bị huỷ',
  '51': 'Tài khoản không đủ số dư',
  '65': 'Tài khoản vượt hạn mức giao dịch trong ngày',
  '75': 'Ngân hàng đang bảo trì',
  '79': 'Sai mật khẩu thanh toán quá số lần quy định',
  '99': 'Lỗi không xác định',
};

export default function PaymentReturn() {
  const [params]  = useSearchParams();
  const [status, setStatus] = useState('loading'); // loading | success | fail

  const success   = params.get('success') === 'true';
  const invoiceId = params.get('invoiceId');
  const code      = params.get('code') || '99';
  const message   = params.get('message');

  useEffect(() => {
    // Hiệu ứng delay nhỏ cho spinner
    const t = setTimeout(() => setStatus(success ? 'success' : 'fail'), 600);
    return () => clearTimeout(t);
  }, [success]);

  const failReason = message
    ? decodeURIComponent(message)
    : (VNP_CODES[code] || `Mã lỗi: ${code}`);

  return (
    <div className={styles.page}>
      <div className={styles.card}>

        {status === 'loading' && (
          <div className={styles.loading}>
            <div className={styles.spinner} />
            <p>Đang xác nhận kết quả thanh toán...</p>
          </div>
        )}

        {status === 'success' && (
          <>
            <div className={styles.iconSuccess}>✓</div>
            <h2 className={styles.titleSuccess}>Thanh toán thành công!</h2>
            <p className={styles.subtitle}>
              Hóa đơn <strong>#INV-{invoiceId}</strong> đã được thanh toán và cập nhật.
            </p>
            <div className={styles.actions}>
              <Link to="/lich-kham-cua-toi" className={styles.btnPrimary}>
                Xem lịch khám của tôi
              </Link>
              <Link to="/" className={styles.btnSecondary}>
                Về trang chủ
              </Link>
            </div>
          </>
        )}

        {status === 'fail' && (
          <>
            <div className={styles.iconFail}>✕</div>
            <h2 className={styles.titleFail}>Thanh toán không thành công</h2>
            <p className={styles.subtitle}>{failReason}</p>
            <div className={styles.actions}>
              <Link to="/lich-kham-cua-toi" className={styles.btnPrimary}>
                Quay lại lịch khám
              </Link>
              <Link to="/" className={styles.btnSecondary}>
                Về trang chủ
              </Link>
            </div>
          </>
        )}

      </div>
    </div>
  );
}
