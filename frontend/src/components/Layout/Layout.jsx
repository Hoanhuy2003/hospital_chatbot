import Navbar from '../Navbar/Navbar'
import Footer from '../Footer/Footer'
import Chatbot from '../Chatbot/Chatbot'
import { useBooking } from '../../context/BookingContext'
import styles from './Layout.module.css'

export default function Layout({ children }) {
  const { chatMsg } = useBooking()

  return (
    <div className={styles.root}>
      <Navbar />
      <div className={styles.content}>{children}</div>
      <Footer />
      <Chatbot appendMsg={chatMsg} />
    </div>
  )
}
