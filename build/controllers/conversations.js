"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createConversation = (chat) => new Promise((resolve) => chat.conversation(resolve));
exports.askYesNo = (conversation, text = 'Right?') => new Promise((resolve) => conversation.ask({ text, quickReplies: ['Yes', 'No'] }, (payload) => resolve(payload.message.text === 'Yes')));
exports.defaultTextValidator = (text, minLength = 0, maxLength = 8000) => text.length >= minLength && text.length <= maxLength;
exports.askQuestion = (conversation, question, askConfirmation = false, validator = exports.defaultTextValidator) => new Promise((resolve) => conversation.ask(question, async (payload) => {
    const answer = payload.message.text;
    if (validator(answer)) {
        if (!askConfirmation)
            return resolve(answer);
        return resolve(await exports.askYesNo(conversation, `${answer}, is it correct?`)
            ? answer
            : await exports.askQuestion(conversation, question, askConfirmation, validator));
    }
    else
        return resolve(await exports.askQuestion(conversation, question, askConfirmation, validator));
}));
//# sourceMappingURL=conversations.js.map