import { CONTENT_TYPE } from '.'

export interface Attachment {
  title: string
  url: string
  type: CONTENT_TYPE
  payload: {
    coordinates: {
      lat: number
      long: number
    }
  }
}

export interface MessagePayload {
  message: {
    text: string
  }
}

export interface LocationPayload {
  message: {
    attachments: Array<Attachment>
  }
}

export interface PostbackPayload {
  postback: {
    payload: string
  }
}
