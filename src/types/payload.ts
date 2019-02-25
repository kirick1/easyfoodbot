export interface Payload {
  message: {
    text: string
  }
  postback?: {
    payload: string
  }
}
