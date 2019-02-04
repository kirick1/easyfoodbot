import { Payload } from '../declarations/payload'

export function Conversation (chat: any): Promise<any> {
  return new Promise(resolve => {
    chat.conversation((conversation: any) => {
      return resolve(conversation)
    })
  })
}
export function YesNo (conversation: any, text: string = 'Right?'): Promise<boolean> {
  return new Promise(resolve => {
    conversation.ask({ text, quickReplies: ['Yes', 'No'] }, (payload: Payload) => {
      const answer = payload.message.text
      return resolve(answer === 'Yes')
    })
  })
}
export function defaultTextValidator (text?: string, minLength: number = 0, maxLength: number = 8000): boolean {
  return text !== null && text !== undefined && text !== '' && text.length >= minLength && text.length <= maxLength
}
export function Question (conversation: any, question: any, askConfirmation: boolean = false, validator: Function = defaultTextValidator): Promise<any> {
  return new Promise(resolve => {
    conversation.ask(question, async (payload: Payload) => {
      const answer: string = payload.message.text
      console.log('[QUESTION] (ANSWER): ', answer)
      if (validator(answer)) {
        if (!askConfirmation) return resolve(answer)
        const yes = await YesNo(conversation, `${answer}, is it correct?`)
        return resolve(yes ? answer : await Question(conversation, question, askConfirmation, validator))
      } else return resolve(await Question(conversation, question, askConfirmation, validator))
    })
  })
}
