import { Chat } from '../types'
import { User } from '../classes'

export const AccountEventsHandler = async (chat: Chat, command: string, user: User): Promise<void> => {
  switch (command) {
    case 'ACCOUNT_CONTACT_INFORMATION': {
      await user.showContactInformation(chat)
      break
    }
    case 'ACCOUNT_DELIVERY_INFORMATION': {
      await user.setContactInformation(chat)
      await chat.say('Account contact information was updated!')
      await user.showContactInformation(chat)
      break
    }
    default: {
      const [action, userID] = command.split('___')
      switch (action) {
        case 'ACCOUNT_CONTACT_EDIT': {
          if (!userID) {
            await chat.say('User ID not found! Please try again!')
          }
          break
        }
        default: {
          console.warn('[BOT] [EVENTS] UNKNOWN COMMAND: ', command)
          await chat.say('Unknown command, please try again!')
          break
        }
      }
    }
  }
}
