import { Chat, SendMessageOptions } from './chat'

export interface Conversation extends Chat {
  ask (question: string | object | Array<any>, answer: Function, callbacks?: Array<Function>, options?: SendMessageOptions): any
  respond (payload: object, data: object): any
  isActive (): boolean
  isWaitingForAnswer (): boolean
  stopWaitingForAnswer (): any
  start (): any
  end (): any
  get (property: string): any
  set (property: string, value: any): any
}
