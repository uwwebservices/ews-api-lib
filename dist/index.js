"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "Certificate", {
  enumerable: true,
  get: function () {
    return _cert.default;
  }
});
Object.defineProperty(exports, "GroupsWebService", {
  enumerable: true,
  get: function () {
    return _groupsWS.default;
  }
});
Object.defineProperty(exports, "PersonWebService", {
  enumerable: true,
  get: function () {
    return _personWS.default;
  }
});
Object.defineProperty(exports, "IDCardWebService", {
  enumerable: true,
  get: function () {
    return _idcardWS.default;
  }
});
Object.defineProperty(exports, "HRPWebService", {
  enumerable: true,
  get: function () {
    return _hrpWS.default;
  }
});

var _cert = _interopRequireDefault(require("./cert"));

var _groupsWS = _interopRequireDefault(require("./groupsWS"));

var _personWS = _interopRequireDefault(require("./personWS"));

var _idcardWS = _interopRequireDefault(require("./idcardWS"));

var _hrpWS = _interopRequireDefault(require("./hrpWS"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }