import { Schema } from 'mongoose'
import { get, includes, isNull, toPairs, reduce, takeRight, size } from 'lodash'

import { Options } from './interfaces'

const mongooseTracker = function (schema: Schema, options: Options): void {
  const { name = '__updates', fieldsToTrack, limit = 30 } = options

  schema.add({
    [name]: Array
  })

  schema.pre('save', function (): void {
    const updatedFields = this.directModifiedPaths()

    for (const field of updatedFields) {
      if (includes(fieldsToTrack, field)) {
        const trackFields = this.get(`${name}`)

        if (size(trackFields) >= limit) {
          trackFields.pop(-1)
        }

        trackFields.push({
          field: `${field}`,
          changedTo: get(this, field, ''),
          at: Date.now()
        })
      }
    }
  })

  schema.pre(['updateOne', 'findOneAndUpdate', 'update', 'updateMany'], async function () {
    const updatedFields = this.getUpdate()

    if (isNull(updatedFields)) {
      return
    }

    const trackedFields = reduce(toPairs(updatedFields), (acc, [key, value]: [string, any]): any => {
      if (includes(fieldsToTrack, key)) {
        return [...acc, {
          field: `${key}`,
          changedTo: value,
          at: Date.now()
        }]
      }

      return acc
    }, [])

    const docUpdated = await this.model.findOne(this.getQuery())
    const oldTrackedFields = docUpdated.get(`${name}`)

    this.clone().set({
      [name]: takeRight([...oldTrackedFields, ...trackedFields], limit)
    }).catch((err) => console.log(err))
  })
}

export default mongooseTracker
