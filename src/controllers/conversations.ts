import { MessagePayload, Chat, Conversation } from '../types'

export const createConversation = (chat: Chat): Promise<Conversation> => new Promise<Conversation>((resolve) => chat.conversation(resolve))
export const askYesNo = (conversation: Conversation, text: string = 'Right?'): Promise<boolean> => new Promise<boolean>((resolve) => conversation.ask({ text, quickReplies: ['Yes', 'No'] }, (payload: MessagePayload) => resolve(payload.message.text === 'Yes')))

export const defaultTextValidator = (text: string, minLength: number = 0, maxLength: number = 8000): boolean => text.length >= minLength && text.length <= maxLength

/*export const askSelection = (conversation: Conversation, text: string, quickReplies: Array<string>): Promise<string> => new Promise(async (resolve) => conversation.ask({ text, quickReplies }, async (payload: MessagePayload) => {
  const text = payload.message.text
  return resolve(text.length > 0 && text.length < 8000 ? text : await askSelection(conversation, text, quickReplies))
}))*/

export const askQuestion = (conversation: Conversation, question: any, askConfirmation: boolean = false, validator: Function = defaultTextValidator): Promise<string> => new Promise<string>((resolve) => conversation.ask(question, async (payload: MessagePayload) => {
  const text = payload.message.text
  if (validator(text)) {
    if (!askConfirmation) return resolve(text)
    return resolve(
      await askYesNo(conversation, `${text}, is it correct?`)
        ? text
        : await askQuestion(conversation, question, askConfirmation, validator))
  } else return resolve(await askQuestion(conversation, question, askConfirmation, validator))
}))
