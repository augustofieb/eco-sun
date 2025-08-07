import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getCurrentUser } from './utils/auth'
import { initTheme } from './utils/theme'
import './Checkout.css'
import './dark-mode.css'
import Logo from './assets/Logo.png'

const Checkout = () => {
  const [cartItems, setCartItems] = useState([])
  const [user, setUser] = useState(null)
  const [paymentForm, setPaymentForm] = useState({
    cardNumber: '', expiryDate: '', cvv: '', cardName: ''
  })
  const navigate = useNavigate()

  useEffect(() => {
    const currentUser = getCurrentUser()
    if (!currentUser) {
      navigate('/login')
      return
    }
    setUser(currentUser)
    
    const items = JSON.parse(sessionStorage.getItem('checkoutItems') || '[]')
    setCartItems(items)
    
    initTheme()
  }, [navigate])

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0)
  }

  const handlePayment = (e) => {
    e.preventDefault()
    alert('Pagamento processado com sucesso!')
    sessionStorage.removeItem('checkoutItems')
    navigate('/')
  }

  return (
    <>
      <header className="cabecalho">
        <nav className="topo">
          <ul className="menu">
            <ul><img className='Logo' src={Logo} alt="Logo" /></ul>
            <li className="spacer"></li>
            <li>
              <Link to="/" className="sign-in">Home</Link>
            </li>
          </ul>
        </nav>
      </header>

      <div className='division'></div>

      <main className="checkout-content">
        <h1>Finalizar Pagamento</h1>
        
        <div className="checkout-container">
          <div className="order-summary">
            <h2>Resumo do Pedido</h2>
            {cartItems.map(item => (
              <div key={item.name} className="checkout-item">
                <img src={item.image} alt={item.name} />
                <div className="item-details">
                  <h4>{item.name}</h4>
                  <p>Quantidade: {item.quantity}</p>
                  <p>R${(item.price * item.quantity).toFixed(2)}</p>
                </div>
              </div>
            ))}
            <div className="total">
              <h3>Total: R${getTotalPrice().toFixed(2)}</h3>
            </div>
          </div>

          <div className="payment-form">
            <h2>Dados de Pagamento</h2>
            <form onSubmit={handlePayment}>
              <input
                type="text"
                placeholder="Número do cartão"
                value={paymentForm.cardNumber}
                onChange={(e) => setPaymentForm({...paymentForm, cardNumber: e.target.value})}
                required
              />
              <input
                type="text"
                placeholder="Nome no cartão"
                value={paymentForm.cardName}
                onChange={(e) => setPaymentForm({...paymentForm, cardName: e.target.value})}
                required
              />
              <div className="form-row">
                <input
                  type="text"
                  placeholder="MM/AA"
                  value={paymentForm.expiryDate}
                  onChange={(e) => setPaymentForm({...paymentForm, expiryDate: e.target.value})}
                  required
                />
                <input
                  type="text"
                  placeholder="CVV"
                  value={paymentForm.cvv}
                  onChange={(e) => setPaymentForm({...paymentForm, cvv: e.target.value})}
                  required
                />
              </div>
              <button type="submit" className="btn-primary">Finalizar Pagamento</button>
            </form>
          </div>
        </div>
      </main>
    </>
  )
}

export default Checkout