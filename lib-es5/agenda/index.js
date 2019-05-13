"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

var _require = require('events'),
    EventEmitter = _require.EventEmitter;

var humanInterval = require('human-interval');
/**
 * @class Agenda
 * @param {Object} config - Agenda Config
 * @param {Function} cb - Callback after Agenda has started and connected to mongo
 * @property {Object} _name - Name of the current Agenda queue
 * @property {Number} _processEvery
 * @property {Number} _defaultConcurrency
 * @property {Number} _maxConcurrency
 * @property {Number} _defaultLockLimit
 * @property {Number} _lockLimit
 * @property {Object} _definitions
 * @property {Object} _runningJobs
 * @property {Object} _lockedJobs
 * @property {Object} _jobQueue
 * @property {Number} _defaultLockLifetime
 * @property {Object} _sort
 * @property {Object} _indices
 * @property {Boolean} _isLockingOnTheFly
 * @property {Array} _jobsToLock
 */


var Agenda =
/*#__PURE__*/
function (_EventEmitter) {
  _inherits(Agenda, _EventEmitter);

  function Agenda() {
    var _this;

    var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var cb = arguments.length > 1 ? arguments[1] : undefined;

    _classCallCheck(this, Agenda);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(Agenda).call(this));

    if (!(_assertThisInitialized(_this) instanceof Agenda)) {
      return _possibleConstructorReturn(_this, new Agenda(config));
    }

    _this._name = config.name;
    _this._processEvery = humanInterval(config.processEvery) || humanInterval('5 seconds');
    _this._defaultConcurrency = config.defaultConcurrency || 5;
    _this._maxConcurrency = config.maxConcurrency || 20;
    _this._defaultLockLimit = config.defaultLockLimit || 0;
    _this._lockLimit = config.lockLimit || 0;
    _this._definitions = {};
    _this._runningJobs = [];
    _this._lockedJobs = [];
    _this._jobQueue = [];
    _this._defaultLockLifetime = config.defaultLockLifetime || 10 * 60 * 1000; // 10 minute default lockLifetime

    _this._sort = config.sort || {
      nextRunAt: 1,
      priority: -1
    };
    _this._indices = Object.assign({
      name: 1
    }, _this._sort, {
      priority: -1,
      lockedAt: 1,
      nextRunAt: 1,
      disabled: 1
    });
    _this._isLockingOnTheFly = false;
    _this._jobsToLock = [];
    _this._ready = new Promise(function (resolve) {
      return _this.once('ready', resolve);
    });

    if (config.mongo) {
      _this.mongo(config.mongo, config.db ? config.db.collection : undefined, cb);
    } else if (config.db) {
      _this.database(config.db.address, config.db.collection, config.db.options, cb);
    }

    return _this;
  }

  return Agenda;
}(EventEmitter);

Agenda.prototype.mongo = require('./mongo');
Agenda.prototype.database = require('./database');
Agenda.prototype.db_init = require('./db-init'); // eslint-disable-line camelcase

Agenda.prototype.name = require('./name');
Agenda.prototype.processEvery = require('./process-every');
Agenda.prototype.maxConcurrency = require('./max-concurrency');
Agenda.prototype.defaultConcurrency = require('./default-concurrency');
Agenda.prototype.lockLimit = require('./locklimit');
Agenda.prototype.defaultLockLimit = require('./default-lock-limit');
Agenda.prototype.defaultLockLifetime = require('./default-lock-lifetime');
Agenda.prototype.sort = require('./sort');
Agenda.prototype.create = require('./create');
Agenda.prototype.jobs = require('./jobs');
Agenda.prototype.purge = require('./purge');
Agenda.prototype.define = require('./define');
Agenda.prototype.every = require('./every');
Agenda.prototype.schedule = require('./schedule');
Agenda.prototype.now = require('./now');
Agenda.prototype.cancel = require('./cancel');
Agenda.prototype.saveJob = require('./save-job');
Agenda.prototype.start = require('./start');
Agenda.prototype.stop = require('./stop');
Agenda.prototype._findAndLockNextJob = require('./find-and-lock-next-job');
module.exports = Agenda;