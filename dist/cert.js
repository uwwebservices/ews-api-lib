"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _awsSdk = _interopRequireDefault(require("aws-sdk"));

var _fs = _interopRequireDefault(require("fs"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Certificate {
  /**
   * Get the certificate from an AWS S3 bucket.
   * @param s3Bucket The bucket name
   * @param s3CertKey The filename for the cert file
   * @param s3PassKey The filename for the passkey file
   * @param s3CAKey The filename for the ca file
   * @param s3Incommon The filename for the incommon file
   * @returns A pfx.
   */
  async GetPFXFromS3(s3Bucket, s3CertKey, s3PassKey, s3CAKey, s3Incommon) {
    const s3 = new _awsSdk.default.S3();
    let Config = {
      pfx: null,
      passphrase: null,
      ca: null,
      incommon: null
    };
    let promises = [s3.getObject({
      Bucket: s3Bucket,
      Key: s3CertKey
    }).promise().then(pfxFile => Config.pfx = pfxFile.Body), s3.getObject({
      Bucket: s3Bucket,
      Key: s3PassKey
    }).promise().then(passphrase => Config.passphrase = passphrase.Body != null ? passphrase.Body.toString() : ''), s3.getObject({
      Bucket: s3Bucket,
      Key: s3CAKey
    }).promise().then(caFile => Config.ca = caFile.Body), s3.getObject({
      Bucket: s3Bucket,
      Key: s3Incommon
    }).promise().then(incommonFile => Config.incommon = incommonFile.Body)];
    await Promise.all(promises);
    return Config;
  }
  /**
   * Get the certificate from a FS location.
   * @param pfxFilePath The filename for the cert files
   * @param passphraseFilePath The filename for the passkey file
   * @param caFilePath The filename for the ca file
   * @param incommonFilePath The filename for the incommon cert file
   * @returns A pfx.
   */


  GetPFXFromFS(pfxFilePath, passphraseFilePath, caFilePath, incommonFilePath) {
    let Config = {
      pfx: null,
      passphrase: null,
      ca: null,
      incommon: null
    };
    Config.pfx = _fs.default.readFileSync(pfxFilePath);
    Config.passphrase = _fs.default.readFileSync(passphraseFilePath, {
      encoding: 'utf8'
    }).toString();
    Config.ca = _fs.default.readFileSync(caFilePath);
    Config.ca = _fs.default.readFileSync(incommonFilePath);
    return Config;
  }

}

var _default = new Certificate();

exports.default = _default;