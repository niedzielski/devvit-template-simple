import type {UUID} from './uuid.ts'

/** Generic error detail for all responses. */
export type ErrorResponse = {error: string; status: number}

/** Disconnect a user session (may not be sent). */
export type GoodbyeRequest = {uuid: UUID}
export type GoodbyeResponse = object | ErrorResponse

/** Connect a user session. */
export type HelloRequest = {uuid: UUID}
export type HelloResponse = object | ErrorResponse

export type Endpoint = (typeof Endpoint)[keyof typeof Endpoint]
export const Endpoint = {
  Goodbye: 'api/goodbye',
  Hello: 'api/hello',
  OnMenuNewPost: 'internal/on/menu/new-post',
} as const
