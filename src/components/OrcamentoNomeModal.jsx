import { useEffect, useState } from 'react'
import './OrcamentoNomeModal.css'

const OrcamentoNomeModal = ({ open, onClose, onConfirm }) => {
  const [nome, setNome] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (open) {
      setNome('')
      setError('')
    }
  }, [open])

  useEffect(() => {
    const onKeyDown = (e) => {
      if (!open) return
      if (e.key === 'Escape') onClose?.()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  const handleConfirm = () => {
    const trimmed = (nome || '').trim()
    if (!trimmed) {
      setError('Informe um nome para o orçamento.')
      return
    }
    setError('')
    onConfirm?.(trimmed)
  }

  if (!open) return null

  return (
    <div className="orcamento-nome-modal__backdrop" onMouseDown={(e) => {
      if (e.target === e.currentTarget) onClose?.()
    }}>
      <div className="orcamento-nome-modal__card">
        <h3>Nome do Orçamento</h3>
        <p>Escolha um nome para este orçamento.</p>

        <div className="orcamento-nome-modal__field">
          <label htmlFor="orcamento-nome">Nome</label>
          <input
            id="orcamento-nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Ex: Orçamento Casa - João"
            autoFocus
          />
        </div>

        {error && <div className="orcamento-nome-modal__error">{error}</div>}

        <div className="orcamento-nome-modal__actions">
          <button className="orcamento-nome-modal__btn secondary" onClick={() => onClose?.()}>
            Cancelar
          </button>
          <button className="orcamento-nome-modal__btn primary" onClick={handleConfirm}>
            Confirmar
          </button>
        </div>
      </div>
    </div>
  )
}

export default OrcamentoNomeModal

