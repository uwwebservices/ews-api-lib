"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.BaseWebService = void 0;

var _requestPromise = _interopRequireDefault(require("request-promise"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

class BaseWebService {
  constructor() {
    _defineProperty(this, "Config", void 0);

    this.Config = {
      certificate: {
        pfx: null,
        passphrase: null,
        ca: null,
        incommon: null
      },
      baseUrl: ''
    };
  }
  /**
   * Initial setup for the web service
   * @param certificate
   * @param baseUrl
   */


  Setup(certificate, baseUrl) {
    this.Config.certificate = certificate;
    this.Config.baseUrl = baseUrl;
  }
  /**
   * Reset the setup for the web service
   */


  Reset() {
    this.Config = {
      certificate: {
        pfx: null,
        passphrase: null,
        ca: null,
        incommon: null
      },
      baseUrl: ''
    };
  }
  /**
   * Default configuration for an API request
   * @param url The full URL to make ar equest to
   * @param method HTTP Method to use (default: 'GET')
   * @param body A body object to send with the request (default: {})
   * @param timeout How long to wait before giving up on the call (default: 4000)
   * @param encoding What encoding to expect (default: undefined)
   * @returns A request/request-promise configuration object
   */


  async MakeRequest(url, method = 'GET', body = {}, timeout = 5000, encoding = undefined) {
    const request = this.CreateRequest(url, method, body, timeout, encoding);
    return (0, _requestPromise.default)(request);
  }
  /**
   * Default configuration for an API request
   * @param url The full URL to make ar equest to
   * @param method HTTP Method to use
   * @param body A body object to send with the request
   * @param timeout How long to wait before giving up on the call
   * @param encoding What encoding to expect
   * @returns A request/request-promise configuration object
   */


  CreateRequest(url, method, body, timeout, encoding = undefined) {
    const options = {
      method,
      url,
      body,
      json: true,
      time: true,
      ca: [],
      timeout,
      encoding,
      agentOptions: {
        pfx: this.Config.certificate.pfx,
        passphrase: this.Config.certificate.passphrase !== null ? this.Config.certificate.passphrase : '',
        securityOptions: 'SSL_OP_NO_SSLv3'
      }
    };

    if (this.Config.certificate.ca) {
      options.ca.push(this.Config.certificate.ca);
    }

    if (this.Config.certificate.incommon) {
      options.ca.push(this.Config.certificate.incommon);
    }

    return options;
  }

}

exports.BaseWebService = BaseWebService;