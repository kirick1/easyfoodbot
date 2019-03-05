import { Dish } from '../classes'
import { Status, TypeOfRepetitions } from '.'

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
export interface OrderObject {
  id: number
  user_id: number
  total_price: number
  number_of_repetitions: number
  type_of_repetitions: TypeOfRepetitions
  status: Status
  is_completed: boolean
  dishes?: Map<string, Dish>
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
export interface Payload {
  message: {
    text: string
  }
  postback?: {
    payload: string
  }
}
