'use strict';

var _cert = require('./cert');

var _cert2 = _interopRequireDefault(_cert);

var _groupsWS = require('./groupsWS');

var _groupsWS2 = _interopRequireDefault(_groupsWS);

var _personWS = require('./personWS');

var _personWS2 = _interopRequireDefault(_personWS);

var _idcardWS = require('./idcardWS');

var _idcardWS2 = _interopRequireDefault(_idcardWS);

var _hrpWS = require('./hrpWS');

var _hrpWS2 = _interopRequireDefault(_hrpWS);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.Certificate = _cert2.default;
exports.GroupsWebService = _groupsWS2.default;
exports.PersonWebService = _personWS2.default;
exports.IDCardWebService = _idcardWS2.default;
exports.HRPWebService = _hrpWS2.default;