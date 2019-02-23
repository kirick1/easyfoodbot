"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("../database");
const Dish_1 = require("./Dish");
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
        let total = 0.0;
        for (const dish of this.dishes.values())
            total += dish.getTotalPrice();
        return total;
    }
    async getDishes() {
        if (this.dishes.size > 0)
            return this.dishes;
        try {
            const { rows: setDishesIDs } = await database_1.default.query('SELECT dish_id FROM set_dishes WHERE set_id = $1', [this.id]);
            for (const { dish_id } of setDishesIDs) {
                const { rows: [dishData] } = await database_1.default.query('SELECT id, title, description, photo, price FROM dishes WHERE id = $1', [parseInt(dish_id, 10)]);
                if (dishData) {
                    const dish = new Dish_1.default(dishData);
                    this.dishes.set(dish.getTitle(), dish);
                }
            }
        }
        catch (error) {
            console.error('[BOT] [DISHES SET] ERROR GETTING SET DISHES: ', error);
        }
        return this.dishes;
    }
    static async getAllDishesSets() {
        const map = new Map();
        try {
            const { rows: dishesSets } = await database_1.default.query('SELECT id, title FROM sets');
            for (const dishesSetData of dishesSets) {
                const dishesSet = new DishesSet(dishesSetData);
                await dishesSet.getDishes();
                map.set(dishesSet.getTitle(), dishesSet);
            }
        }
        catch (error) {
            console.error('[BOT] [DISHES SET] ERROR GETTING ALL DISHES SETS: ', error);
        }
        return map;
    }
}
exports.default = DishesSet;
//# sourceMappingURL=DishesSet.js.map