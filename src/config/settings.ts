import { ButtonType } from '../types'
import { Commands, Information, Messages } from '.'

export const GreetingText = [
  {
    locale: Information.LOCALE,
    text: `Hello, {{user.full_name}}! Welcome to ${Information.BOT_NAME}!`
  }
]

export const PersistentMenu = [
  {
    title: Messages.MAKE_ORDER,
    type: ButtonType.POSTBACK,
    payload: Commands.MAKE_ORDER_NOW
  },
  {
    title: Messages.MY_ORDERS,
    type: ButtonType.NESTED,
    call_to_actions: [
      {
        title: Messages.CREATED,
        type: ButtonType.POSTBACK,
        payload: Commands.CREATED_ORDERS
      },
      {
        title: Messages.CURRENT,
        type: ButtonType.POSTBACK,
        payload: Commands.CURRENT_ORDERS
      },
      {
        title: Messages.COMPLETED,
        type: ButtonType.POSTBACK,
        payload: Commands.COMPLETED_ORDERS
      }
    ]
  },
  {
    title: Messages.MORE,
    type: ButtonType.NESTED,
    call_to_actions: [
      {
        title: Messages.ACCOUNT,
        type: ButtonType.NESTED,
        call_to_actions: [
          {
            title: Messages.SHOW_CONTACT_INFORMATION,
            type: ButtonType.POSTBACK,
            payload: Commands.SHOW_CONTACT_INFORMATION
          },
          {
            title: Messages.UPDATE_CONTACT_INFORMATION,
            type: ButtonType.POSTBACK,
            payload: Commands.UPDATE_CONTACT_INFORMATION
          },
          {
            title: Messages.SHOW_DEFAULT_LOCATION,
            type: ButtonType.POSTBACK,
            payload: Commands.SHOW_DEFAULT_LOCATION
          },
          {
            title: Messages.UPDATE_DEFAULT_LOCATION,
            type: ButtonType.POSTBACK,
            payload: Commands.UPDATE_DEFAULT_LOCATION
          }
        ]
      },
      {
        title: Information.MERCHANT_NAME,
        type: ButtonType.WEB_URL,
        url: Information.EASYFOOD_PAGE
      },
      {
        title: Messages.WRITE_FEEDBACK,
        type: ButtonType.POSTBACK,
        payload: Commands.WRITE_FEEDBACK
      }
    ]
  }
]
