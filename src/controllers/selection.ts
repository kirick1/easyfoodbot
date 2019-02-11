import Dish from '../classes/Dish'
import DishesSet from '../classes/DishesSet'
import { Question, YesNo, Conversation } from './conversation'

export async function selectDishesSet (conversation: any, dishesSets: Map<string, DishesSet>): Promise<DishesSet> {
  if (dishesSets.size === 0) {
    await conversation.say('There are no sets yet!')
    return conversation.end()
  }
  try {
    const title = await Question(conversation, { text: 'Food sets', quickReplies: Array.from(dishesSets.keys()) })
    if (!title || typeof title !== 'string' || !dishesSets.has(title)) {
      await conversation.say('Title was not selected!')
      return await conversation.end()
    }
    const dishesSet = dishesSets.has(title) ? dishesSets.get(title) : null
    if (!dishesSet || dishesSet.dishes.size === 0) {
      await conversation.say('There are no dishes in selected set!')
      return await conversation.end()
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
    const selected = conversation.get('selected_dishes')
    if (!selected) {
      await conversation.say('Select the desired number of products')
      conversation.set('selected_dishes', new Map())
    }
    return dishesSet
  } catch (error) {
    console.error('[BOT] [SELECTION] ERROR GETTING SELECTED SET DISHES: ', error)
    await conversation.say('Something went wrong, please try again!')
    return conversation.end()
  }
}
export async function getSelectedDishesFromSelectedDishesSet (conversation: any, dishesSets: Map<string, DishesSet> = new Map(), selectedDishesSet: Map<string, Dish> = new Map(), text: string = 'Select the desired number of products'): Promise<any> {
  if (dishesSets.size === 0) {
    await conversation.say('There are no sets yet!')
    await conversation.end()
    throw Error('There are no sets yet!')
  }
  if (selectedDishesSet.size === 0) {
    await conversation.say('There are no dishes in selected set!')
    await conversation.end()
    throw Error('There are no dishes in selected set!')
  }
  const selected: DishesSet = conversation.get('selected_dishes')
  try {
    const answer = await Question(conversation, { text, quickReplies: [...selectedDishesSet.keys(), '(Sets)', '(Submit)', '(Cancel)'] })
    if (typeof answer !== 'string') {
      await conversation.say('Answer is not valid!')
      await conversation.end()
      return []
    }
    if (answer === '(Sets)') {
      const dishesSet = await selectDishesSet(conversation, dishesSets)
      return dishesSet instanceof DishesSet ? await getSelectedDishesFromSelectedDishesSet(conversation, dishesSets, dishesSet.dishes, Dish.getSubmittedDishesPriceListString(selected.dishes)) : []
    } else if (answer === '(Submit)') {
      const totalPrice = selected.getTotalPrice()
      const yes = await YesNo(conversation, `Total price is ${totalPrice.toFixed(2)}€, make order?`)
      await conversation.end()
      return yes ? selected.dishes : []
    } else if (answer === '(Cancel)') {
      const yes = await YesNo(conversation, `Are you really want to cancel this order?`)
      if (yes) {
        await conversation.say('Order was canceled!')
        await conversation.end()
        return new Error('Order was canceled!')
      } else return await getSelectedDishesFromSelectedDishesSet(conversation, dishesSets, selectedDishesSet, Dish.getSubmittedDishesPriceListString(selected.dishes))
    } else {
      console.log('ANSWER: ', answer)
      console.log('SELECTED: ', selected)
      console.log('SELECTED SET DISHES: ', selectedDishesSet)

      const current = selected.dishes.get(answer)
      console.log('CURRENT: ', current)
      if (current) {
        current.numberInOrder += 1
        selected.dishes.set(answer, current)
      } else {
        const dish = selectedDishesSet.get(answer)
        if (dish instanceof Dish) selected.dishes.set(answer, dish)
      }
      conversation.set('selected_dishes')
      return await getSelectedDishesFromSelectedDishesSet(conversation, dishesSets, selectedDishesSet, Dish.getSubmittedDishesPriceListString(selected.dishes))
    }
  } catch (error) {
    console.error('[BOT] [SELECTION] ERROR GETTING SELECTED DISHES FROM SELECTED DISHES SET: ', error)
    await conversation.say('Something went wrong, please try again!')
    await conversation.end()
    return []
  }
}
export async function SelectDishesForOrder (chat: any) {
  try {
    const conversation = await Conversation(chat)
    const dishesSets = await DishesSet.getAllDishesSets()
    const selectedDishesSetDishesMap = await selectDishesSet(conversation, dishesSets)
    return await getSelectedDishesFromSelectedDishesSet(conversation, dishesSets, selectedDishesSetDishesMap.dishes)
  } catch (error) {
    console.error('[BOT] [SELECTION] SELECTING DISHES FOR ORDER ERROR: ', error)
    throw Error(error)
  }
}
