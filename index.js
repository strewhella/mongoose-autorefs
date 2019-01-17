/**
 * Created by Simon on 10/12/2014.
 */

var mongoose = require('mongoose');
var populate = require('mongoose-populator');

module.exports = function (schema, options){
    if (!Array.isArray(options)) return console.error('Non-array found in autoref options for schema ' + schema.name);
    if (options.length === 0) return console.error('No autoref options provided for schema ' + schema.name);

    schema.post('save', function(doc, next){
        // making sure the doc is a valid mongoose doc, with the function we need
        if (!doc.populate) {
          return next();
        }

        autorefs(doc._id, doc, function(err){
            if (err) {
              return next(err);
            }
            return next();
        });
    });

    schema.post('findOneAndUpdate', function(doc, next){
        // making sure the doc is a valid mongoose doc, with the function we need
        if (!doc.populate) {
            if (this.schema && this.model && this.model.modelName) {
                var model = mongoose.model(this.model.modelName, this.schema);
                doc = new model(doc);

                if (!doc.populate) {
                    return next();
                }
            }
            else {
                return next();
            }
        }

        autorefs(doc._id, doc, function(err){
            if (err) {
              return next(err);
            }
            return next();
        });
    });

    schema.post('update', function(doc, next){
        // making sure the doc is a valid mongoose doc, with the function we need
        if (!doc.populate) {
            if (this.schema && this.model && this.model.modelName) {
                var model = mongoose.model(this.model.modelName, this.schema);
                doc = new model(doc);

                if (!doc.populate) {
                    return next();
                }
            }
            else {
                return next();
            }
        }

        autorefs(doc._id, doc, function(err){
            if (err) {
              return next(err);
            }
            return next();
        });
    });

    function autorefs(refId, originalDoc, callback){
        var saves = options.length;

        function finish(err){
            --saves;
            if (saves === 0) {
                return callback(err);
            }
        }

        options.forEach(function(autoref){
            populate(originalDoc, autoref, function(err, doc){
                var paths = autoref.split('.');
                var docs = [doc];

                for (var i = 0, pathsLength = paths.length; i < pathsLength - 1; ++i){
                    for (var j = 0, docsLength = docs.length; j < docsLength; ++j){
                        doc = docs.shift();

                        doc = doc[paths[i]];
                        if (!doc || Array.isArray(doc) && doc.length === 0) continue;

                        if (Array.isArray(doc)){
                            doc.forEach(function(arrayDoc){
                                docs.push(arrayDoc);
                            });
                        }
                        else {
                            docs.push(doc);
                        }
                    }
                }

                if (docs.length === 0){
                    return finish(null);
                }

                var dest = paths[paths.length - 1];
                if (!dest){
                    return finish(new Error('Null or empty path found in autoref'));
                }

                var updates = docs.length;

                docs.forEach(function(doc){
                    doc.constructor.findOne({ _id: doc._id }, function(err, doc){
                        if (err){
                            return finish(new Error('Error saving autoref: ' + err.message + ' (doc ' + doc._id + ')'), originalDoc);
                        }

                        if (doc[dest] === refId || Array.isArray(doc[dest]) && doc[dest].indexOf(refId) !== -1){
                            --updates;
                            if (updates === 0) {
                                return finish(null);
                            }
                            return;
                        }

                        var operation = Array.isArray(doc[dest]) ? '$push' : '$set';
                        var update = {};
                        update[operation] = {};
                        update[operation][dest] = refId;

                        doc.constructor.updateOne({ _id: doc._id }, update, function(err){
                            if (err){
                                return finish(new Error('Error saving autoref: ' + err.message + ' (doc ' + doc._id + ')' + update), originalDoc);
                            }

                            --updates;
                            if (updates === 0) {
                                return finish(null);
                            }
                        });
                    });
                });
            });
        });
    };
};
