import { Commands, Messages } from '../../config'
import { Order, User } from '../../classes'
import { IChat, PostbackPayload } from '../../types'

export default async (payload: PostbackPayload, chat: IChat): Promise<void> => {
  try {
    const user = new User()
    await user.syncInformation(chat)
    const command = payload.postback.payload
    switch (command) {
      case Commands.MAKE_ORDER_NOW: {
        const order = await Order.makeImmediateOrder(chat, user)
        await order.showReceipt(chat, user)
        break
      }
      case Commands.CREATED_ORDERS: {
        const orders = await user.getCreatedOrders()
        if (orders.length < 1) return chat.say(Messages.NO_CREATED_ORDERS)
        await chat.say(Messages.CREATED_ORDERS)
        for (const order of orders) await order.showReceipt(chat, user)
        break
      }
      case Commands.CURRENT_ORDERS: {
        const orders = await user.getCurrentOrders()
        if (orders.length < 1) return chat.say(Messages.NO_CURRENT_ORDERS)
        await chat.say(Messages.CURRENT_ORDERS)
        for (const order of orders) await order.showReceipt(chat, user)
        break
      }
      case Commands.COMPLETED_ORDERS: {
        const orders = await user.getCompletedOrders()
        if (orders.length < 1) return chat.say(Messages.NO_COMPLETED_ORDERS)
        await chat.say(Messages.COMPLETED_ORDERS)
        for (const order of orders) await order.showReceipt(chat, user)
        break
      }
      default: {
        const [action, orderID] = command.split('___')
        switch (action) {
          case Commands.ORDERS_CANCEL: {
            if (!orderID) return chat.say(Messages.NO_ORDER)
            const order = await Order.getOrderByID(orderID)
            await User.cancelOrder(order)
            await chat.say(`Order #${order.id} was canceled!`)
            const created = await user.getCreatedOrders()
            if (created.length > 0) await chat.say(Messages.CREATED_ORDERS)
            else await chat.say(Messages.NO_CREATED_ORDERS)
            for (const o of created) await o.showReceipt(chat, user)
            break
          }
          default: {
            console.warn('[BOT] [POSTBACK] UNKNOWN COMMAND: ', command)
            return await chat.say(Messages.UNKNOWN_COMMAND)
          }
        }
      }
    }
  } catch (error) {
    console.error('[BOT] ERROR PROCESSING ORDERS POSTBACK EVENT: ', error)
    return chat.say(Messages.SOMETHING_WENT_WRONG)
  }
}
