import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { isAdmin } from './utils/authAPI'
import api from './services/api'
import AdminLayout from './components/AdminLayout'
import './AdminStats.css'

const COLORS = ['#3483fa','#00a650','#f5a623','#e53935','#7b1fa2','#00bcd4','#ff7043']

/* ── Gráfico de barras verticais ── */
const BarChart = ({ data, labelKey, valueKey, color = '#3483fa' }) => {
  if (!data?.length) return <p className="st-empty">Sem dados</p>
  const max = Math.max(...data.map(d => Number(d[valueKey]) || 0))
  const W = 460, H = 150, PAD = 36, BAR_W = Math.min(32, (W - PAD * 2) / data.length - 6)
  const step = (W - PAD * 2) / data.length
  return (
    <svg viewBox={`0 0 ${W} ${H + 40}`} className="st-svg">
      {/* eixo Y */}
      {[0, 0.25, 0.5, 0.75, 1].map(t => {
        const y = PAD + (1 - t) * H
        return (
          <g key={t}>
            <line x1={PAD} x2={W - PAD} y1={y} y2={y} stroke="#f0f0f0" strokeWidth="1" />
            <text x={PAD - 6} y={y + 4} textAnchor="end" fontSize="10" fill="#aaa">
              {Math.round(max * t)}
            </text>
          </g>
        )
      })}
      {data.map((item, i) => {
        const val = Number(item[valueKey]) || 0
        const barH = max > 0 ? (val / max) * H : 0
        const x = PAD + i * step + step / 2 - BAR_W / 2
        const y = PAD + H - barH
        const label = String(item[labelKey])
        const shortLabel = label.length > 8 ? label.slice(0, 7) + '…' : label
        return (
          <g key={i}>
            <rect x={x} y={y} width={BAR_W} height={barH} rx="3" fill={color} opacity="0.85" />
            <text x={x + BAR_W / 2} y={y - 4} textAnchor="middle" fontSize="11" fontWeight="600" fill="#444">
              {val}
            </text>
            <text x={x + BAR_W / 2} y={PAD + H + 16} textAnchor="middle" fontSize="10" fill="#888">
              {shortLabel}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

/* ── Gráfico de pizza ── */
const PieChart = ({ data, labelKey, valueKey }) => {
  if (!data?.length) return <p className="st-empty">Sem dados</p>
  const total = data.reduce((s, d) => s + (Number(d[valueKey]) || 0), 0)
  if (total === 0) return <p className="st-empty">Sem dados</p>
  const R = 70, CX = 90, CY = 80
  let angle = -Math.PI / 2
  const slices = data.map((item, i) => {
    const val = Number(item[valueKey]) || 0
    const sweep = (val / total) * 2 * Math.PI
    const x1 = CX + R * Math.cos(angle)
    const y1 = CY + R * Math.sin(angle)
    angle += sweep
    const x2 = CX + R * Math.cos(angle)
    const y2 = CY + R * Math.sin(angle)
    const large = sweep > Math.PI ? 1 : 0
    return { path: `M${CX},${CY} L${x1},${y1} A${R},${R} 0 ${large},1 ${x2},${y2} Z`, color: COLORS[i % COLORS.length], label: item[labelKey], val, pct: Math.round((val / total) * 100) }
  })
  return (
    <div className="st-pie-wrap">
      <svg viewBox="0 0 180 160" className="st-pie-svg">
        {slices.map((s, i) => <path key={i} d={s.path} fill={s.color} stroke="white" strokeWidth="1.5" />)}
      </svg>
      <div className="st-legend">
        {slices.map((s, i) => (
          <div key={i} className="st-legend-item">
            <span className="st-legend-dot" style={{ background: s.color }} />
            <span className="st-legend-label">{s.label}</span>
            <span className="st-legend-val">{s.val} ({s.pct}%)</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── Gráfico de linha: X = tempo, Y = quantidade ── */
const LineChart = ({ data, labelKey, valueKey, color = '#3483fa', yLabel = 'Quantidade' }) => {
  if (!data?.length) return <p className="st-empty">Sem dados</p>

  const W = 500, H = 160, PL = 48, PR = 16, PT = 16, PB = 44
  const chartW = W - PL - PR
  const chartH = H - PT - PB
  const max = Math.max(...data.map(d => Number(d[valueKey]) || 0), 1)
  const yTicks = 4

  const px = i => PL + (i / (data.length - 1 || 1)) * chartW
  const py = v => PT + (1 - v / max) * chartH

  const pts = data.map((d, i) => [px(i), py(Number(d[valueKey]) || 0)])
  const polyline = pts.map(p => p.join(',')).join(' ')
  const area = `M${pts[0][0]},${PT + chartH} ` + pts.map(p => `L${p[0]},${p[1]}`).join(' ') + ` L${pts[pts.length-1][0]},${PT + chartH} Z`

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="st-svg">
      {/* título eixo Y */}
      <text x={10} y={PT + chartH / 2} textAnchor="middle" fontSize="10" fill="#aaa"
        transform={`rotate(-90, 10, ${PT + chartH / 2})`}>{yLabel}</text>

      {/* linhas de grade e ticks Y */}
      {Array.from({ length: yTicks + 1 }, (_, i) => {
        const t = i / yTicks
        const y = py(max * t)
        const val = Math.round(max * t)
        return (
          <g key={i}>
            <line x1={PL} x2={PL + chartW} y1={y} y2={y} stroke="#eee" strokeWidth="1" strokeDasharray={t === 0 ? '0' : '4,3'} />
            <text x={PL - 6} y={y + 4} textAnchor="end" fontSize="10" fill="#aaa">{val}</text>
          </g>
        )
      })}

      {/* eixo X e Y */}
      <line x1={PL} x2={PL} y1={PT} y2={PT + chartH} stroke="#ddd" strokeWidth="1" />
      <line x1={PL} x2={PL + chartW} y1={PT + chartH} y2={PT + chartH} stroke="#ddd" strokeWidth="1" />

      {/* área preenchida */}
      <path d={area} fill={color} opacity="0.08" />

      {/* linha */}
      <polyline points={polyline} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />

      {/* pontos e labels */}
      {pts.map(([x, y], i) => {
        const val = Number(data[i][valueKey]) || 0
        const rawLabel = String(data[i][labelKey])
        // formata 'yyyy-MM' → 'MMM/yy'
        const label = rawLabel.match(/^\d{4}-\d{2}$/)
          ? new Date(rawLabel + '-01').toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })
          : rawLabel
        return (
          <g key={i}>
            <circle cx={x} cy={y} r="4" fill="white" stroke={color} strokeWidth="2" />
            <text x={x} y={y - 9} textAnchor="middle" fontSize="11" fontWeight="700" fill={color}>{val}</text>
            <text x={x} y={PT + chartH + 14} textAnchor="middle" fontSize="10" fill="#888">{label}</text>
          </g>
        )
      })}

      {/* título eixo X */}
      <text x={PL + chartW / 2} y={H - 2} textAnchor="middle" fontSize="10" fill="#aaa">Tempo</text>
    </svg>
  )
}

const AdminStats = () => {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    if (!isAdmin()) { navigate('/'); return }
    api.get('/estatisticas')
      .then(r => { setStats(r.data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [navigate])

  const getProdutosMaisUsados = () => {
    if (!stats?.orcamentosRaw) return []
    const contagem = {}
    stats.orcamentosRaw.forEach(o => {
      try {
        const produtos = JSON.parse(o.produtos_selecionados)
        const lista = Array.isArray(produtos) ? produtos : Object.values(produtos)
        lista.forEach(p => {
          const nome = p.nome || p.name || `Produto #${p.id}`
          contagem[nome] = (contagem[nome] || 0) + 1
        })
      } catch {}
    })
    return Object.entries(contagem).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([nome, total]) => ({ nome, total }))
  }

  if (!isAdmin()) return null

  return (
    <AdminLayout>
      <h1 className="st-title">Dashboard</h1>

      {loading ? (
        <div className="st-loading">Carregando estatísticas...</div>
      ) : !stats ? (
        <div className="st-loading">Erro ao carregar dados.</div>
      ) : (
        <>
          <div className="st-cards">
            {[
              { icon: '👥', value: stats.totalUsuarios,   label: 'Usuários'       },
              { icon: '✅', value: stats.usuariosAtivos,  label: 'Ativos'         },
              { icon: '📦', value: stats.totalProdutos,   label: 'Produtos'       },
              { icon: '📋', value: stats.totalOrcamentos, label: 'Orçamentos'     },
              { icon: '⭐', value: stats.totalAvaliacoes, label: 'Avaliações'     },
              { icon: '💰', value: stats.mediaValorOrcamento > 0 ? `R$ ${Number(stats.mediaValorOrcamento).toLocaleString('pt-BR', {maximumFractionDigits:0})}` : '—', label: 'Ticket médio' },
            ].map((c, i) => (
              <div key={i} className="st-card">
                <div className="st-card-icon">{c.icon}</div>
                <div className="st-card-value">{c.value}</div>
                <div className="st-card-label">{c.label}</div>
              </div>
            ))}
          </div>

          <div className="st-grid">
            <div className="st-panel st-wide">
              <h3>Orçamentos por mês</h3>
              <LineChart data={stats.orcamentosPorMes} labelKey="mes" valueKey="total" color="#3483fa" />
            </div>

            <div className="st-panel st-wide">
              <h3>Novos usuários por mês</h3>
              <LineChart data={stats.usuariosPorMes} labelKey="mes" valueKey="total" color="#00a650" />
            </div>

            <div className="st-panel">
              <h3>Produtos mais avaliados</h3>
              <BarChart data={stats.produtosMaisAvaliados} labelKey="nome" valueKey="total_avaliacoes" color="#f5a623" />
            </div>

            <div className="st-panel">
              <h3>Produtos mais usados em orçamentos</h3>
              <BarChart data={getProdutosMaisUsados()} labelKey="nome" valueKey="total" color="#e53935" />
            </div>

            <div className="st-panel">
              <h3>Distribuição por categoria</h3>
              <PieChart data={stats.produtosPorCategoria} labelKey="nome" valueKey="total" />
            </div>

            <div className="st-panel">
              <h3>Usuários recentes</h3>
              {stats.usuariosRecentes?.length ? (
                <table className="st-table">
                  <thead><tr><th>Nome</th><th>Email</th><th>Data</th></tr></thead>
                  <tbody>
                    {stats.usuariosRecentes.map((u, i) => (
                      <tr key={i}>
                        <td>{u.nome}</td>
                        <td>{u.email}</td>
                        <td>{u.data_cadastro ? new Date(u.data_cadastro).toLocaleDateString('pt-BR') : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : <p className="st-empty">Sem dados</p>}
            </div>
          </div>
        </>
      )}
    </AdminLayout>
  )
}

export default AdminStats
