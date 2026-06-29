import assert from 'node:assert/strict'
import {createServer} from 'node:http'
import type {AddressInfo, Server} from 'node:net'
import {after, before, test} from 'node:test'
import {type Context, runWithContext} from '@devvit/web/server'
import {
  Endpoint,
  type ErrorResponse,
  type HelloRequest,
  type HelloResponse,
} from '../shared/api.ts'
import {onReq} from './server.ts'

let server: Server
let serverURL: string

before(async () => {
  server = createServer(async (req, rsp) => {
    await runWithContext(
      {userId: 't2_123', username: 'username'} as unknown as Context,
      () => onReq(req, rsp),
    )
  })
  await new Promise<void>(resolve => {
    server.listen(0, '127.0.0.1', () => resolve())
  })
  const info = server.address() as AddressInfo
  serverURL = `http://127.0.0.1:${info.port}`
})

after(async () => {
  if (!server.listening) return
  await new Promise<void>((resolve, reject) => {
    server.close(err => (err ? reject(err) : resolve()))
  })
})

test('hello', async () => {
  const req: HelloRequest = {uuid: '0-1-2-3-4-5'}
  const rsp = await fetch(`${serverURL}/${Endpoint.Hello}`, {
    body: JSON.stringify(req),
    method: 'POST',
  })
  assert.equal(rsp.status, 200)
  assert.equal(rsp.headers.get('Content-Type'), 'application/json')
  assert.deepEqual<HelloResponse>(await rsp.json(), {})
})

test('404', async () => {
  const rsp = await fetch(serverURL)
  assert.equal(rsp.status, 404)
  assert.deepEqual<ErrorResponse>(await rsp.json(), {
    error: 'not found',
    status: 404,
  })
})
