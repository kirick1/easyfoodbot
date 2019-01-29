import Dish from '../classes/Dish'

export interface OrderObject {
  id: number
  user_id: number
  total_price: number
  number_of_repetitions: number
  type_of_repetitions: number
  status: string
  is_completed: boolean
  dishes?: Map<string, Dish>
}
