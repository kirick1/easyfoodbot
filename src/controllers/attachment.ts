import { User } from '../classes'
import { IChat, PostbackPayload } from '../types'

export const AttachmentEventHandler = async (payload: any, chat: IChat): Promise<any> => {
  try {
    console.log('ATTACHMENT PAYLOAD: ', payload)
    const user = new User()
  } catch (error) {
    console.error('[BOT] ERROR PROCESSING ATTACHMENT EVENT: ', error)
    return chat.say('Something went wrong, please try again')
  }
}
