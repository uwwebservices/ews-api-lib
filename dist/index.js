'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _cert = require('./cert');

Object.defineProperty(exports, 'Certificate', {
  enumerable: true,
  get: function () {
    return _interopRequireDefault(_cert).default;
  }
});

var _groupsWS = require('./groupsWS');

Object.defineProperty(exports, 'GroupsWebService', {
  enumerable: true,
  get: function () {
    return _interopRequireDefault(_groupsWS).default;
  }
});

var _personWS = require('./personWS');

Object.defineProperty(exports, 'PersonWebService', {
  enumerable: true,
  get: function () {
    return _interopRequireDefault(_personWS).default;
  }
});

var _idcardWS = require('./idcardWS');

Object.defineProperty(exports, 'IDCardWebService', {
  enumerable: true,
  get: function () {
    return _interopRequireDefault(_idcardWS).default;
  }
});

var _hrpWS = require('./hrpWS');

Object.defineProperty(exports, 'HRPWebService', {
  enumerable: true,
  get: function () {
    return _interopRequireDefault(_hrpWS).default;
  }
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }