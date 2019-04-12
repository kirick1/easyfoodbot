import { IChat } from '../types'
import { User } from '../classes'

export const AccountEventsHandler = async (chat: IChat, command: string, user: User): Promise<void> => {
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

      break
    }
    case 'ACCOUNT_UPDATE_DEFAULT_LOCATION': {

      break
    }
    default: {
      // const [action, userID] = command.split('___')
      console.warn('[BOT] [EVENTS] UNKNOWN COMMAND: ', command)
      await chat.say('Unknown command, please try again!')
    }
  }
}
