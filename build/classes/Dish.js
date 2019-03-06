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
    inOrder() {
        return this.numberInOrder > 0 && this.getTotalPrice() > 0.0;
    }
    addOne() {
        this.numberInOrder += 1;
        return this;
    }
    getTitle(maxLength = 20) {
        return this.title.slice(0, maxLength).trim();
    }
    getTotalPrice() {
        return this.numberInOrder > 0 ? this.price * this.numberInOrder : this.price;
    }
    getPriceString(currency = '€') {
        return this.inOrder()
            ? `${this.numberInOrder} ${this.title} ${this.getTotalPrice().toFixed(2)}${currency}`
            : `${this.title} ${this.getTotalPrice().toFixed(2)}${currency}`;
    }
    static getSubmittedDishesPriceListString(dishesMap, currency = '€') {
        if (dishesMap.size === 0)
            return 'No dishes!';
        let result = 'Selected dishes:\n\n';
        for (const dish of dishesMap.values())
            result += dish.getPriceString();
        result += `\nTotal price: ${Dish.getDishesMapTotalPrice(dishesMap).toFixed(2)}${currency}`;
        return result;
    }
    static getDishesMapTotalPrice(dishesMap) {
        return Array.from(dishesMap.values()).reduce((total, current) => total + current.getTotalPrice(), 0.0);
    }
}
exports.Dish = Dish;
//# sourceMappingURL=Dish.js.map