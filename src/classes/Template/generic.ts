import { ButtonType } from '../../types'

export interface PostbackButton {
  type: ButtonType
  title: string
  url?: string
  payload?: string
}

export interface GenericTemplate {
  title: string
  subtitle?: string
  image_url?: string
  default_action?: {
    type: string
    title: string
    url: string
  }
  buttons: Array<PostbackButton>
}
