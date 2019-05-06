'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _requestPromise = require('request-promise');

var _requestPromise2 = _interopRequireDefault(_requestPromise);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {
  Config: {
    certificate: {
      pfx: null,
      passphrase: null,
      ca: null
    },
    baseUrl: ''
  },

  Setup(certificate, baseUrl) {
    this.Config.certificate = certificate;
    this.Config.baseUrl = baseUrl;
  },

  async GetRegID(magstrip = '', rfid = '') {
    const request = this.CreateRequest(`${this.Config.baseUrl}/card.json?mag_strip_code=${magstrip}&prox_rfid=${rfid}`, this.Config.certificate);

    try {
      return (await (0, _requestPromise2.default)(request)).Cards[0].RegID;
    } catch (ex) {
      console.log('GetRegID Error', ex);
      return '';
    }
  },

  async GetPhoto(regid, size = 'medium') {
    const request = this.CreateRequest(`${this.Config.baseUrl}/photo/${regid}-${size}.jpg`, this.Config.certificate);

    try {
      return Buffer.from((await (0, _requestPromise2.default)(request)));
    } catch (ex) {
      console.log('GetPhoto Error', ex);
      return null;
    }
  },

  CreateRequest(url, certificate, method = 'GET', body = {}, encoding = null) {
    return {
      method,
      url,
      body,
      json: true,
      time: true,
      encoding,
      ca: [certificate.ca],
      agentOptions: {
        pfx: certificate.pfx,
        passphrase: certificate.passphrase,
        securityOptions: 'SSL_OP_NO_SSLv3'
      }
    };
  }
};