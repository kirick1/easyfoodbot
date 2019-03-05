import db from '../database'
import { Dish, User } from '.'
import { SelectDishesForOrder } from '../controllers'
import { Status, TypeOfRepetitions, OrderObject, Payload, Chat } from '../types'

export class Order {
  id: number
  userID: number
  totalPrice: number
  numberOfRepetitions: number
  typeOfRepetitions: string
  status: Status
  isCompleted: boolean
  dishes: Map<string, Dish>
  constructor (order: OrderObject) {
    this.id = order.id
    this.userID = order.user_id
    this.totalPrice = order.total_price
    this.numberOfRepetitions = order.number_of_repetitions || 0
    this.typeOfRepetitions = order.type_of_repetitions || TypeOfRepetitions.IMMEDIATE
    this.status = order.status || Status.NEW
    this.isCompleted = order.is_completed
    this.dishes = order.dishes && order.dishes.size > 0 ? order.dishes : new Map()
  }
  getTotalPrice (): number {
    let total = 0.0
    for (const dish of this.dishes.values()) total += dish.getTotalPrice()
    return total
  }
  async getDishes (): Promise<Map<string, Dish>> {
    if (this.dishes && this.dishes.size > 0) return this.dishes
    const { rows: orderDishesIDs } = await db.query('SELECT dish_id, number FROM order_dishes WHERE order_id = $1', [this.id])
    for (const { dish_id, number: num } of orderDishesIDs) {
      const { rows: [dishData] } = await db.query('SELECT id, title, description, photo, price FROM dishes WHERE id = $1', [parseInt(dish_id, 10)])
      if (dishData) {
        const dish = new Dish(dishData, num)
        this.dishes.set(dish.getTitle(), dish)
      }
    }
    return this.dishes
  }
  showReceipt (chat: Chat, user: User): Promise<any> {
    return this.status !== Status.NEW
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
        elements: this.dishes && this.dishes.size > 0
          ? Array.from(this.dishes.values()).map(dish => ({
            title: dish.title,
            subtitle: dish.description,
            quantity: dish.numberInOrder || 1,
            price: dish.getTotalPrice().toFixed(2),
            currency: 'EUR',
            image_url: dish.photo
          })) : []
      }) : chat.sendGenericTemplate([{
        title: `Order #${this.id}`,
        subtitle: `Price: ${this.getTotalPrice().toFixed(2)}€`,
        buttons: [{
          title: 'Cancel',
          type: 'postback',
          payload: `ORDERS_CANCEL___${this.id}`
        }]
      }], (payload: Payload) => console.log('PAYLOAD: ', payload))
  }
  static async makeImmediateOrder (chat: Chat, user: User): Promise<Order> {
    try {
      const dishes = await SelectDishesForOrder(chat)
      const totalPrice = Dish.getDishesMapTotalPrice(dishes)
      const { rows: [orderData] } = await db.query('INSERT INTO orders (user_id, total_price) VALUES ($1, $2) RETURNING *', [user.id, totalPrice])
      for (const dish of dishes.values()) await db.query('INSERT INTO order_dishes (order_id, dish_id, number) VALUES ($1, $2, $3)', [parseInt(orderData.id, 10), dish.id, dish.numberInOrder || 1])
      const order = new Order(orderData)
      await db.query(`NOTIFY new_order, '${JSON.stringify({ id: order.id, user_id: order.userID, total_price: order.getTotalPrice() })}'`)
      return order
    } catch (error) {
      console.error('[BOT] [ORDER] ERROR MAKING IMMEDIATE ORDER: ', error)
      throw Error(error)
    }
  }
  static async toArray (orders: Array<OrderObject> = []): Promise<Array<Order>> {
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
