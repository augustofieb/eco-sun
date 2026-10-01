import { defineConfig, devices } from '@playwright/test'
import process from 'node:process'

const apiUrl = 'http://127.0.0.1:8082/api'
const apiProxyTarget = 'http://127.0.0.1:8082'
const e2eAdminEmail = process.env.E2E_ADMIN_EMAIL || 'admin-e2e@ecosun.invalid'
const e2eAdminPassword = process.env.E2E_ADMIN_PASSWORD || 'E2e-only-admin-password-948!'
process.env.E2E_ADMIN_EMAIL = e2eAdminEmail
process.env.E2E_ADMIN_PASSWORD = e2eAdminPassword

export default defineConfig({
  testDir: './e2e',
  use: {
    baseURL: 'http://127.0.0.1:5174',
    trace: 'on-first-retry',
  },
  webServer: [
    {
      command: 'mvn -f backend/pom.xml spring-boot:run',
      url: `${apiUrl}/test/ping`,
      reuseExistingServer: false,
      timeout: 120000,
      env: {
        PORT: '8082',
        SPRING_DATASOURCE_URL: 'jdbc:h2:mem:ecosun-e2e;MODE=MSSQLServer;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE',
        SPRING_DATASOURCE_USERNAME: 'sa',
        SPRING_DATASOURCE_PASSWORD: '',
        SPRING_DATASOURCE_DRIVER_CLASS_NAME: 'org.h2.Driver',
        SPRING_JPA_HIBERNATE_DDL_AUTO: 'create-drop',
        SPRING_JPA_DATABASE_PLATFORM: 'org.hibernate.dialect.H2Dialect',
        JWT_SECRET: 'ecosun-playwright-integration-test-secret-key-32-bytes',
        BOOTSTRAP_ADMIN_EMAIL: e2eAdminEmail,
        BOOTSTRAP_ADMIN_PASSWORD: e2eAdminPassword,
        E2E_ADMIN_EMAIL: e2eAdminEmail,
        E2E_ADMIN_PASSWORD: e2eAdminPassword,
      },
    },
    {
      command: 'npm run dev -- --host 127.0.0.1 --port 5174 --strictPort',
      url: 'http://127.0.0.1:5174',
      reuseExistingServer: false,
      timeout: 30000,
      env: {
        API_PROXY_TARGET: apiProxyTarget,
      },
    },
  ],
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
})