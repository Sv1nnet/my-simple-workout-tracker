

import getBase64 from 'app/utils/getBase64'
import { nanoid } from '@reduxjs/toolkit'
import EntityModel from 'app/store/utils/EntityModel'

export type ImageConstructorParameter = Blob & Omit<ImageModel, 'url'> & { url?: string } | ImageModel

export const MB_IN_BYTES = 1048576

export type ImageFields = {
  image_created_at: string,
  image_id: string,
  image_name: string,
  image_uid: string,
  image_updated_at: string,
  image_url: string,
  image_uuid: string,
}

export const imageSizeErrorText = 'Image is size should be less than 1 MB'

export class ImageModel extends EntityModel {
  public uid: string

  public uuid: string

  public name: string

  public uploaded_at: number

  public url?: string

  private _imageSetter: Promise<ImageModel>

  public get imageSetter(): Promise<ImageModel> {
    return this._imageSetter
  }

  constructor(image: ImageConstructorParameter) {
    super(image)

    const {
      uid,
      uuid,
      name,
      url,
    } = image

    this.uid = uid
    this.uuid = uuid || nanoid()
    this.name = name
    this.uploaded_at = Date.now()
    if (image instanceof Blob) {
      if (image.size > MB_IN_BYTES) throw new Error(imageSizeErrorText)
      this._imageSetter = this.setBlobToUrl(image)
    } else {
      this.url = url
      this._imageSetter = Promise.resolve(this)
    }
  }

  async setBlobToUrl(blob: Blob) {
    try {
      let imageInBase64 = await getBase64(blob)
      if (imageInBase64 instanceof ArrayBuffer) {
        imageInBase64 = new Uint8Array(imageInBase64).toString()
      }

      this.url = imageInBase64
      return this
    } catch (e) {
      console.warn('Could not convert blob to base64', e)
    }
  }

  async updateImage(data: Partial<Omit<ImageConstructorParameter, 'blob'>> | Partial<Omit<ImageConstructorParameter, 'blob'>> & Blob) {
    if (data instanceof Blob) {
      this._imageSetter = this.setBlobToUrl(data)

      await this.imageSetter
    } else {
      this.url = data.url
    }

    this.uid = data.uid
    this.uuid = data.uuid || nanoid()
    this.name = data.name
    this.uploaded_at = Date.now()

    return this
  }

  toString() {
    const { _imageSetter: _, imageSetter: __, ...image } = this
    return JSON.stringify(image)
  }

  toJSON() {
    const { _imageSetter: _, imageSetter: __, ...image } = this
    return image
  }
}
