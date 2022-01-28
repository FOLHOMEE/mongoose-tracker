# Mongoose Tracker


Mongoose Tracker is a mongoose plugin that automatically keeps track of when the document has been created & updated.
Rewrite from old [mongoose-trackable](https://www.npmjs.com/package/mongoose-trackable) which has not been updated for 7 years

## Installation


With [npm](https://npmjs.org)

```
npm install @folhomee/mongoose-tracker
```

With [Yarn](https://yarnpkg.com) : 
```
yarn add @folhomee/mongoose-tracker
```

## Options

|      Fields       |     Types     |   Default   |                 Description                 |
|:-----------------:|:-------------:|:-----------:|:-------------------------------------------:|
| **fieldsToTrack** | Array[String] |    none     |     Array that contain fields to track      |
|     **name**      |    String     | '__updates' | name of the Array that will contains fields |
|     **limit**     |    Number     |     30      |     Number of element in fieldsToTrack      |

## Usage


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

|      Fields      | Types  |      Description       |
|:----------------:|:------:|:----------------------:|
|    **field**     | String |   name of key field    |
|  **changedTo**   | String |     value of key field |
|      **at**      |  Date  |  time at modification  |

## Contributing
- Use eslint to lint your code.
- Add tests for any new or changed functionality.
- Update the readme with an example if you add or change any functionality.
## Legal
Author: [Folhomee](https://www.folhomee.fr/). License Apache-2.0