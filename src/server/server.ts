import {once} from 'node:events'
import type {IncomingMessage, ServerResponse} from 'node:http'
import {context, reddit} from '@devvit/web/server'
import type {
  PartialJsonValue,
  TriggerResponse,
  UiResponse,
} from '@devvit/web/shared'
import {
  Endpoint,
  type ErrorResponse,
  type GoodbyeRequest,
  type GoodbyeResponse,
  type HelloRequest,
  type HelloResponse,
} from '../shared/api.ts'

export async function serverOnRequest(
  req: IncomingMessage,
  rsp: ServerResponse,
): Promise<void> {
  try {
    await onRequest(req, rsp)
  } catch (err) {
    const msg = `server error; ${err instanceof Error ? err.stack : err}`
    console.error(msg)
    writeJSON<ErrorResponse>(500, {error: msg, status: 500}, rsp)
  }
}

async function onRequest(
  req: IncomingMessage,
  rsp: ServerResponse,
): Promise<void> {
  const endpoint = req.url?.slice(1) as Endpoint | undefined

  let body: TriggerResponse | ErrorResponse
  switch (endpoint) {
    case Endpoint.Hello:
      body = await onHello(req)
      break
    case Endpoint.Goodbye:
      body = await onGoodbye(req)
      break
    case Endpoint.OnMenuNewPost:
      body = await onMenuNewPost(req)
      break
    default:
      endpoint satisfies undefined
      body = {error: 'not found', status: 404}
      break
  }

  writeJSON<PartialJsonValue>('status' in body ? body.status : 200, body, rsp)
}

async function onGoodbye(req: IncomingMessage): Promise<GoodbyeResponse> {
  const msg = await readJSON<GoodbyeRequest>(req)
  if (!context.userId) throw Error('no user ID')
  console.log(`user ${context.username} disconnected session ${msg.uuid}`)
  return {}
}

async function onHello(req: IncomingMessage): Promise<HelloResponse> {
  const msg = await readJSON<HelloRequest>(req)
  if (!context.userId) throw Error('no user ID')
  console.log(`user ${context.username} connected session ${msg.uuid}`)
  return {}
}

async function onMenuNewPost(_req: IncomingMessage): Promise<UiResponse> {
  const post = await reddit.submitCustomPost({title: context.appName})
  return {
    showToast: {text: `Post ${post.id} created.`, appearance: 'success'},
    navigateTo: post.url,
  }
}

async function readJSON<T>(req: IncomingMessage): Promise<T> {
  const chunks: Uint8Array[] = []
  req.on('data', chunk => chunks.push(chunk))
  await once(req, 'end')
  return JSON.parse(`${Buffer.concat(chunks)}`)
}

function writeJSON<T extends PartialJsonValue>(
  status: number,
  json: Readonly<T>,
  rsp: ServerResponse,
): void {
  const body = JSON.stringify(json)
  const len = Buffer.byteLength(body)
  rsp.writeHead(status, {
    'Content-Length': len,
    'Content-Type': 'application/json',
  })
  rsp.end(body)
}
