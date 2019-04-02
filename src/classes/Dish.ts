import { Template } from '.'
import { DishObject, Chat, Conversation, Element } from '../types'

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
  isInOrder (): boolean {
    return this.numberInOrder > 0 && this.getTotalPrice() > 0.0
  }
  getTitle (maxLength: number = 20): string {
    return this.title.slice(0, maxLength).trim()
  }
  getTotalPrice (): number {
    return this.numberInOrder > 0 ? this.price * this.numberInOrder : this.price
  }
  getTotalPriceString (currency: string = '€'): string {
    return `${this.getTotalPrice().toFixed(2)}${currency}`
  }
  getPriceListString (): string {
    return this.isInOrder()
      ? `* (${this.numberInOrder}) ${this.title} ${this.getTotalPriceString()}\n`
      : `* ${this.title} ${this.getTotalPriceString()}\n`
  }
  getElementData (): Element {
    return {
      title: this.title,
      subtitle: this.description,
      quantity: this.numberInOrder,
      price: this.getTotalPrice(),
      currency: 'EUR',
      image_url: this.photo
    }
  }
  static getSelectedDishesPriceListString (dishesMap: Map<string, Dish>, currency: string = '€'): string {
    if (dishesMap.size === 0) return 'No dishes!'
    let result = 'Selected dishes:\n\n'
    for (const dish of dishesMap.values()) result += dish.getPriceListString()
    result += `\nTotal price: ${Dish.getDishesMapTotalPriceString(dishesMap, currency)}`
    return result
  }
  static getDishesMapTotalPrice (dishesMap: Map<string, Dish>): number {
    return Array.from(dishesMap.values()).reduce((total: number, current: Dish) => total + current.getTotalPrice(), 0.0)
  }
  static getDishesMapTotalPriceString (dishesMap: Map<string, Dish>, currency: string = '€'): string {
    return `${Dish.getDishesMapTotalPrice(dishesMap).toFixed(2)}${currency}`
  }
  static async showDishesMapInformation (conversation: Conversation | Chat, dishesMap: Map<string, Dish>): Promise<any> {
    return dishesMap.size > 0
      ? conversation.sendGenericTemplate(Template.getDishesMapGenericMessage(dishesMap))
      : conversation.say('No dishes!')
  }
}
