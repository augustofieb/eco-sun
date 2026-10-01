import { expect, test } from '@playwright/test'

test('envia email e exibe confirmação de recuperação', async ({ page }) => {
  let requestBody

  await page.route('**/api/auth/forgot-password', async (route) => {
    requestBody = route.request().postDataJSON()
    await route.fulfill({
      status: 200,
      contentType: 'text/plain',
      body: 'Se o e-mail estiver cadastrado, você receberá as instruções para redefinir sua senha.',
    })
  })

  await page.goto('/forgot-password')
  await page.getByPlaceholder('Digite seu email').fill('cliente@exemplo.com')
  await page.getByRole('button', { name: 'Enviar' }).click()

  await expect(page.getByText('Se o e-mail estiver cadastrado, você receberá as instruções para redefinir sua senha.')).toBeVisible()
  expect(requestBody).toEqual({ email: 'cliente@exemplo.com' })
})

test('exibe o erro retornado pelo backend', async ({ page }) => {
  await page.route('**/api/auth/forgot-password', async (route) => {
    await route.fulfill({
      status: 500,
      contentType: 'text/plain',
      body: 'Email não encontrado',
    })
  })

  await page.goto('/forgot-password')
  await page.getByPlaceholder('Digite seu email').fill('inexistente@exemplo.com')
  await page.getByRole('button', { name: 'Enviar' }).click()

  await expect(page.getByText('Se o e-mail estiver cadastrado, você receberá as instruções para redefinir sua senha.')).toBeVisible()
})