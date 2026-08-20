export type CssDecl = { name: string; declared: string }

function stripComments(css: string): string {
  return css.replace(/\/\*[\s\S]*?\*\//g, '')
}

function forEachRule(css: string, visit: (selector: string, body: string) => void): void {
  let i = 0
  while (i < css.length) {
    const open = css.indexOf('{', i)
    if (open < 0) break
    const selector = css.slice(i, open).trim()
    let depth = 1
    let j = open + 1
    while (j < css.length && depth > 0) {
      if (css[j] === '{') depth += 1
      else if (css[j] === '}') depth -= 1
      j += 1
    }
    const body = css.slice(open + 1, j - 1)
    if (selector.startsWith('@')) {
      forEachRule(body, visit)
    } else {
      visit(selector, body)
    }
    i = j
  }
}

function selectorApplies(selector: string, theme: 'light' | 'dark'): boolean {
  const s = selector.toLowerCase()
  if (s.includes(':root')) return true
  const hasLight = s.includes("data-theme='light'") || s.includes('data-theme="light"')
  const hasDark = s.includes("data-theme='dark'") || s.includes('data-theme="dark"')
  if (hasLight && hasDark) return true
  if (theme === 'light' && hasLight) return true
  if (theme === 'dark' && hasDark) return true
  return false
}

function declsInBody(body: string): CssDecl[] {
  const decls: CssDecl[] = []
  const re = /(--[a-zA-Z0-9-]+)\s*:\s*([^;]+);/g
  let match: RegExpExecArray | null
  while ((match = re.exec(body))) {
    decls.push({ name: match[1], declared: match[2].trim() })
  }
  return decls
}

export function parseDeclsForTheme(cssSources: string[], theme: 'light' | 'dark'): Map<string, string> {
  const map = new Map<string, string>()
  for (const raw of cssSources) {
    forEachRule(stripComments(raw), (selector, body) => {
      if (!selectorApplies(selector, theme)) return
      for (const decl of declsInBody(body)) {
        map.set(decl.name, decl.declared)
      }
    })
  }
  return map
}

export function isHardcodedValue(declared: string): boolean {
  const value = declared.trim()
  if (!value) return false
  return !value.includes('var(')
}

export function colorScaleOf(name: string): string | null {
  const match = name.match(/^--primitives-color-([a-z]+)-/)
  return match ? match[1] : null
}

export function semanticRoleOf(name: string): string | null {
  const match = name.match(/^--semantic-color-([a-z]+)/)
  return match ? match[1] : null
}
