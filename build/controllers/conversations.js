"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createConversation = (chat) => new Promise((resolve) => chat.conversation(resolve));
exports.askYesNo = (conversation, text = 'Right?') => new Promise((resolve) => conversation.ask({ text, quickReplies: ['Yes', 'No'] }, (payload) => resolve(payload.message.text === 'Yes')));
exports.defaultTextValidator = (text, minLength = 0, maxLength = 8000) => text.length >= minLength && text.length <= maxLength;
exports.askQuestion = (conversation, question, askConfirmation = false, validator = exports.defaultTextValidator) => new Promise((resolve) => conversation.ask(question, async (payload) => {
    const text = payload.message.text;
    if (validator(text)) {
        if (!askConfirmation)
            return resolve(text);
        return resolve(await exports.askYesNo(conversation, `${text}, is it correct?`)
            ? text
            : await exports.askQuestion(conversation, question, askConfirmation, validator));
    }
    else
        return resolve(await exports.askQuestion(conversation, question, askConfirmation, validator));
}));
exports.askEmail = (conversation) => new Promise((resolve) => conversation.ask({ text: 'Add email', quickReplies: [{
            content_type: 'user_email'
        }] }, async (payload) => resolve(payload.message.text)));
exports.askPhoneNumber = (conversation) => new Promise((resolve) => conversation.ask({ text: 'Add mobile phone', quickReplies: [{
            content_type: 'user_phone_number'
        }] }, async (payload) => resolve(payload.message.text)));
//# sourceMappingURL=conversations.js.map