
/**
 * Created by Simon on 5/12/2014.
 */

var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
var autoref = require('../index.js');

var ObjectId = mongoose.Schema.ObjectId;
var initialized = false;

module.exports.init = function(done) {
    if (!initialized) {
        initialized = true;
        mongoose.connect('mongodb://localhost/test', {useMongoClient:true});
    //    mongoose.set('debug', true);

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
    }

    var Company = mongoose.model('Company', companySchema);
    var Person = mongoose.model('Person', personSchema);
    var db = {
        Company: Company,
        Person: Person
    };

    Company.collection.drop(function(){
        Person.collection.drop(function(){
            finishedDrop();
        });
    });

    function finishedDrop(){
        var greg = new Person({_id: mongoose.Types.ObjectId(), name: 'Greg'});
        var mike = new Person({_id: mongoose.Types.ObjectId(), name: 'Mike'});
        var lisa = new Person({_id: mongoose.Types.ObjectId(), name: 'Lisa'});

        lisa.on('autoref', function(err, lisa) {
            createCompanies(greg, mike, lisa);
        });

        greg.save(function (err, greg) {
            mike.save(function (err, mike) {
                lisa.save(function (err, lisa) {
                });
            });
        });



        function createCompanies() {
            var sweet = new Company({_id:mongoose.Types.ObjectId(), name: 'Sweet' });
            var schmick = new Company({_id:mongoose.Types.ObjectId(), name: 'Schmick'});

            schmick.on('autoref', function(err, schmick) {
                done(db);
            });

            sweet.save(function(){
                schmick.save(function () {}); 
            })
        }
    }
};

