import { Dish, DishesSet } from '../classes'
import { Conversation, Chat } from '../types'
import { askQuestion, askYesNo, createConversation } from '.'

enum KEY {
  SETS = '(Sets)',
  SUBMIT = '(Submit)',
  CANCEL = '(Cancel)',
  SELECTED_DISHES = 'SelectedDishes'
}

const selectDishesSet = async (conversation: Conversation, dishesSets: Map<string, DishesSet>): Promise<Map<string, Dish>> => {
  if (dishesSets.size === 0) {
    await conversation.say('There are no sets yet!')
    await conversation.end()
    throw Error('There are no sets yet!')
  }
  const selectedDishesSetTitle = await askQuestion(conversation, { text: 'Food sets', quickReplies: Array.from(dishesSets.keys()) })
  const selectedDishesSet = dishesSets.get(selectedDishesSetTitle)
  if (!selectedDishesSet || !selectedDishesSet.dishes || selectedDishesSet.dishes.size === 0) {
    await conversation.say('There are no dishes in selected set!')
    return selectDishesSet(conversation, dishesSets)
  } else {
    await Dish.showDishesMapInformation(conversation, selectedDishesSet.dishes)
    return selectedDishesSet.dishes
  }
}
const selectDishesFromDishesSet = async (conversation: Conversation, dishesSets: Map<string, DishesSet>, dishesMap: Map<string, Dish> = new Map<string, Dish>(), text: string | null = null): Promise<Map<string, Dish>> => {
  if (dishesMap.size === 0) {
    const dishesSetDishes = await selectDishesSet(conversation, dishesSets)
    return selectDishesFromDishesSet(conversation, dishesSets, dishesSetDishes, text)
  }
  const selectedDishes: Map<string, Dish> = conversation.get(KEY.SELECTED_DISHES)
  if (selectedDishes === undefined || selectedDishes === null || !(selectedDishes instanceof Map)) {
    await conversation.say('Selected dishes not found, please try again!')
    return selectDishesFromDishesSet(conversation, dishesSets, dishesMap, text)
  }
  if (text === null && selectedDishes.size > 0) text = Dish.getSelectedDishesPriceListString(selectedDishes)
  const answer = await askQuestion(conversation, { text, quickReplies: [...dishesMap.keys(), KEY.SETS, KEY.SUBMIT, KEY.CANCEL] })
  switch (answer) {
    case KEY.SETS: {
      return selectDishesFromDishesSet(conversation, dishesSets)
    }
    case KEY.SUBMIT: {
      const selectedDishes: Map<string, Dish> = conversation.get(KEY.SELECTED_DISHES)
      if (selectedDishes.size > 0) {
        const submit = await askYesNo(conversation, `Total price is ${Dish.getDishesMapTotalPriceString(selectedDishes)}, make order?`)
        if (!submit) return selectDishesFromDishesSet(conversation, dishesSets)
        await conversation.end()
        return selectedDishes
      } else {
        await conversation.say('Dishes not selected yet!')
        return selectDishesFromDishesSet(conversation, dishesSets)
      }
    }
    case KEY.CANCEL: {
      if (await askYesNo(conversation, `Are you really want to cancel this order?`)) {
        await conversation.say('Order was canceled!')
        await conversation.end()
        throw Error('Order was canceled!')
      } else return selectDishesFromDishesSet(conversation, dishesSets)
    }
    default: {
      console.log('ANSWER: ', answer)
      console.log('DISHES MAP: ', dishesMap)
      const dish = dishesMap.get(answer)
      console.log('DISH: ', dish)
      if (dish === undefined || dish === null || !(dish instanceof Dish)) return selectDishesFromDishesSet(conversation, dishesSets, dishesMap)
      let selectedDish = selectedDishes.get(answer)
      if (selectedDish !== undefined && selectedDish !== null && selectedDish instanceof Dish) {
        selectedDish.numberInOrder += 1
        selectedDishes.set(selectedDish.getTitle(), selectedDish)
      } else {
        dish.numberInOrder = 1
        selectedDishes.set(dish.getTitle(), dish)
      }
      conversation.set(KEY.SELECTED_DISHES, selectedDishes)
      return selectDishesFromDishesSet(conversation, dishesSets, dishesMap)
    }
  }
}
export const SelectDishesForOrder = async (chat: Chat): Promise<Map<string, Dish>> => {
  const conversation = await createConversation(chat)
  conversation.set(KEY.SELECTED_DISHES, new Map<string, Dish>())
  const dishesSets: Map<string, DishesSet> = await DishesSet.getAllDishesSets()
  if (dishesSets.size === 0) {
    await conversation.say('There are no food sets yet!')
    await conversation.end()
    return new Map<string, Dish>()
  }
  try {
    const selectedDishes = await selectDishesFromDishesSet(conversation, dishesSets, new Map<string, Dish>(), 'Select the desired number of products')
    if (selectedDishes && selectedDishes.size > 0) return selectedDishes
    else return SelectDishesForOrder(chat)
  } catch (error) {
    console.error('[BOT] [SELECTION] SELECTING DISHES FOR ORDER ERROR: ', error)
    if (typeof error === 'string') await conversation.say(error)
    else await conversation.say('Something went wrong, please try again later!')
    await conversation.end()
    return new Map<string, Dish>()
  }
}
