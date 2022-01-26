import mongoose from 'mongoose'
import { Schema } from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'

import mongooseTracker from '../src/index'

describe('mongooseTracker tests', () => {
  beforeAll(async () => {
    const mongod = new MongoMemoryServer()

    await mongod.start()

    const mongoUrl = await mongod.getUri()

    await mongoose.connect(mongoUrl)
  })

  beforeEach(async () => {
    const collections = mongoose.connection.collections

    for (const key in collections) {
      const collection = collections[key]

      await collection.deleteMany({})
    }
  })

  afterAll(async () => {
    await mongoose.disconnect()
  })

  describe('tracker array key name', () => {
    it('should create Array in model with the key name "__updates" by default', () => {
      const schema = new Schema({
        name: String
      })

      schema.plugin(mongooseTracker, {})

      const Model = mongoose.model('test1', schema)

      const doc = new Model({})


      expect(doc).toEqual(expect.objectContaining({
        '__updates': expect.any(Array)
      }))
    })

    it('should create Array in model with the key name "__tokens"', () => {
      const schema = new Schema({})

      schema.plugin(mongooseTracker, {
        name: '__tokens'
      })

      const Model = mongoose.model('test2', schema)

      const doc = new Model({})

      expect(doc).toEqual(
        expect.objectContaining({
          '__tokens': expect.any(Array)
        })
      )
    })
  })

  describe('pre functions', () => {
    describe('save function', () => {
      it('should not add modified field in __updates if the field is not tracked', () => {
        const schema = new Schema({
          price: Number
        })

        schema.plugin(mongooseTracker, {
          fieldsToTrack: ['name']
        })

        const Model = mongoose.model('test3', schema)

        const doc = new Model({
          price: 0
        })

        doc.price = 1

        doc.save()

        expect(doc).toEqual(
          expect.objectContaining({
            '__updates': []
          })
        )
      })

      it('should add 2 modified fields in __updates if 2 fields are tracked', async () => {
        const schema = new Schema({
          name: String,
          price: Number,
          toto: String
        })

        schema.plugin(mongooseTracker, {
          fieldsToTrack: ['name', 'toto']
        })

        const Model = mongoose.model('test4', schema)

        const doc = new Model({})

        doc.toto = 'c est mon nom'
        doc.name = 'tata'
        doc.price = 5

        await doc.save()

        expect(doc).toEqual(
          expect.objectContaining({
            '__updates': expect.arrayContaining([
              expect.objectContaining({
                changedTo: 'c est mon nom',
                field: 'toto'
              }), expect.objectContaining({
                changedTo: 'tata',
                field: 'name'
              })
            ])
          })
        )
      })
    })

    describe('findOneAndUpdate function', () => {
      it('should add modified field in __updates if the field is tracked', async () => {
        const schema = new Schema({
          name: String,
          price: Number,
          toto: String
        })

        schema.plugin(mongooseTracker, {
          fieldsToTrack: ['name', 'toto']
        })

        const Model = mongoose.model('test5', schema)

        await Model.create({ price: 10, name: 'nom', toto: 'c est moi' })
        await Model.findOneAndUpdate({ price: 10 }, { name: 'nouveauNom' })

        const doc = await Model.findOne({ price: 10 })

        expect(doc).toEqual(
          expect.objectContaining({
            '__updates': expect.arrayContaining([
              expect.objectContaining({
                changedTo: 'nouveauNom',
                field: 'name'
              })
            ])
          })
        )
      })

      it('should not add modified field in __updates if the field is not tracked', async () => {
        const schema = new Schema({
          name: String,
          price: Number,
          toto: String
        })

        schema.plugin(mongooseTracker, {
          fieldsToTrack: ['toto']
        })

        const Model = mongoose.model('test6', schema)

        await Model.create({ price: 10, name: 'nom', toto: 'c est moi' })
        await Model.findOneAndUpdate({ price: 10 }, { name: 'nouveauNom' })

        const doc = await Model.findOne({ price: 10 })

        expect(doc).toEqual(
          expect.objectContaining({
            '__updates': expect.arrayContaining([
              expect.not.objectContaining({
                changedTo: 'nouveauNom',
                field: 'name'
              })
            ])
          })
        )
      })

      it('should add modified field in __tokens if the field is tracked', async () => {
        const schema = new Schema({
          name: String,
          price: Number,
          toto: String
        })

        schema.plugin(mongooseTracker, {
          fieldsToTrack: ['name', 'toto'],
          name: '__tokens'
        })

        const Model = mongoose.model('test7', schema)

        await Model.create({ price: 10, name: 'nom', toto: 'c est moi' })
        await Model.findOneAndUpdate({ price: 10 }, { name: 'nouveauNom' })

        const doc = await Model.findOne({ price: 10 })

        expect(doc).toEqual(
          expect.objectContaining({
            '__tokens': expect.arrayContaining([
              expect.objectContaining({
                changedTo: 'nouveauNom',
                field: 'name'
              })
            ])
          })
        )
      })

      it('should not add modified field in __tokens if the field is not tracked', async () => {
        const schema = new Schema({
          name: String,
          price: Number,
          toto: String
        })

        schema.plugin(mongooseTracker, {
          fieldsToTrack: ['toto'],
          name: '__tokens'
        })

        const Model = mongoose.model('test8', schema)

        await Model.create({ price: 10, name: 'nom', toto: 'c est moi' })
        await Model.findOneAndUpdate({ price: 10 }, { name: 'nouveauNom' })

        const doc = await Model.findOne({ price: 10 })

        expect(doc).toEqual(
          expect.objectContaining({
            '__tokens': expect.arrayContaining([
              expect.not.objectContaining({
                changedTo: 'nouveauNom',
                field: 'name'
              })
            ])
          })
        )
      })
    })

    describe('UpdateOne function', () => {
      it('should add modified field in __updates if the field is tracked', async () => {
        const schema = new Schema({
          name: String,
          price: Number,
          toto: String
        })

        schema.plugin(mongooseTracker, {
          fieldsToTrack: ['name', 'toto']
        })

        const Model = mongoose.model('test9', schema)

        await Model.create({ price: 10, name: 'nom', toto: 'c est moi' })
        await Model.updateOne({ price: 10 }, { name: 'nouveauNom' })

        const doc = await Model.findOne({ price: 10 })

        expect(doc).toEqual(
          expect.objectContaining({
            '__updates': expect.arrayContaining([
              expect.objectContaining({
                changedTo: 'nouveauNom',
                field: 'name'
              })
            ])
          })
        )
      })

      it('should not modified field in __updates if the field is not tracked', async () => {
        const schema = new Schema({
          name: String,
          price: Number,
          toto: String
        })

        schema.plugin(mongooseTracker, {
          fieldsToTrack: ['toto']
        })

        const Model = mongoose.model('test10', schema)

        await Model.create({ price: 10, name: 'nom', toto: 'c est moi' })
        await Model.updateOne({ price: 10 }, { name: 'nouveauNom' })

        const doc = await Model.findOne({ price: 10 })

        expect(doc).toEqual(
          expect.objectContaining({
            '__updates': expect.arrayContaining([
              expect.not.objectContaining({
                changedTo: 'nouveauNom',
                field: 'name'
              })
            ])
          })
        )
      })

      it('should add modified field in __tokens if the field is tracked', async () => {
        const schema = new Schema({
          name: String,
          price: Number,
          toto: String
        })

        schema.plugin(mongooseTracker, {
          fieldsToTrack: ['name', 'toto'],
          name: '__tokens'
        })

        const Model = mongoose.model('test11', schema)

        await Model.create({ price: 10, name: 'nom', toto: 'c est moi' })
        await Model.updateOne({ price: 10 }, { name: 'nouveauNom' })

        const doc = await Model.findOne({ price: 10 })

        expect(doc).toEqual(
          expect.objectContaining({
            '__tokens': expect.arrayContaining([
              expect.objectContaining({
                changedTo: 'nouveauNom',
                field: 'name'
              })
            ])
          })
        )

      })

      it('should not add modified field in __tokens if the field is not tracked', async () => {
        const schema = new Schema({
          name: String,
          price: Number,
          toto: String
        })

        schema.plugin(mongooseTracker, {
          fieldsToTrack: ['toto'],
          name: '__tokens'
        })

        const Model = mongoose.model('test12', schema)

        await Model.create({ price: 10, name: 'nom', toto: 'c est moi' })
        await Model.updateOne({ price: 10 }, { name: 'nouveauNom' })

        const doc = await Model.findOne({ price: 10 })

        expect(doc).toEqual(
          expect.objectContaining({
            '__tokens': expect.arrayContaining([
              expect.not.objectContaining({
                changedTo: 'nouveauNom',
                field: 'name'
              })
            ])
          })
        )
      })
    })

    describe('findByIdAndUpdate function', () => {
      it('should add modified field in __updates if the field is tracked', async () => {
        const schema = new Schema({
          name: String,
          price: Number,
          toto: String
        })

        schema.plugin(mongooseTracker, {
          fieldsToTrack: ['name', 'toto']
        })

        const Model = mongoose.model('test13', schema)

        const { _id } = await Model.create({ price: 10, name: 'nom', toto: 'c est moi' })

        await Model.findByIdAndUpdate(_id, { name: 'nouveauNom' })

        const doc = await Model.findOne({ price: 10 })

        expect(doc).toEqual(
          expect.objectContaining({
            '__updates': expect.arrayContaining([
              expect.objectContaining({
                changedTo: 'nouveauNom',
                field: 'name'
              })
            ])
          })
        )
      })

      it('should not add modified field in __updates if the field is not tracked', async () => {
        const schema = new Schema({
          name: String,
          price: Number,
          toto: String
        })

        schema.plugin(mongooseTracker, {
          fieldsToTrack: ['toto']
        })

        const Model = mongoose.model('test14', schema)

        const { _id } = await Model.create({ price: 10, name: 'nom', toto: 'c est moi' })

        await Model.findByIdAndUpdate(_id, { name: 'nouveauNom' })

        const doc = await Model.findOne({ price: 10 })

        expect(doc).toEqual(
          expect.objectContaining({
            '__updates': expect.arrayContaining([
              expect.not.objectContaining({
                changedTo: 'nouveauNom',
                field: 'name'
              })
            ])
          })
        )
      })

      it('should add modified field in __tokens if the field is tracked', async () => {
        const schema = new Schema({
          name: String,
          price: Number,
          toto: String
        })

        schema.plugin(mongooseTracker, {
          fieldsToTrack: ['name', 'toto'],
          name: '__tokens'
        })

        const Model = mongoose.model('test15', schema)

        const { _id } = await Model.create({ price: 10, name: 'nom', toto: 'c est moi' })

        await Model.findByIdAndUpdate(_id, { name: 'nouveauNom' })

        const doc = await Model.findOne({ price: 10 })

        expect(doc).toEqual(
          expect.objectContaining({
            '__tokens': expect.arrayContaining([
              expect.objectContaining({
                changedTo: 'nouveauNom',
                field: 'name'
              })
            ])
          })
        )
      })

      it('should add modified field in __tokens if the field is not tracked', async () => {
        const schema = new Schema({
          name: String,
          price: Number,
          toto: String
        })

        schema.plugin(mongooseTracker, {
          fieldsToTrack: ['toto'],
          name: '__tokens'
        })

        const Model = mongoose.model('test16', schema)

        const { _id } = await Model.create({ price: 10, name: 'nom', toto: 'c est moi' })

        await Model.findByIdAndUpdate(_id, { name: 'nouveauNom' })

        const doc = await Model.findOne({ price: 10 })

        expect(doc).toEqual(
          expect.objectContaining({
            '__tokens': expect.arrayContaining([
              expect.not.objectContaining({
                changedTo: 'nouveauNom',
                field: 'name'
              })
            ])
          })
        )
      })
    })

    describe('updateMany function', () => {
      it('should add modified field in __updates if the field is tracked', async () => {
        const schema = new Schema({
          name: String,
          price: Number,
          toto: String
        })

        schema.plugin(mongooseTracker, {
          fieldsToTrack: ['name', 'toto']
        })

        const Model = mongoose.model('test17', schema)

        await Model.create({ price: 10, name: 'nom', toto: 'c est moi' })
        await Model.updateMany({ price: 10 }, { name: 'nouveauNom' })

        const doc = await Model.findOne({ price: 10 })

        expect(doc).toEqual(
          expect.objectContaining({
            '__updates': expect.arrayContaining([
              expect.objectContaining({
                changedTo: 'nouveauNom',
                field: 'name'
              })
            ])
          })
        )
      })

      it('should not add modified field in __updates if the field is not tracked', async () => {
        const schema = new Schema({
          name: String,
          price: Number,
          toto: String
        })

        schema.plugin(mongooseTracker, {
          fieldsToTrack: ['toto']
        })

        const Model = mongoose.model('test18', schema)

        await Model.create({ price: 10, name: 'nom', toto: 'c est moi' })
        await Model.updateMany({ price: 10 }, { name: 'nouveauNom' })

        const doc = await Model.findOne({ price: 10 })

        expect(doc).toEqual(
          expect.objectContaining({
            '__updates': expect.arrayContaining([
              expect.not.objectContaining({
                changedTo: 'nouveauNom',
                field: 'name'
              })
            ])
          })
        )
      })

      it('should add modified field in __tokens if the field is tracked', async () => {
        const schema = new Schema({
          name: String,
          price: Number,
          toto: String
        })

        schema.plugin(mongooseTracker, {
          fieldsToTrack: ['name', 'toto'],
          name: '__tokens'
        })

        const Model = mongoose.model('test19', schema)

        await Model.create({ price: 10, name: 'nom', toto: 'c est moi' })
        await Model.updateMany({ price: 10 }, { name: 'nouveauNom' })

        const doc = await Model.findOne({ price: 10 })

        expect(doc).toEqual(
          expect.objectContaining({
            '__tokens': expect.arrayContaining([
              expect.objectContaining({
                changedTo: 'nouveauNom',
                field: 'name'
              })
            ])
          })
        )
      })

      it('should add modified field in __tokens if the field is not tracked', async () => {
        const schema = new Schema({
          name: String,
          price: Number,
          toto: String
        })

        schema.plugin(mongooseTracker, {
          fieldsToTrack: ['toto'],
          name: '__tokens'
        })

        const Model = mongoose.model('test20', schema)

        await Model.create({ price: 10, name: 'nom', toto: 'c est moi' })
        await Model.updateMany({ price: 10 }, { name: 'nouveauNom' })

        const doc = await Model.findOne({ price: 10 })

        expect(doc).toEqual(
          expect.objectContaining({
            '__tokens': expect.arrayContaining([
              expect.not.objectContaining({
                changedTo: 'nouveauNom',
                field: 'name'
              })
            ])
          })
        )
      })

      it('should update 2 document if these documents have the field is tracked', async () => {
        const schema = new Schema({
          name: String,
          price: Number,
          toto: String
        })

        schema.plugin(mongooseTracker, {
          fieldsToTrack: ['name', 'toto']
        })

        const Model = mongoose.model('test21', schema)

        await Model.create({ price: 10, name: 'nom', toto: 'c est moi' })
        await Model.create({ price: 10, name: 'nom', toto: 'c est moi' })
        await Model.updateMany({ price: 10 }, { name: 'nouveauNom' })

        const docs = await Model.find({ price: 10 })

        expect(docs[0]).toEqual(
          expect.objectContaining({
            '__updates': expect.arrayContaining([
              expect.objectContaining({
                changedTo: 'nouveauNom',
                field: 'name'
              })
            ])
          })
        )
        expect(docs[1]).toEqual(
          expect.objectContaining({
            '__updates': expect.arrayContaining([
              expect.objectContaining({
                changedTo: 'nouveauNom',
                field: 'name'
              })
            ])
          })
        )
      })
    })
  })
})
