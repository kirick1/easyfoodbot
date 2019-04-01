import db from '../database'
import { LocationObject, Coordinates } from '../types'

export class Location {
  id: number | null = null
  title: string | null = null
  url: string | null = null
  latitude: number | null = null
  longitude: number | null = null
  constructor (value?: LocationObject) {
    if (value) {
      this.id = value.id
      this.title = value.title
      this.url = value.url
      this.latitude = value.latitude
      this.longitude = value.longitude
    }
  }
  async update (coordinates: Coordinates): Promise<Location> {
    this.latitude = coordinates.lat
    this.longitude = coordinates.long
    await db.query('UPDATE locations SET latitude = $1, longitude = $2 WHERE id = $3', [this.latitude, this.longitude, this.id])
    return this
  }
  static async create (coordinates: Coordinates, title: string, url: string): Promise<Location> {
    const { rows: [created] } = await db.query('INSERT INTO locations (title, url, latitude, longitude) VALUES ($1, $2, $3, $4) RETURNING *', [title, url, coordinates.lat, coordinates.long])
    return new Location(created)
  }
}
