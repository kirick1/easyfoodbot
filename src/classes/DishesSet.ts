import db from '../config/database'
import Dish from './Dish'
import { DishesSetObject } from '../declarations/dishesSet'

export default class DishesSet {
  id: number
  title: string
  dishes: Map<string, Dish>
  constructor (dishesSet: DishesSetObject) {
    this.id = dishesSet.id
    this.title = dishesSet.title
    this.dishes = dishesSet.dishes || new Map()
  }
  getTitle (maxLength: number = 20): string {
    return this.title.slice(0, maxLength).trim()
  }
  getTotalPrice (): number {
    let total = 0.0
    for (const dish of this.dishes.values()) total += dish.getTotalPrice()
    return total
  }
  async getDishes () {
    if (this.dishes.size > 0) return this.dishes
    try {
      const { rows: setDishesIDs } = await db.query('SELECT dish_id FROM set_dishes WHERE set_id = $1', [this.id])
      for (const { dish_id } of setDishesIDs) {
        const { rows: [dishData] } = await db.query('SELECT id, title, description, photo, price FROM dishes WHERE id = $1', [parseInt(dish_id, 10)])
        if (dishData) {
          const dish = new Dish(dishData)
          this.dishes.set(dish.getTitle(), dish)
        }
      }
      return this.dishes
    } catch (error) {
      console.error('[BOT] [DISHES SET] ERROR GETTING SET DISHES: ', error)
      return this.dishes
    }
  }
  static async getAllDishesSets () {
    const map: Map<string, DishesSet> = new Map()
    try {
      const { rows: dishesSets } = await db.query('SELECT id, title FROM sets')
      for (const dishesSetData of dishesSets) {
        const dishesSet = new DishesSet(dishesSetData)
        await dishesSet.getDishes()
        map.set(dishesSet.getTitle(), dishesSet)
      }
      return map
    } catch (error) {
      console.error('[BOT] [DISHES SET] ERROR GETTING ALL DISHES SETS: ', error)
      return map
    }
  }
}
