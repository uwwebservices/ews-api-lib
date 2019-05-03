'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _awsSdk = require('aws-sdk');

var _awsSdk2 = _interopRequireDefault(_awsSdk);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {
  Config: {
    pfx: null,
    passphrase: null,
    ca: null
  },

  async GetPFXFromS3(s3Bucket, s3CertKey, s3PassKey, s3CAKey) {
    const s3 = new _awsSdk2.default.S3();
    let promises = [];

    if (!this.Config.pfx) {
      promises.push(s3.getObject({ Bucket: s3Bucket, Key: s3CertKey }).promise().then(pfxFile => this.Config.pfx = pfxFile.Body));
    }
    if (!this.Config.passphrase) {
      promises.push(s3.getObject({ Bucket: s3Bucket, Key: s3PassKey }).promise().then(passphrase => this.Config.passphrase = passphrase.Body.toString()));
    }
    if (!this.Config.ca) {
      promises.push(s3.getObject({ Bucket: s3Bucket, Key: s3CAKey }).promise().then(caFile => this.Config.ca = caFile.Body));
    }
    await Promise.all(promises);

    return this.Config;
  }
};