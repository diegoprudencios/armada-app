import { appendFile, mkdir, readFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
export const TESTING_FEEDBACK_LOG_PATH = resolve(
  __dirname,
  '../data/testing-feedback.ndjson',
)

async function ensureLogFile() {
  await mkdir(dirname(TESTING_FEEDBACK_LOG_PATH), { recursive: true })
}

async function appendLogLine(line) {
  await ensureLogFile()
  await appendFile(TESTING_FEEDBACK_LOG_PATH, `${line}\n`, 'utf8')
}

function readRequestBody(req) {
  return new Promise((resolveBody, reject) => {
    const chunks = []
    req.on('data', (chunk) => {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
    })
    req.on('end', () => resolveBody(Buffer.concat(chunks).toString('utf8')))
    req.on('error', reject)
  })
}

/**
 * Dev-only: POST /api/testing-feedback appends NDJSON to data/testing-feedback.ndjson
 * GET /api/testing-feedback returns the full log.
 */
export function testingFeedbackApiPlugin() {
  return {
    name: 'armada-testing-feedback-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url?.split('?')[0]
        if (url !== '/api/testing-feedback') {
          next()
          return
        }

        res.setHeader('Cache-Control', 'no-store')

        if (req.method === 'GET') {
          try {
            await ensureLogFile()
            let raw = ''
            try {
              raw = await readFile(TESTING_FEEDBACK_LOG_PATH, 'utf8')
            } catch {
              raw = ''
            }
            res.statusCode = 200
            res.setHeader('Content-Type', 'application/x-ndjson; charset=utf-8')
            res.end(raw)
          } catch (error) {
            res.statusCode = 500
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: String(error) }))
          }
          return
        }

        if (req.method === 'POST') {
          try {
            const body = await readRequestBody(req)
            if (!body.trim()) {
              res.statusCode = 400
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ error: 'Empty body' }))
              return
            }
            JSON.parse(body)
            await appendLogLine(body.trim())
            console.log('[TestingFeedback] appended to', TESTING_FEEDBACK_LOG_PATH)
            res.statusCode = 204
            res.end()
          } catch (error) {
            res.statusCode = 500
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: String(error) }))
          }
          return
        }

        res.statusCode = 405
        res.setHeader('Allow', 'GET, POST')
        res.end()
      })
    },
  }
}
