import { Dish, Order, User } from '..'
import { ButtonType } from '../../types'
import { ReceiptTemplate } from './receipt'
import { GenericTemplate } from './generic'
import { Commands, Information, Messages } from '../../config'

export class Template {
  static getGetStartedButtonGenericMessage (user: User): GenericTemplate {
    const template: GenericTemplate = {
      title: `Welcome, ${user.getFullName()}!`,
      subtitle: 'Click to make order now!',
      buttons: [
        {
          type: ButtonType.POSTBACK,
          title: Messages.MAKE_ORDER,
          payload: Commands.MAKE_ORDER_NOW
        }
      ]
    }
    if (!user.isContactInformationSet()) {
      template.buttons.push({
        type: ButtonType.POSTBACK,
        title: Messages.UPDATE_CONTACT_INFORMATION,
        payload: Commands.UPDATE_CONTACT_INFORMATION
      })
    }
    if (!user.isDefaultLocationSet()) {
      template.buttons.push({
        type: ButtonType.POSTBACK,
        title: Messages.UPDATE_DEFAULT_LOCATION,
        payload: Commands.UPDATE_DEFAULT_LOCATION
      })
    }
    if (template.buttons.length > 1) template.subtitle = 'Select one of the following options to start using bot!'
    return template
  }
  static async getOrderReceiptMessage (order: Order, user: User): Promise<ReceiptTemplate> {
    const dishes = await order.getDishesArray()
    if (!dishes || dishes.length < 1) throw Error(Messages.NO_DISHES_IN_ORDER)
    const dishesElements = (await order.getDishesArray()).map((dish: Dish) => dish.getElementData())
    return {
      template_type: ButtonType.RECEIPT,
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
          title: Messages.CANCEL,
          type: ButtonType.POSTBACK,
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
          type: ButtonType.WEB_URL,
          url: dish.photo,
          title: Messages.PHOTO
        },
        {
          type: ButtonType.WEB_URL,
          url: dish.getInformationURL(),
          title: Messages.MORE
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
    if (!user.email && !user.phone) subtitle = Messages.NO_CONTACT_INFORMATION
    return {
      title: user.getFullName(),
      subtitle: subtitle,
      buttons: [
        {
          title: Messages.UPDATE_CONTACT_INFORMATION,
          type: ButtonType.POSTBACK,
          payload: Commands.UPDATE_CONTACT_INFORMATION
        },
        {
          title: Messages.SHOW_DEFAULT_LOCATION,
          type: ButtonType.POSTBACK,
          payload: Commands.SHOW_DEFAULT_LOCATION
        },
        {
          title: Messages.UPDATE_DEFAULT_LOCATION,
          type: ButtonType.POSTBACK,
          payload: Commands.UPDATE_DEFAULT_LOCATION
        }
      ]
    }
  }
}

export { Element } from './receipt'
