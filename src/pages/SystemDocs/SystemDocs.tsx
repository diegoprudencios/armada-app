import { useEffect, useMemo, useState } from 'react'
import tokensCss from '@/styles/tokens.css?raw'
import overridesCss from '@/styles/theme-overrides.css?raw'
import { ThemeToggle } from '@/components/ThemeToggle'
import { useTheme } from '@/hooks/useTheme'
import { TYPOGRAPHY_VARIANTS, typographyClassName } from '@/typography/variants'
import { ComponentPlayground } from './ComponentPlaygrounds'
import { MOTION_KEYFRAMES } from './motionInventory'
import {
  colorScaleOf,
  isHardcodedValue,
  parseDeclsForTheme,
  semanticRoleOf,
} from './parseCssVars'
import styles from './SystemDocs.module.css'

const MISSING_DS =
  'not documented yet — ARMADA_DESIGN_SYSTEM.md is not in this repo; .cursor/rules/armada-project.mdc is not in this repo.'

const APP_RULES = [
  'Verify token names in src/styles/tokens.css before writing or editing UI.',
  'Follow accessibility-a11y.mdc — strictly apply A11Y.md for all frontend work.',
  'Never hardcode hex colors, raw px spacing/sizing, or font sizes — use CSS custom properties from src/styles/tokens.css. App-only roles live in src/styles/theme-overrides.css.',
  'Run npm run build before marking any task complete.',
  'This repo owns tokens and typography. Do not copy or overwrite them from another project.',
  'Never hand-edit typography.css or variants.ts. After changing semantic.typography in JSON, run npm run tokens:typography.',
  'CSS Modules per component (Component.module.css).',
  'Prefer semantic tokens (--semantic-*); use primitives when no semantic alias exists.',
  'Border radius and font-size primitives are unitless — wrap with calc(var(--token) * 1px).',
  'npm run build → npm run tokens:typography && tsc && vite build',
] as const

const NAV = [
  { href: '#foundations', label: 'Foundations' },
  { href: '#color', label: 'Color' },
  { href: '#typography', label: 'Typography' },
  { href: '#spacing', label: 'Spacing' },
  { href: '#radius', label: 'Radius & borders' },
  { href: '#gradient', label: 'Gradient' },
  { href: '#components', label: 'Components' },
  { href: '#motion', label: 'Motion' },
  { href: '#examples', label: 'Live examples' },
  { href: '#rules', label: 'Rules reference' },
  { href: '#agent', label: 'Agent guide' },
] as const

const PLAYGROUNDS = new Set([
  'Button',
  'IconButton',
  'Tag',
  'SegmentedControl',
  'Steps',
  'ThemeToggle',
  'TokenBadge',
  'Tooltip',
  'BalanceActionButton',
])

const componentIndexFiles = import.meta.glob('../../components/*/index.ts', { eager: true })

function componentFolders(): string[] {
  return Object.keys(componentIndexFiles)
    .map((path) => path.match(/components\/([^/]+)\/index\.ts$/)?.[1])
    .filter((name): name is string => Boolean(name))
    .sort((a, b) => a.localeCompare(b))
}

function useResolved(name: string, kind: 'color' | 'width' | 'font' | 'radius'): string {
  const [theme] = useTheme()
  const [value, setValue] = useState('')

  useEffect(() => {
    const el = document.createElement('div')
    el.style.position = 'absolute'
    el.style.visibility = 'hidden'
    el.style.pointerEvents = 'none'
    if (kind === 'color') el.style.background = `var(${name})`
    if (kind === 'width') el.style.width = `var(${name})`
    if (kind === 'font') el.style.fontSize = `calc(var(${name}) * 1px)`
    if (kind === 'radius') el.style.borderRadius = `calc(var(${name}) * 1px)`
    document.body.appendChild(el)
    const cs = getComputedStyle(el)
    if (kind === 'color') setValue(cs.backgroundColor)
    if (kind === 'width') setValue(cs.width)
    if (kind === 'font') setValue(cs.fontSize)
    if (kind === 'radius') setValue(cs.borderRadius)
    el.remove()
  }, [name, kind, theme])

  return value
}

function ColorSwatch({ name, declared }: { name: string; declared: string }) {
  const resolved = useResolved(name, 'color')
  const hardcoded = isHardcodedValue(declared)
  return (
    <div className={styles.swatch}>
      <div className={styles.chip} style={{ background: `var(${name})` }} />
      <code className={styles.meta}>{name}</code>
      <span className={styles.meta}>{declared}</span>
      <span className={styles.meta}>{resolved}</span>
      {hardcoded ? (
        <span className={`${styles.meta} ${styles.flag}`}>declared value is not a var() alias</span>
      ) : null}
    </div>
  )
}

