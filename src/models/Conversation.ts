interface Payload {
  message: {
    text: string
  }
}

export default class Conversation {
  static Conversation (chat: any) {
    return new Promise(resolve => chat.conversation(resolve))
  }
  static YesNo (conversation: any, text: string = 'Right?') {
    return new Promise(resolve => conversation.ask({ text, quickReplies: ['Yes', 'No'] }, (payload: Payload) => resolve(payload.message.text === 'Yes')))
  }
  static Question (conversation: any, question: any, confirm: boolean = false, validator: Function = (value: string): boolean => !!value) {
    return new Promise(resolve => conversation.ask(question, async (payload: Payload) => {
      const text = payload.message.text
      console.log('TEXT: ', text)
      if (validator(text)) {
        if (confirm === false) return resolve(text)
        const yes = await Conversation.YesNo(conversation, `${text}, is it correct?`)
        return resolve(yes ? text : await Conversation.Question(conversation, question, confirm, validator))
      } else return resolve(await Conversation.Question(conversation, question, confirm, validator))
    }))
  }
}
