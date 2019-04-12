import db from '../database'
import { User, Order } from '.'

export interface ILocation {
  id: number
  title: string
  url: string
  latitude: number
  longitude: number
}

export interface ICoordinates {
  lat: number
  long: number
}

export class Location implements ILocation {
  id: number
  title: string
  url: string
  latitude: number
  longitude: number
  constructor (value: ILocation) {
    this.id = value.id
    this.title = value.title
    this.url = value.url
    this.latitude = value.latitude
    this.longitude = value.longitude
  }
  async update (coordinates: ICoordinates): Promise<Location> {
    this.latitude = coordinates.lat
    this.longitude = coordinates.long
    await db.query('UPDATE locations SET latitude = $1, longitude = $2 WHERE id = $3', [this.latitude, this.longitude, this.id])
    return this
  }
  static async isExists (locationID?: number | null): Promise<boolean> {
    if (locationID === undefined || locationID === null) return false
    const { rows: [location] } = await db.query('SELECT * FROM locations WHERE id = $1', [locationID])
    return location !== undefined && location !== null
  }
  static async create (coordinates: ICoordinates, title: string, url: string): Promise<Location> {
    const { rows: [created] } = await db.query('INSERT INTO locations (title, url, latitude, longitude) VALUES ($1, $2, $3, $4) RETURNING *', [title, url, coordinates.lat, coordinates.long])
    return new Location(created)
  }
  static async getForUser (user: User): Promise<Location> {
    const { rows: [location] } = await db.query('SELECT * FROM locations WHERE id = $1', [user.location])
    return new Location(location)
  }
  static async getForOrder (order: Order): Promise<Location> {
    const { rows: [location] } = await db.query('SELECT * FROM locations WHERE id = $1', [order.location])
    return new Location(location)
  }
}
