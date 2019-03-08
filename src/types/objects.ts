import { Dish } from '../classes'

export interface DishObject {
  id: number
  title: string
  description: string
  photo: string
  price: number
  numberInOrder?: number
}
export interface DishesSetObject {
  id: number
  title: string
  dishes?: Map<string, Dish>
}

export type Status = 'new' | 'progress' | 'done' | 'canceled'
export type TypeOfRepetitions = 'immediate'

export interface OrderObject {
  id: number | null
  user_id: number | null
  total_price: number | null
  number_of_repetitions: number | null
  type_of_repetitions: TypeOfRepetitions
  status: Status
  is_completed: boolean
  dishes?: Map<string, Dish> | null
}
export interface UserObject {
  messenger_id: number | null
  first_name: string | null
  last_name: string | null
  profile_pic: string | null
  locale: string | null
  gender: string | null
  id: number | null
  email: string | null
  phone: string | null
  profile_url: string | null
}
export interface MessagePayload {
  message: {
    text: string
  }
}
export interface PostbackPayload {
  postback: {
    payload: string
  }
}
