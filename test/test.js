/**
 * Created by Simon on 10/12/2014.
 */

var testdb = require('./testdb');
var should = require('should');
var autoref = require('../index');
var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.ObjectId;

describe('1-1 self referencing relationship', function(){
    var mike, lisa, error;
    before(function(done){
        testdb.init(function(db){
            db.Person.findOne({ name: 'Mike' }, function(err, m){
                db.Person.findOne({ name: 'Lisa'}, function(err, l){
                    m.partner = l._id;
                    m.save(function(err, m) {
                        error = err;
                        m.on('autoref', function() {
                            db.Person.findOne({name: 'Mike'}, function (err, m) {
                                mike = m;
                                db.Person.findOne({name: 'Lisa'}, function (err, l) {
                                    lisa = l;
                                    done();
                                });
                            });
                        });
                    });
                });
            });
        });
    });

    it('should not have errored', function(){
        should.not.exist(error);
    });

    it('should have saved main doc with new ref', function(){
        should.exist(mike);
        mike.partner.should.eql(lisa._id);
    });

    it('should have saved autoref', function(){
        lisa.partner.should.eql(mike._id);
    });
});

describe('many-many self referencing relationship', function() {
    var mike, lisa, error, greg;
    before(function (done) {
        testdb.init(function (db) {
            db.Person.findOne({ name: 'Mike' }, function (err, m) {
                db.Person.findOne({ name: 'Lisa' }, function (err, l){
                    db.Person.findOne({ name: 'Greg' }, function (err, g) {
                        m.friends = [l._id, g._id];
                        m.save(function (err, m) {
                            error = err;
                            m.on('autoref', function() {
                                db.Person.findOne({name: 'Mike'}, function (err, m) {
                                    mike = m;
                                    db.Person.findOne({name: 'Lisa'}, function (err, l) {
                                        lisa = l;
                                        db.Person.findOne({name: 'Greg'}, function (err, g) {
                                            greg = g;
                                            done();
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    });

    it('should not have errored', function(){
        should.not.exist(error);
    });

    it('should have saved main doc with new refs', function(){
        should.exist(mike);
        mike.friends.length.should.eql(2);
        mike.friends.indexOf(greg._id).should.not.eql(-1);
        mike.friends.indexOf(lisa._id).should.not.eql(-1);
    });

    it('should have saved autoref to first doc', function(){
        should.exist(lisa);
        lisa.friends.length.should.eql(1);
        lisa.friends.indexOf(mike._id).should.not.eql(-1);
    });

    it('should have saved autoref to second doc', function(){
        should.exist(greg);
        greg.friends.length.should.eql(1);
        greg.friends.indexOf(mike._id).should.not.eql(-1);
    });
});

describe('1-many relationship', function() {
    var mike, error, sweet;
    before(function (done) {
        testdb.init(function (db) {
            db.Person.findOne({ name: 'Mike' }, function (err, m) {
                db.Company.findOne({ name: 'Sweet' }, function(err, s){
                    m.employer = s._id;
                    m.save(function (err, m) {
                        error = err;
                        m.on('autoref', function() {
                            db.Person.findOne({name: 'Mike'}, function (err, m) {
                                mike = m;
                                db.Company.findById(s._id, function (err, s) {
                                    sweet = s;
                                    done();
                                });
                            });
                        });
                    });
                });
            });
        });
    });

    it('should not have errored', function(){
        should.not.exist(error);
    });

    it('should have saved main doc with new refs', function(){
        should.exist(mike.employer);
        mike.employer.should.eql(sweet._id);
    });

    it('should have saved autoref', function(){
        should.exist(sweet);
        should.exist(sweet.employees);
        sweet.employees.length.should.eql(1);
        sweet.employees.indexOf(mike._id).should.not.eql(-1);
    });
});

describe('many-1 relationship', function() {
    var mike, error, sweet;
    before(function (done) {
        testdb.init(function (db) {
            db.Person.findOne({ name: 'Mike' }, function (err, m) {
                db.Company.findOne({ name: 'Sweet' }, function(err, s){
                    s.employees = [m._id];
                    s.save(function (err, s) {
                        error = err;
                        s.on('autoref', function() {
                            db.Company.findOne({name: 'Sweet'}, function (err, s) {
                                sweet = s;
                                db.Person.findOne({name: 'Mike'}, function (err, m) {
                                    mike = m;
                                    done();
                                });
                            });
                        });
                    });
                });
            });
        });
    });

    it('should not have errored', function(){
        should.not.exist(error);
    });

    it('should have saved main doc with new refs', function(){
        should.exist(sweet);
        should.exist(sweet.employees);
        sweet.employees.length.should.eql(1);
        sweet.employees.indexOf(mike._id).should.not.eql(-1);
    });

    it('should have saved autoref', function(){
        should.exist(mike.employer);
        mike.employer.should.eql(sweet._id);
    });
});

describe('many-many relationship company to person', function() {
    var mike, error, sweet;
    before(function (done) {
        testdb.init(function (db) {
            db.Person.findOne({ name: 'Mike' }, function (err, m) {
                db.Person.findOne({ name: 'Lisa' }, function (err, l){
                    db.Company.findOne({ name: 'Sweet'}, function(err, s){
                        s.interviewees = [m._id, l._id];
                        s.save(function(err, s) {
                            error = err;
                            s.on('autoref', function() {
                                db.Company.findOne({name: 'Sweet'}, function (err, s) {
                                    sweet = s;
                                    db.Person.findOne({name: 'Mike'}, function (err, m) {
                                        mike = m;
                                        db.Person.findOne({name: 'Lisa'}, function (err, l) {
                                            lisa = l;
                                            done();
                                        })
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    });

    it('should not have errored', function(){
        should.not.exist(error);
    });

    it('should have saved main doc with new refs', function(){
        should.exist(sweet);
        sweet.interviewees.length.should.eql(2);
        sweet.interviewees.indexOf(mike._id).should.not.eql(-1);
        sweet.interviewees.indexOf(lisa._id).should.not.eql(-1);
    });

    it('should have saved autoref to first doc', function(){
        should.exist(mike);
        mike.interviewers.length.should.eql(1);
        mike.interviewers.indexOf(sweet._id).should.not.eql(-1);
    });

    it('should have saved autoref to second doc', function(){
        should.exist(lisa);
        lisa.interviewers.length.should.eql(1);
        lisa.interviewers.indexOf(sweet._id).should.not.eql(-1);
    });
});

describe('many-many relationship person to company', function() {
    var mike, error, sweet, schmick;
    before(function (done) {
        testdb.init(function (db) {
            db.Company.findOne({ name: 'Sweet'}, function(err, s){
                db.Company.findOne({ name: 'Schmick' }, function(err, sch) {
                    db.Person.findOne({name: 'Mike'}, function (err, m) {
                        m.interviewers = [s._id, sch._id];
                        m.save(function(err, ma){
                            error = err;
                            ma.on('autoref', function() {
                                db.Person.findOne({name: 'Mike'}, function (err, m) {
                                    mike = m;
                                    db.Company.findOne({name: 'Sweet'}, function (err, s) {
                                        db.Company.findOne({name: 'Schmick'}, function (err, sch) {
                                            sweet = s;
                                            schmick = sch;
                                            done();
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    });

    it('should not have errored', function(){
        should.not.exist(error);
    });

    it('should have saved main doc with new refs', function(){
        should.exist(mike);
        mike.interviewers.length.should.eql(2);
        mike.interviewers.indexOf(sweet._id).should.not.eql(-1);
        mike.interviewers.indexOf(schmick._id).should.not.eql(-1);
    });

    it('should have saved autoref to first doc', function(){
        should.exist(sweet);
        sweet.interviewees.length.should.eql(1);
        sweet.interviewees.indexOf(mike._id).should.not.eql(-1);
    });

    it('should have saved autoref to second doc', function(){
        should.exist(schmick);
        schmick.interviewees.length.should.eql(1);
        schmick.interviewees.indexOf(mike._id).should.not.eql(-1);
    });
});

describe('1-many relationship no duplicates on multiple save', function() {
    var mike, error, sweet;
    before(function (done) {
        testdb.init(function (db) {
            db.Person.findOne({ name: 'Mike' }, function (err, m) {
                db.Company.findOne({ name: 'Sweet' }, function(err, s){
                    m.employer = s._id;
                    m.save(function (err, m) {
                        error = err;
                        m.on('autoref', function() {
                            // Do not subscribe to autoref more than one on the same instance
                            m.removeAllListeners('autoref');
                            process.nextTick(function() {
                                m.name = 'Mike2';
                                m.save(function (err, m) {
                                    error = err;
                                    m.on('autoref', function() {
                                        db.Person.findOne({name: 'Mike2'}, function (err, m) {
                                            mike = m;
                                            db.Company.findById(s._id, function (err, s) {
                                                sweet = s;
                                                done();
                                            });
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    });

    it('should not have errored', function(){
        should.not.exist(error);
    });

    it('should have saved main doc with new refs', function(){
        should.exist(mike.employer);
        mike.employer.should.eql(sweet._id);
    });

    it('should have saved autoref but no duplicates', function(){
        should.exist(sweet);
        should.exist(sweet.employees);
        sweet.employees.length.should.eql(1);
        sweet.employees.indexOf(mike._id).should.not.eql(-1);
    });
});

// TODO Validate bad paths against schemas so that we can generate errors
describe('bad input', function() {
    var db;
    beforeEach(function (done) {
        testdb.init(function (initDb) {
            db = initDb;
            done();
        });

    });


    it('should ignore bad nested paths', function (done) {
        var badSchema = new mongoose.Schema({
            _id: ObjectId,
            person: {type: ObjectId, ref: 'Person'}
        });
        badSchema.plugin(autoref, [
            'person.nope'
        ]);
        var Bad = mongoose.model('BadNestedPath', badSchema);
        db.Person.findOne({name: 'Mike'}, function (err, mike) {
            var bad = new Bad({
                _id: mongoose.Types.ObjectId(),
                person: mike._id
            });

            bad.save(function(){
                bad.on('autoref', function(err, bad){
                    should.not.exist(err);
                    should.exist(bad);
                    done();
                });
            });
        });
    });

    it('should ignore bad paths', function (done) {
        var badSchema = new mongoose.Schema({
            _id: ObjectId,
            person: {type: ObjectId, ref: 'Person'}
        });
        badSchema.plugin(autoref, [
            'hmm.not.there'
        ]);
        var Bad = mongoose.model('BadPath', badSchema);
        db.Person.findOne({name: 'Mike'}, function (err, mike) {
            var bad = new Bad({
                _id: mongoose.Types.ObjectId(),
                person: mike._id
            });

            bad.save(function(){
                bad.on('autoref', function(err, bad){
                    should.not.exist(err);
                    should.exist(bad);
                    done();
                });
            });
        });
    });
});

describe('when populating deeply nested objects', function() {
    var One, Two, Three, Four;
    before(function (done) {
        var oneSchema = new mongoose.Schema({
            data: String,
            two: {type: mongoose.Schema.ObjectId, ref: 'Two'}
        }, { _id: true });
        oneSchema.plugin(autoref, ['two.threes.four.one']);

        var twoSchema = new mongoose.Schema({
            data: String,
            threes: [{type: mongoose.Schema.ObjectId, ref: 'Three'}]
        }, { _id: true });

        var threeSchema = new mongoose.Schema({
            data: String,
            four: {type: mongoose.Schema.ObjectId, ref: 'Four'}
        }, { _id: true });

        var fourSchema = new mongoose.Schema({
            data: String,
            one: [{type: mongoose.Schema.ObjectId, ref: 'One'}]
        }, { _id: true });

        One = mongoose.model('One', oneSchema);
        Two = mongoose.model('Two', twoSchema);
        Three = mongoose.model('Three', threeSchema);
        Four = mongoose.model('Four', fourSchema);

        One.collection.drop(function(){
            Two.collection.drop(function(){
                Three.collection.drop(function(){
                    Four.collection.drop(function(){
                        populateData();
                    });
                });
            });
        });

        function populateData() {
            var oneOne = new One({data: 'one-one'});
            var oneTwo = new One({data: 'one-two'});
            var twoOne = new Two({data: 'two-one'});
            var twoTwo = new Two({data: 'two-two'});
            var threeOne = new Three({data: 'three-one'});
            var threeTwo = new Three({data: 'three-two'});
            var fourOne = new Four({data: 'four-one'});
            var fourTwo = new Four({data: 'four-two'});

            oneOne.two = twoOne._id;
            oneTwo.two = twoTwo._id;
            twoOne.threes = [threeOne._id];
            twoTwo.threes = [threeTwo._id];
            threeOne.four = fourOne._id;
            threeTwo.four = fourTwo._id;

            oneOne.save(function () {
                twoOne.save(function () {
                    oneTwo.save(function () {
                        twoTwo.save(function () {
                            threeOne.save(function () {
                                threeTwo.save(function () {
                                    fourOne.save(function () {
                                        fourTwo.save(function () {
                                            done();
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            });
        }
    });

    it('should auto update deeply nested refs', function(done){
        One.findOne({data:'one-one'}, function(err, oneOne){
            Two.findOne({data:'two-two'}, function(err, twoTwo){
                oneOne.two = twoTwo._id;
                oneOne.save(function(err, oneOne){
                    oneOne.on('autoref', function(err, oneOne){
                        oneOne.two.data.should.eql('two-two');
                        oneOne.two.threes[0].data.should.eql('three-two');
                        oneOne.two.threes[0].four.data.should.eql('four-two');
                        done();
                    });
                });
            });
        });
    });
});
