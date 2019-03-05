import { ProfileObject } from '.'

export interface BootbotObject {
  accessToken: string
  verifyToken: string
  appSecret: string
  webhook: string
  broadcastEchoes: boolean
  graphApiVersion: string
  start (port?: number): void
  close (): Promise<any>
  setGreetingText (text: string | Array<object>): void
  setGetStartedButton (action: string | Function): void
  deleteGetStartedButton (): void
  setPersistentMenu (buttons: Array<string | object>, disableInput?: boolean): void
  deletePersistentMenu (): void
  on (event: string, handler: Function): void
}
export interface SendMessageOptions {
  typing?: boolean | number
  onDelivery?: Function
  onRead?: Function
}
export interface QuickReply {
  content_type: string
  title: string
  payload: string | number
  image_url?: string
}
export interface Message {
  text: string
  attachment: object
  quick_reply?: Array<QuickReply>
  metadata?: string
}
export interface Element {
  title: string
  subtitle?: string
  image_url?: string
  default_action?: object
  buttons: Array<any>
}
export interface Chat {
  say (message: any, options?: SendMessageOptions): Promise<any>
  sendTextMessage (text: string, quickReplies: Array<QuickReply | string>, options?: SendMessageOptions): Promise<any>
  sendButtonTemplate (text: string, buttons: Array<any>, options?: SendMessageOptions): Promise<any>
  sendGenericTemplate (cards: Array<Element>, options?: SendMessageOptions | Function): Promise<any>
  sendListTemplate (elements: Array<Element>, buttons: Array<any>, options?: SendMessageOptions): Promise<any>
  sendTemplate (payload: object, options?: SendMessageOptions): Promise<any>
  sendAttachment (type: string, url: string, quickReplies: Array<QuickReply>, options?: SendMessageOptions): Promise<any>
  sendAction (action: string, options?: SendMessageOptions): Promise<any>
  sendMessage (message: object, options?: SendMessageOptions): Promise<any>
  sendRequest (body: object, endpoint: string, method: string): Promise<any>
  sendTypingIndicator (milliseconds: number): Promise<any>
  getUserProfile (): Promise<ProfileObject>
  conversation (factory: Function): any
}
export interface Conversation extends Chat {
  ask (question: string | object | Array<any>, answer: Function, callbacks?: Array<Function>, options?: SendMessageOptions): any
  respond (payload: object, data: object): any
  isActive (): boolean
  isWaitingForAnswer (): boolean
  stopWaitingForAnswer (): any
  start (): any
  end (): Promise<any>
  get (property: string): any
  set (property: string, value: any): any
}
