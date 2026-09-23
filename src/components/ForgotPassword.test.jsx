import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import ForgotPassword from './ForgotPassword'
import { authAPI } from '../services/api'

vi.mock('../services/api', () => ({
  authAPI: {
    forgotPassword: vi.fn(),
  },
}))

const renderPage = () => render(
  <MemoryRouter>
    <ForgotPassword />
  </MemoryRouter>,
)

describe('ForgotPassword', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('envia o email correto e exibe confirmação', async () => {
    authAPI.forgotPassword.mockResolvedValue({ data: 'Se o e-mail estiver cadastrado, você receberá as instruções para redefinir sua senha.' })
    renderPage()

    fireEvent.change(screen.getByPlaceholderText('Digite seu email'), {
      target: { value: 'cliente@exemplo.com' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Enviar' }))

    await waitFor(() => expect(authAPI.forgotPassword).toHaveBeenCalledWith('cliente@exemplo.com'))
    expect(await screen.findByText('Se o e-mail estiver cadastrado, você receberá as instruções para redefinir sua senha.')).toBeInTheDocument()
  })

  it('exibe a mensagem retornada pelo backend quando a recuperação falha', async () => {
    authAPI.forgotPassword.mockRejectedValue(new Error('request failed'))
    renderPage()

    fireEvent.change(screen.getByPlaceholderText('Digite seu email'), {
      target: { value: 'inexistente@exemplo.com' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Enviar' }))

    expect(await screen.findByText('Se o e-mail estiver cadastrado, você receberá as instruções para redefinir sua senha.')).toBeInTheDocument()
  })
})