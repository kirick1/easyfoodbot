"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const User_1 = require("../classes/User");
const Order_1 = require("../classes/Order");
async function default_1(chat, command, user) {
    try {
        switch (command) {
            case 'ORDERS_MAKE_ORDER_NOW': {
                const order = await Order_1.default.makeImmediateOrder(chat, user);
                await order.showReceipt(chat, user);
                break;
            }
            case 'ORDERS_CREATED_ORDERS': {
                const orders = await user.getCreatedOrders();
                if (orders.length < 1)
                    return await chat.say('There are no created orders!');
                await chat.say('Created orders:');
                for (const order of orders)
                    await order.showReceipt(chat, user);
                break;
            }
            case 'ORDERS_CURRENT_ORDERS': {
                const orders = await user.getCurrentOrders();
                if (orders.length < 1)
                    return await chat.say('There are no current orders!');
                await chat.say('Current orders:');
                for (const order of orders)
                    await order.showReceipt(chat, user);
                break;
            }
            case 'ORDERS_COMPLETED_ORDERS': {
                const orders = await user.getCompletedOrders();
                if (orders.length < 1)
                    return await chat.say('There are no completed orders!');
                await chat.say('Completed orders:');
                for (const order of orders)
                    await order.showReceipt(chat, user);
                break;
            }
            default: {
                const [action, orderID] = command.split('___');
                switch (action) {
                    case 'ORDERS_CANCEL': {
                        if (!orderID)
                            return await chat.say('No order!');
                        const order = await Order_1.default.getOrderByID(orderID);
                        await User_1.default.cancelOrder(order);
                        await chat.say(`Order #${order.id} was canceled!`);
                        const created = await user.getCreatedOrders();
                        if (created.length > 0)
                            await chat.say('Created orders:');
                        else
                            await chat.say('There are no created orders!');
                        for (const o of created)
                            await o.showReceipt(chat, user);
                        break;
                    }
                    default: {
                        console.warn('[BOT] [POSTBACK] UNKNOWN COMMAND: ', command);
                        await chat.say('Unknown command, please try again!');
                        break;
                    }
                }
            }
        }
    }
    catch (error) {
        console.error('[BOT] [EVENTS] ORDERS ERROR: ', error);
        throw Error(error);
    }
}
exports.default = default_1;
//# sourceMappingURL=orders.js.map