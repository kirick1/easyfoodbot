import { PostbackButton } from './buttons'

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
