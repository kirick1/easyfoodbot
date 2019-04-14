import db from '../database'
import { User, Order } from '.'
import { Attachment } from '../types'

export interface ILocation {
  id: number | null
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
  id: number | null
  title: string
  url: string
  latitude: number
  longitude: number
  constructor (location: ILocation) {
    this.id = location.id
    this.title = location.title
    this.url = location.url
    this.latitude = location.latitude
    this.longitude = location.longitude
  }
  async save (): Promise<Location> {
    const { rows: [{ id }] } = await db.query('INSERT INTO locations (title, url, latitude, longitude) VALUES ($1, $2, $3, $4) RETURNING id', [this.title, this.url, this.latitude, this.longitude])
    this.id = parseInt(id, 10)
    return this
  }
  async update (): Promise<Location> {
    await db.query('UPDATE locations SET latitude = $1, longitude = $2 WHERE id = $3', [this.latitude, this.longitude, this.id])
    return this
  }
  setAttachmentData (attachment: Attachment): Location {
    this.latitude = attachment.payload.coordinates.lat
    this.longitude = attachment.payload.coordinates.long
    return this
  }
  static async createFromAttachment (attachment: Attachment): Promise<Location> {
    const locationData: ILocation = {
      id: null,
      title: attachment.title,
      url: attachment.url,
      latitude: attachment.payload.coordinates.lat,
      longitude: attachment.payload.coordinates.long
    }
    const location = new Location(locationData)
    await location.save()
    return location
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
  static async getByID (locationID?: number | null): Promise<Location> {
    if (!locationID) throw Error('Location ID is required!')
    const { rows: [locationData] } = await db.query('SELECT * FROM locations WHERE id = $1', [locationID])
    if (!locationData) throw Error('Location not found!')
    return new Location(locationData)
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
