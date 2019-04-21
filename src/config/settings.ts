import { Information, Messages, Commands } from '.'

export const GreetingText = [
  {
    locale: Information.LOCALE,
    text: 'Hello, {{user.full_name}}! Welcome to EasyFood IBot!'
  }
]

export const PersistentMenu = [
  {
    title: Messages.MAKE_ORDER,
    type: 'postback',
    payload: Commands.MAKE_ORDER_NOW
  },
  {
    title: Messages.MY_ORDERS,
    type: 'nested',
    call_to_actions: [
      {
        title: Messages.CREATED_ORDERS,
        type: 'postback',
        payload: Commands.CREATED_ORDERS
      },
      {
        title: Messages.CURRENT_ORDERS,
        type: 'postback',
        payload: Commands.CURRENT_ORDERS
      },
      {
        title: Messages.COMPLETED_ORDERS,
        type: 'postback',
        payload: Commands.COMPLETED_ORDERS
      }
    ]
  },
  {
    title: Messages.MORE,
    type: 'nested',
    call_to_actions: [
      {
        title: Messages.ACCOUNT,
        type: 'nested',
        call_to_actions: [
          {
            title: Messages.SHOW_CONTACT_INFORMATION,
            type: 'postback',
            payload: Commands.SHOW_CONTACT_INFORMATION
          },
          {
            title: Messages.UPDATE_CONTACT_INFORMATION,
            type: 'postback',
            payload: Commands.UPDATE_CONTACT_INFORMATION
          },
          {
            title: Messages.SHOW_DEFAULT_LOCATION,
            type: 'postback',
            payload: Commands.SHOW_DEFAULT_LOCATION
          },
          {
            title: Messages.UPDATE_DEFAULT_LOCATION,
            type: 'postback',
            payload: Commands.UPDATE_DEFAULT_LOCATION
          }
        ]
      },
      {
        title: Information.MERCHANT_NAME,
        type: 'web_url',
        url: Information.EASYFOOD_PAGE
      },
      {
        title: Messages.WRITE_FEEDBACK,
        type: 'postback',
        payload: Commands.WRITE_FEEDBACK
      }
    ]
  }
]
