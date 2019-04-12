export enum CONTENT_TYPE {
  LOCATION = 'location',
  PHONE_NUMBER = 'user_phone_number',
  EMAIL = 'user_email'
}
export interface Attachment {
  title: string
  url: string
  type: CONTENT_TYPE.LOCATION
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
