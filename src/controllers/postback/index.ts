import { Commands, Messages } from '../../config'
import { User } from '../../classes'
import { IChat, PostbackPayload } from '../../types'
import AccountPostbackController from './account'
import OrdersPostbackController from './orders'

export const PostbackEventController = async (payload: PostbackPayload, chat: IChat): Promise<void> => {
  try {
    const command = payload.postback.payload
    switch (command) {
      case Commands.GET_STARTED: {
        await User.showGetStartedMessage(chat)
        break
      }
      default: {
        const [commandType] = command.split('_')
        switch (commandType) {
          case Commands.ORDERS: {
            await OrdersPostbackController(payload, chat)
            break
          }
          case Commands.ACCOUNT: {
            await AccountPostbackController(payload, chat)
            break
          }
          default: {
            await chat.say(Messages.UNKNOWN_COMMAND)
            break
          }
        }
      }
    }
  } catch (error) {
    console.error('[BOT] ERROR PROCESSING POSTBACK EVENT: ', error)
    return chat.say(Messages.SOMETHING_WENT_WRONG)
  }
}
