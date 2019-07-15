import assert from 'assert';
import certificate from '../src/cert.js';
import pws from '../src/personWS.js';
import path from 'path';

const s3Bucket = 'aisdev-certs';
const s3PfxFileName = 'cert.pfx';
const s3PassphraseFileName = 'cert.key';
const s3UWCAFileName = 'ca.pem';
const s3IncommonCert = 'incommon.pem';

const fsPfxFilePath = path.resolve('config/cert.pfx');
const fsPassphraseFilePath = path.resolve('config/passphrase.key');
const fsUWCAFilePath = path.resolve('config/uwca.pem');
const fsIncommonFilePath = path.resolve('config/incommon.pem');

const pwsBaseUrl = 'https://wseval.s.uw.edu/identity/v2';

describe('Certificate Tests', function() {
  describe('Should Get Files from fs', function() {
    let cert = null;
    it('load certificate from file system', function() {
      cert = certificate.GetPFXFromFS(fsPfxFilePath, fsPassphraseFilePath, fsUWCAFilePath, fsIncommonFilePath);
    });
    it('should call pws with certificate from fs', async function() {
      pws.Setup(cert, pwsBaseUrl, true);
      let resp = await pws.Get('ccan', true);
      assert.equal(resp.statusCode, 200);
    });
  });
  describe('Should Get Files from s3', function() {
    let cert = null;
    it('load files from s3', async function() {
      cert = await certificate.GetPFXFromS3(s3Bucket, s3PfxFileName, s3PassphraseFileName, s3UWCAFileName, s3IncommonCert);
    });
    it('should call pws with certificate from s3', async function() {
      pws.Setup(cert, pwsBaseUrl, true);
      let resp = await pws.Get('ccan', true);
      assert.equal(resp.statusCode, 200);
    });
  });
});

describe('GroupsWS Tests', function() {
  let cert = cert = await certificate.GetPFXFromS3(s3Bucket, s3PfxFileName, s3PassphraseFileName, s3UWCAFileName, s3IncommonCert);
  describe('', function() {});
});

describe('HRPWS Tests', function() {
  let cert = cert = await certificate.GetPFXFromS3(s3Bucket, s3PfxFileName, s3PassphraseFileName, s3UWCAFileName, s3IncommonCert);
  describe('', function() {});
});

describe('IDCardWS Tests', function() {
  let cert = cert = await certificate.GetPFXFromS3(s3Bucket, s3PfxFileName, s3PassphraseFileName, s3UWCAFileName, s3IncommonCert);
  describe('', function() {});
});

describe('PWS Tests', function() {
  let cert = cert = await certificate.GetPFXFromS3(s3Bucket, s3PfxFileName, s3PassphraseFileName, s3UWCAFileName, s3IncommonCert);
  describe('', function() {});
});
