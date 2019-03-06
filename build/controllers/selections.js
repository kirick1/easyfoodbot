"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const classes_1 = require("../classes");
const _1 = require(".");
const getSelectedDishes = (conversation) => {
    const selectedDishes = conversation.get('selectedDishes');
    if (selectedDishes && selectedDishes instanceof Map)
        return selectedDishes;
    conversation.set('selectedDishes', new Map());
    return getSelectedDishes(conversation);
};
exports.selectDishesSet = async (conversation, dishesSets) => {
    if (dishesSets.size === 0) {
        await conversation.say('There are no sets yet!');
        await conversation.end();
        throw Error('There are no sets yet!');
    }
    getSelectedDishes(conversation);
    const dishesSet = dishesSets.get(await _1.askQuestion(conversation, { text: 'Food sets', quickReplies: Array.from(dishesSets.keys()) }));
    if (!dishesSet || dishesSet.dishes.size === 0) {
        await conversation.say('There are no dishes in selected set!');
        return exports.selectDishesSet(conversation, dishesSets);
    }
    await conversation.sendGenericTemplate(Array.from(dishesSet.dishes.values()).map((dish) => ({
        title: `${dish.title} (${dish.getTotalPrice().toFixed(2)})`,
        subtitle: dish.description,
        image_url: dish.photo,
        buttons: [{
                type: 'web_url',
                url: dish.photo,
                title: 'Photo'
            }]
    })));
    return dishesSet;
};
exports.getSelectedDishesFromSelectedDishesSet = async (conversation, dishesSets, selectedDishesSet = null, text = 'Select the desired number of products') => {
    if (selectedDishesSet === null)
        return exports.getSelectedDishesFromSelectedDishesSet(conversation, dishesSets, await exports.selectDishesSet(conversation, dishesSets), text);
    const selectedDishes = getSelectedDishes(conversation);
    const answer = await _1.askQuestion(conversation, { text: text || classes_1.Dish.getSubmittedDishesPriceListString(selectedDishes), quickReplies: [...selectedDishesSet.dishes.keys(), '(Sets)', '(Submit)', '(Cancel)'] });
    switch (answer) {
        case '(Sets)': {
            const dishesSet = await exports.selectDishesSet(conversation, dishesSets);
            return exports.getSelectedDishesFromSelectedDishesSet(conversation, dishesSets, dishesSet);
        }
        case '(Submit)': {
            if (!(await _1.askYesNo(conversation, `Total price is ${classes_1.Dish.getDishesMapTotalPrice(selectedDishes).toFixed(2)}€, make order?`)))
                return exports.getSelectedDishesFromSelectedDishesSet(conversation, dishesSets, selectedDishesSet);
            await conversation.end();
            return selectedDishes;
        }
        case '(Cancel)': {
            if (await _1.askYesNo(conversation, `Are you really want to cancel this order?`)) {
                await conversation.say('Order was canceled!');
                await conversation.end();
                throw Error('Order was canceled!');
            }
            else
                return exports.getSelectedDishesFromSelectedDishesSet(conversation, dishesSets, selectedDishesSet);
        }
        default: {
            const selectedDish = selectedDishesSet.dishes.get(answer);
            if (!selectedDish)
                return exports.getSelectedDishesFromSelectedDishesSet(conversation, dishesSets, selectedDishesSet, null);
            selectedDishes.set(selectedDish.getTitle(), selectedDish.addOne());
            conversation.set('selectedDishes', selectedDishes);
            return exports.getSelectedDishesFromSelectedDishesSet(conversation, dishesSets, selectedDishesSet);
        }
    }
};
exports.SelectDishesForOrder = async (chat) => {
    const conversation = await _1.createConversation(chat);
    try {
        return await exports.getSelectedDishesFromSelectedDishesSet(conversation, await classes_1.DishesSet.getAllDishesSets(), null, 'Select the desired number of products');
    }
    catch (error) {
        console.error('[BOT] [SELECTION] SELECTING DISHES FOR ORDER ERROR: ', error);
        await conversation.say('Something went wrong, please try again later!');
        return conversation.end();
    }
};
//# sourceMappingURL=selections.js.map