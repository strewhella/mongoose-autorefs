/**
 * Created by Simon on 10/12/2014.
 */

var populate = require('mongoose-populator');

module.exports = function (schema, options){
    if (!Array.isArray(options)) return console.error('Non-array found in autoref options for schema ' + schema.name);
    if (options.length === 0) return console.error('No autoref options provided for schema ' + schema.name);

    options.forEach(function(autoref){
        schema.post('save', function(){
            var refId = this._id;
            var saveModel = this.constructor;

            populate(this, autoref, function(err, doc){
                var paths = autoref.split('.');
                var docs = [doc];

                for (var i = 0, pathsLength = paths.length; i < pathsLength - 1; ++i){
                    for (var j = 0, docsLength = docs.length; j < docsLength; ++j){
                        doc = docs.shift();

                        doc = doc[paths[i]];
                        if (!doc || Array.isArray(doc) && doc.length === 0) return;

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

                var dest = paths[paths.length - 1];
                var updates = docs.length;

                docs.forEach(function(doc){
                    if (!doc) return;
                    if (doc[dest] === refId || Array.isArray(doc[dest]) && doc[dest].indexOf(refId) !== -1) return;

                    var operation = Array.isArray(doc[dest]) ? '$push' : '$set';

                    var update = {};
                    update[operation] = {};
                    update[operation][dest] = refId;

                    doc.constructor.findOneAndUpdate({ _id: doc._id }, update, function(err, savedDoc){
                        if (err){
                            console.error('Error saving autoref: ' + err.message + ' (doc ' + doc._id + ')' + update );
                        }

                        --updates;
                        if (updates === 0) {
                            saveModel.emit(completeEvent(refId), savedDoc);
                        }
                    });
                });
            })
        });
    });
};

function completeEvent(id){
    return id + '-autoref-complete';
}
module.exports.completeEvent = completeEvent;

