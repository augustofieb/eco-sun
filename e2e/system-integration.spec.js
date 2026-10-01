import { expect, test } from '@playwright/test'
import { randomUUID } from 'node:crypto'
import process from 'node:process'

const apiUrl = 'http://127.0.0.1:8082/api'
const adminEmail = process.env.E2E_ADMIN_EMAIL
const adminPassword = process.env.E2E_ADMIN_PASSWORD

test('faz login, salva orçamento pela interface e consulta o registro persistido', async ({ page, request }) => {
  const adminResponse = await request.post(`${apiUrl}/auth/login`, {
    data: { email: adminEmail, senha: adminPassword },
  })
  expect(adminResponse.ok()).toBeTruthy()
  const admin = await adminResponse.json()

  const suffix = randomUUID()
  const categoryName = `Categoria E2E ${suffix}`
  const productName = `Painel E2E ${suffix}`
  const categoryCreated = await request.post(`${apiUrl}/categorias`, {
    headers: { Authorization: `Bearer ${admin.token}` },
    data: { nome: categoryName, descricao: 'Categoria criada para teste', especificacoes: '{}' },
  })
  expect(categoryCreated.ok()).toBeTruthy()

  const categoriesResponse = await request.get(`${apiUrl}/categorias`)
  const categories = await categoriesResponse.json()
  const category = categories.find((item) => (item.nome ?? item.NOME) === categoryName)
  expect(category, `Categoria criada não apareceu na API: ${JSON.stringify(categories)}`).toBeTruthy()
  const categoryId = category.id ?? category.ID

  const productCreated = await request.post(`${apiUrl}/produtos`, {
    headers: { Authorization: `Bearer ${admin.token}` },
    data: {
      nome: productName,
      descricao: 'Painel utilizado no teste de integração',
      preco: 899.99,
      categoriaId: categoryId,
      foto: '',
      especificacoesTecnicas: JSON.stringify({ potencia_wp: 550 }),
    },
  })
  expect(productCreated.ok()).toBeTruthy()

  const email = `e2e-${suffix}@example.com`
  const password = 'Integracao123'
  const userCreated = await request.post(`${apiUrl}/auth/register`, {
    data: { nome: 'Usuário E2E', email, senha: password },
  })
  expect(userCreated.ok()).toBeTruthy()
  const userLogin = await request.post(`${apiUrl}/auth/login`, {
    data: { email, senha: password },
  })
  expect(userLogin.ok(), `Login direto da conta de teste falhou: ${await userLogin.text()}`).toBeTruthy()

  await page.goto('/login')
  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Senha').fill(password)
  await page.getByRole('button', { name: 'Entrar' }).click()
  await expect(page).toHaveURL('/')

  await page.goto('/configurador')
  await expect(page.getByRole('heading', { name: 'Configure seu Sistema Solar' })).toBeVisible()

  const productCard = page.locator('.product-card').filter({ hasText: productName })
  await expect(productCard).toBeVisible()
  await productCard.getByRole('button', { name: 'Adicionar' }).click()
  await page.getByRole('button', { name: 'Salvar Orçamento' }).click()
  await page.getByLabel('Nome').fill(`Orçamento E2E ${suffix}`)
  await page.getByRole('button', { name: 'Confirmar' }).click()

  await expect(page.getByText('Orçamento salvo com sucesso!')).toBeVisible()
  await page.goto('/meus-orcamentos')
  await expect(page.getByRole('heading', { name: 'Meus Orçamentos' })).toBeVisible()
  await expect(page.locator('.orcamento-card')).toContainText(`Orçamento E2E ${suffix}`)
})