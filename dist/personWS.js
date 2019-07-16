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
      ca: null,
      incommon: null
    },
    baseUrl: ''
  },

  Setup(certificate, baseUrl) {
    this.Config.certificate = certificate;
    this.Config.baseUrl = baseUrl;
  },

  async Get(identifier, full = false) {
    if (full) {
      identifier = identifier + '/full';
    }
    const request = this.CreateRequest(`${this.Config.baseUrl}/person/${identifier}.json`, this.Config.certificate);
    try {
      return await (0, _requestPromise2.default)(request);
    } catch (ex) {
      console.log('Get Error', ex);
      return null;
    }
  },

  async GetMany(identifiers, batchSize = 15, key = 'uwnetid') {
    let start = 0;
    let end = start + batchSize > identifiers.length ? identifiers.length : start + batchSize;

    const filtered = [];

    while (end <= identifiers.length) {
      let res = {
        Persons: []
      };
      const ids = identifiers.slice(start, end);
      const request = this.CreateRequest(`${this.Config.baseUrl}/person.json?${key}=${ids.join(',')}&verbose=true`, this.Config.certificate);

      if (ids.length == 0) {
        break;
      }

      try {
        res = await (0, _requestPromise2.default)(request);
      } catch (ex) {
        console.log('GetMany Error', ex);
        for (let _ of ids) {
          res.Persons.push(null);
        }
      }

      for (let person of res.Persons) {
        filtered.push(person);
      }

      start = end;
      end = start + batchSize > identifiers.length ? identifiers.length : start + batchSize;
    }

    return filtered;
  },

  async Search(query, pageSize = '10', pageStart = '1') {
    const request = this.CreateRequest(`${this.Config.baseUrl}/person.json?${query}&page_size=${pageSize}&page_start=${pageStart}`, this.Config.certificate);
    let res = {
      Persons: [],

      TotalCount: '',

      Size: '',

      PageStart: ''
    };

    try {
      res = await (0, _requestPromise2.default)(request);
    } catch (ex) {
      console.log('Search Error', ex);
    }

    return res;
  },

  CreateRequest(url, certificate, method = 'GET', body = {}) {
    let options = {
      method,
      url,
      body,
      json: true,
      time: true,
      ca: [],
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
};