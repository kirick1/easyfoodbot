import { Commands, Messages } from '../../config'
import { User } from '../../classes'
import { IChat, PostbackPayload } from '../../types'

export default async (payload: PostbackPayload, chat: IChat): Promise<void> => {
  try {
    const user = new User()
    await user.syncInformation(chat)
    const command = payload.postback.payload
    switch (command) {
      case Commands.WRITE_FEEDBACK: {
        await user.writeFeedBack(chat)
        break
      }
      case Commands.SHOW_CONTACT_INFORMATION: {
        await user.showContactInformation(chat)
        break
      }
      case Commands.UPDATE_CONTACT_INFORMATION: {
        await user.setContactInformation(chat)
        await chat.say(Messages.CONTACT_INFORMATION_UPDATED)
        await user.showContactInformation(chat)
        break
      }
      case Commands.SHOW_DEFAULT_LOCATION: {
        return await user.showDefaultLocation(chat)
      }
      case Commands.UPDATE_DEFAULT_LOCATION: {
        await user.setDefaultLocation(chat)
        await chat.say(Messages.DEFAULT_LOCATION_UPDATED)
        return await user.showDefaultLocation(chat)
      }
      default: {
        console.warn('[BOT] [EVENTS] UNKNOWN COMMAND: ', command)
        return await chat.say(Messages.UNKNOWN_COMMAND)
      }
    }
  } catch (error) {
    console.error('[BOT] ERROR PROCESSING ACCOUNT POSTBACK EVENT: ', error)
    return chat.say(Messages.SOMETHING_WENT_WRONG)
  }
}
