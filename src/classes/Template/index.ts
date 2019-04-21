import { Dish, Order, User } from '..'
import { GenericTemplate } from './generic'
import { ReceiptTemplate } from './receipt'
import { Commands, Information, Messages } from '../../config'

export class Template {
  static async getOrderReceiptMessage (order: Order, user: User): Promise<ReceiptTemplate> {
    const dishesElements = (await order.getDishesArray()).map((dish: Dish) => dish.getElementData()) || []
    return {
      template_type: 'receipt',
      recipient_name: user.getFullName(),
      merchant_name: Information.MERCHANT_NAME,
      order_number: `${order.id}`,
      currency: Information.CURRENCY,
      payment_method: Information.PAYMENT_METHOD,
      summary: {
        subtotal: order.getTotalPrice(),
        total_cost: order.getTotalPrice()
      },
      elements: dishesElements
    }
  }
  static async getOrderGenericMessage (order: Order): Promise<GenericTemplate> {
    return {
      title: `Order #${order.id}`,
      subtitle: `Price: ${order.getTotalPrice().toFixed(2)}${Information.CURRENCY_SYMBOL}`,
      buttons: [
        {
          title: 'Cancel',
          type: 'postback',
          payload: `ORDERS_CANCEL___${order.id}`
        }
      ]
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
          url: dish.getInformationURL(),
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
          title: Messages.UPDATE_CONTACT_INFORMATION,
          type: 'postback',
          payload: Commands.UPDATE_CONTACT_INFORMATION
        },
        {
          title: Messages.SHOW_DEFAULT_LOCATION,
          type: 'postback',
          payload: Commands.SHOW_DEFAULT_LOCATION
        },
        {
          title: Messages.UPDATE_DEFAULT_LOCATION,
          type: 'postback',
          payload: Commands.UPDATE_DEFAULT_LOCATION
        }
      ]
    }
  }
}

export { Element } from './receipt'
