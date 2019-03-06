import db from '../database'
import { Dish } from '.'
import { DishesSetObject } from '../types'

export class DishesSet {
  id: number
  title: string
  dishes: Map<string, Dish> = new Map<string, Dish>()
  constructor (dishesSet: DishesSetObject, dishes?: Map<string, Dish>) {
    this.id = dishesSet.id
    this.title = dishesSet.title
    this.dishes = dishesSet.dishes && dishesSet.dishes.size > 0 ? dishesSet.dishes : new Map<string, Dish>()
    if (dishes && dishes.size > 0) this.dishes = dishes
  }
  getTitle (maxLength: number = 20): string {
    return this.title.slice(0, maxLength).trim()
  }
  getTotalPrice (): number {
    return Dish.getDishesMapTotalPrice(this.dishes)
  }
  async getDishes (): Promise<Map<string, Dish>> {
    if (this.dishes.size > 0) return this.dishes
    const { rows: setDishesIDs } = await db.query('SELECT dish_id FROM set_dishes WHERE set_id = $1', [this.id])
    for (const { dish_id } of setDishesIDs) {
      const { rows: [dishData] } = await db.query('SELECT id, title, description, photo, price FROM dishes WHERE id = $1', [parseInt(dish_id, 10)])
      const dish = new Dish(dishData)
      this.dishes.set(dish.getTitle(), dish)
    }
    return this.dishes
  }
  static async getAllDishesSets (): Promise<Map<string, DishesSet>> {
    const map: Map<string, DishesSet> = new Map()
    const { rows: dishesSets } = await db.query('SELECT id, title FROM sets')
    for (const dishesSetData of dishesSets) {
      const dishesSet = new DishesSet(dishesSetData)
      await dishesSet.getDishes()
      map.set(dishesSet.getTitle(), dishesSet)
    }
    return map
  }
}
