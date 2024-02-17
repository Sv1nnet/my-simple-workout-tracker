import { ObjectId } from 'bson'

export default class EntityModel {
  public static createId() {
    return new ObjectId().toString()
  }

  public updated_at: number

  public readonly created_at: number

  public id: string

  constructor({
    id, created_at, updated_at,
  }: {
    id?: string, created_at?: number, updated_at?: number
  } = {}) {
    this.id = id || new ObjectId().toString()
    this.created_at = created_at || Date.now()
    this.updated_at = updated_at || this.created_at
  }

  toString() {
    return JSON.stringify(this)
  }
}