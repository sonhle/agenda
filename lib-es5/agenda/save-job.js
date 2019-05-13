'use strict';

var _this = void 0;

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var debug = require('debug')('agenda:saveJob');

var _require = require('../utils'),
    processJobs = _require.processJobs;
/**
 * Given a result for findOneAndUpdate() or insert() above, determine whether to process
 * the job immediately or to let the processJobs() interval pick it up later
 * @param {Error} err error passed in via MongoDB call as to whether modify call failed or passed
 * @param {*} result the data returned from the findOneAndUpdate() call or insertOne() call
 * @access private
 * @returns {undefined}
 */


var processDbResult = function processDbResult(job, result) {
  debug('processDbResult() called with success, checking whether to process job immediately or not'); // We have a result from the above calls
  // findOneAndUpdate() returns different results than insertOne() so check for that

  var res = result.ops ? result.ops : result.value;

  if (res) {
    // If it is an array, grab the first job
    if (Array.isArray(res)) {
      res = res[0];
    } // Grab ID and nextRunAt from MongoDB and store it as an attribute on Job


    job.attrs._id = res._id;
    job.attrs.nextRunAt = res.nextRunAt; // If the current job would have been processed in an older scan, process the job immediately

    if (job.attrs.nextRunAt && job.attrs.nextRunAt < _this._nextScanAt) {
      debug('[%s:%s] job would have ran by nextScanAt, processing the job immediately', job.attrs.name, res._id);
      processJobs.call(_this, job);
    }
  } // Return the Job instance


  return job;
};
/**
 * Save the properties on a job to MongoDB
 * @name Agenda#saveJob
 * @function
 * @param {Job} job job to save into MongoDB
 * @returns {Promise} resolves when job is saved or errors
 */


module.exports =
/*#__PURE__*/
function () {
  var _ref = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee(job) {
    var id, _job$attrs, unique, uniqueOpts, props, now, protect, update, _result, _result2, query, _result3, result;

    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.prev = 0;
            debug('attempting to save a job into Agenda instance'); // Grab information needed to save job but that we don't want to persist in MongoDB

            id = job.attrs._id;
            _job$attrs = job.attrs, unique = _job$attrs.unique, uniqueOpts = _job$attrs.uniqueOpts; // Store job as JSON and remove props we don't want to store from object

            props = job.toJSON();
            delete props._id;
            delete props.unique;
            delete props.uniqueOpts; // Store name of agenda queue as last modifier in job data

            props.lastModifiedBy = this._name;
            debug('[job %s] set job props: \n%O', id, props); // Grab current time and set default query options for MongoDB

            now = new Date();
            protect = {};
            update = {
              $set: props
            };
            debug('current time stored as %s', now.toISOString()); // If the job already had an ID, then update the properties of the job
            // i.e, who last modified it, etc

            if (!id) {
              _context.next = 20;
              break;
            }

            // Update the job and process the resulting data'
            debug('job already has _id, calling findOneAndUpdate() using _id as query');
            _context.next = 18;
            return this._collection.findOneAndUpdate({
              _id: id
            }, update, {
              returnOriginal: false
            });

          case 18:
            _result = _context.sent;
            return _context.abrupt("return", processDbResult(job, _result));

          case 20:
            if (!(props.type === 'single')) {
              _context.next = 29;
              break;
            }

            // Job type set to 'single' so...
            // NOTE: Again, not sure about difference between 'single' here and 'once' in job.js
            debug('job with type of "single" found'); // If the nextRunAt time is older than the current time, "protect" that property, meaning, don't change
            // a scheduled job's next run time!

            if (props.nextRunAt && props.nextRunAt <= now) {
              debug('job has a scheduled nextRunAt time, protecting that field from upsert');
              protect.nextRunAt = props.nextRunAt;
              delete props.nextRunAt;
            } // If we have things to protect, set them in MongoDB using $setOnInsert


            if (Object.keys(protect).length > 0) {
              update.$setOnInsert = protect;
            } // Try an upsert
            // NOTE: 'single' again, not exactly sure what it means


            debug('calling findOneAndUpdate() with job name and type of "single" as query');
            _context.next = 27;
            return this._collection.findOneAndUpdate({
              name: props.name,
              type: 'single'
            }, update, {
              upsert: true,
              returnOriginal: false
            });

          case 27:
            _result2 = _context.sent;
            return _context.abrupt("return", processDbResult(job, _result2));

          case 29:
            if (!unique) {
              _context.next = 38;
              break;
            }

            // If we want the job to be unique, then we can upsert based on the 'unique' query object that was passed in
            query = job.attrs.unique;
            query.name = props.name;

            if (uniqueOpts && uniqueOpts.insertOnly) {
              update = {
                $setOnInsert: props
              };
            } // Use the 'unique' query object to find an existing job or create a new one


            debug('calling findOneAndUpdate() with unique object as query: \n%O', query);
            _context.next = 36;
            return this._collection.findOneAndUpdate(query, update, {
              upsert: true,
              returnOriginal: false
            });

          case 36:
            _result3 = _context.sent;
            return _context.abrupt("return", processDbResult(job, _result3));

          case 38:
            // If all else fails, the job does not exist yet so we just insert it into MongoDB
            debug('using default behavior, inserting new job via insertOne() with props that were set: \n%O', props);
            _context.next = 41;
            return this._collection.insertOne(props);

          case 41:
            result = _context.sent;
            return _context.abrupt("return", processDbResult(job, result));

          case 45:
            _context.prev = 45;
            _context.t0 = _context["catch"](0);
            debug('processDbResult() received an error, job was not updated/created');
            throw _context.t0;

          case 49:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, this, [[0, 45]]);
  }));

  return function (_x) {
    return _ref.apply(this, arguments);
  };
}();