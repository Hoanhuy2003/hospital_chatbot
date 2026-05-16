import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import styles from './DoctorProfile.module.css';
import { doctorService } from '../../../services/doctorService';

export default function DoctorProfile() {
  // Lấy chính xác doctorId từ localStorage ra để xử lý
  const doctorId = localStorage.getItem('doctorId'); 
  const [loading, setLoading] = useState(false);
  
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');

  const [formData, setFormData] = useState({
    fullName: '',
    qualification: '',
    experienceYears: '',
    price: '',
    biography: ''
  });

  // 1. Gọi API getDoctorById để hiển thị dữ liệu cũ của bác sĩ lên Form
  useEffect(() => {
    const loadProfile = async () => {
      if (!doctorId) {
        toast.error("Không tìm thấy mã định danh bác sĩ!");
        return;
      }
      try {
        setLoading(true);
        const data = await doctorService.getDoctorById(doctorId);
        setFormData({
          fullName: data.fullName || '',
          qualification: data.qualification || '',
          experienceYears: data.experienceYears || '',
          price: data.price || '',
          biography: data.biography || ''
        });
        
        if (data.photoUrl) {
          setPreviewUrl(data.photoUrl); // Link ảnh trả về từ Cloudinary của Hoàn
        }
      } catch (err) {
        toast.error("Không thể tải thông tin bác sĩ");
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [doctorId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file)); 
    }
  };

  // 2. Đóng gói dữ liệu đẩy qua FormData lên API cập nhật
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      const dataToSend = new FormData();
      // Chú ý đặt tên key của FormData khớp chính xác với cấu trúc DoctorDTO của bạn
      dataToSend.append('qualification', formData.qualification);
      dataToSend.append('experience_years', formData.experienceYears); // Khớp snake_case của JsonProperty
      dataToSend.append('price', formData.price);
      dataToSend.append('biography', formData.biography);
      
      if (selectedImage) {
        dataToSend.append('photoUrl', selectedImage); // Khớp MultipartFile photoUrl
      }

      await doctorService.updateDoctor(doctorId, dataToSend);
      toast.success("Cập nhật hồ sơ và ảnh đại diện Cloudinary thành công!");
    } catch (err) {
      toast.error(err.response?.data?.message || err.response?.data || "Cập nhật hồ sơ thất bại");
    } finally {
      setLoading(false);
    }
  };

  if (loading && !formData.fullName) return <div className={styles.loading}>Đang xử lý dữ liệu...</div>;

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>👤 Cập nhật hồ sơ bác sĩ</h2>
      
      <form onSubmit={handleSubmit} className={styles.form} encType="multipart/form-data">
        
        {/* KHU VỰC ẢNH ĐẠI DIỆN */}
        <div className={styles.avatarSection}>
          <div className={styles.avatarPreviewContainer}>
            {previewUrl ? (
              <img src={previewUrl} alt="Avatar" className={styles.avatarPreview} />
            ) : (
              <div className={styles.avatarPlaceholder}>👨‍⚕️</div>
            )}
          </div>
          <div className={styles.uploadBtnWrapper}>
            <button type="button" className={styles.btnUploadDummy}>📸 Thay đổi ảnh đại diện</button>
            <input type="file" accept="image/*" onChange={handleImageChange} className={styles.fileInput} />
          </div>
        </div>

        <div className={styles.formGroup}>
          <label>Họ và tên bác sĩ</label>
          {/* Ô này để hiển thị tên, không cho chỉnh sửa trực tiếp vì trường này thuộc bảng User */}
          <input type="text" name="fullName" value={formData.fullName} disabled className={styles.disabledInput} />
          <small className={styles.note}>*Để thay đổi thông tin họ tên, vui lòng liên hệ bộ phận Admin.</small>
        </div>

        <div className={styles.row}>
          <div className={styles.formGroup}>
            <label>Học vị / Trình độ</label>
            <input type="text" name="qualification" value={formData.qualification} onChange={handleChange} placeholder="Ví dụ: Thạc sĩ, Bác sĩ CKI..." required />
          </div>
          <div className={styles.formGroup}>
            <label>Số năm kinh nghiệm</label>
            <input type="number" name="experienceYears" value={formData.experienceYears} onChange={handleChange} required />
          </div>
        </div>

        <div className={styles.formGroup}>
          <label>Giá tiền dịch vụ khám (VNĐ)</label>
          <input type="number" name="price" value={formData.price} onChange={handleChange} required />
        </div>

        <div className={styles.formGroup}>
          <label>Giới thiệu chi tiết (Tiểu sử công tác)</label>
          <textarea name="biography" rows="5" value={formData.biography} onChange={handleChange} placeholder="Nhập tiểu sử công tác của bác sĩ..."></textarea>
        </div>

        <button type="submit" className={styles.btnSave} disabled={loading}>
          {loading ? '⏳ Hệ thống đang xử lý...' : '💾 Lưu thông tin hồ sơ'}
        </button>
      </form>
    </div>
  );
}