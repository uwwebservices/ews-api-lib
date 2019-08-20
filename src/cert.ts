import aws from 'aws-sdk';
import fs from 'fs';

export interface Pfx {
  pfx: any;
  passphrase: string | null;
  ca: any;
  incommon: any;
}

class Certificate {
  protected Config: Pfx;

  constructor() {
    this.Config = {
      pfx: null,
      passphrase: null,
      ca: null,
      incommon: null
    };
  }

  /**
   * Get the certificate from an AWS S3 bucket.
   * @param s3Bucket The bucket name
   * @param s3CertKey The filename for the cert file
   * @param s3PassKey The filename for the passkey file
   * @param s3CAKey The filename for the ca file
   * @param s3Incommon The filename for the incommon file
   * @returns A pfx.
   */
  public async GetPFXFromS3(s3Bucket: string, s3CertKey: string, s3PassKey: string, s3CAKey: string, s3Incommon: string) {
    const s3 = new aws.S3();
    let promises = [];

    promises.push(
      s3
        .getObject({ Bucket: s3Bucket, Key: s3CertKey })
        .promise()
        .then(pfxFile => (this.Config.pfx = pfxFile.Body))
    );
    promises.push(
      s3
        .getObject({ Bucket: s3Bucket, Key: s3PassKey })
        .promise()
        .then(passphrase => (this.Config.passphrase = passphrase.Body != null ? passphrase.Body.toString() : ''))
    );
    promises.push(
      s3
        .getObject({ Bucket: s3Bucket, Key: s3CAKey })
        .promise()
        .then(caFile => (this.Config.ca = caFile.Body))
    );
    promises.push(
      s3
        .getObject({ Bucket: s3Bucket, Key: s3Incommon })
        .promise()
        .then(caFile => (this.Config.incommon = caFile.Body))
    );

    await Promise.all(promises);

    return this.Config as Pfx;
  }

  /**
   * Get the certificate from a FS location.
   * @param pfxFilePath The filename for the cert files
   * @param passphraseFilePath The filename for the passkey file
   * @param caFilePath The filename for the ca file
   * @param incommonFilePath The filename for the incommon cert file
   * @returns A pfx.
   */
  public GetPFXFromFS(pfxFilePath: string, passphraseFilePath: string, caFilePath: string, incommonFilePath: string) {
    this.Config.pfx = fs.readFileSync(pfxFilePath);
    this.Config.passphrase = fs.readFileSync(passphraseFilePath, { encoding: 'utf8' }).toString();
    this.Config.ca = fs.readFileSync(caFilePath);
    this.Config.ca = fs.readFileSync(incommonFilePath);
    return this.Config as Pfx;
  }

  /**
   * Reset the setup for the certificate (for tests)
   */
  public Reset() {
    this.Config = {
      pfx: null,
      passphrase: null,
      ca: null,
      incommon: null
    };
  }
}

export default new Certificate();
