"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _requestPromise = _interopRequireDefault(require("request-promise"));

var _common = require("./common");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class PersonWebService extends _common.BaseWebService {
  /**
   * Get information for a person via PersonWS.
   * @param identifier The identifer (UWNetID or UWRegID) of the person to lookup
   * @returns Data representing a person or null
   */
  async Get(identifier, full = false) {
    if (full) {
      identifier = identifier + '/full';
    }

    const request = this.CreateRequest(`${this.Config.baseUrl}/person/${identifier}.json`, this.Config.certificate);

    try {
      return await (0, _requestPromise.default)(request);
    } catch (ex) {
      console.log('Get Error', ex);
      return null;
    }
  }
  /**
   * Get information for people via PersonWS.
   * @param identifiers The identifers (UWNetID or UWRegID) of the people to lookup
   * @param batchSize The size of the batch
   * @param key The key to use (uwnetid or uwregid)
   * @returns The information belonging to that people or null
   */


  async GetMany(identifiers, batchSize = 15, key = 'uwnetid') {
    let start = 0;
    let end = start + batchSize > identifiers.length ? identifiers.length : start + batchSize;
    const filtered = [];

    while (end <= identifiers.length) {
      let res = {
        Persons: []
      };
      const ids = identifiers.slice(start, end);
      const request = this.CreateRequest(`${this.Config.baseUrl}/person.json?${key}=${ids.join(',')}&verbose=true`, this.Config.certificate); // Breakout if no members

      if (ids.length == 0) {
        break;
      }

      try {
        res = await (0, _requestPromise.default)(request);
      } catch (ex) {
        console.log('GetMany Error', ex);

        for (let _ of ids) {
          res.Persons.push({});
        }
      }

      for (let person of res.Persons) {
        filtered.push(person);
      }

      start = end;
      end = start + batchSize > identifiers.length ? identifiers.length : start + batchSize;
    }

    return filtered;
  }
  /**
   * PWS Search by query
   * @param query The identifer (UWNetID or UWRegID) of the person to lookup
   * @param pageSize How large of a page (max: 250)
   * @param pageStart What page to start on
   * @returns Data representing a person or empty list
   */


  async Search(query, pageSize = '10', pageStart = '1') {
    const request = this.CreateRequest(`${this.Config.baseUrl}/person.json?${query}&page_size=${pageSize}&page_start=${pageStart}`, this.Config.certificate);
    let res = {
      Persons: [],
      TotalCount: '',
      Size: '',
      PageStart: ''
    };

    try {
      res = await (0, _requestPromise.default)(request);
    } catch (ex) {
      console.log('Search Error', ex);
    }

    return res;
  }

}

var _default = new PersonWebService();

exports.default = _default;