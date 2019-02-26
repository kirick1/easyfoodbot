import { User } from '../classes'
import { Chat } from '../types/bootbot'

export async function AccountEvents (chat: Chat, command: string, user: User) {
  try {
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
              return null
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
  } catch (error) {
    console.error('[BOT] [EVENTS] ACCOUNT ERROR: ', error)
    throw Error(error)
  }
}
