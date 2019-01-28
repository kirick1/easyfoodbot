interface DishObject {
  id: number
  title: string
  description: string
  photo: string
  price: number
  number?: number
}

export default class Dish {
  id: number
  title: string
  description: string
  photo: string
  price: number
  number: number
  constructor (dish: DishObject, numberOfDishes?: number) {
    this.id = dish.id
    this.title = dish.title
    this.description = dish.description
    this.photo = dish.photo
    this.price = dish.price
    this.number = dish.number || 0
    if (numberOfDishes) this.number = numberOfDishes || this.number
  }
  getTotalPrice (): number {
    return this.number * this.price
  }
  static getSubmittedDishesPriceListString (dishesMap: Map<string, Dish> = new Map()): string {
    if (dishesMap.size === 0) return 'Selected dishes not found!'
    let result = 'Selected dishes:\n\n'
    for (const dish of dishesMap.values()) if (dish.number > 0) result += `${dish.number} ${dish.title} ${dish.getTotalPrice().toFixed(2)}€\n`
    result += `\nTotal price: ${Dish.calculateTotalPrice(dishesMap).toFixed(2)}€`
    return result
  }
  static calculateTotalPrice (dishesMap: Map<string, Dish> = new Map()): number {
    let total = 0.0
    if (dishesMap.size === 0) return total
    for (const dish of dishesMap.values()) total += dish.getTotalPrice()
    return total
  }
}
