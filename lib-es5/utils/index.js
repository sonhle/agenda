"use strict";

var createJob = require('./create-job');

var processJobs = require('./process-jobs');

module.exports = {
  createJob: createJob,
  processJobs: processJobs
};