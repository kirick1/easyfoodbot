import { Dish } from '../../classes'
import { Status, TypeOfRepetitions } from '../enums'

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
