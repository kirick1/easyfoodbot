import Dish from '../../classes/Dish'

export interface DishesSetObject {
  id: number
  title: string
  dishes?: Map<string, Dish>
}
