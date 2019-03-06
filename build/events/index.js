"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const classes_1 = require("../classes");
const orders_1 = require("./orders");
const account_1 = require("./account");
exports.PostbackEventHandler = async (payload, chat) => {
    try {
        const user = new classes_1.User();
        await user.syncInformation(chat);
        const command = payload.postback.payload;
        switch (command) {
            case 'BOOTBOT_GET_STARTED': {
                return chat.say(`Hello, ${user.firstName} ${user.lastName}!`);
            }
            case 'WRITE_FEEDBACK': {
                return await user.writeFeedBack(chat);
            }
            default: {
                const [commandType] = command.split('_');
                switch (commandType) {
                    case 'ORDERS': {
                        return await orders_1.OrderEventsHandler(chat, command, user);
                    }
                    case 'ACCOUNT': {
                        return await account_1.AccountEventsHandler(chat, command, user);
                    }
                    default: {
                        return await chat.say('Unknown command type!');
                    }
                }
            }
        }
    }
    catch (error) {
        console.error('[BOT] ERROR PROCESSING POSTBACK EVENT: ', error);
        return chat.say('Something went wrong, please try again');
    }
};
//# sourceMappingURL=index.js.map