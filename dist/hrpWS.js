"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _common = require("./common");

class HRPWebService extends _common.BaseWebService {
  /**
   * Get information for a person via HRPWS.
   * @param identifier - The identifer (UWNetID or UWRegID) of the person to lookup
   * @returns Data representing a person or null
   */
  async Get(identifier) {
    try {
      return await this.MakeRequest(`${this.Config.baseUrl}/worker/${identifier}.json`);
    } catch (ex) {
      console.log('Get Error', ex);
      return null;
    }
  }

}

var _default = new HRPWebService();

exports.default = _default;