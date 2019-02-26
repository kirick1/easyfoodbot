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
  say (message: any, options?: SendMessageOptions): any
  sendTextMessage (text: string, quickReplies: Array<QuickReply | string>, options?: SendMessageOptions): any
  sendButtonTemplate (text: string, buttons: Array<any>, options?: SendMessageOptions): any
  sendGenericTemplate (cards: Array<Element>, options?: SendMessageOptions | Function): any
  sendListTemplate (elements: Array<Element>, buttons: Array<any>, options?: SendMessageOptions): any
  sendTemplate (payload: object, options?: SendMessageOptions): any
  sendAttachment (type: string, url: string, quickReplies: Array<QuickReply>, options?: SendMessageOptions): any
  sendAction (action: string, options?: SendMessageOptions): any
  sendMessage (message: object, options?: SendMessageOptions): any
  sendRequest (body: object, endpoint: string, method: string): Promise<any>
  sendTypingIndicator (milliseconds: number): any
  getUserProfile (): Promise<object>
  conversation (factory: Function): any
}
