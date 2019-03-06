import { Dish, DishesSet } from '../classes'
import { Conversation, Chat } from '../types'
import { askQuestion, askYesNo, createConversation } from '.'

const getSelectedDishes = (conversation: Conversation): Map<string, Dish> => {
  const selectedDishes = conversation.get('selectedDishes')
  if (selectedDishes && selectedDishes instanceof Map) return selectedDishes
  conversation.set('selectedDishes', new Map<string, Dish>())
  return getSelectedDishes(conversation)
}
export const selectDishesSet = async (conversation: Conversation, dishesSets: Map<string, DishesSet>): Promise<DishesSet> => {
  if (dishesSets.size === 0) {
    await conversation.say('There are no sets yet!')
    await conversation.end()
    throw Error('There are no sets yet!')
  }
  getSelectedDishes(conversation)
  const dishesSet = dishesSets.get(await askQuestion(conversation, { text: 'Food sets', quickReplies: Array.from(dishesSets.keys()) }))
  if (!dishesSet || dishesSet.dishes.size === 0) {
    await conversation.say('There are no dishes in selected set!')
    return selectDishesSet(conversation, dishesSets)
  }
  await conversation.sendGenericTemplate(Array.from(dishesSet.dishes.values()).map((dish: Dish) => ({
    title: `${dish.title} (${dish.getTotalPrice().toFixed(2)})`,
    subtitle: dish.description,
    image_url: dish.photo,
    buttons: [{
      type: 'web_url',
      url: dish.photo,
      title: 'Photo'
    }]
  })))
  return dishesSet
}
export const getSelectedDishesFromSelectedDishesSet = async (conversation: Conversation, dishesSets: Map<string, DishesSet>, selectedDishesSet: DishesSet | null = null, text: string | null = 'Select the desired number of products'): Promise<Map<string, Dish>> => {
  if (selectedDishesSet === null) return getSelectedDishesFromSelectedDishesSet(conversation, dishesSets, await selectDishesSet(conversation, dishesSets), text)
  const selectedDishes = getSelectedDishes(conversation)
  const answer = await askQuestion(conversation, { text: text || Dish.getSubmittedDishesPriceListString(selectedDishes), quickReplies: [...selectedDishesSet.dishes.keys(), '(Sets)', '(Submit)', '(Cancel)'] })
  switch (answer) {
    case '(Sets)': {
      const dishesSet = await selectDishesSet(conversation, dishesSets)
      return getSelectedDishesFromSelectedDishesSet(conversation, dishesSets, dishesSet)
    }
    case '(Submit)': {
      if (!(await askYesNo(conversation, `Total price is ${Dish.getDishesMapTotalPrice(selectedDishes).toFixed(2)}€, make order?`))) return getSelectedDishesFromSelectedDishesSet(conversation, dishesSets, selectedDishesSet)
      await conversation.end()
      return selectedDishes
    }
    case '(Cancel)': {
      if (await askYesNo(conversation, `Are you really want to cancel this order?`)) {
        await conversation.say('Order was canceled!')
        await conversation.end()
        throw Error('Order was canceled!')
      } else return getSelectedDishesFromSelectedDishesSet(conversation, dishesSets, selectedDishesSet)
    }
    default: {
      const selectedDish = selectedDishesSet.dishes.get(answer)
      if (!selectedDish) return getSelectedDishesFromSelectedDishesSet(conversation, dishesSets, selectedDishesSet, null)
      selectedDishes.set(selectedDish.getTitle(), selectedDish.addOne())
      conversation.set('selectedDishes', selectedDishes)
      return getSelectedDishesFromSelectedDishesSet(conversation, dishesSets, selectedDishesSet)
    }
  }
}
export const SelectDishesForOrder = async (chat: Chat): Promise<Map<string, Dish>> => {
  const conversation = await createConversation(chat)
  try {
    return await getSelectedDishesFromSelectedDishesSet(conversation, await DishesSet.getAllDishesSets(), null, 'Select the desired number of products')
  } catch (error) {
    console.error('[BOT] [SELECTION] SELECTING DISHES FOR ORDER ERROR: ', error)
    await conversation.say('Something went wrong, please try again later!')
    return conversation.end()
  }
}
