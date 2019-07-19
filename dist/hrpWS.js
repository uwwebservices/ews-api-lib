"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _requestPromise = _interopRequireDefault(require("request-promise"));

var _common = require("./common");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class HRPWebService extends _common.BaseWebService {
  /**
   * Get information for a person via HRPWS.
   * @param identifier - The identifer (UWNetID or UWRegID) of the person to lookup
   * @returns Data representing a person or null
   */
  async Get(identifier) {
    const request = this.CreateRequest(`${this.Config.baseUrl}/worker/${identifier}.json`, this.Config.certificate);

    try {
      return await (0, _requestPromise.default)(request);
    } catch (ex) {
      console.log('Get Error', ex);
      return null;
    }
  }

}

var _default = new HRPWebService();

exports.default = _default;