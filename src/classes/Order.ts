import db from '../database'
import { Dish, User } from '.'
import { SelectDishesForOrder } from '../controllers'
import { OrderObject, MessagePayload, PostbackPayload, Chat, Status, TypeOfRepetitions } from '../types'

export class Order {
  id: number | null
  userID: number | null
  totalPrice: number | null
  numberOfRepetitions: number | null = 0
  typeOfRepetitions: TypeOfRepetitions = 'immediate'
  status: Status = 'new'
  isCompleted: boolean = false
  dishes: Map<string, Dish> = new Map<string, Dish>()
  constructor (order: OrderObject) {
    this.id = order.id
    this.userID = order.user_id
    this.totalPrice = order.total_price
    this.numberOfRepetitions = order.number_of_repetitions || 0
    this.typeOfRepetitions = order.type_of_repetitions
    this.status = order.status || 'new'
    this.isCompleted = order.is_completed
    this.dishes = order.dishes && order.dishes.size > 0 ? order.dishes : new Map<string, Dish>()
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
      dishes: this.dishes || new Map<string, Dish>()
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
  showReceipt (chat: Chat, user: User): Promise<void> {
    return this.status !== 'new'
      ? chat.sendTemplate({
        template_type: 'receipt',
        recipient_name: `${user.firstName} ${user.lastName}`,
        merchant_name: 'EasyFood Delivery',
        order_number: `${this.id}`,
        currency: 'EUR',
        payment_method: 'Cash',
        summary: {
          total_cost: this.getTotalPrice()
        },
        elements: Array.from(this.dishes.values()).map((dish: Dish) => ({
          title: dish.title,
          subtitle: dish.description,
          quantity: dish.numberInOrder,
          price: dish.getTotalPrice().toFixed(2),
          currency: 'EUR',
          image_url: dish.photo
        })) || []
      }) : chat.sendGenericTemplate([{
        title: `Order #${this.id}`,
        subtitle: `Price: ${this.getTotalPrice().toFixed(2)}€`,
        buttons: [{
          title: 'Cancel',
          type: 'postback',
          payload: `ORDERS_CANCEL___${this.id}`
        }]
      }], (payload: MessagePayload | PostbackPayload) => console.log('PAYLOAD: ', payload))
  }
  static async makeImmediateOrder (chat: Chat, user: User): Promise<Order> {
    try {
      const dishes = await SelectDishesForOrder(chat)
      const totalPrice = Dish.getDishesMapTotalPrice(dishes)
      const { rows: [orderData] } = await db.query('INSERT INTO orders (user_id, total_price) VALUES ($1, $2) RETURNING *', [user.id, totalPrice])
      for (const dish of dishes.values()) await db.query('INSERT INTO order_dishes (order_id, dish_id, number) VALUES ($1, $2, $3)', [parseInt(orderData.id, 10), dish.id, dish.numberInOrder || 1])
      const order = new Order(orderData)
      await db.query(`NOTIFY new_order, '${JSON.stringify(order.getInformation())}'`)
      return order
    } catch (error) {
      console.error('[BOT] [ORDER] ERROR MAKING IMMEDIATE ORDER: ', error)
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
  static async getOrderByID (orderID: number | string): Promise<Order> {
    const { rows: [orderData] } = await db.query('SELECT * FROM orders WHERE id = $1', [orderID])
    const order = new Order(orderData)
    await order.getDishes()
    return order
  }
}
