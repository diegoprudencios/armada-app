import { mkdir } from 'node:fs/promises'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT_DIR = join(__dirname, '../screenshots/deposit-amount-figma')
const BASE_URL = process.env.BASE_URL ?? 'http://localhost:5177/dashboard.html'

async function setTheme(page, theme) {
  await page.evaluate((nextTheme) => {
    document.documentElement.setAttribute('data-theme', nextTheme)
    try {
      localStorage.setItem('armada-theme', nextTheme)
    } catch {
      /* ignore */
    }
  }, theme)
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true })
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })

  await page.goto(BASE_URL)
  await setTheme(page, 'light')
  await page.getByRole('button', { name: 'Deposit' }).click()
  await page.getByText('How much do you want to deposit?').waitFor()
  await page.waitForTimeout(300)
  await page.screenshot({
    path: join(OUT_DIR, 'dashboard-modal-light.png'),
    fullPage: true,
  })

  await browser.close()
  console.log('Saved dashboard-modal-light.png')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
