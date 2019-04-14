import { Order, User } from '../classes'
import { IChat, PostbackPayload } from '../types'

export const PostbackEventHandler = async (payload: PostbackPayload, chat: IChat): Promise<any> => {
  try {
    const user = new User()
    await user.syncInformation(chat)
    const command = payload.postback.payload
    console.log('COMMAND: ', command)
    switch (command) {
      case 'BOOTBOT_GET_STARTED': {
        return chat.say(`Hello, ${user.firstName} ${user.lastName}!`)
      }
      case 'WRITE_FEEDBACK': {
        return await user.writeFeedBack(chat)
      }
      default: {
        const [commandType] = command.split('_')
        switch (commandType) {
          case 'ORDERS': {
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
                    return await chat.say('Unknown command, please try again!')
                  }
                }
              }
            }
            break
          }
          case 'ACCOUNT': {
            switch (command) {
              case 'ACCOUNT_SHOW_CONTACT_INFORMATION': {
                await user.showContactInformation(chat)
                break
              }
              case 'ACCOUNT_UPDATE_CONTACT_INFORMATION': {
                await user.setContactInformation(chat)
                await chat.say('Account contact information was updated!')
                await user.showContactInformation(chat)
                break
              }
              case 'ACCOUNT_SHOW_DEFAULT_LOCATION': {
                return await user.showDefaultLocation(chat)
              }
              case 'ACCOUNT_UPDATE_DEFAULT_LOCATION': {
                await user.setDefaultLocation(chat)
                await chat.say('Account default location was successfully saved!')
                return await user.showDefaultLocation(chat)
              }
              default: {
                console.warn('[BOT] [EVENTS] UNKNOWN COMMAND: ', command)
                return await chat.say('Unknown command, please try again!')
              }
            }
            break
          }
          default: {
            return await chat.say('Unknown command type!')
          }
        }
      }
    }
  } catch (error) {
    console.error('[BOT] ERROR PROCESSING POSTBACK EVENT: ', error)
    return chat.say('Something went wrong, please try again')
  }
}
