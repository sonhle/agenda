'use strict';

var Job = require('../job');
/**
 * Create Job object from data
 * @param {Object} agenda instance of Agenda
 * @param {Object} jobData job data
 * @returns {Job} returns created job
 */


module.exports = function (agenda, jobData) {
  jobData.agenda = agenda;
  return new Job(jobData);
};