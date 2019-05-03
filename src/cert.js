// @ts-check
import aws from 'aws-sdk';

export default {
  /** @type {Pfx} */
  Config: {
    pfx: null,
    passphrase: null,
    ca: null
  },
  /**
   * Get the certificate from an AWS S3 bucket.
   * @param {string} s3Bucket
   * @param {string} s3CertKey
   * @param {string} s3PassKey
   * @param {string} s3CAKey
   * @returns {Promise<Pfx>} - An object from S3 containing pfx/passphrase .
   */
  async GetPFXFromS3(s3Bucket, s3CertKey, s3PassKey, s3CAKey) {
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
    if (!this.Config.ca) {
      promises.push(
        s3
          .getObject({ Bucket: s3Bucket, Key: s3CAKey })
          .promise()
          .then(caFile => (this.Config.ca = caFile.Body))
      );
    }
    await Promise.all(promises);

    return this.Config;
  }
};

/** @typedef {{ pfx: any, passphrase: string, ca: any }} Pfx */
