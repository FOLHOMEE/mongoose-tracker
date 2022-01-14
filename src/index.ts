import moment from 'moment'
import { Schema } from 'mongoose'
import { get, includes } from 'lodash'

interface Options {
  fieldsToTrack: [string]
  name: string
}

const mongooseTracker = function (schema: Schema, options: Options): void {
  const { name = '__updates', fieldsToTrack } = options

  schema.add({
    [name]: Array
  })

  // TODO : permettre une valeur limite du nombre de d'updates via Options

  schema.pre('save', function (): void {
    const updatedFields = this.directModifiedPaths()

    for (const field of updatedFields) {
      if (includes(fieldsToTrack, field)) {
        this.get(`${name}`).push({
          field: `${field}`,
          changedTo: get(this, field, ''),
          at: moment().toDate()
        })
      }
    }
  })

  schema.pre(['updateOne', 'findOneAndUpdate', 'update', 'updateMany'], function (): void {
    const updatedFields = this.getUpdate()

    if (updatedFields == null) {
      return
    }

    for (const [key, value] of Object.entries(updatedFields)) {
      if (includes(fieldsToTrack, key)) {
        void this.update({}, {
          $push: {
            [name]: {
              field: `${key}`,
              changedTo: value,
              at: moment().toDate()
            }
          }
        })
      }
    }
  })
}

export default mongooseTracker
