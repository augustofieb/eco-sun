import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getProducts } from './utils/products'
import { getCurrentUser } from './utils/auth'
import './ProductDetails.css'
import Logo from './assets/Logo.png'

const ProductDetails = () => {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [reviews, setReviews] = useState([])
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' })
  const [user] = useState(getCurrentUser())

  useEffect(() => {
    const products = getProducts()
    const foundProduct = products.find(p => p.id === parseInt(id))
    setProduct(foundProduct)
    
    // Load reviews from localStorage
    const savedReviews = JSON.parse(localStorage.getItem(`reviews_${id}`) || '[]')
    setReviews(savedReviews)
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
    </>
  )
}

export default ProductDetails