import db from '../config/database'
import Dish from './Dish'
import { Status } from '../declarations/status'
import { OrderObject } from '../declarations/order'
import { TypeOfRepetitions } from '../declarations/typeOfRepetitions'

export default class Order {
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
  async getDishes () {
    if (this.dishes && this.dishes.size > 0) return this.dishes
    try {
      const { rows: orderDishesIDs } = await db.query('SELECT dish_id, number FROM order_dishes WHERE order_id = $1', [this.id])
      for (const { dish_id, number: num } of orderDishesIDs) {
        const { rows: [dishData] } = await db.query('SELECT id, title, description, photo, price FROM dishes WHERE id = $1', [parseInt(dish_id, 10)])
        if (dishData) {
          const dish = new Dish(dishData, num)
          this.dishes.set(dish.getTitle(), dish)
        }
      }
      return this.dishes
    } catch (error) {
      console.error('[BOT] [ORDER] ERROR GETTING ORDER DISHES: ', error)
      return this.dishes
    }
  }
  async showReceipt (chat: any, user: any) {
    return this.status !== 'new'
      ? await chat.sendTemplate({
        template_type: 'receipt',
        recipient_name: `${user.first_name} ${user.last_name}`,
        merchant_name: 'EasyFood Delivery',
        order_number: `${this.id}`,
        currency: 'EUR',
        payment_method: 'Cash',
        summary: {
          total_cost: this.total_price
        },
        elements: this.dishes && this.dishes.length > 0
          ? this.dishes.map(dish => ({
            title: dish.title,
            subtitle: dish.description,
            quantity: parseInt(dish.number) || 1,
            price: parseFloat(dish.price).toFixed(2),
            currency: 'EUR',
            image_url: dish.photo
          })) : []
      }) : await chat.sendGenericTemplate([{
        title: `Order #${this.id}`,
        subtitle: `Price: ${this.total_price}€`,
        buttons: [{
          title: 'Cancel',
          type: 'postback',
          payload: `ORDERS_CANCEL___${this.id}`
        }]
      }], payload => console.log('PAYLOAD: ', payload))
  }
}
