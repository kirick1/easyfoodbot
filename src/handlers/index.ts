import { User } from '../classes'
import { Chat, PostbackPayload } from '../types'
import { OrderEventsHandler } from './orders'
import { AccountEventsHandler } from './account'

export const PostbackEventHandler = async (payload: PostbackPayload, chat: Chat): Promise<any> => {
  try {
    const user = new User()
    await user.syncInformation(chat)
    const command = payload.postback.payload
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
            return await OrderEventsHandler(chat, command, user)
          }
          case 'ACCOUNT': {
            return await AccountEventsHandler(chat, command, user)
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
