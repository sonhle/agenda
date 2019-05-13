'use strict';

var debug = require('debug')('agenda:stop');
/**
 * Clear the interval that processes the jobs
 * @name Agenda#stop
 * @function
 * @returns {Promise} resolves when job unlocking fails or passes
 */


module.exports = function () {
  var self = this;
  /**
   * Internal method to unlock jobs so that they can be re-run
   * NOTE: May need to update what properties get set here, since job unlocking seems to fail
   * @access private
   * @returns {Promise} resolves when job unlocking fails or passes
   */

  var _unlockJobs = function _unlockJobs() {
    return new Promise(function (resolve, reject) {
      debug('Agenda._unlockJobs()');

      var jobIds = self._lockedJobs.map(function (job) {
        return job.attrs._id;
      });

      if (jobIds.length === 0) {
        debug('no jobs to unlock');
        return resolve();
      }

      debug('about to unlock jobs with ids: %O', jobIds);

      self._collection.updateMany({
        _id: {
          $in: jobIds
        }
      }, {
        $set: {
          lockedAt: null
        }
      }, function (err) {
        if (err) {
          return reject(err);
        }

        self._lockedJobs = [];
        return resolve();
      });
    });
  };

  debug('Agenda.stop called, clearing interval for processJobs()');
  clearInterval(this._processInterval);
  this._processInterval = undefined;
  return _unlockJobs();
};