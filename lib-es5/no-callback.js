"use strict";

/**
 * Internal method ensure functions don't have a callback
 * @name noCallback
 * @global
 * @private
 * @param {Object} args Arguments passed to the function
 * @param {Number} length The amount of arguments that should exist
 * @throws {Error} Throws if callback passed
 */
module.exports = function (args) {
  var length = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

  if (args.length > length) {
    throw new Error("This function does not accept a callback function. ".concat(args.length, "/").concat(length));
  }
};