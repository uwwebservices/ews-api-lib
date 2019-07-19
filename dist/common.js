"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CreateRequest = void 0;

/**
 * Default configuration for an API request
 * @param url The full URL to make ar equest to
 * @param certificate Certificate informationg for the request
 * @param method HTTP Method to use (default: 'GET')
 * @param body A body object to send with the request (default: {})
 * @returns A request/request-promise configuration object
 */
const CreateRequest = (url, certificate, method = 'GET', body = {}, timeout = 5000) => {
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
};

exports.CreateRequest = CreateRequest;