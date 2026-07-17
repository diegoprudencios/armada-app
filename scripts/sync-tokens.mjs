import { copyFileSync, existsSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')
const crowdfundRoot = resolve(root, '../armada-crowdfund')
const pocUiRoot = resolve(root, '../armada-poc/packages/ui')

const crowdfundCopies = [
  ['src/tokens/armada-tokens.json', 'src/tokens/armada-tokens.json'],
  ['src/styles/tokens.css', 'src/styles/tokens.css'],
]

for (const [relFrom, relTo] of crowdfundCopies) {
  const from = resolve(crowdfundRoot, relFrom)
  const to = resolve(root, relTo)

  if (!existsSync(from)) {
    console.error(`Missing source: ${from}`)
    process.exit(1)
  }

  mkdirSync(dirname(to), { recursive: true })
  copyFileSync(from, to)
  console.log(`Synced ${relTo} from armada-crowdfund`)
}

const typographyFrom = resolve(pocUiRoot, 'src/styles/typography.css')
const typographyTo = resolve(root, 'src/styles/typography.css')

if (!existsSync(typographyFrom)) {
  console.error(`Missing source: ${typographyFrom}`)
  process.exit(1)
}

copyFileSync(typographyFrom, typographyTo)
console.log('Synced src/styles/typography.css from armada-poc @armada/ui')
