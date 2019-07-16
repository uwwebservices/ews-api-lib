'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _awsSdk = require('aws-sdk');

var _awsSdk2 = _interopRequireDefault(_awsSdk);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {
  Config: {
    pfx: null,
    passphrase: null,
    ca: null,
    incommon: null
  },

  async GetPFXFromS3(s3Bucket, s3CertKey, s3PassKey, s3CAKey, s3Incommon) {
    const s3 = new _awsSdk2.default.S3();
    let promises = [];

    if (!this.Config.pfx) {
      promises.push(s3.getObject({ Bucket: s3Bucket, Key: s3CertKey }).promise().then(pfxFile => this.Config.pfx = pfxFile.Body));
    }
    if (!this.Config.passphrase) {
      promises.push(s3.getObject({ Bucket: s3Bucket, Key: s3PassKey }).promise().then(passphrase => this.Config.passphrase = passphrase.Body.toString()));
    }
    if (s3CAKey && !this.Config.ca) {
      promises.push(s3.getObject({ Bucket: s3Bucket, Key: s3CAKey }).promise().then(caFile => this.Config.ca = caFile.Body));
    }
    if (s3Incommon && !this.Config.ca) {
      promises.push(s3.getObject({ Bucket: s3Bucket, Key: s3Incommon }).promise().then(caFile => this.Config.incommon = caFile.Body));
    }
    await Promise.all(promises);

    return this.Config;
  },
  GetPFXFromFS(pfxFilePath, passphraseFilePath, caFilePath, incommonFilePath) {
    if (!this.Config.pfx) {
      this.Config.pfx = _fs2.default.readFileSync(pfxFilePath);
    }
    if (!this.Config.passphrase) {
      this.Config.passphrase = _fs2.default.readFileSync(passphraseFilePath, { encoding: 'utf8' }).toString();
    }
    if (caFilePath && !this.Config.ca) {
      this.Config.ca = _fs2.default.readFileSync(caFilePath);
    }
    if (incommonFilePath && !this.Config.incommon) {
      this.Config.ca = _fs2.default.readFileSync(incommonFilePath);
    }
    return this.Config;
  }
};