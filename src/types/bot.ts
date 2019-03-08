export interface Bot {
  accessToken: string
  verifyToken: string
  appSecret: string
  webhook: string | '/webhook'
  broadcastEchoes: boolean | false
  graphApiVersion: string | 'v2.12'
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
  onDelivery?: Function
  onRead?: Function
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
  say (message: any, options?: SendMessageOptions): Promise<void>
  sendTextMessage (text: string, quickReplies: Array<QuickReply | string>, options?: SendMessageOptions): Promise<void>
  sendButtonTemplate (text: string, buttons: Array<any>, options?: SendMessageOptions): Promise<void>
  sendGenericTemplate (cards: Array<Element>, options?: SendMessageOptions | Function): Promise<any>
  sendListTemplate (elements: Array<Element>, buttons: Array<any>, options?: SendMessageOptions): Promise<any>
  sendTemplate (payload: object, options?: SendMessageOptions): Promise<any>
  sendAttachment (type: string, url: string, quickReplies: Array<QuickReply>, options?: SendMessageOptions): Promise<any>
  sendAction (action: string, options?: SendMessageOptions): Promise<any>
  sendMessage (message: object, options?: SendMessageOptions): Promise<any>
  sendRequest (body: object, endpoint: string, method: string): Promise<any>
  sendTypingIndicator (milliseconds: number): Promise<any>
  getUserProfile (): Promise<ProfileObject>
  conversation (factory: Function): void
}
export interface Conversation extends Chat {
  ask (question: string | object | Array<any>, answer: Function, callbacks?: Array<Function>, options?: SendMessageOptions): any
  respond (payload: object, data: object): any
  isActive (): boolean
  isWaitingForAnswer (): boolean
  stopWaitingForAnswer (): any
  start (): void
  end (): Promise<void>
  get (property: string): any
  set (property: string, value: any): any
}
