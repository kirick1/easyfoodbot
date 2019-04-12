import { IChat } from '../types'
import { User, Order } from '../classes'

export const OrderEventsHandler = async (chat: IChat, command: string, user: User): Promise<void> => {
  switch (command) {
    case 'ORDERS_MAKE_ORDER_NOW': {
      const order = await Order.makeImmediateOrder(chat, user)
      await order.showReceipt(chat, user)
      break
    }
    case 'ORDERS_CREATED_ORDERS': {
      const orders = await user.getCreatedOrders()
      if (orders.length < 1) return chat.say('There are no created orders!')
      await chat.say('Created orders:')
      for (const order of orders) await order.showReceipt(chat, user)
      break
    }
    case 'ORDERS_CURRENT_ORDERS': {
      const orders = await user.getCurrentOrders()
      if (orders.length < 1) return chat.say('There are no current orders!')
      await chat.say('Current orders:')
      for (const order of orders) await order.showReceipt(chat, user)
      break
    }
    case 'ORDERS_COMPLETED_ORDERS': {
      const orders = await user.getCompletedOrders()
      if (orders.length < 1) return chat.say('There are no completed orders!')
      await chat.say('Completed orders:')
      for (const order of orders) await order.showReceipt(chat, user)
      break
    }
    default: {
      const [action, orderID] = command.split('___')
      switch (action) {
        case 'ORDERS_CANCEL': {
          if (!orderID) return chat.say('No order!')
          const order = await Order.getOrderByID(orderID)
          await User.cancelOrder(order)
          await chat.say(`Order #${order.id} was canceled!`)
          const created = await user.getCreatedOrders()
          if (created.length > 0) await chat.say('Created orders:')
          else await chat.say('There are no created orders!')
          for (const o of created) await o.showReceipt(chat, user)
          break
        }
        default: {
          console.warn('[BOT] [POSTBACK] UNKNOWN COMMAND: ', command)
          await chat.say('Unknown command, please try again!')
          break
        }
      }
    }
  }
}
