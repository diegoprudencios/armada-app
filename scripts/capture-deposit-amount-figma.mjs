import { mkdir } from 'node:fs/promises'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT_DIR = join(__dirname, '../screenshots/deposit-amount-figma')
const BASE_URL = process.env.BASE_URL ?? 'http://localhost:5177/deposit.html'

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

async function capture(page, name, theme) {
  await setTheme(page, theme)
  await page.waitForTimeout(300)
  await page.screenshot({
    path: join(OUT_DIR, `${name}-${theme}.png`),
    fullPage: true,
  })
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true })
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })

  for (const theme of ['light', 'dark']) {
    await page.goto(BASE_URL)
    await capture(page, '01-empty', theme)

    await page.goto(BASE_URL)
    await page.getByRole('textbox', { name: 'Deposit amount' }).fill('100')
    await page.getByText('Fee').waitFor()
    await capture(page, '02-filled-fee', theme)
  }

  await browser.close()
  console.log(`Screenshots saved to ${OUT_DIR}`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
