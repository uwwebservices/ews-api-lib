import aws from 'aws-sdk';
import fs from 'fs';

export interface Pfx {
  pfx: any;
  passphrase: string | null;
  ca: any;
  incommon: any;
}

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
  public async GetPFXFromS3(s3Bucket: string, s3CertKey: string, s3PassKey: string, s3CAKey: string, s3Incommon: string) {
    const s3 = new aws.S3();
    let Config: Pfx = { pfx: null, passphrase: null, ca: null, incommon: null };
    let promises = [
      s3
        .getObject({ Bucket: s3Bucket, Key: s3CertKey })
        .promise()
        .then(pfxFile => (Config.pfx = pfxFile.Body)),
      s3
        .getObject({ Bucket: s3Bucket, Key: s3PassKey })
        .promise()
        .then(passphrase => (Config.passphrase = passphrase.Body != null ? passphrase.Body.toString() : '')),
      s3
        .getObject({ Bucket: s3Bucket, Key: s3CAKey })
        .promise()
        .then(caFile => (Config.ca = caFile.Body)),
      s3
        .getObject({ Bucket: s3Bucket, Key: s3Incommon })
        .promise()
        .then(incommonFile => (Config.incommon = incommonFile.Body))
    ];

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
  public GetPFXFromFS(pfxFilePath: string, passphraseFilePath: string, caFilePath: string, incommonFilePath: string) {
    let Config: Pfx = { pfx: null, passphrase: null, ca: null, incommon: null };

    Config.pfx = fs.readFileSync(pfxFilePath);
    Config.passphrase = fs.readFileSync(passphraseFilePath, { encoding: 'utf8' }).toString();
    Config.ca = fs.readFileSync(caFilePath);
    Config.ca = fs.readFileSync(incommonFilePath);
    return Config as Pfx;
  }
}

export default new Certificate();
