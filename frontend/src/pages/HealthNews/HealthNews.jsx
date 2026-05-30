import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import styles from './HealthNews.module.css'

const ARTICLES = [
  {
    id: 1,
    category: 'Sức khỏe tim mạch',
    date: '2026-05-20',
    title: '5 dấu hiệu cảnh báo sớm bệnh tim mạch cần đi khám ngay',
    excerpt:
      'Đau ngực, khó thở khi gắng sức, hồi hộp kéo dài… là những triệu chứng không nên bỏ qua. Khám sớm giúp phát hiện bệnh kịp thời.',
    tag: 'Tim mạch',
  },
  {
    id: 2,
    category: 'Dinh dưỡng',
    date: '2026-05-18',
    title: 'Chế độ ăn lành mạnh cho người cao huyết áp',
    excerpt:
      'Giảm muối, tăng rau xanh và trái cây, hạn chế đồ chiên rán. Kết hợp theo dõi huyết áp định kỳ theo hướng dẫn bác sĩ.',
    tag: 'Dinh dưỡng',
  },
  {
    id: 3,
    category: 'Nhi khoa',
    date: '2026-05-15',
    title: 'Lịch tiêm chủng mở rộng cho trẻ em — những điều phụ huynh cần biết',
    excerpt:
      'Tiêm đúng lịch, đúng chủng giúp bảo vệ trẻ trước nhiều bệnh truyền nhiễm nguy hiểm. Mang theo sổ tiêm chủng khi đến khám.',
    tag: 'Nhi',
  },
  {
    id: 4,
    category: 'Phòng bệnh',
    date: '2026-05-12',
    title: 'Mùa nóng: phòng sốt xuất huyết và các bệnh truyền nhiễm',
    excerpt:
      'Diệt lăng quăng, mặc áo dài tay, sử dụng kem chống muỗi. Khi sốt cao kéo dài, cần đến cơ sở y tế để được tư vấn.',
    tag: 'Phòng bệnh',
  },
  {
    id: 5,
    category: 'Sản phụ',
    date: '2026-05-08',
    title: 'Chăm sóc thai kỳ ba tháng đầu: lưu ý quan trọng cho mẹ bầu',
    excerpt:
      'Bổ sung axit folic, khám thai định kỳ, tránh thuốc không kê đơn. Thông báo ngay với bác sĩ khi có ra máu hoặc đau bụng dữ dội.',
    tag: 'Sản phụ',
  },
  {
    id: 6,
    category: 'Tư vấn',
    date: '2026-05-05',
    title: 'Đặt khám trực tuyến tại Bệnh viện Bạch Mai — hướng dẫn từng bước',
    excerpt:
      'Chọn chuyên khoa hoặc bác sĩ, chọn khung giờ phù hợp và thanh toán trực tuyến. Giữ mã lịch hẹn để check-in nhanh tại quầy.',
    tag: 'Hướng dẫn',
  },
  {
    id: 7,
    category: 'Ung bướu',
    date: '2026-04-28',
    title: 'Tầm soát ung thư vú: ai nên khám và bao lâu một lần?',
    excerpt:
      'Phụ nữ trên 40 tuổi nên tầm soát định kỳ. Tự khám vú hàng tháng giúp phát hiện thay đổi bất thường sớm hơn.',
    tag: 'Ung bướu',
  },
  {
    id: 8,
    category: 'Tâm lý',
    date: '2026-04-22',
    title: 'Quản lý căng thẳng trong cuộc sống hiện đại',
    excerpt:
      'Ngủ đủ giấc, vận động nhẹ nhàng và chia sẻ khi cần. Nếu lo âu kéo dài ảnh hưởng sinh hoạt, hãy tìm gặp chuyên gia tâm lý.',
    tag: 'Tâm lý',
  },
]

const CATEGORIES = ['Tất cả', ...new Set(ARTICLES.map((a) => a.tag))]

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  } catch {
    return iso
  }
}

export default function HealthNews() {
  const [query, setQuery] = useState('')
  const [activeTag, setActiveTag] = useState('Tất cả')

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim()
    return ARTICLES.filter((a) => {
      const matchTag = activeTag === 'Tất cả' || a.tag === activeTag
      const matchQ =
        !q ||
        a.title.toLowerCase().includes(q) ||
        a.excerpt.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q)
      return matchTag && matchQ
    })
  }, [query, activeTag])

  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <h1 className={styles.title}>Tin Y tế</h1>
        <p className={styles.sub}>
          Cập nhật kiến thức sức khỏe, hướng dẫn khám chữa bệnh và thông tin hữu ích từ Bệnh viện Bạch Mai.
        </p>
      </div>

      <div className={styles.searchWrap}>
        <input
          className={styles.searchInput}
          placeholder="Tìm bài viết, chủ đề..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <span className={styles.searchIcon}>🔍</span>
      </div>

      <div className={styles.chips}>
        {CATEGORIES.map((tag) => (
          <button
            key={tag}
            type="button"
            className={`${styles.chip} ${activeTag === tag ? styles.chipActive : ''}`}
            onClick={() => setActiveTag(tag)}
          >
            {tag}
          </button>
        ))}
      </div>

      <p className={styles.count}>
        <strong>{filtered.length}</strong> bài viết
      </p>

      {filtered.length === 0 ? (
        <div className={styles.empty}>
          <span>📰</span>
          <p>Không tìm thấy bài viết phù hợp</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {filtered.map((article) => (
            <article key={article.id} className={styles.card}>
              <div className={styles.cardTop}>
                <span className={styles.badge}>{article.tag}</span>
                <time className={styles.date}>{formatDate(article.date)}</time>
              </div>
              <h2 className={styles.cardTitle}>{article.title}</h2>
              <p className={styles.cardExcerpt}>{article.excerpt}</p>
              <div className={styles.cardFoot}>
                <span className={styles.category}>{article.category}</span>
              </div>
            </article>
          ))}
        </div>
      )}

      <div className={styles.cta}>
        <div className={styles.ctaInner}>
          <h3>Cần tư vấn hoặc đặt lịch khám?</h3>
          <p>Đội ngũ bác sĩ Bệnh viện Bạch Mai sẵn sàng hỗ trợ bạn.</p>
          <div className={styles.ctaBtns}>
            <Link to="/tim-kiem" className={styles.btnPrimary}>
              Tìm bác sĩ
            </Link>
            <Link to="/chuyen-khoa" className={styles.btnOutline}>
              Xem chuyên khoa
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
