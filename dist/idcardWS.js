"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _requestPromise = _interopRequireDefault(require("request-promise"));

var _common = require("./common");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class IDCardWebService extends _common.BaseWebService {
  /**
   * Get the UWRegID of a person via the magstrip/rfid of their husky card
   * @param magstrip The magstrip of the card to lookup
   * @param rfid The rfid of the card to lookup
   * @returns The UWRegID of the person or an empty string
   */
  async GetRegID(magstrip = '', rfid = '') {
    const request = this.CreateRequest(`${this.Config.baseUrl}/card.json?mag_strip_code=${magstrip}&prox_rfid=${rfid}`, this.Config.certificate);

    try {
      return (await (0, _requestPromise.default)(request)).Cards[0].RegID;
    } catch (ex) {
      console.log('GetRegID Error', ex);
      return '';
    }
  }
  /**
   * Get the photo of a person via their UWRegID
   * @param regid The UWRegID of the person for which to fetch a photo
   * @param size The size of the photo to fetch (small, medium, large)
   * @returns The photo or null
   */


  async GetPhoto(regid, size = 'medium') {
    const request = this.CreateRequest(`${this.Config.baseUrl}/photo/${regid}-${size}.jpg`, this.Config.certificate);

    try {
      return Buffer.from((await (0, _requestPromise.default)(request)));
    } catch (ex) {
      console.log('GetPhoto Error', ex);
      return null;
    }
  }

}

var _default = new IDCardWebService();

exports.default = _default;