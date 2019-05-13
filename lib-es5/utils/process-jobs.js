'use strict'; // @TODO: What should we use for internal util functions?
//        Maybe we should use agenda:util:processJobs which would move agenda:* to agenda:agenda;*

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var debug = require('debug')('agenda:internal:processJobs');

var createJob = require('./create-job');
/**
 * Process methods for jobs
 * @param {Job} extraJob job to run immediately
 * @returns {undefined}
 */


module.exports = function (extraJob) {
  debug('starting to process jobs'); // Make sure an interval has actually been set
  // Prevents race condition with 'Agenda.stop' and already scheduled run

  if (!this._processInterval) {
    debug('no _processInterval set when calling processJobs, returning');
    return;
  }

  var self = this;
  var definitions = this._definitions;
  var jobQueue = this._jobQueue;
  var jobName; // Determine whether or not we have a direct process call!

  if (!extraJob) {
    // Go through each jobName set in 'Agenda.process' and fill the queue with the next jobs
    for (jobName in definitions) {
      if ({}.hasOwnProperty.call(definitions, jobName)) {
        debug('queuing up job to process: [%s]', jobName);
        jobQueueFilling(jobName);
      }
    }
  } else if (definitions[extraJob.attrs.name]) {
    // Add the job to list of jobs to lock and then lock it immediately!
    debug('job [%s] was passed directly to processJobs(), locking and running immediately', extraJob.attrs.name);

    self._jobsToLock.push(extraJob);

    lockOnTheFly();
  }
  /**
   * Returns true if a job of the specified name can be locked.
   * Considers maximum locked jobs at any time if self._lockLimit is > 0
   * Considers maximum locked jobs of the specified name at any time if jobDefinition.lockLimit is > 0
   * @param {String} name name of job to check if we should lock or not
   * @returns {boolean} whether or not you should lock job
   */


  function shouldLock(name) {
    var jobDefinition = definitions[name];
    var shouldLock = true;

    if (self._lockLimit && self._lockLimit <= self._lockedJobs.length) {
      shouldLock = false;
    }

    if (jobDefinition.lockLimit && jobDefinition.lockLimit <= jobDefinition.locked) {
      shouldLock = false;
    }

    debug('job [%s] lock status: shouldLock = %s', name, shouldLock);
    return shouldLock;
  }
  /**
   * Internal method that adds jobs to be processed to the local queue
   * @param {*} jobs Jobs to queue
   * @param {boolean} inFront puts the job in front of queue if true
   * @returns {undefined}
   */


  function enqueueJobs(jobs, inFront) {
    if (!Array.isArray(jobs)) {
      jobs = [jobs];
    }

    jobs.forEach(function (job) {
      var jobIndex;
      var start;
      var loopCondition;
      var endCondition;
      var inc;

      if (inFront) {
        start = jobQueue.length ? jobQueue.length - 1 : 0;
        inc = -1;

        loopCondition = function loopCondition() {
          return jobIndex >= 0;
        };

        endCondition = function endCondition(queuedJob) {
          return !queuedJob || queuedJob.attrs.priority < job.attrs.priority;
        };
      } else {
        start = 0;
        inc = 1;

        loopCondition = function loopCondition() {
          return jobIndex < jobQueue.length;
        };

        endCondition = function endCondition(queuedJob) {
          return queuedJob.attrs.priority >= job.attrs.priority;
        };
      }

      for (jobIndex = start; loopCondition(); jobIndex += inc) {
        if (endCondition(jobQueue[jobIndex])) {
          break;
        }
      } // Insert the job to the queue at its prioritized position for processing


      jobQueue.splice(jobIndex, 0, job);
    });
  }
  /**
   * Internal method that will lock a job and store it on MongoDB
   * This method is called when we immediately start to process a job without using the process interval
   * We do this because sometimes jobs are scheduled but will be run before the next process time
   * @returns {undefined}
   */


  function lockOnTheFly() {
    // Already running this? Return
    if (self._isLockingOnTheFly) {
      debug('lockOnTheFly() already running, returning');
      return;
    } // Don't have any jobs to run? Return


    if (self._jobsToLock.length === 0) {
      debug('no jobs to current lock on the fly, returning');
      self._isLockingOnTheFly = false;
      return;
    } // Set that we are running this


    self._isLockingOnTheFly = true; // Grab a job that needs to be locked

    var now = new Date();

    var job = self._jobsToLock.pop(); // If locking limits have been hit, stop locking on the fly.
    // Jobs that were waiting to be locked will be picked up during a
    // future locking interval.


    if (!shouldLock(job.attrs.name)) {
      debug('lock limit hit for: [%s]', job.attrs.name);
      self._jobsToLock = [];
      self._isLockingOnTheFly = false;
      return;
    } // Query to run against collection to see if we need to lock it


    var criteria = {
      _id: job.attrs._id,
      lockedAt: null,
      nextRunAt: job.attrs.nextRunAt,
      disabled: {
        $ne: true
      }
    }; // Update / options for the MongoDB query

    var update = {
      $set: {
        lockedAt: now
      }
    };
    var options = {
      returnOriginal: false
    }; // Lock the job in MongoDB!

    self._collection.findOneAndUpdate(criteria, update, options, function (err, resp) {
      if (err) {
        throw err;
      } // Did the "job" get locked? Create a job object and run


      if (resp.value) {
        var _job = createJob(self, resp.value);

        debug('found job [%s] that can be locked on the fly', _job.attrs.name);

        self._lockedJobs.push(_job);

        definitions[_job.attrs.name].locked++;
        enqueueJobs(_job);
        jobProcessing();
      } // Mark lock on fly is done for now


      self._isLockingOnTheFly = false; // Re-run in case anything is in the queue

      lockOnTheFly();
    });
  }
  /**
   * Internal method used to fill a queue with jobs that can be run
   * @param {String} name fill a queue with specific job name
   * @returns {undefined}
   */


  function jobQueueFilling(name) {
    // Don't lock because of a limit we have set (lockLimit, etc)
    if (!shouldLock(name)) {
      debug('lock limit reached in queue filling for [%s]', name);
      return;
    } // Set the date of the next time we are going to run _processEvery function


    var now = new Date();
    self._nextScanAt = new Date(now.valueOf() + self._processEvery); // For this job name, find the next job to run and lock it!

    self._findAndLockNextJob(name, definitions[name], function (err, job) {
      if (err) {
        debug('[%s] job lock failed while filling queue', name);
        throw err;
      } // Still have the job?
      // 1. Add it to lock list
      // 2. Add count of locked jobs
      // 3. Queue the job to actually be run now that it is locked
      // 4. Recursively run this same method we are in to check for more available jobs of same type!


      if (job) {
        debug('[%s:%s] job locked while filling queue', name, job.attrs._id);

        self._lockedJobs.push(job);

        definitions[job.attrs.name].locked++;
        enqueueJobs(job);
        jobQueueFilling(name);
        jobProcessing();
      }
    });
  }
  /**
   * Internal method that processes any jobs in the local queue (array)
   * @returns {undefined}
   */


  function jobProcessing() {
    // Ensure we have jobs
    if (jobQueue.length === 0) {
      return;
    } // Store for all sorts of things


    var now = new Date(); // Get the next job that is not blocked by concurrency

    var next;

    for (next = jobQueue.length - 1; next > 0; next -= 1) {
      var def = definitions[jobQueue[next].attrs.name];

      if (def.concurrency > def.running) {
        break;
      }
    } // We now have the job we are going to process and its definition


    var job = jobQueue.splice(next, 1)[0];
    var jobDefinition = definitions[job.attrs.name];
    debug('[%s:%s] about to process job', job.attrs.name, job.attrs._id); // If the 'nextRunAt' time is older than the current time, run the job
    // Otherwise, setTimeout that gets called at the time of 'nextRunAt'

    if (job.attrs.nextRunAt < now) {
      debug('[%s:%s] nextRunAt is in the past, run the job immediately', job.attrs.name, job.attrs._id);
      runOrRetry();
    } else {
      var runIn = job.attrs.nextRunAt - now;
      debug('[%s:%s] nextRunAt is in the future, calling setTimeout(%d)', job.attrs.name, job.attrs._id, runIn);
      setTimeout(runOrRetry, runIn);
    }
    /**
     * Internal method that tries to run a job and if it fails, retries again!
     * @returns {undefined}
     */


    function runOrRetry() {
      return _runOrRetry.apply(this, arguments);
    }

    function _runOrRetry() {
      _runOrRetry = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee() {
        var lockDeadline;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                if (!self._processInterval) {
                  _context.next = 18;
                  break;
                }

                if (!(jobDefinition.concurrency > jobDefinition.running && self._runningJobs.length < self._maxConcurrency)) {
                  _context.next = 16;
                  break;
                }

                // Get the deadline of when the job is not supposed to go past for locking
                lockDeadline = new Date(Date.now() - jobDefinition.lockLifetime); // This means a job has "expired", as in it has not been "touched" within the lockoutTime
                // Remove from local lock
                // NOTE: Shouldn't we update the 'lockedAt' value in MongoDB so it can be picked up on restart?

                if (!(job.attrs.lockedAt < lockDeadline)) {
                  _context.next = 9;
                  break;
                }

                debug('[%s:%s] job lock has expired, freeing it up', job.attrs.name, job.attrs._id);

                self._lockedJobs.splice(self._lockedJobs.indexOf(job), 1);

                jobDefinition.locked--;
                jobProcessing();
                return _context.abrupt("return");

              case 9:
                // Add to local "running" queue
                self._runningJobs.push(job);

                jobDefinition.running++; // CALL THE ACTUAL METHOD TO PROCESS THE JOB!!!

                debug('[%s:%s] processing job', job.attrs.name, job.attrs._id);
                job.run()["catch"](function (err) {
                  return [err, job];
                }).then(function (job) {
                  return processJobResult.apply(void 0, _toConsumableArray(Array.isArray(job) ? job : [null, job]));
                }); // eslint-disable-line promise/prefer-await-to-then
                // Re-run the loop to check for more jobs to process (locally)

                jobProcessing();
                _context.next = 18;
                break;

              case 16:
                // Run the job immediately by putting it on the top of the queue
                debug('[%s:%s] concurrency preventing immediate run, pushing job to top of queue', job.attrs.name, job.attrs._id);
                enqueueJobs(job, true);

              case 18:
              case "end":
                return _context.stop();
            }
          }
        }, _callee);
      }));
      return _runOrRetry.apply(this, arguments);
    }
  }
  /**
   * Internal method used to run the job definition
   * @param {Error} err thrown if can't process job
   * @param {module.Job} job job to process
   * @returns {undefined}
   */


  function processJobResult(err, job) {
    if (err) {
      return job.agenda.emit('error', err);
    }

    var name = job.attrs.name; // Job isn't in running jobs so throw an error

    if (self._runningJobs.indexOf(job) === -1) {
      debug('[%s] callback was called, job must have been marked as complete already', job.attrs._id);
      throw new Error('callback already called - job ' + name + ' already marked complete');
    } // Remove the job from the running queue


    self._runningJobs.splice(self._runningJobs.indexOf(job), 1);

    if (definitions[name].running > 0) {
      definitions[name].running--;
    } // Remove the job from the locked queue


    self._lockedJobs.splice(self._lockedJobs.indexOf(job), 1);

    if (definitions[name].locked > 0) {
      definitions[name].locked--;
    } // Re-process jobs now that one has finished


    jobProcessing();
  }
};