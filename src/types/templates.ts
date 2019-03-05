export interface PostbackButton {
  type: string
  title: string
  payload: string
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
export interface Element {
  title: string
  subtitle?: string
  quantity?: number
  price: number
  currency?: string
  image_url?: string
}
export interface Address {
  street_1: string
  street_2?: string
  city: string
  postal_code: string
  state: string
  country: string
}
export interface Summary {
  subtotal?: number
  shipping_cost?: number
  total_tax?: number
  total_cost: number
}
export interface ReceiptTemplate {
  template_type: string
  recipient_name: string
  merchant_name?: string
  order_number: string
  currency: string
  payment_method: string
  timestamp?: string
  elements?: Array<Element>
  address?: Address
  summary: Summary
}
