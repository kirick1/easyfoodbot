export const GreetingText = [
  {
    locale: 'default',
    text: 'Hello, {{user.full_name}}! Welcome to EasyFood Bot!'
  }
]

export const PersistentMenu = [
  {
    title: 'Make order',
    type: 'postback',
    payload: 'ORDERS_MAKE_ORDER_NOW'
  },
  {
    title: 'My orders',
    type: 'nested',
    call_to_actions: [
      {
        title: 'Created',
        type: 'postback',
        payload: 'ORDERS_CREATED_ORDERS'
      },
      {
        title: 'Current',
        type: 'postback',
        payload: 'ORDERS_CURRENT_ORDERS'
      },
      {
        title: 'Completed',
        type: 'postback',
        payload: 'ORDERS_COMPLETED_ORDERS'
      }
    ]
  },
  {
    title: 'More',
    type: 'nested',
    call_to_actions: [
      {
        title: 'Account',
        type: 'nested',
        call_to_actions: [
          {
            title: 'Show contact information',
            type: 'postback',
            payload: 'ACCOUNT_SHOW_CONTACT_INFORMATION'
          },
          {
            title: 'Update contact information',
            type: 'postback',
            payload: 'ACCOUNT_UPDATE_CONTACT_INFORMATION'
          },
          {
            title: 'Show default location',
            type: 'postback',
            payload: 'ACCOUNT_SHOW_DEFAULT_LOCATION'
          },
          {
            title: 'Update default location',
            type: 'postback',
            payload: 'ACCOUNT_UPDATE_DEFAULT_LOCATION'
          }
        ]
      },
      {
        title: 'EasyFood Page',
        type: 'web_url',
        url: 'https://www.facebook.com/EF.delivery/'
      },
      {
        title: 'Write Feedback',
        type: 'postback',
        payload: 'WRITE_FEEDBACK'
      }
    ]
  }
]
