import { assert } from 'chai';
import certificate from '../src/cert.js';
import pws from '../src/personWS.js';
import hrp from '../src/hrpWS.js';
import idcard from '../src/idcardWS.js';
import groups from '../src/groupsWS.js';
import path from 'path';

const s3Bucket = 'aisdev-certs';
const s3PfxFileName = 'cert.pfx';
const s3PassphraseFileName = 'passphrase.key';
const s3UWCAFileName = 'uwca.pem';
const s3IncommonCert = 'incommon.pem';

const fsPfxFilePath = path.resolve('config/cert.pfx');
const fsPassphraseFilePath = path.resolve('config/passphrase.key');
const fsUWCAFilePath = path.resolve('config/uwca.pem');
const fsIncommonFilePath = path.resolve('config/incommon.pem');

const pwsBaseUrl = 'https://wseval.s.uw.edu/identity/v2';
const hrpBaseUrl =  'https://wseval.s.uw.edu/hrp/v2';
const idcardBaseUrl = 'https://wseval.s.uw.edu/idcard/v2';
const groupsBaseUrl = 'https://groups.uw.edu/group_sws/v3';

const testUser = 'pprestin';

let s3cert = null;
let fscert = null;

describe('Certificate Tests', function() {
  describe('Should Get Files from fs', function() {
    it('load certificate from file system', async function() {
      certificate.Config = {
        pfx: null,
        passphrase: null,
        ca: null,
        incommon: null
      };
      fscert = certificate.GetPFXFromFS(fsPfxFilePath, fsPassphraseFilePath, fsUWCAFilePath, fsIncommonFilePath);
      pws.Setup(fscert, pwsBaseUrl);

      let resp = await pws.Get(testUser, true);
      assert.equal(resp.UWNetID, testUser);
    });
  });
  describe('Should Get Files from s3', function() {
    it('load files from s3 and call WS', async function() {
      certificate.Config = {
        pfx: null,
        passphrase: null,
        ca: null,
        incommon: null
      };
      s3cert = await certificate.GetPFXFromS3(s3Bucket, s3PfxFileName, s3PassphraseFileName, s3UWCAFileName, s3IncommonCert);
      pws.Setup(s3cert, pwsBaseUrl);

      let resp = await pws.Get(testUser, true);
      assert.equal(resp.UWNetID, testUser);
    });
  });
});

describe('Webservice Tests', function () {
  before(async function () {
    s3cert = await certificate.GetPFXFromS3(s3Bucket, s3PfxFileName, s3PassphraseFileName, s3UWCAFileName, s3IncommonCert);
    fscert = certificate.GetPFXFromFS(fsPfxFilePath, fsPassphraseFilePath, fsUWCAFilePath, fsIncommonFilePath);
    groups.Setup(s3cert, groupsBaseUrl);
    hrp.Setup(s3cert, hrpBaseUrl);
    idcard.Setup(s3cert, idcardBaseUrl);
    pws.Setup(s3cert, pwsBaseUrl);
  });

  const groupName = 'uw_ais_sm_ews_api-tests';
  describe('GroupsWS Tests', function() {
    it('Search for test group', async function() {
      let resp = await groups.Search(groupName, 'one');
      assert.include(resp, groupName);
    });
    it('Should update group members', async function () {
      let resp = await groups.UpdateMembers(groupName, ['pprestin'], 'netid');
      assert.isTrue(resp);
    });
    it('Should get info about a group', async function() {
      let resp = await groups.Info([groupName]);
      assert.equal(resp[0].id, groupName)
    });
    it('Should get group history', async function () {
      let resp = await groups.GetHistory(groupName);
      assert.isAtLeast(resp.length, 1);
    });
    it('Should delete group', async function () {
      // not testing delete until create is added
    });
    it('Should create a group', async function () {
      // not implemented yet    
    })
  });
  
  describe('HRPWS Tests', async function() {
    it('', function() {});
  });
  
  describe('IDCardWS Tests', async function() {
    it('', function() {});
  });
  
  describe('PWS Tests', async function() {
    it('', function() {});
  });
})