function groupBy<T>(items: T[], keyFn: (item: T) => string): Array<[string, T[]]> {
  const map = new Map<string, T[]>()
  for (const item of items) {
    const key = keyFn(item)
    const list = map.get(key) ?? []
    list.push(item)
    map.set(key, list)
  }
  return [...map.entries()]
}

export function SystemDocs() {
  const [theme] = useTheme()
  const [query, setQuery] = useState('')
  const [active, setActive] = useState('foundations')
  const [motionPlay, setMotionPlay] = useState(0)

  const decls = useMemo(
    () => parseDeclsForTheme([tokensCss, overridesCss], theme),
    [theme],
  )

  const primitiveColors = [...decls.entries()]
    .filter(([name]) => name.startsWith('--primitives-color-'))
    .map(([name, declared]) => ({ name, declared }))

  const semanticColors = [...decls.entries()]
    .filter(([name]) => name.startsWith('--semantic-color-'))
    .map(([name, declared]) => ({ name, declared }))

  const fontSizes = [...decls.keys()].filter((name) => name.startsWith('--primitives-fontSize-')).sort()
  const spacings = [...decls.keys()].filter((name) => name.startsWith('--primitives-spacing-'))
  const radii = [...decls.keys()].filter((name) => name.includes('borderRadius'))
  const borders = [
    '--semantic-color-border-default',
    '--semantic-color-border-lavender',
    '--semantic-color-border-amber',
    '--semantic-color-border-focus',
  ].filter((name) => decls.has(name))

  const q = query.trim().toLowerCase()
  const folders = componentFolders().filter((name) => !q || name.toLowerCase().includes(q))
  const rules = APP_RULES.filter((rule) => !q || rule.toLowerCase().includes(q))

  useEffect(() => {
    const ids = NAV.map((item) => item.href.slice(1))
    const nodes = ids.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[]
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)
        if (visible[0]?.target.id) setActive(visible[0].target.id)
      },
      { rootMargin: '0px 0px -70% 0px', threshold: [0, 0.25, 0.5] },
    )
    for (const node of nodes) observer.observe(node)
    return () => observer.disconnect()
  }, [])

  const gradientCss = `background: linear-gradient(
  to right,
  var(--semantic-color-brand-lavender),
  var(--semantic-color-brand-gradient-rose),
  var(--semantic-color-brand-amber)
);`

  const agentText = `AGENT GUIDE — Armada App
Source: .cursor/rules/armada-app.mdc (verbatim). ARMADA_DESIGN_SYSTEM.md and armada-project.mdc: not in this repo.

TOKEN DISCIPLINE
- Verify token names in src/styles/tokens.css before writing or editing UI.
- Never hardcode hex colors, raw px spacing/sizing, or font sizes — use CSS custom properties from src/styles/tokens.css. App-only roles live in src/styles/theme-overrides.css.
- Prefer semantic tokens (--semantic-*); use primitives when no semantic alias exists.
- Border radius and font-size primitives are unitless — wrap with calc(var(--token) * 1px).

WRONG
.card { background: #151416; padding: 20px; font-size: 15px; }

RIGHT
.card {
  background: var(--semantic-color-surface-default);
  padding: var(--primitives-spacing-5);
  font-size: calc(var(--primitives-fontSize-md) * 1px);
}

Token names can differ from what you guess. Check tokens.css before writing any var() reference.

CURSOR PROMPTS
Put CRITICAL constraints at the top of the prompt. Name token vars explicitly. Include: check tokens.css before writing any var() reference.

Example:
CRITICAL: never hardcode hex/px/font-size. Use var(--semantic-color-surface-default) and var(--primitives-spacing-5). Check src/styles/tokens.css before any var().

BUILD
- npm run build before marking a task complete.
- npm run build → npm run tokens:typography && tsc && vite build
- npm run dev does not run tsc.

New HTML entry checklist:
[ ] *.html
[ ] main-*.tsx
[ ] vite.config.ts rollupOptions.input
[ ] vercel.json route if the URL is not the html filename

COMPONENT REUSE
Before building anything, check #components on this page (folder list from src/components/).

FIGMA MCP
not documented yet

DEFERRED REFACTOR / WALLET SEAM
not documented yet in ARMADA_DESIGN_SYSTEM.md or armada-project.mdc
`

  return (
    <div className={styles.page}>
      <a className={styles.skip} href="#content">
        Skip to content
      </a>
      <header className={styles.topBar}>
        <h1 className={styles.topTitle}>System docs</h1>
        <label className={styles.meta} htmlFor="docs-search">
          Filter
        </label>
        <input
          id="docs-search"
          className={styles.search}
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Filter components and rules"
        />
        <ThemeToggle />
      </header>
      <div className={styles.shell}>
        <nav className={styles.sidebar} aria-label="Sections">
          <ul className={styles.navList}>
            {NAV.map((item) => (
              <li key={item.href}>
                <a
                  className={[styles.navLink, active === item.href.slice(1) ? styles.navLinkActive : '']
                    .filter(Boolean)
                    .join(' ')}
                  href={item.href}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <main id="content" className={styles.content}>
          <p className={styles.note}>
            Documentation site only. Values below are <code>var(--token)</code> plus computed
            styles from the live cascade (tokens.css + theme-overrides.css). {MISSING_DS}
          </p>

          <section id="foundations">
            <h2 className={styles.sectionTitle}>Foundations</h2>
          </section>

          <section id="color">
            <h3 className={styles.subTitle}>Primitive color</h3>
            {groupBy(primitiveColors, (item) => colorScaleOf(item.name) ?? 'other').map(([scale, items]) => (
              <div key={scale}>
                <h4 className={styles.meta}>{scale}</h4>
                <div className={styles.grid}>
                  {items.map((item) => (
                    <ColorSwatch key={item.name} name={item.name} declared={item.declared} />
                  ))}
                </div>
              </div>
            ))}
            <h3 className={styles.subTitle}>Semantic color</h3>
            {groupBy(semanticColors, (item) => semanticRoleOf(item.name) ?? 'other').map(([role, items]) => (
              <div key={role}>
                <h4 className={styles.meta}>{role}</h4>
                <div className={styles.grid}>
                  {items.map((item) => (
                    <ColorSwatch key={item.name} name={item.name} declared={item.declared} />
                  ))}
                </div>
              </div>
            ))}
          </section>

          <section id="typography">
            <h3 className={styles.subTitle}>Typography</h3>
            <p className={styles.note}>
              Font role table from ARMADA_DESIGN_SYSTEM.md section 5: {MISSING_DS} Specimens use
              generated <code>.armada-text-*</code> classes from this repo.
            </p>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Token</th>
                  <th>Computed size</th>
                  <th>Specimen</th>
                </tr>
              </thead>
              <tbody>
                {fontSizes.map((name) => (
                  <FontSizeRow key={name} name={name} />
                ))}
              </tbody>
            </table>
            <h4 className={styles.subTitle}>Composites</h4>
            {TYPOGRAPHY_VARIANTS.map((variant) => (
              <p key={variant} className={typographyClassName(variant)}>
                {variant} — The quick brown fox
              </p>
            ))}
          </section>

          <section id="spacing">
            <h3 className={styles.subTitle}>Spacing</h3>
            <p className={styles.note}>Spacing rhythm note from the design system: {MISSING_DS}</p>
            {spacings.map((name) => (
              <SpacingRow key={name} name={name} />
            ))}
          </section>

          <section id="radius">
            <h3 className={styles.subTitle}>Radius and borders</h3>
            <div className={styles.grid}>
              {radii.map((name) => (
                <RadiusCard key={name} name={name} declared={decls.get(name) ?? ''} />
              ))}
            </div>
            <div className={styles.grid}>
              {borders.map((name) => (
                <div key={name} className={styles.swatch}>
                  <div className={styles.borderBox} style={{ borderColor: `var(${name})` }} />
                  <code className={styles.meta}>{name}</code>
                  <span className={styles.meta}>{decls.get(name)}</span>
                </div>
              ))}
            </div>
            <p className={styles.note}>Shadows: {MISSING_DS} No --shadow tokens in tokens.css.</p>
          </section>

          <section id="gradient">
            <h3 className={styles.subTitle}>Gradient</h3>
            <div className={styles.gradientPreview} />
            <div className={styles.copyRow}>
              <button
                type="button"
                className={styles.copyBtn}
                onClick={() => void navigator.clipboard.writeText(gradientCss)}
              >
                Copy CSS
              </button>
            </div>
            <pre className={styles.code}>{gradientCss}</pre>
          </section>

          <section id="components">
            <h2 className={styles.sectionTitle}>Components</h2>
            <p className={styles.note}>
              Folders from <code>src/components/*/index.ts</code>. Usage rules from design system
              section 8: {MISSING_DS} Theme: use the header toggle (
              <code>data-theme</code>), not duplicate trees.
            </p>
            {folders.map((name) => (
              <article key={name} className={styles.card} id={`component-${name}`}>
                <h3 className={styles.subTitle}>{name}</h3>
                <p className={styles.meta}>src/components/{name}/</p>
                <ComponentPlayground name={name} />
              </article>
            ))}
          </section>

          <section id="motion">
            <h2 className={styles.sectionTitle}>Motion</h2>
            <p className={styles.note}>
              There is no formal motion token system beyond{' '}
              <code>--semantic-motion-theme</code>. Keyframes below are ad hoc CSS in modules.
              Durations/easings are not centralized; inspect the listed file. Sample replay uses
              <code> var(--semantic-motion-theme)</code> and{' '}
              <code>var(--primitives-spacing-10)</code> travel only.
            </p>
            <div className={styles.playground}>
              <button
                type="button"
                className={styles.replayBtn}
                onClick={() => setMotionPlay((value) => value + 1)}
              >
                Replay sample enter
              </button>
              <div key={motionPlay} className={`${styles.motionBox} ${styles.motionBoxPlay}`} />
            </div>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>@keyframes</th>
                  <th>File</th>
                </tr>
              </thead>
              <tbody>
                {MOTION_KEYFRAMES.map((item) => (
                  <tr key={`${item.file}-${item.name}`}>
                    <td>
                      <code>{item.name}</code>
                    </td>
                    <td className={styles.meta}>{item.file}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section id="examples">
            <h2 className={styles.sectionTitle}>Live examples</h2>
            <p className={styles.note}>
              Participate flow: {MISSING_DS} (not an app route). Iframes of existing entries.
            </p>
            <h3 className={styles.subTitle}>Dashboard</h3>
            <p className={styles.meta}>BalanceCard, frost surfaces, activity, ThemeToggle.</p>
            <iframe className={styles.iframe} title="Dashboard" src="/dashboard.html" />
            <h3 className={styles.subTitle}>Pay via link</h3>
            <p className={styles.meta}>Landing stack, Button, QR, frost/raised on a product page.</p>
            <iframe className={styles.iframe} title="Pay via link" src="/pay-via-link.html" />
            <h3 className={styles.subTitle}>App intro</h3>
            <p className={styles.meta}>LandingHero / intro entry (`index.html`).</p>
            <iframe className={styles.iframe} title="App intro" src="/index.html" />
          </section>

          <section id="rules">
            <h2 className={styles.sectionTitle}>Rules reference</h2>
            <p className={styles.note}>
              Pulled from <code>.cursor/rules/armada-app.mdc</code> because the two files named in
              the spec are absent. Design-system one-liners: {MISSING_DS}
            </p>
            <ul>
              {rules.map((rule) => (
                <li key={rule}>{rule}</li>
              ))}
            </ul>
          </section>

          <section id="agent">
            <h2 className={styles.sectionTitle}>Agent guide</h2>
            <pre className={styles.agent}>{agentText}</pre>
          </section>
        </main>
      </div>
    </div>
  )
}

function FontSizeRow({ name }: { name: string }) {
  const size = useResolved(name, 'font')
  return (
    <tr>
      <td>
        <code>{name}</code>
      </td>
      <td>{size}</td>
      <td style={{ fontSize: `calc(var(${name}) * 1px)` }}>Ag</td>
    </tr>
  )
}

function SpacingRow({ name }: { name: string }) {
  const px = useResolved(name, 'width')
  return (
    <div className={styles.spaceRow}>
      <div className={styles.spaceBar} style={{ width: `var(${name})` }} />
      <code className={styles.meta}>{name}</code>
      <span className={styles.meta}>{px}</span>
    </div>
  )
}

function RadiusCard({ name, declared }: { name: string; declared: string }) {
  const resolved = useResolved(name, 'radius')
  return (
    <div className={styles.swatch}>
      <div className={styles.radiusBox} style={{ borderRadius: `calc(var(${name}) * 1px)` }} />
      <code className={styles.meta}>{name}</code>
      <span className={styles.meta}>{declared}</span>
      <span className={styles.meta}>{resolved}</span>
    </div>
  )
}
