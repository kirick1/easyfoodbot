import { Payload, Chat, Conversation } from '../types'

export const createConversation = (chat: Chat): Promise<Conversation> => new Promise(resolve => chat.conversation(resolve))
export const askYesNo = (conversation: Conversation, text: string = 'Right?'): Promise<boolean> => new Promise(resolve => conversation.ask({ text, quickReplies: ['Yes', 'No'] }, (payload: Payload) => resolve(payload.message.text === 'Yes')))

export const defaultTextValidator = (text?: string, minLength: number = 0, maxLength: number = 8000): boolean => text !== null && text !== undefined && text !== '' && text.length >= minLength && text.length <= maxLength

export const askQuestion = (conversation: Conversation, question: any, askConfirmation: boolean = false, validator: Function = defaultTextValidator): Promise<string> => new Promise(resolve => conversation.ask(question, async (payload: Payload) => {
  const answer = payload.message.text
  if (validator(answer)) {
    if (!askConfirmation) return resolve(answer)
    const yes = await askYesNo(conversation, `${answer}, is it correct?`)
    return resolve(yes ? answer : await askQuestion(conversation, question, askConfirmation, validator))
  } else return resolve(await askQuestion(conversation, question, askConfirmation, validator))
}))
