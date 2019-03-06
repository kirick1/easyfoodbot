"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("../database");
const _1 = require(".");
const controllers_1 = require("../controllers");
class Order {
    constructor(order) {
        this.totalPrice = 0.0;
        this.numberOfRepetitions = 0;
        this.typeOfRepetitions = 'immediate';
        this.status = 'new';
        this.isCompleted = false;
        this.dishes = new Map();
        this.id = order.id;
        this.userID = order.user_id;
        this.totalPrice = order.total_price || 0.0;
        this.numberOfRepetitions = order.number_of_repetitions || 0;
        this.typeOfRepetitions = order.type_of_repetitions || 'immediate';
        this.status = order.status || 'new';
        this.isCompleted = order.is_completed;
        this.dishes = order.dishes instanceof Map && order.dishes.size > 0 ? order.dishes : new Map();
    }
    getTotalPrice() {
        return _1.Dish.getDishesMapTotalPrice(this.dishes);
    }
    getInformation() {
        return {
            id: this.id,
            user_id: this.userID,
            total_price: this.getTotalPrice(),
            number_of_repetitions: this.numberOfRepetitions,
            type_of_repetitions: this.typeOfRepetitions,
            status: this.status,
            is_completed: this.isCompleted,
            dishes: this.dishes
        };
    }
    async getDishes() {
        if (this.dishes.size > 0)
            return this.dishes;
        const { rows: orderDishesIDs } = await database_1.default.query('SELECT dish_id, number FROM order_dishes WHERE order_id = $1', [this.id]);
        for (const { dish_id, number: num } of orderDishesIDs) {
            const { rows: [dishData] } = await database_1.default.query('SELECT id, title, description, photo, price FROM dishes WHERE id = $1', [parseInt(dish_id, 10)]);
            const dish = new _1.Dish(dishData, num);
            this.dishes.set(dish.getTitle(), dish);
        }
        return this.dishes;
    }
    showReceipt(chat, user) {
        return this.status !== 'new'
            ? chat.sendTemplate({
                template_type: 'receipt',
                recipient_name: `${user.firstName} ${user.lastName}`,
                merchant_name: 'EasyFood Delivery',
                order_number: `${this.id}`,
                currency: 'EUR',
                payment_method: 'Cash',
                summary: {
                    total_cost: this.getTotalPrice()
                },
                elements: Array.from(this.dishes.values()).map((dish) => ({
                    title: dish.title,
                    subtitle: dish.description,
                    quantity: dish.numberInOrder,
                    price: dish.getTotalPrice().toFixed(2),
                    currency: 'EUR',
                    image_url: dish.photo
                })) || []
            }) : chat.sendGenericTemplate([{
                title: `Order #${this.id}`,
                subtitle: `Price: ${this.getTotalPrice().toFixed(2)}€`,
                buttons: [{
                        title: 'Cancel',
                        type: 'postback',
                        payload: `ORDERS_CANCEL___${this.id}`
                    }]
            }], (payload) => console.log('PAYLOAD: ', payload));
    }
    static async create(dishes, user, notify = true) {
        const totalPrice = _1.Dish.getDishesMapTotalPrice(dishes);
        const { rows: [orderData] } = await database_1.default.query('INSERT INTO orders (user_id, total_price) VALUES ($1, $2) RETURNING *', [user.id, totalPrice]);
        for (const dish of dishes.values())
            await database_1.default.query('INSERT INTO order_dishes (order_id, dish_id, number) VALUES ($1, $2, $3)', [parseInt(orderData.id, 10), dish.id, dish.numberInOrder || 1]);
        const order = new Order(orderData);
        if (notify)
            await database_1.default.query(`NOTIFY new_order, '${JSON.stringify(order.getInformation())}'`);
        return order;
    }
    static async makeImmediateOrder(chat, user) {
        try {
            const dishes = await controllers_1.SelectDishesForOrder(chat);
            return await Order.create(dishes, user);
        }
        catch (error) {
            console.error('[BOT] [ORDER] ERROR MAKING IMMEDIATE ORDER: ', error);
            throw Error(error);
        }
    }
    static async toArray(orders) {
        const result = [];
        for (const orderData of orders) {
            const order = new Order(orderData);
            await order.getDishes();
            result.push(order);
        }
        return result;
    }
    static async getOrderByID(orderID) {
        const { rows: [orderData] } = await database_1.default.query('SELECT * FROM orders WHERE id = $1', [orderID]);
        const order = new Order(orderData);
        await order.getDishes();
        return order;
    }
}
exports.Order = Order;
//# sourceMappingURL=Order.js.map