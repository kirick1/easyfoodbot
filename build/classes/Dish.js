"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Dish {
    constructor(dish, numberInOrder = null) {
        this.price = 0.0;
        this.numberInOrder = 0;
        this.id = dish.id;
        this.title = dish.title;
        this.description = dish.description;
        this.photo = dish.photo;
        this.price = dish.price || 0.0;
        this.numberInOrder = dish.numberInOrder || 0;
        if (numberInOrder !== null)
            this.numberInOrder = numberInOrder || this.numberInOrder;
    }
    getTitle(maxLength = 20) {
        return this.title.slice(0, maxLength).trim();
    }
    getTotalPrice() {
        return this.numberInOrder > 0 ? this.price * this.numberInOrder : this.price;
    }
    getTotalPriceString(currency = '€') {
        return `${this.getTotalPrice().toFixed(2)}${currency}`;
    }
    inOrder() {
        return this.numberInOrder > 0 && this.getTotalPrice() > 0.0;
    }
    getPriceListString() {
        return this.inOrder()
            ? `* (${this.numberInOrder}) ${this.title} ${this.getTotalPriceString()}\n`
            : `* ${this.title} ${this.getTotalPriceString()}\n`;
    }
    static getSelectedDishesPriceListString(dishesMap, currency = '€') {
        if (dishesMap.size === 0)
            return 'No dishes!';
        let result = 'Selected dishes:\n\n';
        for (const dish of dishesMap.values())
            result += dish.getPriceListString();
        result += `\nTotal price: ${Dish.getDishesMapTotalPriceString(dishesMap, currency)}`;
        return result;
    }
    static getDishesMapTotalPrice(dishesMap) {
        return Array.from(dishesMap.values()).reduce((total, current) => total + current.getTotalPrice(), 0.0);
    }
    static getDishesMapTotalPriceString(dishesMap, currency = '€') {
        return `${Dish.getDishesMapTotalPrice(dishesMap).toFixed(2)}${currency}`;
    }
    static async showDishesMapInformation(conversation, dishesMap) {
        return dishesMap.size > 0
            ? conversation.sendGenericTemplate(Array.from(dishesMap.values()).map((dish) => ({
                title: `${dish.title} (${dish.getTotalPriceString()})`,
                subtitle: dish.description,
                image_url: dish.photo,
                buttons: [{
                        type: 'web_url',
                        url: dish.photo,
                        title: 'Photo'
                    }]
            })))
            : conversation.say('No dishes!');
    }
}
exports.Dish = Dish;
//# sourceMappingURL=Dish.js.map