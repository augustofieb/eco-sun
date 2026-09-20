import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getCurrentUser } from './utils/authAPI'
import { orcamentosAPI } from './services/api'
import Logo from './assets/Logo.png'

const MeusOrcamentos = () => {
  const [orcamentos, setOrcamentos] = useState([])
  const [loading, setLoading] = useState(true)
  const user = getCurrentUser()

  useEffect(() => {
    if (!user?.id) {
      setLoading(false)
      return
    }

    orcamentosAPI
      .getByUser(user.id)
      .then((r) => setOrcamentos(r.data))
      .catch(() => setOrcamentos([]))
      .finally(() => setLoading(false))
  }, [])

  const handleDelete = async (id) => {
    if (!window.confirm('Excluir este orçamento?')) return

    await orcamentosAPI.delete(id)
    setOrcamentos((prev) => prev.filter((o) => o.id !== id))
  }

  return (
    <>
      <header className="cabecalho">
        <nav className="topo">
          <ul className="menu">
            <ul>
              <Link to="/"><img className="Logo" src={Logo} alt="Logo" /></Link>
            </ul>

            <li className="spacer"></li>

            {user && (
              <li>
                <span className="user-welcome">
                  Olá, {user.nome || user.name}
                </span>
              </li>
            )}

            <li>
              <Link
                to="/configurador"
                className="quote-btn"
                style={{ textDecoration: 'none' }}
              >
                Novo Orçamento
              </Link>
            </li>

            <li>
              <Link
                to="/"
                className="quote-btn"
                style={{
                  textDecoration: 'none',
                  marginRight: '50px',
                }}
              >
                Início
              </Link>
            </li>
          </ul>
        </nav>
      </header>

      <div className="division"></div>

      <div
        className="orcamentos-page"
        style={{
          width: '100%',
          boxSizing: 'border-box',
          padding: '100px 2rem 2rem',
          textAlign: 'center',
        }}
      >
        <h1 className="orcamentos-page-title" style={{ marginBottom: '2rem' }}>Meus Orçamentos</h1>

        {!user ? (
          <div style={{ marginTop: '3rem' }}>
            <p>Você precisa estar logado para ver seus orçamentos.</p>

            <Link
              to="/login"
              className="btn-primary"
              style={{
                textDecoration: 'none',
                display: 'inline-block',
                marginTop: '1rem',
              }}
            >
              Fazer Login
            </Link>
          </div>
        ) : loading ? (
          <p style={{ color: '#888' }}>Carregando...</p>
        ) : orcamentos.length === 0 ? (
          <div style={{ marginTop: '3rem' }}>
            <p className="orcamento-empty-state" style={{ color: '#aaa', marginBottom: '1rem' }}>
              Você ainda não tem orçamentos salvos.
            </p>

            <Link
              to="/configurador"
              className="btn-primary"
              style={{
                textDecoration: 'none',
                display: 'inline-block',
              }}
            >
              Criar Orçamento
            </Link>
          </div>
        ) : (          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 300px)',
              justifyContent: 'center',
              gap: '20px',
              width: '100%',
            }}
          >
            {orcamentos.map((o) => {
              let produtos = []

              try {
                produtos = JSON.parse(o.produtosSelecionados || '[]')
              } catch {}

              return (
                <div
                  key={o.id}
                  className="orcamento-card"
                  style={{
                    width: '300px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    padding: '1.25rem 1.5rem',
                    background: '#fff',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                    boxSizing: 'border-box',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      flexWrap: 'wrap',
                      gap: '0.5rem',
                    }}
                  >
                    <div>
                      <h3 className="orcamento-card-title" style={{ margin: 0, fontSize: '1.1rem' }}>
                        {o.nome || `Orçamento #${o.id}`}
                      </h3>

                      <span className="orcamento-date" style={{ fontSize: '0.8rem', color: '#999' }}>
                        {o.dataCriacao
                          ? new Date(o.dataCriacao).toLocaleDateString('pt-BR')
                          : '—'}
                      </span>
                    </div>

                    <button
                      onClick={() => handleDelete(o.id)}
                      style={{
                        background: '#dc2626',
                        border: '1px solid #b91c1c',
                        borderRadius: '6px',
                        padding: '0.45rem 0.75rem',
                        cursor: 'pointer',
                        color: '#fff',
                        fontSize: '0.9rem',
                        fontWeight: 600,
                      }}
                      title="Excluir"
                    >
                      Excluir
                    </button>
                  </div>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns:
                        'repeat(auto-fit, minmax(150px, 1fr))',
                      gap: '0.75rem',
                      marginTop: '1rem',
                    }}
                  >
                    {[
                      {
                        label: 'Investimento Total',
                        value:
                          o.precoTotal != null
                            ? `R$ ${Number(o.precoTotal).toLocaleString(
                                'pt-BR',
                                { minimumFractionDigits: 2 }
                              )}`
                            : '—',
                      },
                      {
                        label: 'Energia Gerada',
                        value:
                          o.energiaTotalGerada != null
                            ? `${Number(o.energiaTotalGerada).toFixed(
                                2
                              )} kWh/mês`
                            : '—',
                      },
                      {
                        label: 'Economia Mensal',
                        value:
                          o.economiaMensal != null
                            ? `R$ ${Number(o.economiaMensal).toFixed(2)}`
                            : '—',
                      },
                      {
                        label: 'Retorno',
                        value:
                          o.tempoRetornoMeses != null
                            ? `${o.tempoRetornoMeses} meses`
                            : '—',
                      },
                      {
                        label: 'Redução CO₂/ano',
                        value:
                          o.reducaoCo2Anual != null
                            ? `${Number(o.reducaoCo2Anual).toFixed(2)} kg`
                            : '—',
                      },
                    ].map(({ label, value }) => (
                      <div
                        key={label}
                        className="orcamento-stat"
                        style={{
                          background: '#f9fafb',
                          borderRadius: '8px',
                          padding: '0.6rem 0.75rem',
                        }}
                      >
                        <div
                          className="orcamento-stat-label"
                          style={{
                            fontSize: '0.75rem',
                            color: '#888',
                            marginBottom: '2px',
                          }}
                        >
                          {label}
                        </div>

                        <div className="orcamento-stat-value" style={{ fontWeight: 600, fontSize: '0.95rem' }}>
                          {value}
                        </div>
                      </div>
                    ))}
                  </div>

                  {produtos.length > 0 && (
                    <div style={{ marginTop: '0.75rem' }}>
                      <p className="orcamento-produtos-label" style={{ fontSize: '0.8rem', color: '#888' }}>
                        Produtos:
                      </p>

                      <div
                        style={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: '0.4rem',
                        }}
                      >
                        {produtos.map((p, i) => (
                          <span
                            key={i}
                            className="orcamento-produto-tag"
                            style={{
                              background: '#dbeafe',
                              color: '#1d4ed8',
                              borderRadius: '999px',
                              padding: '2px 10px',
                              fontSize: '0.8rem',
                            }}
                          >
                            {p.nome}
                            {p.quantity > 1 ? ` x${p.quantity}` : ''}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}

export default MeusOrcamentos