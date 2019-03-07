"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const classes_1 = require("../classes");
const _1 = require(".");
var KEY;
(function (KEY) {
    KEY["SETS"] = "(Sets)";
    KEY["SUBMIT"] = "(Submit)";
    KEY["CANCEL"] = "(Cancel)";
    KEY["SELECTED_DISHES"] = "SelectedDishes";
})(KEY || (KEY = {}));
const selectDishesSet = async (conversation, dishesSets) => {
    if (dishesSets.size === 0) {
        await conversation.say('There are no sets yet!');
        await conversation.end();
        throw Error('There are no sets yet!');
    }
    const selectedDishesSetTitle = await _1.askQuestion(conversation, { text: 'Food sets', quickReplies: Array.from(dishesSets.keys()) });
    const selectedDishesSet = dishesSets.get(selectedDishesSetTitle);
    if (!selectedDishesSet || !selectedDishesSet.dishes || selectedDishesSet.dishes.size === 0) {
        await conversation.say('There are no dishes in selected set!');
        return selectDishesSet(conversation, dishesSets);
    }
    else {
        await classes_1.Dish.showDishesMapInformation(conversation, selectedDishesSet.dishes);
        return selectedDishesSet.dishes;
    }
};
const selectDishesFromDishesSet = async (conversation, dishesSets, dishesMap = new Map(), text = null) => {
    if (dishesMap.size === 0) {
        const dishesSetDishes = await selectDishesSet(conversation, dishesSets);
        return selectDishesFromDishesSet(conversation, dishesSets, dishesSetDishes, text);
    }
    const selectedDishes = conversation.get(KEY.SELECTED_DISHES);
    if (selectedDishes === undefined || selectedDishes === null || !(selectedDishes instanceof Map)) {
        await conversation.say('Selected dishes not found, please try again!');
        return selectDishesFromDishesSet(conversation, dishesSets, dishesMap, text);
    }
    if (text === null && selectedDishes.size > 0)
        text = classes_1.Dish.getSelectedDishesPriceListString(selectedDishes);
    const answer = await _1.askQuestion(conversation, { text, quickReplies: [...dishesMap.keys(), KEY.SETS, KEY.SUBMIT, KEY.CANCEL] });
    switch (answer) {
        case KEY.SETS: {
            return selectDishesFromDishesSet(conversation, dishesSets);
        }
        case KEY.SUBMIT: {
            const selectedDishes = conversation.get(KEY.SELECTED_DISHES);
            if (selectedDishes.size > 0) {
                const submit = await _1.askYesNo(conversation, `Total price is ${classes_1.Dish.getDishesMapTotalPriceString(selectedDishes)}, make order?`);
                if (!submit)
                    return selectDishesFromDishesSet(conversation, dishesSets);
                await conversation.end();
                return selectedDishes;
            }
            else {
                await conversation.say('Dishes not selected yet!');
                return selectDishesFromDishesSet(conversation, dishesSets);
            }
        }
        case KEY.CANCEL: {
            if (await _1.askYesNo(conversation, `Are you really want to cancel this order?`)) {
                await conversation.say('Order was canceled!');
                await conversation.end();
                throw Error('Order was canceled!');
            }
            else
                return selectDishesFromDishesSet(conversation, dishesSets);
        }
        default: {
            const dish = dishesMap.get(answer);
            if (dish === undefined || dish === null || !(dish instanceof classes_1.Dish))
                return selectDishesFromDishesSet(conversation, dishesSets, dishesMap);
            let selectedDish = selectedDishes.get(answer);
            if (selectedDish !== undefined && selectedDish !== null && selectedDish instanceof classes_1.Dish) {
                selectedDish.numberInOrder += 1;
                selectedDishes.set(selectedDish.getTitle(), selectedDish);
            }
            else {
                dish.numberInOrder = 1;
                selectedDishes.set(dish.getTitle(), dish);
            }
            conversation.set(KEY.SELECTED_DISHES, selectedDishes);
            return selectDishesFromDishesSet(conversation, dishesSets, dishesMap);
        }
    }
};
exports.SelectDishesForOrder = async (chat) => {
    const conversation = await _1.createConversation(chat);
    conversation.set(KEY.SELECTED_DISHES, new Map());
    const dishesSets = await classes_1.DishesSet.getAllDishesSets();
    if (dishesSets.size === 0) {
        await conversation.say('There are no food sets yet!');
        await conversation.end();
        return new Map();
    }
    try {
        const selectedDishes = await selectDishesFromDishesSet(conversation, dishesSets, new Map(), 'Select the desired number of products');
        if (selectedDishes && selectedDishes.size > 0)
            return selectedDishes;
        else
            return exports.SelectDishesForOrder(chat);
    }
    catch (error) {
        console.error('[BOT] [SELECTION] SELECTING DISHES FOR ORDER ERROR: ', error);
        if (typeof error === 'string')
            await conversation.say(error);
        else
            await conversation.say('Something went wrong, please try again later!');
        await conversation.end();
        return new Map();
    }
};
//# sourceMappingURL=selections.js.map