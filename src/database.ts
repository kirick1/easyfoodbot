import { Client, ConnectionConfig } from 'pg'

export enum NotificationType {
  FEEDBACK = 'feedback_message',
  ORDER = 'new_order'
}

const ConnectionConfig: ConnectionConfig = {
  user: process.env.PG_USER,
  host: process.env.PG_HOST || '127.0.0.1',
  database: process.env.PG_DBNAME,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT ? parseInt(process.env.PG_PORT, 10) : 5432
}

const db = new Client(ConnectionConfig)

db.connect(async (error: any) => {
  if (error) {
    await db.end()
    console.error('[DATABASE] ERROR DURING CONNECTION: ', error)
    process.exit(1)
  } else console.log('[DATABASE] CONNECTED!')
})

db.on('error', (error: any) => {
  console.error('[DATABASE] ERROR: ', error)
})
db.on('end', () => {
  console.warn('[DATABASE] DISCONNECTED!')
})
db.on('notice', notice => {
  console.warn('[DATABASE] NOTICE: ', notice)
})

process.once('SIGINT', async () => {
  await db.end()
  process.exit(0)
})

export default db
