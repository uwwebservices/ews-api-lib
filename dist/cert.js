"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _awsSdk = _interopRequireDefault(require("aws-sdk"));

var _fs = _interopRequireDefault(require("fs"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _default = {
  Config: {
    pfx: null,
    passphrase: null,
    ca: null,
    incommon: null
  },

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
    let promises = []; // Check if we've already loaded data from S3

    if (!this.Config.pfx) {
      promises.push(s3.getObject({
        Bucket: s3Bucket,
        Key: s3CertKey
      }).promise().then(pfxFile => this.Config.pfx = pfxFile.Body));
    }

    if (!this.Config.passphrase) {
      promises.push(s3.getObject({
        Bucket: s3Bucket,
        Key: s3PassKey
      }).promise().then(passphrase => this.Config.passphrase = passphrase.Body != null ? passphrase.Body.toString() : ''));
    }

    if (s3CAKey && !this.Config.ca) {
      promises.push(s3.getObject({
        Bucket: s3Bucket,
        Key: s3CAKey
      }).promise().then(caFile => this.Config.ca = caFile.Body));
    }

    if (s3Incommon && !this.Config.ca) {
      promises.push(s3.getObject({
        Bucket: s3Bucket,
        Key: s3Incommon
      }).promise().then(caFile => this.Config.incommon = caFile.Body));
    }

    await Promise.all(promises);
    return this.Config;
  },

  /**
   * Get the certificate from a FS location.
   * @param pfxFilePath The filename for the cert files
   * @param passphraseFilePath The filename for the passkey file
   * @param caFilePath The filename for the ca file
   * @param incommonFilePath The filename for the incommon cert file
   * @returns A pfx.
   */
  GetPFXFromFS(pfxFilePath, passphraseFilePath, caFilePath, incommonFilePath) {
    if (!this.Config.pfx) {
      this.Config.pfx = _fs.default.readFileSync(pfxFilePath);
    }

    if (!this.Config.passphrase) {
      this.Config.passphrase = _fs.default.readFileSync(passphraseFilePath, {
        encoding: 'utf8'
      }).toString();
    }

    if (caFilePath && !this.Config.ca) {
      this.Config.ca = _fs.default.readFileSync(caFilePath);
    }

    if (incommonFilePath && !this.Config.incommon) {
      this.Config.ca = _fs.default.readFileSync(incommonFilePath);
    }

    return this.Config;
  }

};
exports.default = _default;