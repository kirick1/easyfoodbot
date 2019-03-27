"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Template {
    static async getOrderReceiptMessage(order, user) {
        return {
            template_type: 'receipt',
            recipient_name: user.getFullName(),
            merchant_name: 'EasyFood Delivery',
            order_number: `${order.id}`,
            currency: 'EUR',
            payment_method: 'Cash',
            summary: {
                subtotal: order.getTotalPrice(),
                total_cost: order.getTotalPrice()
            },
            elements: (await order.getDishesArray()).map((dish) => dish.getElementData()) || []
        };
    }
    static async getOrderGenericMessage(order) {
        return {
            title: `Order #${order.id}`,
            subtitle: `Price: ${order.getTotalPrice().toFixed(2)}€`,
            buttons: [{
                    title: 'Cancel',
                    type: 'postback',
                    payload: `ORDERS_CANCEL___${order.id}`
                }]
        };
    }
    static getDishGenericMessage(dish) {
        return {
            title: `${dish.title} (${dish.getTotalPriceString()})`,
            subtitle: dish.description,
            image_url: dish.photo,
            buttons: [{
                    type: 'web_url',
                    url: dish.photo,
                    title: 'Photo'
                }]
        };
    }
    static getDishesMapGenericMessage(dishesMap) {
        return Array.from(dishesMap.values()).map((dish) => Template.getDishGenericMessage(dish));
    }
    static getContactInformationGenericMessage(user) {
        return {
            title: user.getFullName(),
            subtitle: `Email: ${user.email}\nPhone: ${user.phone}`,
            buttons: [{
                    title: 'Edit',
                    type: 'postback',
                    payload: `ACCOUNT_CONTACT_EDIT___${user.id}`
                }]
        };
    }
}
exports.Template = Template;
//# sourceMappingURL=Template.js.map