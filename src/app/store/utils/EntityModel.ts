import { ObjectId } from 'bson'
import browserDB from 'app/store/utils/BrowserDB'
import { parseIfString } from 'app/utils/parsers'

type ClassType<T = any> = new (...args: any[]) => T


export default class EntityModel {
  public static createId() {
    return new ObjectId().toString()
  }

  public updated_at: number

  public readonly created_at: number

  public id: string

  public static async updateMany<M extends ClassType, N extends string>(tableName: N, objects: InstanceType<M>[]) {
    return browserDB.db?.batchUpdate(tableName, objects.map(object => ({
      key: object.id,
      value: object.toPlainObject(),
    })))
  }

  public static deleteMany<N extends string>(tableName: N, ids: EntityModel['id'][]): Promise<number> {
    return browserDB.db?.batchRemove(tableName, ids)
  }

  public static async getOneFromDB<M extends ClassType, N extends string>(Model: M, tableName: N, id: EntityModel['id']): Promise<InstanceType<M> | undefined> {
    const plainObject = (await browserDB.db?.getAll<Pick<EntityModel, 'id'>>(tableName) || [])
      .map(value => parseIfString(value))
      .find(object => object?.id === id)

    if (plainObject) {
      return new Model(plainObject)
    }

    return undefined
  }

  public static  async getManyFromDB<M extends ClassType, N extends string>(Model: M, tableName: N, ids: EntityModel['id'][]): Promise<InstanceType<M>[]> {
    return (await browserDB.db?.getAll<Pick<EntityModel, 'id'>>(tableName) || [])
      .map(value => parseIfString(value))
      .filter(object => ids.includes(object.id))
      .map(object => new Model(object))
  }

  public static async getAllFromDB<M extends ClassType, N extends string>(Model: M, tableName: N): Promise<InstanceType<M>[]> {
    return (await browserDB.db?.getAll<Pick<EntityModel, 'id'>>(tableName) || [])
      .map(value => parseIfString(value))
      .map(object => new Model(object))
  }

  public static async removeFromDB<N extends string>(tableName: N, id: string): Promise<void> {
    return browserDB.db?.remove(tableName, id)
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
