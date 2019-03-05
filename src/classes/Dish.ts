import { DishObject } from '../types'

export class Dish {
  id: number
  title: string
  description: string
  photo: string
  price: number
  numberInOrder: number
  constructor (dish: DishObject, numberInOrder?: number) {
    this.id = dish.id
    this.title = dish.title
    this.description = dish.description
    this.photo = dish.photo
    this.price = dish.price
    this.numberInOrder = dish.numberInOrder || 1
    if (numberInOrder !== null && numberInOrder !== undefined) this.numberInOrder = numberInOrder || this.numberInOrder
  }
  getTitle (maxLength: number = 20): string {
    return this.title.slice(0, maxLength).trim()
  }
  getTotalPrice (): number {
    return this.price * this.numberInOrder
  }
  static getSubmittedDishesPriceListString (dishesMap: Map<string, Dish> = new Map()): string {
    if (dishesMap.size === 0) return 'Dishes not found!'
    let result = 'Select dishes:\n\n'
    for (const dish of dishesMap.values()) if (dish.numberInOrder > 0) result += `${dish.numberInOrder} ${dish.title} ${dish.getTotalPrice().toFixed(2)}€`
    result += `\nTotal price: ${Dish.getDishesMapTotalPrice(dishesMap).toFixed(2)}€`
    return result
  }
  static getDishesMapTotalPrice (dishesMap: Map<string, Dish> = new Map()): number {
    let total = 0.0
    for (const dish of dishesMap.values()) total += dish.getTotalPrice()
    return total
  }
}
