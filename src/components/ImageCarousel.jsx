import { useState } from 'react'
import './ImageCarousel.css'

const ImageCarousel = ({ images, productName, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(0)

  if (!images || images.length === 0) {
    return null
  }

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  return (
    <div className="carousel-modal" onClick={onClose}>
      <div className="carousel-content" onClick={(e) => e.stopPropagation()}>
        <button className="carousel-close" onClick={onClose}>×</button>
        <h3>{productName}</h3>
        <div className="carousel-container">
          {images.length > 1 && (
            <button className="carousel-btn prev" onClick={prevImage}>‹</button>
          )}
          <img src={images[currentIndex]} alt={`${productName} - ${currentIndex + 1}`} />
          {images.length > 1 && (
            <button className="carousel-btn next" onClick={nextImage}>›</button>
          )}
        </div>
        {images.length > 1 && (
          <div className="carousel-dots">
            {images.map((_, index) => (
              <span
                key={index}
                className={`dot ${index === currentIndex ? 'active' : ''}`}
                onClick={() => setCurrentIndex(index)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default ImageCarousel
