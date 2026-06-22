import { mkdir } from 'node:fs/promises'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT_DIR = join(__dirname, '../screenshots/deposit-rebuild')
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

async function captureStep(page, name, theme) {
  await setTheme(page, theme)
  await page.waitForTimeout(300)
  await page.screenshot({
    path: join(OUT_DIR, `${name}-${theme}.png`),
    fullPage: true,
  })
}

async function goToReview(page) {
  await page.getByRole('textbox', { name: 'Deposit amount' }).fill('1000')
  await page.getByRole('button', { name: 'Review' }).click()
  await page.getByText('Review your deposit').waitFor()
}

async function goToProcessing(page) {
  await goToReview(page)
  await page.getByRole('button', { name: 'Confirm deposit' }).click()
  await page.getByText('Pending').waitFor()
}

async function goToConfirmed(page) {
  await goToProcessing(page)
  await page.getByText('Deposit confirmed').waitFor({ timeout: 12000 })
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true })
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })

  for (const theme of ['light', 'dark']) {
    await page.goto(BASE_URL)
    await captureStep(page, '01-amount', theme)

    await page.goto(BASE_URL)
    await goToReview(page)
    await captureStep(page, '02-review', theme)

    await page.goto(BASE_URL)
    await goToProcessing(page)
    await captureStep(page, '03-processing', theme)

    await page.goto(BASE_URL)
    await goToConfirmed(page)
    await captureStep(page, '04-confirmed', theme)
  }

  await browser.close()
  console.log(`Screenshots saved to ${OUT_DIR}`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
