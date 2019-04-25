import { Messages } from '../config'
import { Location } from '../classes'
import { CONTENT_TYPE, IChat, IConversation, LocationPayload, MessagePayload } from '../types'

export const defaultTextValidator = (text: string, minLength: number = 0, maxLength: number = 8000): boolean => text.length >= minLength && text.length <= maxLength

export class Conversation {
  static createConversation (chat: IChat): Promise<IConversation> {
    return new Promise<IConversation>((resolve) => chat.conversation(resolve))
  }
  static askYesNo (conversation: IConversation, text: string = Messages.RIGHT): Promise<boolean> {
    return new Promise<boolean>((resolve) => conversation.ask({
      text, quickReplies: [Messages.YES, Messages.NO]
    }, (payload: MessagePayload) => resolve(payload.message.text === Messages.YES)))
  }
  static askQuestion (conversation: IConversation, question: any, askConfirmation: boolean = false, validator: Function = defaultTextValidator): Promise<string> {
    return new Promise<string>((resolve) => conversation.ask(question, async (payload: MessagePayload) => {
      const text = payload.message.text
      if (validator(text)) {
        if (!askConfirmation) return resolve(text)
        return resolve(await Conversation.askYesNo(conversation, `${text}, is it correct?`)
          ? text
          : await Conversation.askQuestion(conversation, question, askConfirmation, validator))
      } else return resolve(await Conversation.askQuestion(conversation, question, askConfirmation, validator))
    }))
  }
  static askEmail (chat: IChat, text: string = Messages.ADD_EMAIL): Promise<string> {
    return new Promise<string>((resolve) => chat.conversation((conversation: IConversation) => conversation.ask({
      text, quickReplies: [{ content_type: CONTENT_TYPE.EMAIL }]
    }, async (payload: MessagePayload, conversation: IConversation) => {
      const value = payload.message.text
      await conversation.end()
      return resolve(value)
    })))
  }
  static askPhoneNumber (chat: IChat, text: string = Messages.ADD_MOBILE_PHONE): Promise<string> {
    return new Promise<string>((resolve) => chat.conversation((conversation: IConversation) => conversation.ask({
      text, quickReplies: [{ content_type: CONTENT_TYPE.PHONE_NUMBER }]
    }, async (payload: MessagePayload, conversation: IConversation) => {
      const value = payload.message.text
      await conversation.end()
      return resolve(value)
    })))
  }
  static askLocation (chat: IChat, text: string = Messages.ADD_LOCATION): Promise<Location> {
    return new Promise<Location>((resolve) => chat.conversation((conversation: IConversation) => conversation.ask({
      text, quickReplies: [{ content_type: CONTENT_TYPE.LOCATION }]
    }, async (payload: LocationPayload, conversation: IConversation) => {
      const attachment = payload.message.attachments[0]
      await conversation.end()
      const location = await Location.createFromAttachment(attachment)
      return resolve(location)
    })))
  }
}
