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
            title: 'Show information',
            type: 'postback',
            payload: 'ACCOUNT_CONTACT_INFORMATION'
          },
          {
            title: 'Update information',
            type: 'postback',
            payload: 'ACCOUNT_DELIVERY_INFORMATION'
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
