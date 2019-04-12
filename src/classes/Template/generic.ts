export interface PostbackButton {
  type: string
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
