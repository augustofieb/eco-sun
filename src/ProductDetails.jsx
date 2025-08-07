import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getProducts } from './utils/products'
import { getCurrentUser } from './utils/auth'
import './ProductDetails.css'
import Logo from './assets/Logo.png'
import shoppingCartIcon from './assets/shoppingcart.png'

const ProductDetails = () => {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [reviews, setReviews] = useState([])
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' })
  const [user] = useState(getCurrentUser())
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [cartItems, setCartItems] = useState([])

  useEffect(() => {
    const products = getProducts()
    const foundProduct = products.find(p => p.id === parseInt(id))
    setProduct(foundProduct)
    
    // Load reviews from localStorage
    const savedReviews = JSON.parse(localStorage.getItem(`reviews_${id}`) || '[]')
    setReviews(savedReviews)
    
    // Load cart items from localStorage
    const savedCart = JSON.parse(localStorage.getItem('cartItems') || '[]')
    setCartItems(savedCart)
  }, [id])

  const handleAddReview = (e) => {
    e.preventDefault()
    if (!user) {
      alert('Você precisa estar logado para avaliar')
      return
    }
    
    const review = {
      id: Date.now(),
      userId: user.id,
      userName: user.name || user.nickname,
      rating: parseInt(newReview.rating),
      comment: newReview.comment,
      date: new Date().toLocaleDateString('pt-BR')
    }
    
    const updatedReviews = [...reviews, review]
    setReviews(updatedReviews)
    localStorage.setItem(`reviews_${id}`, JSON.stringify(updatedReviews))
    setNewReview({ rating: 5, comment: '' })
  }

  const getAverageRating = () => {
    if (reviews.length === 0) return 0
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0)
    return (sum / reviews.length).toFixed(1)
  }

  const renderStars = (rating) => {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating)
  }

  const addToCart = (product) => {
    const updatedCart = [...cartItems]
    const existing = updatedCart.find(item => item.name === product.name)
    
    if (existing) {
      existing.quantity += 1
    } else {
      updatedCart.push({ ...product, quantity: 1 })
    }
    
    setCartItems(updatedCart)
    localStorage.setItem('cartItems', JSON.stringify(updatedCart))
    alert('Produto adicionado ao carrinho!')
  }

  const removeFromCart = (productName) => {
    const updatedCart = cartItems.filter(item => item.name !== productName)
    setCartItems(updatedCart)
    localStorage.setItem('cartItems', JSON.stringify(updatedCart))
  }

  const updateQuantity = (productName, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productName)
      return
    }
    
    const updatedCart = cartItems.map(item => 
      item.name === productName 
        ? { ...item, quantity }
        : item
    )
    setCartItems(updatedCart)
    localStorage.setItem('cartItems', JSON.stringify(updatedCart))
  }

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0)
  }

  if (!product) {
    return <div>Produto não encontrado</div>
  }

  return (
    <>
      <header className="cabecalho">
        <nav className="topo">
          <ul className="menu">
            <ul><img className='Logo' src={Logo} alt="Logo" /></ul>
            <li className="spacer"></li>
            <li>
              <Link to="/" className="sign-in">Voltar</Link>
            </li>
            <li>
              <button onClick={() => setIsCartOpen(true)} className="shopping-cart">
                <img src={shoppingCartIcon} alt="Shopping Cart" width="24" height="24" />
                {cartItems.length > 0 && <span className="cart-count">{cartItems.length}</span>}
              </button>
            </li>
          </ul>
        </nav>
      </header>

      <div className='division'></div>

      <div className="product-details-container">
        <div className="product-main">
          <div className="product-image">
            <img src={product.image || 'https://via.placeholder.com/400'} alt={product.name} />
          </div>
          
          <div className="product-info">
            <h1>{product.name}</h1>
            <div className="product-rating">
              <span className="stars">{renderStars(Math.round(getAverageRating()))}</span>
              <span className="rating-text">({getAverageRating()}) - {reviews.length} avaliações</span>
            </div>
            <div className="product-price">R$ {product.price.toFixed(2)}</div>
            <div className="product-category">Categoria: {product.category}</div>
            
            {product.description && (
              <div className="product-description">
                <h3>Descrição</h3>
                <p>{product.description}</p>
              </div>
            )}
            
            <button 
              className="btn-add-to-cart" 
              onClick={() => addToCart(product)}
            >
              Adicionar ao Carrinho
            </button>
          </div>
        </div>

        <div className="reviews-section">
          <h2>Avaliações e Comentários</h2>
          
          {user && (
            <form onSubmit={handleAddReview} className="review-form">
              <h3>Deixe sua avaliação</h3>
              <div className="rating-input">
                <label>Nota:</label>
                <select 
                  value={newReview.rating} 
                  onChange={(e) => setNewReview({...newReview, rating: e.target.value})}
                >
                  <option value={5}>5 - Excelente</option>
                  <option value={4}>4 - Muito Bom</option>
                  <option value={3}>3 - Bom</option>
                  <option value={2}>2 - Regular</option>
                  <option value={1}>1 - Ruim</option>
                </select>
              </div>
              <textarea
                placeholder="Escreva seu comentário..."
                value={newReview.comment}
                onChange={(e) => setNewReview({...newReview, comment: e.target.value})}
                required
              />
              <button type="submit" className="btn-submit">Enviar Avaliação</button>
            </form>
          )}

          <div className="reviews-list">
            {reviews.length === 0 ? (
              <p>Ainda não há avaliações para este produto.</p>
            ) : (
              reviews.map(review => (
                <div key={review.id} className="review-item">
                  <div className="review-header">
                    <span className="reviewer-name">{review.userName}</span>
                    <span className="review-rating">{renderStars(review.rating)}</span>
                    <span className="review-date">{review.date}</span>
                  </div>
                  <p className="review-comment">{review.comment}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Shopping Cart Sidebar */}
      <div className={`cart-sidebar ${isCartOpen ? 'cart-open' : ''}`}>
        <div className="cart-header">
          <h2>Carrinho de Compras</h2>
          <button onClick={() => setIsCartOpen(false)} className="close-cart">×</button>
        </div>
        <div className="cart-content">
          {cartItems.length === 0 ? (
            <p className="empty-cart">Seu carrinho está vazio</p>
          ) : (
            <>
              {cartItems.map(item => (
                <div key={item.name} className="cart-item">
                  <img src={item.image} alt={item.name} className="cart-item-image" />
                  <div className="cart-item-details">
                    <h4>{item.name}</h4>
                    <p>R${item.price.toFixed(2)}</p>
                    <div className="quantity-controls">
                      <button onClick={() => updateQuantity(item.name, item.quantity - 1)}>-</button>
                      <span>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.name, item.quantity + 1)}>+</button>
                    </div>
                  </div>
                  <button onClick={() => removeFromCart(item.name)} className="remove-item">×</button>
                </div>
              ))}
              <div className="cart-total">
                <h3>Total: R${getTotalPrice().toFixed(2)}</h3>
                <button 
                  className="btn-primary checkout-btn"
                  onClick={() => {
                    sessionStorage.setItem('checkoutItems', JSON.stringify(cartItems))
                    window.location.href = '/checkout'
                  }}
                >
                  Finalizar Compra
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {isCartOpen && <div className="cart-overlay" onClick={() => setIsCartOpen(false)}></div>}
    </>
  )
}

export default ProductDetails