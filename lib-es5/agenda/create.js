'use strict';

var debug = require('debug')('agenda:create');

var Job = require('../job');
/**
 * Given a name and some data, create a new job
 * @name Agenda#create
 * @function
 * @param {String} name name of job
 * @param {Object} data data to set for job
 * @returns {Job} instance of new job
 */


module.exports = function (name, data) {
  debug('Agenda.create(%s, [Object])', name);
  var priority = this._definitions[name] ? this._definitions[name].priority : 0;
  var job = new Job({
    name: name,
    data: data,
    type: 'normal',
    priority: priority,
    agenda: this
  });
  return job;
};