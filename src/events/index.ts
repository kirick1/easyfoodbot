import User from '../classes/User'
import Orders from './orders'
import Account from './account'
import { Payload } from '../declarations/payload'

export async function PostbackEvents (payload: Payload, chat: any, data?: any) {
  try {
    if (data && data.captured) console.warn('[BOT] [POSTBACK] DATA CAPTURED!')
    const user = new User()
    await user.syncInformation(chat)
    if (!payload.postback || !payload.postback.payload) return await chat.say('Error: no payload! Please try again!')
    const command = payload.postback.payload
    if (command === 'BOOTBOT_GET_STARTED') return await chat.say(`Hello, ${user.firstName} ${user.lastName}!`)
    else if (command === 'WRITE_FEEDBACK') return await user.writeFeedBack(chat)
    const [commandType] = command.split('_')
    if (commandType === 'ORDERS') return await Orders(chat, command, user)
    else if (commandType === 'ACCOUNT') return await Account(chat, command, user)
    else return await chat.say('Unknown command type!')
  } catch (error) {
    console.error('[BOT] ERROR PROCESSING POSTBACK EVENT: ', error)
    return chat.say('Something went wrong, please try again')
  }
}
