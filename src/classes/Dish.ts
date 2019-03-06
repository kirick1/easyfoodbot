import { DishObject } from '../types'

export class Dish {
  id: number
  title: string
  description: string
  photo: string
  price: number = 0.0
  numberInOrder: number = 0
  constructor (dish: DishObject, numberInOrder: number | null = null) {
    this.id = dish.id
    this.title = dish.title
    this.description = dish.description
    this.photo = dish.photo
    this.price = dish.price || 0.0
    this.numberInOrder = dish.numberInOrder || 0
    if (numberInOrder !== null) this.numberInOrder = numberInOrder || this.numberInOrder
  }
  inOrder (): boolean {
    return this.numberInOrder > 0 && this.getTotalPrice() > 0.0
  }
  addOne (): Dish {
    this.numberInOrder += 1
    return this
  }
  getTitle (maxLength: number = 20): string {
    return this.title.slice(0, maxLength).trim()
  }
  getTotalPrice (): number {
    return this.numberInOrder > 0 ? this.price * this.numberInOrder : this.price
  }
  getPriceString (currency: string = '€'): string {
    return this.inOrder()
      ? `${this.numberInOrder} ${this.title} ${this.getTotalPrice().toFixed(2)}${currency}`
      : `${this.title} ${this.getTotalPrice().toFixed(2)}${currency}`
  }
  static getSubmittedDishesPriceListString (dishesMap: Map<string, Dish>, currency: string = '€'): string {
    if (dishesMap.size === 0) return 'No dishes!'
    let result = 'Selected dishes:\n\n'
    for (const dish of dishesMap.values()) result += dish.getPriceString()
    result += `\nTotal price: ${Dish.getDishesMapTotalPrice(dishesMap).toFixed(2)}${currency}`
    return result
  }
  static getDishesMapTotalPrice (dishesMap: Map<string, Dish>): number {
    return Array.from(dishesMap.values()).reduce((total: number, current: Dish) => total + current.getTotalPrice(), 0.0)
  }
}
