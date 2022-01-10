import { Schema } from 'mongoose'

const mongooseTracker = function (schema: Schema): void {
  // TODO : Dans les options pouvoir changer le nom de "__updates"
  // TODO : faire les pre de save, findOneAndUpdate, update, updateOne
  // TODO : rajouter les fields to track
  schema.add({
    __updates: Array
  })
}

export default mongooseTracker
