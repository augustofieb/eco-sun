import jwt from 'jsonwebtoken'

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return res.status(401).json({ message: 'Token de acesso requerido' })
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Token inválido' })
    }
    req.user = user
    next()
  })
}

export const requireAdmin = (req, res, next) => {
  if (req.user.nivelAcesso !== 'ADMIN') {
    return res.status(403).json({ message: 'Acesso negado. Apenas administradores.' })
  }
  next()
}