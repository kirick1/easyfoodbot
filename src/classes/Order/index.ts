import db from '../../database'
import { IChat } from '../../types'
import { Selection } from './Selection'
import { Dish, User, Template, Location, Conversation } from '..'

export enum OrderStatus {
  NEW = 'new',
  PROGRESS = 'progress',
  DONE = 'done',
  CANCELED = 'canceled'
}
export enum OrderTypeOfRepetitions {
  IMMEDIATE = 'immediate'
}

export interface IOrder {
  id: number | null
  user_id: number | null
  total_price: number | null
  number_of_repetitions: number | null
  type_of_repetitions: OrderTypeOfRepetitions
  status: OrderStatus
  is_completed: boolean
  location: number | null
  dishes?: Map<string, Dish> | null
}

export class Order {
  id: number | null
  userID: number | null
  totalPrice: number | null = 0.0
  numberOfRepetitions: number | null = 0
  typeOfRepetitions: OrderTypeOfRepetitions = OrderTypeOfRepetitions.IMMEDIATE
  status: OrderStatus = OrderStatus.NEW
  isCompleted: boolean = false
  dishes: Map<string, Dish> = new Map<string, Dish>()
  location: number | null = null
  constructor (order: IOrder) {
    this.id = order.id
    this.userID = order.user_id
    this.totalPrice = order.total_price || 0.0
    this.numberOfRepetitions = order.number_of_repetitions || 0
    this.typeOfRepetitions = order.type_of_repetitions || OrderTypeOfRepetitions.IMMEDIATE
    this.status = order.status || OrderStatus.NEW
    this.isCompleted = order.is_completed
    this.dishes = order.dishes instanceof Map && order.dishes.size > 0 ? order.dishes : new Map<string, Dish>()
    this.location = order.location
  }
  getTotalPrice (): number {
    return this.dishes && this.dishes.size > 0 ? Dish.getDishesMapTotalPrice(this.dishes) : 0.0
  }
  getInformation (): IOrder {
    return {
      id: this.id,
      user_id: this.userID,
      total_price: this.getTotalPrice(),
      number_of_repetitions: this.numberOfRepetitions,
      type_of_repetitions: this.typeOfRepetitions,
      status: this.status,
      is_completed: this.isCompleted,
      dishes: this.dishes,
      location: this.location
    }
  }
  async getLocation (): Promise<Location> {
    return Location.getByID(this.location)
  }
  async setLocation (chat: IChat): Promise<Order> {
    const location = await Conversation.askLocation(chat)
    this.location = location.id
    await db.query(`UPDATE orders SET location = $1, updated_at = now() at time zone 'utc' WHERE id = $2`, [this.location, this.id])
    return this
  }
  async getDishes (): Promise<Map<string, Dish>> {
    if (this.dishes.size > 0) return this.dishes
    const { rows: orderDishesIDs } = await db.query('SELECT dish_id, number FROM order_dishes WHERE order_id = $1', [this.id])
    for (const { dish_id, number: num } of orderDishesIDs) {
      const { rows: [dishData] } = await db.query('SELECT id, title, description, photo, price FROM dishes WHERE id = $1', [parseInt(dish_id, 10)])
      const dish = new Dish(dishData, num)
      this.dishes.set(dish.getTitle(), dish)
    }
    return this.dishes
  }
  async getDishesArray (): Promise<Array<Dish>> {
    const dishes = await this.getDishes()
    return Array.from(dishes.values())
  }
  async showReceipt (chat: IChat, user: User): Promise<void> {
    return this.status === OrderStatus.NEW
      ? chat.sendTemplate(await Template.getOrderReceiptMessage(this, user))
      : chat.sendGenericTemplate([await Template.getOrderGenericMessage(this)])
  }
  static async getOrderByID (orderID: number | string): Promise<Order> {
    const { rows: [orderData] } = await db.query('SELECT * FROM orders WHERE id = $1', [orderID])
    const order = new Order(orderData)
    await order.getDishes()
    return order
  }
  static async create (selectedDishes: Map<string, Dish>, user: User, notify: boolean = true): Promise<Order> {
    const totalPrice = Dish.getDishesMapTotalPrice(selectedDishes)
    const { rows: [orderData] } = await db.query('INSERT INTO orders (user_id, total_price) VALUES ($1, $2) RETURNING *', [user.id, totalPrice])
    for (const dish of selectedDishes.values()) await db.query('INSERT INTO order_dishes (order_id, dish_id, number) VALUES ($1, $2, $3)', [parseInt(orderData.id, 10), dish.id, dish.numberInOrder || 1])
    const order = new Order(orderData)
    if (notify) await db.query(`NOTIFY new_order, '${JSON.stringify(order.getInformation())}'`)
    return order
  }
  static async makeImmediateOrder (chat: IChat, user: User): Promise<Order> {
    const selectedDishes = await Selection.selectDishesForOrder(chat)
    const order = await Order.create(selectedDishes, user)
    await order.setLocation(chat)
    return order
  }
  static async toArray (orders: Array<IOrder>): Promise<Array<Order>> {
    const result = []
    for (const orderData of orders) {
      const order = new Order(orderData)
      await order.getDishes()
      result.push(order)
    }
    return result
  }
}

export { Dish, IDish } from './Dish'
export { DishesSet, IDishesSet } from './DishesSet'
