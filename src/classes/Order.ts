import db from '../config/database'
import Dish from './Dish'
import { OrderObject } from '../declarations/order'
import { getSelectedDishesFromSelectedDishesSet, selectDishesSet } from '../controllers/selection'

export default class Order {
  id: number
  user_id: number
  total_price: number
  number_of_repetitions: number
  type_of_repetitions: number
  status: string
  is_completed: boolean
  dishes?: Map<string, Dish>
  constructor (order: OrderObject) {
    this.id = order.id
    this.user_id = order.user_id
    this.total_price = order.total_price
    this.number_of_repetitions = order.number_of_repetitions
    this.type_of_repetitions = order.type_of_repetitions
    this.status = order.status
    this.is_completed = order.is_completed
    this.dishes = order.dishes && order.dishes.size > 0 ? order.dishes : this.dishes
  }
}
