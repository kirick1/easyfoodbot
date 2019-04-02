import db from '../database'
import { Dish, User, Template, Location } from '.'
import { OrderObject, Chat, Status, TypeOfRepetitions } from '../types'
import { SelectDishesForOrder, createConversation, askLocation } from '../controllers'

export class Order {
  id: number | null
  userID: number | null
  totalPrice: number | null = 0.0
  numberOfRepetitions: number | null = 0
  typeOfRepetitions: TypeOfRepetitions = 'immediate'
  status: Status = 'new'
  isCompleted: boolean = false
  dishes: Map<string, Dish> = new Map<string, Dish>()
  location: number | null = null
  constructor (order: OrderObject) {
    this.id = order.id
    this.userID = order.user_id
    this.totalPrice = order.total_price || 0.0
    this.numberOfRepetitions = order.number_of_repetitions || 0
    this.typeOfRepetitions = order.type_of_repetitions || 'immediate'
    this.status = order.status || 'new'
    this.isCompleted = order.is_completed
    this.dishes = order.dishes instanceof Map && order.dishes.size > 0 ? order.dishes : new Map<string, Dish>()
    this.location = order.location
  }
  getTotalPrice (): number {
    return Dish.getDishesMapTotalPrice(this.dishes)
  }
  getInformation (): OrderObject {
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
  async showReceipt (chat: Chat, user: User): Promise<void> {
    return this.status === 'new'
      ? chat.sendTemplate(await Template.getOrderReceiptMessage(this, user))
      : chat.sendGenericTemplate([await Template.getOrderGenericMessage(this)])
  }
  static async getOrderByID (orderID: number | string): Promise<Order> {
    const { rows: [orderData] } = await db.query('SELECT * FROM orders WHERE id = $1', [orderID])
    const order = new Order(orderData)
    await order.getDishes()
    return order
  }
  static async create (dishes: Map<string, Dish>, user: User, location: Location, notify: boolean = true): Promise<Order> {
    const totalPrice = Dish.getDishesMapTotalPrice(dishes)
    const { rows: [orderData] } = await db.query('INSERT INTO orders (user_id, total_price, location) VALUES ($1, $2, $3) RETURNING *', [user.id, totalPrice, location.id])
    for (const dish of dishes.values()) await db.query('INSERT INTO order_dishes (order_id, dish_id, number) VALUES ($1, $2, $3)', [parseInt(orderData.id, 10), dish.id, dish.numberInOrder || 1])
    const order = new Order(orderData)
    if (notify) await db.query(`NOTIFY new_order, '${JSON.stringify(order.getInformation())}'`)
    return order
  }
  static async makeImmediateOrder (chat: Chat, user: User): Promise<Order> {
    const conversation = await createConversation(chat)
    try {
      const dishes = await SelectDishesForOrder(conversation)
      const locationData = await askLocation(conversation)
      const location = await Location.create(locationData.payload.coordinates, locationData.title, locationData.url)
      await conversation.end()
      return await Order.create(dishes, user, location)
    } catch (error) {
      console.error('[BOT] [ORDER] ERROR MAKING IMMEDIATE ORDER: ', error)
      await conversation.end()
      throw Error(error)
    }
  }
  static async toArray (orders: Array<OrderObject>): Promise<Array<Order>> {
    const result = []
    for (const orderData of orders) {
      const order = new Order(orderData)
      await order.getDishes()
      result.push(order)
    }
    return result
  }
}
