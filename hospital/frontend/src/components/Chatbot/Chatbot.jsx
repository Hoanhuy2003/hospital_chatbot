import { useState, useRef, useEffect } from 'react'
import { useBooking } from '../../context/BookingContext'
import { getBotReply } from '../../data/constants'
import styles from './Chatbot.module.css'

const QUICK_OPTIONS = [
  { label: '👶 Nhi khoa',    msg: 'Tìm bác sĩ nhi khoa' },
  { label: '❤️ Tim mạch',    msg: 'Đặt lịch khám tim mạch' },
  { label: '🤔 Tư vấn khoa', msg: 'Tôi bị đau đầu, nên khám khoa gì?' },
  { label: '💰 Giá khám',    msg: 'Giá khám bao nhiêu?' },
  { label: '🏥 Bảo hiểm',   msg: 'Có hỗ trợ bảo hiểm y tế không?' },
]

export default function Chatbot() {
  const { chatMsg, setChatMsg } = useBooking()
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([
    { role: 'bot', text: 'Xin chào! Tôi là trợ lý đặt khám MedCare.\nTôi có thể giúp bạn tìm bác sĩ, đặt lịch, hoặc tư vấn triệu chứng.' }
  ])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const [showQuick, setShowQuick] = useState(true)
  const messagesRef = useRef(null)

  useEffect(() => {
    if (chatMsg) {
      setOpen(true)
      setMessages(prev => [...prev, { role: 'bot', text: chatMsg }])
      setShowQuick(false)
      setChatMsg(null)
    }
  }, [chatMsg, setChatMsg])

  useEffect(() => {
    if (messagesRef.current)
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight
  }, [messages, typing])

  function send(text) {
    const t = text.trim()
    if (!t) return
    setMessages(prev => [...prev, { role: 'user', text: t }])
    setInput('')
    setShowQuick(false)
    setTyping(true)
    setTimeout(() => {
      setTyping(false)
      setMessages(prev => [...prev, { role: 'bot', text: getBotReply(t) }])
    }, 800 + Math.random() * 500)
  }

  return (
    <>
      {open && (
        <div className={styles.window}>
          <div className={styles.head}>
            <div className={styles.headAvatar}>🤖</div>
            <div>
              <div className={styles.headName}>Trợ lý MedCare</div>
              <div className={styles.headStatus}>• Đang hoạt động</div>
            </div>
            <button className={styles.headClose} onClick={() => setOpen(false)}>x</button>
          </div>
          <div className={styles.messages} ref={messagesRef}>
            {messages.map((m, i) => (
              <div key={i} className={`${styles.msg} ${m.role === 'bot' ? styles.msgBot : styles.msgUser}`}>
                {m.text}
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
                <button key={q.label} className={styles.quickBtn} onClick={() => send(q.msg)}>{q.label}</button>
              ))}
            </div>
          )}
          <div className={styles.inputRow}>
            <input className={styles.input} value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') send(input) }}
              placeholder="Nhập tin nhắn..." />
            <button className={styles.sendBtn} onClick={() => send(input)}>Send</button>
          </div>
        </div>
      )}
      <button className={styles.fab} onClick={() => setOpen(v => !v)}>Chat</button>
    </>
  )
}
