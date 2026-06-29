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

type AnyResponse =
  | GoodbyeResponse
  | HelloResponse
  | UiResponse
  | TriggerResponse
  | ErrorResponse

export async function onReq(
  reqMsg: IncomingMessage,
  rspMsg: ServerResponse,
): Promise<void> {
  try {
    await route(reqMsg, rspMsg)
  } catch (err) {
    const msg = `server error; ${err instanceof Error ? err.stack : err}`
    console.error(msg)
    writeJson<ErrorResponse>(500, {error: msg, status: 500}, rspMsg)
  }
}

async function route(
  reqMsg: IncomingMessage,
  rspMsg: ServerResponse,
): Promise<void> {
  const endpoint = reqMsg.url?.slice(1) as Endpoint | undefined

  let rsp: AnyResponse
  switch (endpoint) {
    case Endpoint.Hello:
      rsp = await routeHello(reqMsg)
      break
    case Endpoint.Goodbye:
      rsp = await routeGoodbye(reqMsg)
      break
    case Endpoint.OnMenuNewPost:
      rsp = await routeMenuNewPost()
      break
    default:
      endpoint satisfies undefined
      rsp = {error: 'not found', status: 404}
      break
  }

  writeJson<PartialJsonValue>('status' in rsp ? rsp.status : 200, rsp, rspMsg)
}

async function routeGoodbye(reqMsg: IncomingMessage): Promise<GoodbyeResponse> {
  const msg = await readJson<GoodbyeRequest>(reqMsg)
  if (!context.userId) throw Error('no user ID')
  console.log(`user ${context.username} disconnected session ${msg.uuid}`)
  return {}
}

async function routeHello(reqMsg: IncomingMessage): Promise<HelloResponse> {
  const msg = await readJson<HelloRequest>(reqMsg)
  if (!context.userId) throw Error('no user ID')
  console.log(`user ${context.username} connected session ${msg.uuid}`)
  return {}
}

async function routeMenuNewPost(): Promise<UiResponse> {
  const post = await reddit.submitCustomPost({title: context.appName})
  return {
    showToast: {text: `Post ${post.id} created.`, appearance: 'success'},
    navigateTo: post.url,
  }
}

async function readJson<T>(req: IncomingMessage): Promise<T> {
  const chunks: Uint8Array[] = []
  req.on('data', chunk => chunks.push(chunk))
  await once(req, 'end')
  return JSON.parse(`${Buffer.concat(chunks)}`)
}

function writeJson<T extends PartialJsonValue>(
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
