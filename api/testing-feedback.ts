import { get, list, put } from '@vercel/blob'
import type { VercelRequest, VercelResponse } from '@vercel/node'

const BLOB_PREFIX = 'testing-feedback/'

function cors(res: VercelResponse): void {
  res.setHeader('Cache-Control', 'no-store')
}

async function readJsonBody(req: VercelRequest): Promise<unknown> {
  if (req.body != null) {
    if (typeof req.body === 'string') return JSON.parse(req.body)
    if (typeof req.body === 'object') return req.body
  }

  const chunks: Buffer[] = []
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
  }
  const raw = Buffer.concat(chunks).toString('utf8')
  if (!raw.trim()) return null
  return JSON.parse(raw)
}

function entryFilename(entry: { kind?: string; sessionId?: string; receivedAt?: number }): string {
  const kind = entry.kind === 'session_end' ? 'session' : 'answer'
  const sessionId = typeof entry.sessionId === 'string' ? entry.sessionId.slice(0, 36) : 'unknown'
  const receivedAt = typeof entry.receivedAt === 'number' ? entry.receivedAt : Date.now()
  const day = new Date(receivedAt).toISOString().slice(0, 10)
  return `${BLOB_PREFIX}${day}/${receivedAt}-${sessionId}-${kind}.json`
}

async function readBlobJson(pathname: string): Promise<unknown | null> {
  try {
    const result = await get(pathname, { access: 'private' })
    if (!result) return null
    const text = await new Response(result.stream).text()
    return JSON.parse(text)
  } catch {
    return null
  }
}

/**
 * Production log sink for research feedback.
 * POST — append one log entry (answer or session_end) to Vercel Blob
 * GET  — compile all entries (requires ?secret= TESTING_FEEDBACK_READ_SECRET)
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  cors(res)

  if (req.method === 'GET') {
    const secret = process.env.TESTING_FEEDBACK_READ_SECRET
    const provided = typeof req.query.secret === 'string' ? req.query.secret : ''
    if (!secret || provided !== secret) {
      res.status(401).json({ error: 'Unauthorized' })
      return
    }

    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      res.status(503).json({
        error: 'BLOB_READ_WRITE_TOKEN not configured — enable Vercel Blob for this project',
      })
      return
    }

    const entries: unknown[] = []
    let cursor: string | undefined
    do {
      const page = await list({ prefix: BLOB_PREFIX, cursor, limit: 1000 })
      for (const blob of page.blobs) {
        const json = await readBlobJson(blob.pathname)
        if (json != null) entries.push(json)
      }
      cursor = page.hasMore ? page.cursor : undefined
    } while (cursor)

    entries.sort((a, b) => {
      const aAt = (a as { receivedAt?: number }).receivedAt ?? 0
      const bAt = (b as { receivedAt?: number }).receivedAt ?? 0
      return aAt - bAt
    })

    res.status(200).json(entries)
    return
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST')
    res.status(405).end()
    return
  }

  let entry: Record<string, unknown>
  try {
    const parsed = await readJsonBody(req)
    if (!parsed || typeof parsed !== 'object') {
      res.status(400).json({ error: 'Expected JSON object' })
      return
    }
    entry = parsed as Record<string, unknown>
  } catch {
    res.status(400).json({ error: 'Invalid JSON' })
    return
  }

  // Always mirror to function logs so entries are visible in Vercel even before Blob is set up.
  console.log('[TestingFeedback]', JSON.stringify(entry))

  const webhook = process.env.TESTING_FEEDBACK_WEBHOOK_URL?.trim()
  if (webhook) {
    try {
      await fetch(webhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry),
      })
    } catch (error) {
      console.warn('[TestingFeedback] webhook failed', error)
    }
  }

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const pathname = entryFilename(entry)
      await put(pathname, JSON.stringify(entry), {
        access: 'private',
        addRandomSuffix: true,
        contentType: 'application/json',
        token: process.env.BLOB_READ_WRITE_TOKEN,
      })
    } catch (error) {
      console.error('[TestingFeedback] blob write failed', error)
      res.status(500).json({ error: 'Failed to persist log entry' })
      return
    }
  }

  res.status(204).end()
}
