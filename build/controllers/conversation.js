"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function Conversation(chat) {
    return new Promise(resolve => {
        chat.conversation((conversation) => {
            return resolve(conversation);
        });
    });
}
exports.Conversation = Conversation;
function YesNo(conversation, text = 'Right?') {
    return new Promise(resolve => {
        conversation.ask({ text, quickReplies: ['Yes', 'No'] }, (payload) => {
            const answer = payload.message.text;
            return resolve(answer === 'Yes');
        });
    });
}
exports.YesNo = YesNo;
function defaultTextValidator(text, minLength = 0, maxLength = 8000) {
    return text !== null && text !== undefined && text !== '' && text.length >= minLength && text.length <= maxLength;
}
exports.defaultTextValidator = defaultTextValidator;
function Question(conversation, question, askConfirmation = false, validator = defaultTextValidator) {
    return new Promise(resolve => {
        conversation.ask(question, async (payload) => {
            const answer = payload.message.text;
            console.log('[QUESTION] (ANSWER): ', answer);
            if (validator(answer)) {
                if (!askConfirmation)
                    return resolve(answer);
                const yes = await YesNo(conversation, `${answer}, is it correct?`);
                return resolve(yes ? answer : await Question(conversation, question, askConfirmation, validator));
            }
            else
                return resolve(await Question(conversation, question, askConfirmation, validator));
        });
    });
}
exports.Question = Question;
//# sourceMappingURL=conversation.js.map