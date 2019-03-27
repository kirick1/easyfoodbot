import { Order, Dish, User } from '.'
import { ReceiptTemplate, GenericTemplate } from '../types'

export class Template {
  static async getOrderReceiptMessage (order: Order, user: User): Promise<ReceiptTemplate> {
    return {
      template_type: 'receipt',
      recipient_name: user.getFullName(),
      merchant_name: 'EasyFood Delivery',
      order_number: `${order.id}`,
      currency: 'EUR',
      payment_method: 'Cash',
      summary: {
        subtotal: order.getTotalPrice(),
        total_cost: order.getTotalPrice()
      },
      elements: (await order.getDishesArray()).map((dish: Dish) => dish.getElementData()) || []
    }
  }
  static async getOrderGenericMessage (order: Order): Promise<GenericTemplate> {
    return {
      title: `Order #${order.id}`,
      subtitle: `Price: ${order.getTotalPrice().toFixed(2)}€`,
      buttons: [{
        title: 'Cancel',
        type: 'postback',
        payload: `ORDERS_CANCEL___${order.id}`
      }]
    }
  }
  static getDishGenericMessage (dish: Dish): GenericTemplate {
    return {
      title: `${dish.title} (${dish.getTotalPriceString()})`,
      subtitle: dish.description,
      image_url: dish.photo,
      buttons: [{
        type: 'web_url',
        url: dish.photo,
        title: 'Photo'
      }]
    }
  }
  static getDishesMapGenericMessage (dishesMap: Map<string, Dish>): Array<GenericTemplate> {
    return Array.from(dishesMap.values()).map((dish: Dish) => Template.getDishGenericMessage(dish))
  }
  static getContactInformationGenericMessage (user: User): GenericTemplate {
    return {
      title: user.getFullName(),
      subtitle: `Email: ${user.email}\nPhone: ${user.phone}`,
      buttons: [{
        title: 'Edit',
        type: 'postback',
        payload: `ACCOUNT_CONTACT_EDIT___${user.id}`
      }]
    }
  }
}
