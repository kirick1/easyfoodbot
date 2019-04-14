import { MessagePayload, LocationPayload, IChat, IConversation, Attachment, CONTENT_TYPE } from '../types'

export const defaultTextValidator = (text: string, minLength: number = 0, maxLength: number = 8000): boolean => text.length >= minLength && text.length <= maxLength

export class Conversation {
  static createConversation (chat: IChat): Promise<IConversation> {
    return new Promise<IConversation>((resolve) => chat.conversation(resolve))
  }
  static askYesNo (conversation: IConversation, text: string = 'Right?'): Promise<boolean> {
    return new Promise<boolean>((resolve) => conversation.ask({
      text,
      quickReplies: ['Yes', 'No']
    }, (payload: MessagePayload) => resolve(payload.message.text === 'Yes')))
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
  static askEmail (conversation: IConversation): Promise<string> {
    return new Promise<string>((resolve) => conversation.ask({
      text: 'Add email',
      quickReplies: [{ content_type: CONTENT_TYPE.EMAIL }]
    }, async (payload: MessagePayload) => resolve(payload.message.text)))
  }
  static askPhoneNumber (conversation: IConversation): Promise<string> {
    return new Promise<string>((resolve) => conversation.ask({
      text: 'Add mobile phone',
      quickReplies: [{ content_type: CONTENT_TYPE.PHONE_NUMBER }]
    }, async (payload: MessagePayload) => resolve(payload.message.text)))
  }
  static askLocation (conversation: IConversation): Promise<Attachment> {
    return new Promise<Attachment>((resolve) => conversation.ask({
      text: 'Send location',
      quickReplies: [{ content_type: CONTENT_TYPE.LOCATION }]
    }, async (payload: LocationPayload) => resolve(payload.message.attachments[0])))
  }
}
