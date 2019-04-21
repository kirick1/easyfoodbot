import { Commands, Messages } from '../config'
import { Order, User } from '../classes'
import { IChat, PostbackPayload } from '../types'

export const PostbackEventController = async (payload: PostbackPayload, chat: IChat): Promise<any> => {
  try {
    const user = new User()
    await user.syncInformation(chat)
    const command = payload.postback.payload
    switch (command) {
      case Commands.GET_STARTED: {
        return chat.say(`Hello, ${user.firstName} ${user.lastName}!`)
      }
      case Commands.WRITE_FEEDBACK: {
        return await user.writeFeedBack(chat)
      }
      default: {
        const [commandType] = command.split('_')
        switch (commandType) {
          case Commands.ORDERS: {
            switch (command) {
              case Commands.MAKE_ORDER_NOW: {
                const order = await Order.makeImmediateOrder(chat, user)
                await order.showReceipt(chat, user)
                break
              }
              case Commands.CREATED_ORDERS: {
                const orders = await user.getCreatedOrders()
                if (orders.length < 1) return chat.say(Messages.NO_CREATED_ORDERS)
                await chat.say('Created orders:')
                for (const order of orders) await order.showReceipt(chat, user)
                break
              }
              case Commands.CURRENT_ORDERS: {
                const orders = await user.getCurrentOrders()
                if (orders.length < 1) return chat.say(Messages.NO_CURRENT_ORDERS)
                await chat.say('Current orders:')
                for (const order of orders) await order.showReceipt(chat, user)
                break
              }
              case Commands.COMPLETED_ORDERS: {
                const orders = await user.getCompletedOrders()
                if (orders.length < 1) return chat.say(Messages.NO_COMPLETED_ORDERS)
                await chat.say('Completed orders:')
                for (const order of orders) await order.showReceipt(chat, user)
                break
              }
              default: {
                const [action, orderID] = command.split('___')
                switch (action) {
                  case Commands.ORDERS_CANCEL: {
                    if (!orderID) return chat.say('No order!')
                    const order = await Order.getOrderByID(orderID)
                    await User.cancelOrder(order)
                    await chat.say(`Order #${order.id} was canceled!`)
                    const created = await user.getCreatedOrders()
                    if (created.length > 0) await chat.say('Created orders:')
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
            break
          }
          case Commands.ACCOUNT: {
            switch (command) {
              case Commands.SHOW_CONTACT_INFORMATION: {
                await user.showContactInformation(chat)
                break
              }
              case Commands.UPDATE_CONTACT_INFORMATION: {
                await user.setContactInformation(chat)
                await chat.say('Account contact information was updated!')
                await user.showContactInformation(chat)
                break
              }
              case Commands.SHOW_DEFAULT_LOCATION: {
                return await user.showDefaultLocation(chat)
              }
              case Commands.UPDATE_DEFAULT_LOCATION: {
                await user.setDefaultLocation(chat)
                await chat.say('Account default location was successfully saved!')
                return await user.showDefaultLocation(chat)
              }
              default: {
                console.warn('[BOT] [EVENTS] UNKNOWN COMMAND: ', command)
                return await chat.say(Messages.UNKNOWN_COMMAND)
              }
            }
            break
          }
          default: {
            return await chat.say(Messages.UNKNOWN_COMMAND)
          }
        }
      }
    }
  } catch (error) {
    console.error('[BOT] ERROR PROCESSING POSTBACK EVENT: ', error)
    return chat.say(Messages.SOMETHING_WENT_WRONG)
  }
}
