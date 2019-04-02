import { MessagePayload, PostbackPayload } from './objects'

export interface BotOptions {
  accessToken: string
  verifyToken: string
  appSecret: string
  webhook: string
  broadcastEchoes: boolean
  graphApiVersion: string
}
export interface Bot {
  start (port?: number | 3000): void
  close (): Promise<any>
  on (event: string, handler: Function): void
  sendTextMessage (recipientId: Recipient | string, text: string, quickReplies: Array<QuickReply | object>, options?: SendMessageOptions): Promise<void>
  sendButtonTemplate (recipientId: Recipient | string, text: string, buttons: Array<string | Button>, options?: SendMessageOptions): Promise<void>
  sendGenericTemplate (recipientId: Recipient | string, elements: Array<Element>, options?: SendMessageOptions): Promise<void>
  sendListTemplate (recipientId: Recipient | string, elements: Array<Element>, buttons: Array<string | Button>, options?: SendMessageOptions): Promise<void>
  sendTemplate (recipientId: Recipient | string, payload: object, options?: SendMessageOptions): Promise<void>
  sendAttachment (recipientId: Recipient | string, type: AttachmentType | string, url: string, quickReplies: Array<QuickReply>, options?: SendMessageOptions): Promise<void>
  sendAction (recipientId: Recipient | string, action: Action | string, options?: SendMessageOptions): Promise<void>
  sendMessage (recipientId: Recipient | string, message: Message, options?: SendMessageOptions): Promise<void>
  sendRequest (body: object, endpoint: string, method: string): Promise<void>
  sendThreadRequest (body: object, method: string): Promise<void>
  sendProfileRequest (body: object, method: string): Promise<void>
  sendTypingIndicator (recipientId: Recipient | string, milliseconds: number): Promise<void>
  getUserProfile (userId: string): Promise<ProfileObject>
  setGreetingText (text: string | Array<object>): void
  setGetStartedButton (action: string | Function): void
  deleteGetStartedButton (): void
  setPersistentMenu (buttons: Array<string | object>, disableInput?: boolean | false): void
  deletePersistentMenu (): void
  say (recipientId: Recipient | string, message: string | Message | Array<any>, options?: SendMessageOptions): Promise<void>
  hear (keywords: string | RegExp | Array<any>, callback: Function): any
  module (factory: Function): any
  conversation (recipientId: Recipient | string, factory: Function): any
  handleFacebookData (data: object | any): any
}

export type AttachmentType = 'image' | 'audio' | 'video' | 'file'
export type Action = 'mark_seen' | 'typing_on' | 'typing_off'
export type Button = object | any
export type Attachment = object | any

export interface Recipient {
  id: string
}
export interface QuickReply {
  content_type: string
  title: string
  payload: string | number
  image_url?: string
}
export interface SendMessageOptions {
  typing?: boolean | number | false
  messagingType?: string | 'RESPONSE'
  notificationType?: string
  tag?: string
  onDelivery?: (payload: MessagePayload | PostbackPayload, chat: Chat, data?: any) => void
  onRead?: (payload: MessagePayload | PostbackPayload, chat: Chat, data?: any) => void
}
export interface Message {
  text: string
  attachment: Attachment
  quick_reply?: Array<QuickReply>
  metadata?: string
}
export interface Element {
  title: string
  subtitle?: string
  image_url?: string
  default_action?: object
  buttons: Array<Button>
}
export interface ProfileObject {
  id: number
  first_name: string
  last_name: string
  profile_pic: string
  locale: string
  gender: string
  messenger_id?: number
}
export interface Chat {
  bot: Bot
  userId: string
  say (message: Message | string | object | Array<any>, options?: SendMessageOptions): Promise<void>
  sendTextMessage (text: string, quickReplies: Array<QuickReply | string>, options?: SendMessageOptions): Promise<void>
  sendButtonTemplate (text: string, buttons: Array<string | Button>, options?: SendMessageOptions): Promise<void>
  sendGenericTemplate (cards: Array<Element>, options?: SendMessageOptions | Function): Promise<void>
  sendListTemplate (elements: Array<Element>, buttons: Array<string | Button>, options?: SendMessageOptions): Promise<void>
  sendTemplate (payload: object, options?: SendMessageOptions): Promise<void>
  sendAttachment (type: AttachmentType, url: string, quickReplies: Array<QuickReply>, options?: SendMessageOptions): Promise<void>
  sendAction (action: string, options?: SendMessageOptions): Promise<void>
  sendMessage (message: Message, options?: SendMessageOptions): Promise<void>
  sendRequest (body: object, endpoint: string, method: string): Promise<void>
  sendTypingIndicator (milliseconds: number): Promise<void>
  getUserProfile (): Promise<ProfileObject>
  conversation (factory: Function): void
}
export interface Conversation extends Chat {
  bot: Bot
  userId: string
  ask (question: string | object | Array<any>, answer: Function, callbacks?: Array<Function>, options?: SendMessageOptions): Promise<void>
  respond (payload: object, data: object): Promise<void>
  isActive (): boolean
  isWaitingForAnswer (): boolean
  stopWaitingForAnswer (): void
  start (): void
  end (): Promise<void>
  get (property: string): any
  set (property: string, value: any): any
}
