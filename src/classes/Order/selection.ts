import { IConversation } from '../../types'
import { Dish } from './Dish'
import { DishesSet } from './DishesSet'
import { Conversation } from '..'

enum SELECTION_DEFAULT_KEYS {
  SETS = '(Sets)',
  SUBMIT = '(Submit)',
  CANCEL = '(Cancel)',
  SELECTED_DISHES = 'SelectedDishes'
}

const selectDishesSet = async (conversation: IConversation, dishesSets: Map<string, DishesSet>): Promise<Map<string, Dish>> => {
  if (dishesSets.size === 0) {
    await conversation.say('There are no sets yet!')
    await conversation.end()
    throw Error('There are no sets yet!')
  }
  const selectedDishesSetTitle = await Conversation.askQuestion(conversation, {
    text: 'Available dishes sets:',
    quickReplies: Array.from(dishesSets.keys())
  })
  const selectedDishesSet = dishesSets.get(selectedDishesSetTitle)
  if (!selectedDishesSet || !selectedDishesSet.dishes || selectedDishesSet.dishes.size === 0) {
    await conversation.say('There are no dishes in selected set!')
    return selectDishesSet(conversation, dishesSets)
  } else {
    await Dish.showDishesMapInformation(conversation, selectedDishesSet.dishes)
    return selectedDishesSet.dishes
  }
}

const selectDishesFromDishesSet = async (conversation: IConversation, dishesSets: Map<string, DishesSet>, dishesMap: Map<string, Dish> = new Map<string, Dish>(), text: string | null = null): Promise<Map<string, Dish>> => {
  if (dishesMap.size === 0) {
    const dishesSetDishes = await selectDishesSet(conversation, dishesSets)
    return selectDishesFromDishesSet(conversation, dishesSets, dishesSetDishes, text)
  }
  const selectedDishes: Map<string, Dish> = conversation.get(SELECTION_DEFAULT_KEYS.SELECTED_DISHES)
  if (selectedDishes === undefined || selectedDishes === null || !(selectedDishes instanceof Map)) {
    await conversation.say('Selected dishes not found, please try again!')
    return selectDishesFromDishesSet(conversation, dishesSets, dishesMap, text)
  }
  if (text === null && selectedDishes.size > 0) text = Dish.getSelectedDishesPriceListString(selectedDishes)
  const answer = await Conversation.askQuestion(conversation, {
    text: text,
    quickReplies: [...dishesMap.keys(), SELECTION_DEFAULT_KEYS.SETS, SELECTION_DEFAULT_KEYS.SUBMIT, SELECTION_DEFAULT_KEYS.CANCEL]
  })
  switch (answer) {
    case SELECTION_DEFAULT_KEYS.SETS: {
      return selectDishesFromDishesSet(conversation, dishesSets)
    }
    case SELECTION_DEFAULT_KEYS.SUBMIT: {
      const selectedDishes: Map<string, Dish> = conversation.get(SELECTION_DEFAULT_KEYS.SELECTED_DISHES)
      if (selectedDishes.size > 0) {
        const submit = await Conversation.askYesNo(conversation, `Total price is ${Dish.getDishesMapTotalPriceString(selectedDishes)}, make order?`)
        if (!submit) return selectDishesFromDishesSet(conversation, dishesSets)
        await conversation.end()
        return selectedDishes
      } else {
        await conversation.say('Dishes not selected yet!')
        return selectDishesFromDishesSet(conversation, dishesSets)
      }
    }
    case SELECTION_DEFAULT_KEYS.CANCEL: {
      if (await Conversation.askYesNo(conversation, `Are you really want to cancel this order?`)) {
        await conversation.say('Order was canceled!')
        await conversation.end()
        throw Error('Order was canceled!')
      } else return selectDishesFromDishesSet(conversation, dishesSets)
    }
    default: {
      const dish = dishesMap.get(answer)
      if (dish === undefined || dish === null || !(dish instanceof Dish)) return selectDishesFromDishesSet(conversation, dishesSets, dishesMap)
      let selectedDish = selectedDishes.get(answer)
      if (selectedDish !== undefined && selectedDish !== null && selectedDish instanceof Dish) {
        selectedDish.numberInOrder += 1
        selectedDishes.set(selectedDish.getTitle(), selectedDish)
      } else {
        dish.numberInOrder = 1
        selectedDishes.set(dish.getTitle(), dish)
      }
      conversation.set(SELECTION_DEFAULT_KEYS.SELECTED_DISHES, selectedDishes)
      return selectDishesFromDishesSet(conversation, dishesSets, dishesMap)
    }
  }
}

export const SelectDishesForOrder = async (conversation: IConversation): Promise<Map<string, Dish>> => {
  conversation.set(SELECTION_DEFAULT_KEYS.SELECTED_DISHES, new Map<string, Dish>())
  const dishesSets: Map<string, DishesSet> = await DishesSet.getAllDishesSets()
  if (dishesSets.size === 0) {
    await conversation.say('There are no food sets yet!')
    await conversation.end()
    return new Map<string, Dish>()
  }
  try {
    const selectedDishes = await selectDishesFromDishesSet(conversation, dishesSets, new Map<string, Dish>(), 'Select the desired number of products')
    if (selectedDishes && selectedDishes.size > 0) return selectedDishes
    else return SelectDishesForOrder(conversation)
  } catch (error) {
    console.error('[BOT] [SELECTION] SELECTING DISHES FOR ORDER ERROR: ', error)
    if (typeof error === 'string') await conversation.say(error)
    else await conversation.say('Something went wrong, please try again later!')
    return new Map<string, Dish>()
  }
}
