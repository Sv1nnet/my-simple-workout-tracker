/** @format */

import { ImageFields } from './models/ImageModel'
import db from '../../BrowserDB'

export const table = db.tables.exercises
export const workoutTable = db.tables.workouts

export const fieldsToFormat = { each_side: 'bool', hours: 'bool', archived: 'bool', weight: 'number', time: 'number' }

export const errors = {
  imageIsTooLarge: {
    ru: 'Изображение слишком большое. Максимальный размер 1 мб.',
    eng: 'Image is too large. Maximum size is 1 mb.',
  },
}

export const imageSizeError = {
  error: {
    status: 400,
    data: {
      data: null,
      error: {
        code: 400,
        appCode: 4007,
        message: {
          text: errors.imageIsTooLarge,
        },
      },
      success: false,
    },
  },
}

export const mapFormDataToImageAndRestForm = (fields: ImageFields) =>
  Object.entries(fields).reduce(
    (acc, [ field, value ]) => {
      if (field.startsWith('image_')) {
        if (!acc.image) acc.image = {}
        acc.image[field.split('image_')[1]] = value
        return acc
      }

      if (!acc.restForm) acc.restForm = {}
      acc.restForm[field] = value
      return acc
    },
    {
      image: null,
      restForm: null,
    },
  )
