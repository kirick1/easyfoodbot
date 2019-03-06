"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("../database");
const _1 = require(".");
class DishesSet {
    constructor(dishesSet) {
        this.id = dishesSet.id;
        this.title = dishesSet.title;
        this.dishes = dishesSet.dishes || new Map();
    }
    getTitle(maxLength = 20) {
        return this.title.slice(0, maxLength).trim();
    }
    getTotalPrice() {
        return _1.Dish.getDishesMapTotalPrice(this.dishes);
    }
    async getDishes() {
        if (this.dishes.size > 0)
            return this.dishes;
        const { rows: setDishesIDs } = await database_1.default.query('SELECT dish_id FROM set_dishes WHERE set_id = $1', [this.id]);
        for (const { dish_id } of setDishesIDs) {
            const { rows: [dishData] } = await database_1.default.query('SELECT id, title, description, photo, price FROM dishes WHERE id = $1', [parseInt(dish_id, 10)]);
            const dish = new _1.Dish(dishData);
            this.dishes.set(dish.getTitle(), dish);
        }
        return this.dishes;
    }
    static async getAllDishesSets() {
        const map = new Map();
        const { rows: dishesSets } = await database_1.default.query('SELECT id, title FROM sets');
        for (const dishesSetData of dishesSets) {
            const dishesSet = new DishesSet(dishesSetData);
            await dishesSet.getDishes();
            map.set(dishesSet.getTitle(), dishesSet);
        }
        return map;
    }
}
exports.DishesSet = DishesSet;
//# sourceMappingURL=DishesSet.js.map