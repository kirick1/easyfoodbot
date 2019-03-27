import { MessagePayload, Chat, Conversation } from '../types'

export const createConversation = (chat: Chat): Promise<Conversation> => new Promise<Conversation>((resolve) => chat.conversation(resolve))
export const askYesNo = (conversation: Conversation, text: string = 'Right?'): Promise<boolean> => new Promise<boolean>((resolve) => conversation.ask({ text, quickReplies: ['Yes', 'No'] }, (payload: MessagePayload) => resolve(payload.message.text === 'Yes')))

export const defaultTextValidator = (text: string, minLength: number = 0, maxLength: number = 8000): boolean => text.length >= minLength && text.length <= maxLength

export const askQuestion = (conversation: Conversation, question: any, askConfirmation: boolean = false, validator: Function = defaultTextValidator): Promise<string> => new Promise<string>((resolve) => conversation.ask(question, async (payload: MessagePayload) => {
  const text = payload.message.text
  if (validator(text)) {
    if (!askConfirmation) return resolve(text)
    return resolve(await askYesNo(conversation, `${text}, is it correct?`)
      ? text
      : await askQuestion(conversation, question, askConfirmation, validator))
  } else return resolve(await askQuestion(conversation, question, askConfirmation, validator))
}))
export const askEmail = (conversation: Conversation): Promise<string> => new Promise<string>((resolve) => conversation.ask({ text: 'Add email', quickReplies: [{
  content_type: 'user_email'
}] }, async (payload: MessagePayload) => resolve(payload.message.text)))
export const askPhoneNumber = (conversation: Conversation): Promise<string> => new Promise<string>((resolve) => conversation.ask({ text: 'Add mobile phone', quickReplies: [{
  content_type: 'user_phone_number'
}] }, async (payload: MessagePayload) => resolve(payload.message.text)))
