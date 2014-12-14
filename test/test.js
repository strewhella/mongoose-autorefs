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
                        m.on('autoref', function(err, object) {
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