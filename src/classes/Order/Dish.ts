import { Template, Element } from '..'
import { Information, Messages } from '../../config'
import { IChat, IConversation } from '../../types'

export interface IDish {
  id: number
  title: string
  description: string
  photo: string
  price: number
  informationURL?: string
  numberInOrder?: number
}

export class Dish implements IDish {
  id: number
  title: string
  description: string
  photo: string
  price: number = 0.0
  informationURL: string = Information.DEFAULT_INFORMATION_URL
  numberInOrder: number = 0
  constructor (dish: IDish, numberInOrder: number = 0) {
    this.id = dish.id
    this.title = dish.title
    this.description = dish.description
    this.photo = dish.photo
    this.price = dish.price || 0.0
    this.informationURL = dish.informationURL || Information.DEFAULT_INFORMATION_URL
    this.numberInOrder = dish.numberInOrder || 0
    if (numberInOrder > 0) this.numberInOrder = numberInOrder
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
  getInformationURL (): string {
    return this.informationURL ? this.informationURL : Information.DEFAULT_INFORMATION_URL
  }
  getTotalPriceString (): string {
    return `${this.getTotalPrice().toFixed(2)}${Information.CURRENCY_SYMBOL}`
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
      currency: Information.CURRENCY,
      image_url: this.photo
    }
  }
  static getSelectedDishesPriceListString (dishesMap: Map<string, Dish>, currency: string = Information.CURRENCY_SYMBOL): string {
    if (dishesMap.size === 0) return Messages.NO_DISHES
    let result = 'Selected dishes:\n\n'
    for (const dish of dishesMap.values()) result += dish.getPriceListString()
    result += `\nTotal price: ${Dish.getDishesMapTotalPriceString(dishesMap, currency)}`
    return result
  }
  static getDishesMapTotalPrice (dishesMap: Map<string, Dish>): number {
    return Array.from(dishesMap.values()).reduce((total: number, current: Dish) => total + current.getTotalPrice(), 0.0)
  }
  static getDishesMapTotalPriceString (dishesMap: Map<string, Dish>, currency: string = Information.CURRENCY_SYMBOL): string {
    return `${Dish.getDishesMapTotalPrice(dishesMap).toFixed(2)}${currency}`
  }
  static async showDishesMapInformation (conversation: IConversation | IChat, dishesMap: Map<string, Dish>): Promise<any> {
    return dishesMap.size > 0
      ? conversation.sendGenericTemplate(Template.getDishesMapGenericMessage(dishesMap))
      : conversation.say(Messages.NO_DISHES)
  }
}
