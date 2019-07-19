"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.BaseWebService = void 0;

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
   * @param certificate Certificate informationg for the request
   * @param method HTTP Method to use (default: 'GET')
   * @param body A body object to send with the request (default: {})
   * @returns A request/request-promise configuration object
   */


  CreateRequest(url, certificate, method = 'GET', body = {}, timeout = 5000) {
    let options = {
      method,
      url,
      body,
      json: true,
      time: true,
      ca: [],
      timeout,
      agentOptions: {
        pfx: certificate.pfx,
        passphrase: certificate.passphrase,
        securityOptions: 'SSL_OP_NO_SSLv3'
      }
    };

    if (certificate.ca) {
      options.ca.push(certificate.ca);
    }

    if (certificate.incommon) {
      options.ca.push(certificate.incommon);
    }

    return options;
  }

}

exports.BaseWebService = BaseWebService;