"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const User_1 = require("../classes/User");
const orders_1 = require("./orders");
const account_1 = require("./account");
async function PostbackEvents(payload, chat, data) {
    try {
        if (data && data.captured)
            console.warn('[BOT] [POSTBACK] DATA CAPTURED!');
        const user = new User_1.default();
        await user.syncInformation(chat);
        if (!payload.postback || !payload.postback.payload)
            return await chat.say('Error: no payload! Please try again!');
        const command = payload.postback.payload;
        if (command === 'BOOTBOT_GET_STARTED')
            return await chat.say(`Hello, ${user.firstName} ${user.lastName}!`);
        else if (command === 'WRITE_FEEDBACK')
            return await user.writeFeedBack(chat);
        const [commandType] = command.split('_');
        if (commandType === 'ORDERS')
            return await orders_1.default(chat, command, user);
        else if (commandType === 'ACCOUNT')
            return await account_1.default(chat, command, user);
        else
            return await chat.say('Unknown command type!');
    }
    catch (error) {
        console.error('[BOT] ERROR PROCESSING POSTBACK EVENT: ', error);
        return chat.say('Something went wrong, please try again');
    }
}
exports.PostbackEvents = PostbackEvents;
//# sourceMappingURL=index.js.map