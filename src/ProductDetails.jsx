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
    } catch (error) {
      alert('Erro ao adicionar avaliação')
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

      <div className="product-details-container">
        <div className="product-main">
          <div className="product-image">
            <img src={product.fotoUrl || 'https://via.placeholder.com/400'} alt={product.nome} />
          </div>
          
          <div className="product-info">
            <h1>{product.nome}</h1>
            <div className="product-rating">
              <span className="stars">{renderStars(Math.round(getAverageRating()))}</span>
              <span className="rating-text">({getAverageRating()}) - {reviews.length} avaliações</span>
            </div>
            <div className="product-price">R$ {product.preco ? product.preco.toFixed(2) : '0.00'}</div>
            <div className="product-category">Categoria: {product.categoria?.nome || 'N/A'}</div>
            
            {product.descricao && (
              <div className="product-description">
                <h3>Descrição</h3>
                <p>{product.descricao}</p>
              </div>
            )}
            
            <button 
              className="btn-add-to-cart" 
              onClick={() => setIsQuoteOpen(true)}
            >
              Solicitar Orçamento
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
                    <span className="reviewer-name">{review.nomeUsuario}</span>
                    <span className="review-rating">{renderStars(review.nota)}</span>
                    <span className="review-date">{new Date(review.dataAvaliacao).toLocaleDateString('pt-BR')}</span>
                  </div>
                  <p className="review-comment">{review.comentario}</p>
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