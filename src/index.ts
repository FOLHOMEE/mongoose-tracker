import { Schema } from 'mongoose'
import { get, includes, isNull, toPairs, reduce } from 'lodash'

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

    void this.set({
      [name]: [...trackedFields, ...oldTrackedFields]
    })
  })
}

export default mongooseTracker
