import { ObjectId } from 'bson'
import browserDB from 'app/store/utils/BrowserDB'

type ClassType<T = any> = new (...args: any[]) => T


export default class EntityModel {
  public static createId() {
    return new ObjectId().toString()
  }

  public updated_at: number

  public readonly created_at: number

  public id: string

  public static async getOneFromDB<M extends ClassType, N extends string>(Model: M, tableName: N, id: Pick<EntityModel, 'id'>): Promise<InstanceType<M> | undefined> {
    const plainObject = (await browserDB.db?.getAllValues(tableName) || [])
      .map(value => JSON.parse(value))
      .find(object => object.id === id)

    if (plainObject) {
      return new Model(plainObject)
    }

    return undefined
  }

  public static  async getManyFromDB<M extends ClassType, N extends string>(Model: M, tableName: N, ids: Pick<EntityModel, | 'id'>[]): Promise<InstanceType<M>[]> {
    return (await browserDB.db?.getAllValues(tableName) || [])
      .map(value => JSON.parse(value))
      .filter(object => ids.includes(object.id))
      .map(object => new Model(object))
  }

  public static async getAllFromDB<M extends ClassType, N extends string>(Model: M, tableName: N): Promise<InstanceType<M>[]> {
    return (await browserDB.db?.getAllValues(tableName) || [])
      .map(value => JSON.parse(value))
      .map(exercise => new Model(exercise))
  }

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
