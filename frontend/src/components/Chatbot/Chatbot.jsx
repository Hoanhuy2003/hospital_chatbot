import { useState, useRef, useEffect } from 'react'
import { useBooking } from '../../context/BookingContext'
import { useAuth } from '../../context/AuthContext'
import chatbotService from '../../services/chatbotService'
import styles from './Chatbot.module.css'

const QUICK_OPTIONS = [
  { label: '👶 Nhi khoa',      msg: 'Tôi muốn đặt lịch khám Nhi khoa' },
  { label: '❤️ Tim mạch',      msg: 'Tôi bị đau ngực khó thở, nên khám khoa gì?' },
  { label: '🤔 Tư vấn triệu chứng', msg: 'Tôi bị đau đầu và chóng mặt, nên khám khoa nào?' },
  { label: '💰 Giá khám',      msg: 'Chi phí khám bệnh tại bệnh viện là bao nhiêu?' },
  { label: '🏥 Bảo hiểm',      msg: 'Bệnh viện có hỗ trợ bảo hiểm y tế không?' },
]

// Render **bold**, link http(s), và xuống dòng
function renderText(text) {
  if (text == null) return null
  const lines = String(text).split('\n')
  return lines.map((line, lineIdx) => (
    <span key={lineIdx}>
      {lineIdx > 0 && <br />}
      {line.split(/(\*\*[^*]+\*\*|https?:\/\/[^\s<]+)/g).map((p, i) => {
        if (p.startsWith('**') && p.endsWith('**'))
          return <strong key={i}>{p.slice(2, -2)}</strong>
        if (/^https?:\/\//.test(p))
          return (
            <a key={i} href={p} target="_blank" rel="noopener noreferrer" className={styles.inlineLink}>
              {p}
            </a>
          )
        return <span key={i}>{p}</span>
      })}
    </span>
  ))
}

export default function Chatbot() {
  const { chatMsg, setChatMsg } = useBooking()
  const { user } = useAuth()

  const [open, setOpen]       = useState(false)
  const [messages, setMessages] = useState([
    { role: 'bot', text: 'Xin chào! Tôi là trợ lý AI của Bệnh viện Bạch Mai.\nTôi có thể tư vấn triệu chứng, hướng dẫn đặt lịch và giải đáp thắc mắc cho bạn.' }
  ])
  const [input, setInput]     = useState('')
  const [typing, setTyping]   = useState(false)
  const [showQuick, setShowQuick] = useState(true)
  const messagesRef = useRef(null)

  // Nhận tin nhắn từ BookingContext (sau khi đặt lịch)
  useEffect(() => {
    if (chatMsg) {
      setOpen(true)
      setMessages(prev => [...prev, { role: 'bot', text: chatMsg }])
      setShowQuick(false)
      setChatMsg(null)
    }
  }, [chatMsg, setChatMsg])

  // Auto scroll xuống cuối
  useEffect(() => {
    if (messagesRef.current)
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight
  }, [messages, typing])

  async function send(text) {
    const t = text.trim()
    if (!t || typing) return
    setMessages(prev => [...prev, { role: 'user', text: t }])
    setInput('')
    setShowQuick(false)
    setTyping(true)
    try {
      const userId = user?.id ? Number(user.id) : null
      const data = await chatbotService.sendMessage(t, userId)
      
      // SỬA DÒNG NÀY: bốc thuộc tính .reply (chuỗi string) để không bị lỗi .split
      setMessages(prev => [...prev, { role: 'bot', text: data.reply }]) 
      
    } catch {
      setMessages(prev => [...prev, {
        role: 'bot',
        text: 'Xin lỗi, không thể kết nối tới trợ lý lúc này. Vui lòng thử lại sau hoặc gọi hotline 024 3869 3731.'
      }])
    } finally {
      setTyping(false)
    }
  }

  return (
    <>
      {open && (
        <div className={styles.window}>
          <div className={styles.head}>
            <div className={styles.headAvatar}>🤖</div>
            <div>
              <div className={styles.headName}>Trợ lý AI Bạch Mai</div>
              <div className={styles.headStatus}>• Đang hoạt động</div>
            </div>
            <button className={styles.headClose} onClick={() => setOpen(false)}>✕</button>
          </div>

          <div className={styles.messages} ref={messagesRef}>
            {messages.map((m, i) => (
              <div key={i} className={`${styles.msg} ${m.role === 'bot' ? styles.msgBot : styles.msgUser}`}>
                {renderText(m.text)}
              </div>
            ))}
            {typing && (
              <div className={`${styles.msg} ${styles.msgBot}`}>
                <div className={styles.typingDots}><span /><span /><span /></div>
              </div>
            )}
          </div>

          {showQuick && (
            <div className={styles.quickBtns}>
              {QUICK_OPTIONS.map(q => (
                <button key={q.label} className={styles.quickBtn} onClick={() => send(q.msg)}>
                  {q.label}
                </button>
              ))}
            </div>
          )}

          <div className={styles.inputRow}>
            <input
              className={styles.input}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') send(input) }}
              placeholder="Nhập triệu chứng hoặc câu hỏi..."
              disabled={typing}
            />
            <button className={styles.sendBtn} onClick={() => send(input)} disabled={typing}>
              Gửi
            </button>
          </div>
        </div>
      )}
      <button className={styles.fab} onClick={() => setOpen(v => !v)}>
        {open ? '✕' : '💬'}
      </button>
    </>
  )
}
