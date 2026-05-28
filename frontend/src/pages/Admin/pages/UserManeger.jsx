import { useState, useEffect, useCallback } from 'react'
import { toast } from 'react-toastify'
import AdminTable, { StatusBadge } from '../components/AdminTable'
import styles from '../AdminCommon.module.css'
import api from '../../../services/api'

const userService = {
  // ĐÃ SỬA: Hỗ trợ nhận đầy đủ param page, size gửi lên Backend Java
  getAll: async (params) => (await api.get('/v1/users', { params })).data,
  toggleActive: async (id) => (await api.patch(`/v1/users/${id}/toggle-active`)).data,
}

export default function UserManager() {
  const [data,    setData]    = useState([])
  const [loading, setLoading] = useState(false)
  const [keyword, setKeyword] = useState('')
  const [role,    setRole]    = useState('')

  // 💡 ĐÃ THÊM: State quản lý phân trang tương thích Spring Data JPA
  const [page, setPage] = useState(0)            // Trang hiện tại (Mặc định trang đầu là 0)
  const [totalPages, setTotalPages] = useState(0) // Tổng số trang trả về từ hệ thống
  const PAGE_SIZE = 12;                          // Số lượng phần tử hiển thị trên một trang

  // ĐÃ SỬA: Hàm load bắn kèm dữ liệu phân trang và đọc đúng cấu trúc res.content
  const load = useCallback(async () => {
    try {
      setLoading(true)
      const res = await userService.getAll({ 
        keyword, 
        role,
        page,
        size: PAGE_SIZE
      })
      
      // Kiểm tra cấu trúc phân trang nếu Backend trả về PageImpl
      if (res && res.content) {
        setData(res.content)
        setTotalPages(res.totalPages || 0)
      } else {
        setData(Array.isArray(res) ? res : [])
        setTotalPages(0)
      }
    } catch { 
      toast.error('Không tải được danh sách người dùng') 
    } finally { 
      setLoading(false) 
    }
  }, [keyword, role, page]) // Tự động gọi lại hàm load khi đổi trang

  useEffect(() => { load() }, [load])

  // Reset về trang 0 (trang đầu) khi người dùng đổi bộ lọc tìm kiếm hoặc vai trò
  const handleFilterChange = (e, type) => {
    setPage(0);
    if (type === 'keyword') setKeyword(e.target.value);
    if (type === 'role') setRole(e.target.value);
  }

  async function handleToggle(user) {
    try {
      await userService.toggleActive(user.id)
      const active = user.is_active ?? user.isActive
      toast.success(`Đã ${active ? 'khoá' : 'mở khoá'} tài khoản ${user.fullName}`)
      load()
    } catch { toast.error('Thao tác thất bại') }
  }

  const COLUMNS = [
    { key: 'fullName', label: 'Họ tên',    render: v => <strong>{v}</strong> },
    { key: 'email',    label: 'Email' },
    { key: 'phone',    label: 'SĐT' },
    { 
    // 💡 ĐÃ SỬA: Đổi từ 'role' thành 'role_name' để khớp 100% với @JsonProperty("role_name") trong Java DTO
    key: 'role_name', 
    label: 'Vai trò', 
    render: (v) => {
      // Lúc này v chính là chuỗi "ADMIN", "DOCTOR", hoặc "PATIENT"
      const roleMap = {
        'ADMIN': 'Admin',
        'DOCTOR': 'Bác sĩ',
        'PATIENT': 'Bệnh nhân'
      };

      return <span className={styles.specBadge}>{roleMap[v] || v || '—'}</span>;
    }
  },
    // 💡 SỬA LẠI THÀNH NHƯ THẾ NÀY:
{ 
  key: 'is_active', // ➔ Đổi thành 'is_active' để khớp với @JsonProperty("is_active")
  label: 'Trạng thái', 
  render: v => <StatusBadge status={v ? 'ACTIVE' : 'INACTIVE'} /> 
},
    {
      key: 'id', label: '', width: 100,
      render: (_, row) => {
        const active = row.is_active ?? row.isActive
        return (
          <button
            className={`${styles.btnSm} ${!active ? styles.btnGreen : styles.btnDanger}`}
            onClick={() => handleToggle(row)}
          >
            {active ? 'Khoá' : 'Mở khoá'}
          </button>
        )
      }
    },
  ]

  return (
    <div>
      <div className={styles.toolbar}>
        <input 
          className={styles.searchInput} 
          placeholder="Tìm tên, email, SĐT..."
          value={keyword} 
          onChange={e => handleFilterChange(e, 'keyword')} 
        />
        <select 
          className={styles.select} 
          value={role} 
          onChange={e => handleFilterChange(e, 'role')}
        >
          <option value="">Tất cả vai trò</option>
          <option value="PATIENT">Bệnh nhân</option>
          <option value="DOCTOR">Bác sĩ</option>
          <option value="ADMIN">Admin</option>
        </select>
      </div>

      <div className={styles.card}>
        {loading
          ? <div className={styles.loading}><div className={styles.spinner}/>Đang tải...</div>
          : (
            <>
              {/* Bảng dữ liệu người dùng */}
              <AdminTable columns={COLUMNS} data={data} />
              
              {/* 💡 ĐÃ THÊM: THANH ĐIỀU HƯỚNG PHÂN TRANG NGƯỜI DÙNG */}
              {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '20px', paddingBottom: '10px' }}>
                  <button 
                    disabled={page === 0} 
                    onClick={() => setPage(p => p - 1)}
                    style={{ padding: '6px 12px', cursor: page === 0 ? 'not-allowed' : 'pointer', background: '#f8f9fa', border: '1px solid #ccc', borderRadius: '4px' }}
                  >
                    ◀ Trước
                  </button>
                  
                  {/* Khởi tạo mảng nút bấm số trang dựa trên dữ liệu thật */}
                  {[...Array(totalPages).keys()].map((num) => (
                    <button
                      key={num}
                      onClick={() => setPage(num)}
                      style={{
                        padding: '6px 12px',
                        cursor: 'pointer',
                        backgroundColor: page === num ? '#007bff' : '#f8f9fa',
                        color: page === num ? '#fff' : '#333',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                        fontWeight: page === num ? 'bold' : 'normal'
                      }}
                    >
                      {num + 1}
                    </button>
                  ))}

                  <button 
                    disabled={page === totalPages - 1} 
                    onClick={() => setPage(p => p + 1)}
                    style={{ padding: '6px 12px', cursor: page === totalPages - 1 ? 'not-allowed' : 'pointer', background: '#f8f9fa', border: '1px solid #ccc', borderRadius: '4px' }}
                  >
                    Sau ▶
                  </button>
                </div>
              )}
            </>
          )
        }
      </div>
    </div>
  )
}