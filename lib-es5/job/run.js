'use strict';

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var debug = require('debug')('agenda:job');
/**
 * Internal method (RUN)
 * @name Job#run
 * @function
 * @returns {Promise} Resolves when job persistence in MongoDB fails or passes
 */


module.exports = function () {
  var self = this;
  var agenda = self.agenda;
  var definition = agenda._definitions[self.attrs.name];
  return new Promise(
  /*#__PURE__*/
  function () {
    var _ref = _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee2(resolve, reject) {
      var jobCallback;
      return regeneratorRuntime.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              self.attrs.lastRunAt = new Date();
              debug('[%s:%s] setting lastRunAt to: %s', self.attrs.name, self.attrs._id, self.attrs.lastRunAt.toISOString());
              self.computeNextRunAt();
              _context2.next = 5;
              return self.save();

            case 5:
              jobCallback =
              /*#__PURE__*/
              function () {
                var _ref2 = _asyncToGenerator(
                /*#__PURE__*/
                regeneratorRuntime.mark(function _callee(err) {
                  return regeneratorRuntime.wrap(function _callee$(_context) {
                    while (1) {
                      switch (_context.prev = _context.next) {
                        case 0:
                          if (err) {
                            self.fail(err);
                          } else {
                            self.attrs.lastFinishedAt = new Date();
                          }

                          self.attrs.lockedAt = null;
                          _context.next = 4;
                          return self.save()["catch"](function (err) {
                            debug('[%s:%s] failed to be saved to MongoDB', self.attrs.name, self.attrs._id);
                            reject(err);
                          });

                        case 4:
                          debug('[%s:%s] was saved successfully to MongoDB', self.attrs.name, self.attrs._id);

                          if (err) {
                            agenda.emit('fail', err, self);
                            agenda.emit('fail:' + self.attrs.name, err, self);
                            debug('[%s:%s] has failed [%s]', self.attrs.name, self.attrs._id, err.message);
                          } else {
                            agenda.emit('success', self);
                            agenda.emit('success:' + self.attrs.name, self);
                            debug('[%s:%s] has succeeded', self.attrs.name, self.attrs._id);
                          }

                          agenda.emit('complete', self);
                          agenda.emit('complete:' + self.attrs.name, self);
                          debug('[%s:%s] job finished at [%s] and was unlocked', self.attrs.name, self.attrs._id, self.attrs.lastFinishedAt); // Curiously, we still resolve successfully if the job processor failed.
                          // Agenda is not equipped to handle errors originating in user code, so, we leave them to inspect the side-effects of job.fail()

                          resolve(self);

                        case 10:
                        case "end":
                          return _context.stop();
                      }
                    }
                  }, _callee);
                }));

                return function jobCallback(_x3) {
                  return _ref2.apply(this, arguments);
                };
              }();

              _context2.prev = 6;
              agenda.emit('start', self);
              agenda.emit('start:' + self.attrs.name, self);
              debug('[%s:%s] starting job', self.attrs.name, self.attrs._id);

              if (definition) {
                _context2.next = 13;
                break;
              }

              debug('[%s:%s] has no definition, can not run', self.attrs.name, self.attrs._id);
              throw new Error('Undefined job');

            case 13:
              if (!(definition.fn.length === 2)) {
                _context2.next = 18;
                break;
              }

              debug('[%s:%s] process function being called', self.attrs.name, self.attrs._id);
              definition.fn(self, jobCallback);
              _context2.next = 22;
              break;

            case 18:
              debug('[%s:%s] process function being called', self.attrs.name, self.attrs._id);
              definition.fn(self);
              _context2.next = 22;
              return jobCallback();

            case 22:
              _context2.next = 29;
              break;

            case 24:
              _context2.prev = 24;
              _context2.t0 = _context2["catch"](6);
              debug('[%s:%s] unknown error occurred', self.attrs.name, self.attrs._id);
              _context2.next = 29;
              return jobCallback(_context2.t0);

            case 29:
            case "end":
              return _context2.stop();
          }
        }
      }, _callee2, null, [[6, 24]]);
    }));

    return function (_x, _x2) {
      return _ref.apply(this, arguments);
    };
  }());
};