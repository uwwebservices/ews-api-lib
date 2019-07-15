// @ts-check
import aws from 'aws-sdk';
import fs from 'fs';

export default {
  /** @type {Pfx} */
  Config: {
    pfx: null,
    passphrase: null,
    ca: null,
    incommon: null
  },
  /**
   * Get the certificate from an AWS S3 bucket.
   * @param {string} s3Bucket
   * @param {string} s3CertKey
   * @param {string} s3PassKey
   * @param {string} s3CAKey
   * @returns {Promise<Pfx>} - An object from S3 containing pfx/passphrase .
   */
  async GetPFXFromS3(s3Bucket, s3CertKey, s3PassKey, s3CAKey, s3Incommon) {
    const s3 = new aws.S3();
    let promises = [];

    // Check if we've already loaded data from S3
    if (!this.Config.pfx) {
      promises.push(
        s3
          .getObject({ Bucket: s3Bucket, Key: s3CertKey })
          .promise()
          .then(pfxFile => (this.Config.pfx = pfxFile.Body))
      );
    }
    if (!this.Config.passphrase) {
      promises.push(
        s3
          .getObject({ Bucket: s3Bucket, Key: s3PassKey })
          .promise()
          .then(passphrase => (this.Config.passphrase = passphrase.Body.toString()))
      );
    }
    if (s3CAKey && !this.Config.ca) {
      promises.push(
        s3
          .getObject({ Bucket: s3Bucket, Key: s3CAKey })
          .promise()
          .then(caFile => (this.Config.ca = caFile.Body))
      );
    }
    if (s3Incommon && !this.Config.ca) {
      promises.push(
        s3
          .getObject({ Bucket: s3Bucket, Key: s3Incommon })
          .promise()
          .then(caFile => (this.Config.incommon = caFile.Body))
      );
    }
    await Promise.all(promises);

    return this.Config;
  },
  GetPFXFromFS(pfxFilePath, passphraseFilePath, caFilePath, incommonFilePath) {
    if (!this.Config.pfx) {
      this.Config.pfx = fs.readFileSync(pfxFilePath);
    }
    if (!this.Config.passphrase) {
      this.Config.passphrase = fs.readFileSync(passphraseFilePath, { encoding: 'utf8' }).toString();
    }
    if (caFilePath && !this.Config.ca) {
      this.Config.ca = fs.readFileSync(caFilePath);
    }
    if (incommonFilePath && !this.Config.incommon) {
      this.Config.ca = fs.readFileSync(incommonFilePath);
    }
    return this.Config;
  }
};

/** @typedef {{ pfx: any, passphrase: string, ca: any, incommon: any }} Pfx */
