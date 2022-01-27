# Mongoose Tracker
---------------

Mongoose Tracker is a mongoose plugin that automatically keeps track of when the document has been created & updated.
Rewrite from deprecated [mongoose-trackable](https://www.npmjs.com/package/mongoose-trackable)

## Installation
---------------

Install using [npm](https://npmjs.org)

```
npm install @folhomee/mongoose-tracker
```

## Options
---------------

|      Fields       |     Types     |   Default   |                 Description                 |
|:-----------------:|:-------------:|:-----------:|:-------------------------------------------:|
| **fieldsToTrack** | Array[String] |    none     |     Array that contain fields to track      |
|     **name**      |    String     | '__updates' | name of the Array that will contains fields |
|     **limit**     |    Number     |     30      |     Number of element in fieldsToTrack      |

## Usage
---------------

Use as you would any Mongoose plugin :

```js
const mongoose = require('mongoose')
const mongooseTracker = require('@folhomee/mongoose-tracker')

const { Schema } = mongoose.Schema

const CarsSchema = new Schema({
    tags: [String],
    description: String,
    price: { type: Number, default: 0 },
})

CarsSchema.plugin(mongooseTracker, {
    limit: 50,
    name: 'metaDescriptions',
    fieldsToTrack: ['price', 'description'],
})

module.exports = mongoose.model('Cars', CarsSchema)
```

When create/update is successful, a [**History**](#History) element is pushed to __updates or the named Array
## History
---------------

|      Fields      | Types  |      Description       |
|:----------------:|:------:|:----------------------:|
|    **field**     | String |   name of key field    |
|  **changedTo**   | String |     value of key field |
|      **at**      |  Date  |  time at modification  |

