import db from '../config/database'
import Dish from './Dish'

interface DishesSetObject {
  id: number
  title: string
  description?: string
  dishes: Map<string, Dish>
}

export default class DishesSet {
  id: number
  title: string
  description?: string
  dishes: Map<string, Dish>
  constructor (dishesSet: DishesSetObject) {
    this.id = dishesSet.id
    this.title = dishesSet.title
    this.description = dishesSet.description
    this.dishes = dishesSet.dishes
  }
  async getDishes () {
    if (this.dishes.size > 0) return this.dishes
    try {
      const { rows: setDishesIDs } = await db.query('SELECT dish_id FROM set_dishes WHERE set_id = $1', [this.id])
      if (!setDishesIDs || setDishesIDs.length < 1) return this.dishes
      for (const { dish_id } of setDishesIDs) {
        if (dish_id) {
          const { rows: [dish] } = await db.query('SELECT id, title, description, photo, price FROM dishes WHERE id = $1', [parseInt(dish_id, 10)])
          if (dish && typeof dish.title === 'string') this.dishes.set(dish.title, new Dish(dish))
        }
      }
      return this.dishes
    } catch (error) {
      console.error('[BOT] [SET] ERROR GETTING SET DISHES: ', error)
      throw Error(error)
    }
  }
  getInformation (): DishesSetObject {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      dishes: this.dishes
    }
  }
  static async getAll () {
    const map = new Map()
    try {
      const { rows: sets } = await db.query('SELECT id, title, description FROM sets')
      if (!sets || sets.length < 1) return map
      for (const setData of sets) {
        const set = new DishesSet(setData)
        const title = set.title.slice(0, 20)
        await set.getDishes()
        map.set(title, set)
      }
      return map
    } catch (error) {
      console.error('[BOT] [SET] ERROR GETTING ALL SETS: ', error)
      throw Error(error)
    }
  }
}
