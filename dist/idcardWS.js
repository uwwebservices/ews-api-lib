"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.PhotoSizes = void 0;

var _common = require("./common");

let PhotoSizes;
exports.PhotoSizes = PhotoSizes;

(function (PhotoSizes) {
  PhotoSizes["Small"] = "small";
  PhotoSizes["Medium"] = "medium";
  PhotoSizes["Large"] = "large";
})(PhotoSizes || (exports.PhotoSizes = PhotoSizes = {}));

class IDCardWebService extends _common.BaseWebService {
  /**
   * Get the UWRegID of a person via the magstrip/rfid of their husky card
   * @param magstrip The magstrip of the card to lookup
   * @param rfid The rfid of the card to lookup
   * @returns The UWRegID of the person or an empty string
   */
  async GetRegID(magstrip = '', rfid = '') {
    try {
      return (await this.MakeRequest(`${this.Config.baseUrl}/card.json?mag_strip_code=${magstrip}&prox_rfid=${rfid}`)).Cards[0].RegID;
    } catch (ex) {
      console.log('GetRegID Error', ex.message);
      return '';
    }
  }
  /**
   * Get the photo of a person via their UWRegID
   * @param regid The UWRegID of the person for which to fetch a photo
   * @param size The size of the photo to fetch (small, medium, large)
   * @returns The photo or null
   */


  async GetPhoto(regid, size = PhotoSizes.Medium) {
    try {
      return Buffer.from((await this.MakeRequest(`${this.Config.baseUrl}/photo/${regid}-${size}.jpg`)));
    } catch (ex) {
      console.log('GetPhoto Error', ex.message);
      return null;
    }
  }

}

var _default = new IDCardWebService();

exports.default = _default;