import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs'
import { join, extname } from 'node:path'
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const componentsRoot = join(__dirname, '../src/components')
const srcRoot = join(__dirname, '../src')

function walk(dir, files = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    if (statSync(p).isDirectory()) walk(p, files)
    else if (/\.(tsx?|css)$/.test(name)) files.push(p)
  }
  return files
}

const componentNames = readdirSync(componentsRoot).filter((n) =>
  statSync(join(componentsRoot, n)).isDirectory(),
)

const skipDirs = new Set([
  'BalanceCard',
  'DashboardHeader',
  'DepositTooltipCard',
  'IconButton',
  'SendButton',
  'ModalShell',
  'Steps',
  'WalletButton',
  'ArmadaLogo',
])

const files = walk(componentsRoot).filter((f) =>
  componentNames.some((c) => !skipDirs.has(c) && f.includes(`/components/${c}/`)),
)

const importReplacements = [
  // Steps: crowdfund default → armada-app named export
  [/import Steps from ['"]@\/components\/Steps(?:\/Steps)?['"]/g, "import { Steps } from '@/components/Steps'"],
  [/import Steps from ['"]\.\.\/Steps\/Steps['"]/g, "import { Steps } from '@/components/Steps'"],
  [/import Steps from ['"]\.\.\/\.\.\/Steps\/Steps['"]/g, "import { Steps } from '@/components/Steps'"],
  // Utils
  [/from ['"]\.\.\/\.\.\/\.\.\/utils\/([^'"]+)['"]/g, "from '@/utils/$1'"],
  [/from ['"]\.\.\/\.\.\/utils\/([^'"]+)['"]/g, "from '@/utils/$1'"],
  [/from ['"]\.\.\/utils\/([^'"]+)['"]/g, "from '@/utils/$1'"],
  // Constants
  [/from ['"]\.\.\/\.\.\/\.\.\/constants\/([^'"]+)['"]/g, "from '@/constants/$1'"],
  [/from ['"]\.\.\/\.\.\/constants\/([^'"]+)['"]/g, "from '@/constants/$1'"],
  [/from ['"]\.\.\/constants\/([^'"]+)['"]/g, "from '@/constants/$1'"],
]

function toAlias(importPath, filePath) {
  if (!importPath.startsWith('.')) return importPath

  const fileDir = filePath.slice(0, filePath.lastIndexOf('/'))
  const parts = filePath.replace(srcRoot + '/', '').split('/')
  const depth = parts.length - 2 // under src/components/...
  const segments = importPath.split('/')
  let resolved = fileDir
  for (const seg of segments) {
    if (seg === '.') continue
    if (seg === '..') {
      resolved = resolved.slice(0, resolved.lastIndexOf('/'))
    } else {
      resolved = `${resolved}/${seg}`
    }
  }

  if (resolved.includes('/components/')) {
    const after = resolved.split('/components/')[1]
    const [comp, ...rest] = after.split('/')
    const withoutExt = (rest.join('/') || comp).replace(/\.(tsx?|css)$/, '')
    if (rest.length === 0 || (rest.length === 1 && rest[0] === comp)) {
      return `@/components/${comp}`
    }
    if (rest[rest.length - 1] === comp || rest.join('/') === `${comp}.module.css`) {
      return `@/components/${comp}`
    }
    return `@/components/${comp}/${rest.join('/').replace(/\.module\.css$/, '.module.css')}`
  }

  return importPath
}

for (const file of files) {
  let content = readFileSync(file, 'utf8')
  let changed = false

  for (const [re, rep] of importReplacements) {
    if (re.test(content)) {
      content = content.replace(re, rep)
      changed = true
    }
  }

  content = content.replace(
    /from ['"](\.[^'"]+)['"]/g,
    (match, importPath) => {
      if (importPath.endsWith('.module.css')) {
        // Keep relative CSS imports within same feature folders
        if (importPath.startsWith('./') || importPath.includes('/screens/') || importPath.includes('/steps/')) {
          return match
        }
      }

      const alias = toAlias(importPath, file)
      if (alias === importPath) return match
      changed = true
      return `from '${alias}'`
    },
  )

  // Fix Button.module.css imports for WalletPillMenu
  content = content.replace(
    /from ['"]@\/components\/Button\.module\.css['"]/g,
    "from '@/components/Button/Button.module.css'",
  )
  content = content.replace(
    /from ['"]\.\.\/Button\/Button\.module\.css['"]/g,
    "from '@/components/Button/Button.module.css'",
  )

  if (changed) writeFileSync(file, content)
}

console.log(`Processed ${files.length} files`)
