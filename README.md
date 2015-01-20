mongoose-autorefs [![Build Status](https://travis-ci.org/strewhella/mongoose-autorefs.svg?branch=master)](https://travis-ci.org/strewhella/mongoose-autorefs)
=================
Mongoose plugin for automatic updating of referenced documents

**Usage**

Add `autoref` as a plugin to a schema, passing in an options array. For example:

```
var autoref = require('mongoose-autorefs');
var mongoose = require('mongoose');

var companySchema = new mongoose.Schema({
    _id: ObjectId,
    name: String,
    employees: [{type: ObjectId, ref: 'Person'}],
    interviewees: [{ type: ObjectId, ref: 'Person' }]
});
companySchema.plugin(autoref, [
    'employees.employer',
    'interviewees.interviewers'
]);
var Company = mongoose.model('Company', companySchema);

var personSchema = new mongoose.Schema({
    _id: ObjectId,
    name: String,
    partner: { type: ObjectId, ref: 'Person' }, // 1-1 self
    friends: [{ type: ObjectId, ref: 'Person' }], // *-* self
    employer: { type: ObjectId, ref: 'Company' }, // 1-*
    interviewers: [{ type: ObjectId, ref: 'Company' }] // *-*
});
personSchema.plugin(autoref, [
    'partner.partner',
    'friends.friends',
    'employer.employees',
    'interviewers.interviewees'
]);
var Person = mongoose.model('Person', personSchema);
```

mongoose-autorefs uses another npm package [mongoose-populator](https://www.npmjs.com/package/mongoose-populator) to fully populate documents in the autoref hierarchy.

**The `options` array**

This array defines one or more paths to referenced documents to update on a `save`.

In the above example, when saving a `Company` document with an `employee`, autoref will automatically update the referenced `Person` document, setting it's `employer` field to the `_id` of the saved `Company`.

This will also work for arrays and arbitrarily nested documents.


**IMPORTANT NOTES**

**1.**  The autoref behaviour is implemented using mongoose's post save middleware. This means the autoref functionality **will only execute on a `save`**. The various `findAndModify` methods **do not** fire the post save middleware.

**2.**  Internally, autoref saves the refs using findOneAndUpdate, so autorefs do not cascade updates. If you want to save the same reference to multiple places, provide a path for each in your plugin config.

**3.**  Since the post save middleware currently does not include a `next` or `done` callback, you can only determine when autoref has completed by listening to the 'autoref' event on the document after you save.
The event passes the updated document, or the original document if the autoref failed.
For example, saving a `Person` document and listening for the complete event:

```
var autoref = require('mongoose-autorefs');

var person = new Person({name: 'Mike'});
person.save(function(err, mike){
    // Listen for the autoref completed event
    personn.on('autoref', function(err, mike){
        // Do some stuff
    });
});
```

The complete event returns any errors, along with the original document the event was fired on. The document will be returned regardless of any errors during the autoref phase.

=======
