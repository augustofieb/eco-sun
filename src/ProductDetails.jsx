import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getProductById } from './utils/productsAPI'
import { getCurrentUser } from './utils/authAPI'
import { getReviewsByProduct, createReview } from './utils/reviewsAPI'
import './ProductDetails.css'
import Logo from './assets/Logo.png'
import SolarQuote from './SolarQuote'

const ProductDetails = () => {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [reviews, setReviews] = useState([])
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' })
  const [user] = useState(getCurrentUser())
  const [isQuoteOpen, setIsQuoteOpen] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    loadProduct()
    loadReviews()
  }, [id])

  const loadProduct = async () => {
    const productData = await getProductById(parseInt(id))
    setProduct(productData)
  }

  const loadReviews = async () => {
    const reviewsData = await getReviewsByProduct(parseInt(id))
    setReviews(reviewsData)
  }

  const handleAddReview = async (e) => {
    e.preventDefault()
    if (!user) {
      alert('Você precisa estar logado para avaliar')
      return
    }
    
    try {
      await createReview({
        produtoId: parseInt(id),
        usuarioId: user.id,
        nomeUsuario: user.nome || user.name,
        nota: parseInt(newReview.rating),
        comentario: newReview.comment
      })
      
      setNewReview({ rating: 5, comment: '' })
      loadReviews()
      setSuccessMessage('Avaliação enviada com sucesso!')
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (error) {
      setSuccessMessage('Erro ao adicionar avaliação')
      setTimeout(() => setSuccessMessage(''), 3000)
    }
  }

  const getAverageRating = () => {
    if (reviews.length === 0) return 0
    const sum = reviews.reduce((acc, review) => acc + review.nota, 0)
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
            <li>
              <button onClick={() => setIsQuoteOpen(true)} className="quote-btn">
                💡 Orçamento
              </button>
            </li>
          </ul>
        </nav>
      </header>

      <div className='division'></div>

      <div className="product-container">
        <div className="product-breadcrumb">
          <Link to="/">Início</Link> &gt; Energia Solar &gt; {product.nome}
        </div>

        <div className="product-main-container">
          <div className="product-content">
            <div className="product-left">
              <div className="product-gallery">
                <img 
                  className="product-main-image"
                  src={product.fotoUrl && product.fotoUrl.startsWith('data:') ? product.fotoUrl : (product.fotoUrl || 'https://via.placeholder.com/500')} 
                  alt={product.nome} 
                  onError={(e) => { e.target.src = 'https://via.placeholder.com/500' }}
                />
              </div>
              
              <h1 className="product-title">{product.nome}</h1>
              
              <div className="product-rating-section">
                <span className="rating-stars">{renderStars(Math.round(getAverageRating()))}</span>
                <a href="#reviews" className="rating-count">({getAverageRating()}) {reviews.length} opiniões</a>
              </div>

              <div className="product-specs">
                <h3>Características principais</h3>
                <ul className="specs-list">
                  <li><strong>Categoria:</strong> {product.categoria?.nome || 'Energia Solar'}</li>
                  <li><strong>Código:</strong> #{product.id}</li>
                  <li><strong>Status:</strong> {product.status_produto}</li>
                </ul>
              </div>
              
              {product.descricao && (
                <div className="product-description">
                  <h3>Descrição</h3>
                  <p>{product.descricao}</p>
                </div>
              )}
            </div>

            <div className="product-sidebar">
              <div className="price-section">
                <div className="price-current">R$ {product.preco ? product.preco.toLocaleString('pt-BR', {minimumFractionDigits: 2}) : '0,00'}</div>
                <div className="price-installments">em 12x R$ {product.preco ? (product.preco / 12).toLocaleString('pt-BR', {minimumFractionDigits: 2}) : '0,00'} sem juros</div>
              </div>

              <div className="shipping-info">
                <h4>Chegará grátis</h4>
                <div className="shipping-free">Frete grátis para todo o Brasil</div>
              </div>

              <div className="quantity-selector">
                <label>Quantidade:</label>
                <input type="number" className="quantity-input" defaultValue="1" min="1" />
              </div>

              <div className="action-buttons">
                <button className="btn-buy-now" onClick={() => setIsQuoteOpen(true)}>
                  Solicitar orçamento
                </button>
                <button className="btn-add-cart">
                  Adicionar aos favoritos
                </button>
              </div>

              <div className="seller-info">
                <h4>Vendido por</h4>
                <a href="#" className="seller-name">ECO SUN Energia Solar</a>
              </div>
            </div>
          </div>
        </div>

        <div className="reviews-container" id="reviews">
          <div className="reviews-header">
            <h2>Opiniões sobre o produto</h2>
            <div className="reviews-summary">
              <div className="average-rating">{getAverageRating()}</div>
              <div className="rating-breakdown">
                <div className="rating-stars">{renderStars(Math.round(getAverageRating()))}</div>
                <div>{reviews.length} opiniões</div>
              </div>
            </div>
          </div>
          
          {user && (
            <form onSubmit={handleAddReview} className="review-form">
              <h3>Deixe sua opinião</h3>
              <div className="form-group">
                <label>Avaliação:</label>
                <div className="star-rating">
                  {[1, 2, 3, 4, 5].map(star => (
                    <span
                      key={star}
                      className={`star ${star <= newReview.rating ? 'filled' : ''}`}
                      onClick={() => setNewReview({...newReview, rating: star})}
                      style={{cursor: 'pointer', fontSize: '40px', color: star <= newReview.rating ? '#ffd700' : '#ddd'}}
                    >
                      ★
                    </span>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label>Comentário:</label>
                <textarea
                  placeholder="Conte sua experiência com o produto..."
                  value={newReview.comment}
                  onChange={(e) => setNewReview({...newReview, comment: e.target.value})}
                  required
                />
              </div>
              {successMessage && <p style={{color: successMessage.includes('sucesso') ? 'green' : 'red', marginTop: '10px'}}>{successMessage}</p>}
              <button type="submit" className="btn-submit-review">Enviar opinião</button>
            </form>
          )}

          <div className="reviews-list">
            {reviews.length === 0 ? (
              <p>Ainda não há opiniões sobre este produto. Seja o primeiro a avaliar!</p>
            ) : (
              reviews.map(review => (
                <div key={review.id} className="review-item">
                  <div className="review-header">
                    <div className="reviewer-info">
                      <div className="reviewer-name">{review.nomeUsuario}</div>
                      <div className="review-date">{new Date(review.dataAvaliacao).toLocaleDateString('pt-BR')}</div>
                    </div>
                    <div className="review-rating">{renderStars(review.nota)}</div>
                  </div>
                  <p className="review-text">{review.comentario}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <SolarQuote isOpen={isQuoteOpen} onClose={() => setIsQuoteOpen(false)} />
    </>
  )
}

export default ProductDetails