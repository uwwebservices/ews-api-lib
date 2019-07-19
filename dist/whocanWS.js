"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.UWAuthMode = void 0;

var _common = require("./common");

let UWAuthMode;
exports.UWAuthMode = UWAuthMode;

(function (UWAuthMode) {
  UWAuthMode["Hops"] = "hops";
  UWAuthMode["Auths"] = "auths";
})(UWAuthMode || (exports.UWAuthMode = UWAuthMode = {}));

const WhoCanTimeout = 5527;

class WhoCanWebService extends _common.BaseWebService {
  /**
   * Get a list of applications.
   * @returns An array of applications or null
   */
  async Applications() {
    try {
      return await this.MakeRequest(`${this.Config.baseUrl}/applications.json`);
    } catch (ex) {
      console.log('Applications Error', ex);
      return null;
    }
  }
  /**
   * Get a list of roles for a given application.
   * @returns An array of application roles or null
   */


  async Roles(app) {
    try {
      return await this.MakeRequest(`${this.Config.baseUrl}/roles/${app}.json`);
    } catch (ex) {
      console.log('Roles Error', ex);
      return null;
    }
  }
  /**
   * Get authorization information for a person.
   * @param identifier The identifer (UWNetID) of the person to lookup
   * @param app The application to lookup
   * @param role The role to lookup
   * @param mode The mode to use (default: hops)
   * @param limit The limit on the number of authorizers (default: 50)
   * @returns Data representing authorization information for a person or null
   */


  async Get(identifier, app, role, mode = UWAuthMode.Hops, hops = 50) {
    try {
      return await this.MakeRequest(`${this.Config.baseUrl}/auth/${identifier}.json?app=${app}&role=${role}&mode=${mode}&hops=${hops}`, 'GET', {}, WhoCanTimeout);
    } catch (ex) {
      console.log('Get Error', ex);
      return null;
    }
  }

}

var _default = new WhoCanWebService();

exports.default = _default;