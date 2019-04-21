import { IChat, IConversation } from '../../types'
import { Dish } from './Dish'
import { DishesSet } from './DishesSet'
import { Conversation } from '..'
import { Messages } from '../../config'

enum SELECTION_KEYS {
  SETS = '(Sets)',
  SUBMIT = '(Submit)',
  CANCEL = '(Cancel)',
  SELECTED_DISHES = 'SelectedDishes'
}

export class Selection {
  static async selectDishesSet (conversation: IConversation, dishesSets: Map<string, DishesSet>): Promise<Map<string, Dish>> {
    if (dishesSets.size === 0) {
      await conversation.say(Messages.NO_DISHES_SETS_YET)
      await conversation.end()
      throw Error(Messages.NO_DISHES_SETS_YET)
    }
    const selectedDishesSetTitle = await Conversation.askQuestion(conversation, {
      text: 'Available dishes sets:',
      quickReplies: Array.from(dishesSets.keys())
    })
    const selectedDishesSet = dishesSets.get(selectedDishesSetTitle)
    if (!selectedDishesSet || !selectedDishesSet.dishes || selectedDishesSet.dishes.size === 0) {
      await conversation.say('There are no dishes in selected set!')
      return Selection.selectDishesSet(conversation, dishesSets)
    } else {
      await Dish.showDishesMapInformation(conversation, selectedDishesSet.dishes)
      return selectedDishesSet.dishes
    }
  }
  static async selectDishesFromDishesSet (conversation: IConversation, dishesSets: Map<string, DishesSet>, dishesMap: Map<string, Dish> = new Map<string, Dish>(), text: string | null = null): Promise<Map<string, Dish>> {
    if (dishesMap.size === 0) {
      const dishesSetDishes = await Selection.selectDishesSet(conversation, dishesSets)
      return Selection.selectDishesFromDishesSet(conversation, dishesSets, dishesSetDishes, text)
    }
    const selectedDishes: Map<string, Dish> = conversation.get(SELECTION_KEYS.SELECTED_DISHES)
    if (selectedDishes === undefined || selectedDishes === null || !(selectedDishes instanceof Map)) {
      await conversation.say('Selected dishes not found, please try again!')
      return Selection.selectDishesFromDishesSet(conversation, dishesSets, dishesMap, text)
    }
    if (text === null && selectedDishes.size > 0) text = Dish.getSelectedDishesPriceListString(selectedDishes)
    const answer = await Conversation.askQuestion(conversation, {
      text: text,
      quickReplies: [...dishesMap.keys(), SELECTION_KEYS.SETS, SELECTION_KEYS.SUBMIT, SELECTION_KEYS.CANCEL]
    })
    switch (answer) {
      case SELECTION_KEYS.SETS: {
        return Selection.selectDishesFromDishesSet(conversation, dishesSets)
      }
      case SELECTION_KEYS.SUBMIT: {
        const selectedDishes: Map<string, Dish> = conversation.get(SELECTION_KEYS.SELECTED_DISHES)
        if (selectedDishes.size > 0) {
          const submit = await Conversation.askYesNo(conversation, `Total price is ${Dish.getDishesMapTotalPriceString(selectedDishes)}, make order?`)
          if (!submit) return Selection.selectDishesFromDishesSet(conversation, dishesSets)
          await conversation.end()
          return selectedDishes
        } else {
          await conversation.say('Dishes not selected yet!')
          return Selection.selectDishesFromDishesSet(conversation, dishesSets)
        }
      }
      case SELECTION_KEYS.CANCEL: {
        if (await Conversation.askYesNo(conversation, `Are you really want to cancel this order?`)) {
          await conversation.say('Order was canceled!')
          await conversation.end()
          throw Error('Order was canceled!')
        } else return Selection.selectDishesFromDishesSet(conversation, dishesSets)
      }
      default: {
        const dish = dishesMap.get(answer)
        if (dish === undefined || dish === null || !(dish instanceof Dish)) return Selection.selectDishesFromDishesSet(conversation, dishesSets, dishesMap)
        let selectedDish = selectedDishes.get(answer)
        if (selectedDish !== undefined && selectedDish !== null && selectedDish instanceof Dish) {
          selectedDish.numberInOrder += 1
          selectedDishes.set(selectedDish.getTitle(), selectedDish)
        } else {
          dish.numberInOrder = 1
          selectedDishes.set(dish.getTitle(), dish)
        }
        conversation.set(SELECTION_KEYS.SELECTED_DISHES, selectedDishes)
        return Selection.selectDishesFromDishesSet(conversation, dishesSets, dishesMap)
      }
    }
  }
  static async selectDishesForOrder (chat: IChat): Promise<Map<string, Dish>> {
    const dishesSets: Map<string, DishesSet> = await DishesSet.getAllDishesSets()
    if (dishesSets.size === 0) throw Error('There are no dishes sets yet!')
    const conversation = await Conversation.createConversation(chat)
    conversation.set(SELECTION_KEYS.SELECTED_DISHES, new Map<string, Dish>())
    try {
      const selectedDishes = await Selection.selectDishesFromDishesSet(conversation, dishesSets, new Map<string, Dish>(), 'Select the desired number of products')
      if (selectedDishes && selectedDishes.size > 0) {
        await conversation.end()
        return selectedDishes
      } else return Selection.selectDishesForOrder(conversation)
    } catch (error) {
      console.error('[BOT] [SELECTION] SELECTING DISHES FOR ORDER ERROR: ', error)
      if (typeof error === 'string') await conversation.say(error)
      else await conversation.say('Something went wrong, please try again later!')
      await conversation.end()
      return new Map<string, Dish>()
    }
  }
}
