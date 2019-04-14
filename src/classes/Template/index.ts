import { Order, Dish, User } from '..'
import { GenericTemplate } from './generic'
import { ReceiptTemplate } from './receipt'

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
      buttons: [
        {
          type: 'web_url',
          url: dish.photo,
          title: 'Photo'
        },
        {
          type: 'web_url',
          url: 'https://www.google.com',
          title: 'More'
        }
      ]
    }
  }
  static getDishesMapGenericMessage (dishesMap: Map<string, Dish>): Array<GenericTemplate> {
    return Array.from(dishesMap.values()).map((dish: Dish) => Template.getDishGenericMessage(dish))
  }
  static getContactInformationGenericMessage (user: User): GenericTemplate {
    let subtitle = ''
    if (user.email) subtitle += `Email: ${user.email}\n`
    if (user.phone) subtitle += `Phone: ${user.phone}\n`
    if (!user.email && !user.phone) subtitle = 'Email and phone number not found!'
    return {
      title: user.getFullName(),
      subtitle: subtitle,
      buttons: [
        {
          title: 'Update contact information',
          type: 'postback',
          payload: 'ACCOUNT_UPDATE_CONTACT_INFORMATION'
        },
        {
          title: 'Show default location',
          type: 'postback',
          payload: 'ACCOUNT_SHOW_DEFAULT_LOCATION'
        },
        {
          title: 'Update default location',
          type: 'postback',
          payload: 'ACCOUNT_UPDATE_DEFAULT_LOCATION'
        }
      ]
    }
  }
}

export { Element } from './receipt'
