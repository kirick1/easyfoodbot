import db from '../database'
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
  static async createFromAttachment (attachment: Attachment): Promise<Location> {
    const attachmentLocationData: ILocation = {
      id: null,
      title: attachment.title,
      url: attachment.url,
      latitude: attachment.payload.coordinates.lat,
      longitude: attachment.payload.coordinates.long
    }
    const location = new Location(attachmentLocationData)
    await location.save()
    return location
  }
  static async getByID (locationID?: number | null): Promise<Location> {
    if (!locationID) throw Error('Location ID is required!')
    const { rows: [locationData] } = await db.query('SELECT * FROM locations WHERE id = $1', [locationID])
    if (!locationData) throw Error('Location not found!')
    return new Location(locationData)
  }
}
