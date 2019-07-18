export interface Pfx {
    pfx: any;
    passphrase: string | null;
    ca: any;
    incommon: any;
}
declare const _default: {
    Config: Pfx;
    /**
     * Get the certificate from an AWS S3 bucket.
     * @param s3Bucket The bucket name
     * @param s3CertKey The filename for the cert file
     * @param s3PassKey The filename for the passkey file
     * @param s3CAKey The filename for the ca file
     * @param s3Incommon The filename for the incommon file
     * @returns A pfx.
     */
    GetPFXFromS3(s3Bucket: string, s3CertKey: string, s3PassKey: string, s3CAKey: string, s3Incommon: string): Promise<Pfx>;
    /**
     * Get the certificate from a FS location.
     * @param pfxFilePath The filename for the cert files
     * @param passphraseFilePath The filename for the passkey file
     * @param caFilePath The filename for the ca file
     * @param incommonFilePath The filename for the incommon cert file
     * @returns A pfx.
     */
    GetPFXFromFS(pfxFilePath: string, passphraseFilePath: string, caFilePath: string, incommonFilePath: string): Pfx;
};
export default _default;
