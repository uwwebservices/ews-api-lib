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
const hrpBaseUrl = 'https://wseval.s.uw.edu/hrp/v2';
const idcardBaseUrl = 'https://wseval.s.uw.edu/idcard/v1';
const groupsBaseUrl = 'https://groups.uw.edu/group_sws/v3';

const testGroup = 'uw_ais_sm_ews_ews-api-lib-test-group';

const testNetids = ['ptaladay', 'mattjm'];
const testEffectiveGroup = 'uw_ais_sm_ews';
const testRegid = '899D5562A55911DA84D4E43104487AB3';
const testDns = 'aisdev.cac.washington.edu';

let s3cert = null;
let fscert = null;

describe('Certificate Tests', function() {
  it('Should load certificate from file system and call WS', async function() {
    certificate.Config = {
      pfx: null,
      passphrase: null,
      ca: null,
      incommon: null
    };
    fscert = certificate.GetPFXFromFS(fsPfxFilePath, fsPassphraseFilePath, fsUWCAFilePath, fsIncommonFilePath);
    pws.Setup(fscert, pwsBaseUrl);

    let resp = await pws.Get(testNetids[0], true);
    assert.equal(testNetids[0], resp.UWNetID);
  });
  it('Should load files from S3 and call WS', async function() {
    certificate.Config = {
      pfx: null,
      passphrase: null,
      ca: null,
      incommon: null
    };
    s3cert = await certificate.GetPFXFromS3(s3Bucket, s3PfxFileName, s3PassphraseFileName, s3UWCAFileName, s3IncommonCert);
    pws.Setup(s3cert, pwsBaseUrl);

    let resp = await pws.Get(testNetids[0], true);
    assert.equal(testNetids[0], resp.UWNetID);
  });
});

describe('Webservice Tests', function() {
  before(async function() {
    s3cert = await certificate.GetPFXFromS3(s3Bucket, s3PfxFileName, s3PassphraseFileName, s3UWCAFileName, s3IncommonCert);
    fscert = certificate.GetPFXFromFS(fsPfxFilePath, fsPassphraseFilePath, fsUWCAFilePath, fsIncommonFilePath);
    groups.Setup(s3cert, groupsBaseUrl);
    hrp.Setup(s3cert, hrpBaseUrl);
    idcard.Setup(s3cert, idcardBaseUrl);
    pws.Setup(s3cert, pwsBaseUrl);
  });

  describe('GroupsWS Tests', function() {
    it('Should create a group', async function() {
      let resp = await groups.Create(testGroup, [{ id: testDns, type: 'dns' }, { id: testEffectiveGroup, type: 'group' }]);
      assert.equal(testGroup, resp.id);
    });
    it('Should get info about a group', async function() {
      let resp = await groups.Info([testGroup]);
      assert.equal(testGroup, resp[0].id);
    });
    it('Should search for test group', async function() {
      let resp = await groups.Search(testGroup, 'one');
      assert.include(resp, testGroup);
    });
    it('Should add group members', async function() {
      let addedNetids = await groups.AddMembers(testGroup, testNetids);
      let addedGroup = await groups.AddMember(testGroup, testEffectiveGroup);

      assert.sameMembers(testNetids, addedNetids);
      assert.isTrue(addedGroup);
    });
    it('Should get group members', async function() {
      let members = await groups.GetMembers(testGroup, false, true);
      assert.lengthOf(members, 3);
    });
    it('Should get group effective members', async function() {
      let members = await groups.GetMembers(testGroup, true, true);
      assert.isAtLeast(members.length, 5);
    });
    it('Should replace group members', async function() {
      let resp = await groups.ReplaceMembers(testGroup, [...testNetids, testEffectiveGroup]);
      assert.isTrue(resp);
    });
    it('Should remove group members', async function() {
      const removeOne = [testNetids[0]];
      const removeTwo = [testNetids[1], testEffectiveGroup];
      let resp = await groups.RemoveMember(testGroup, removeOne);
      assert.isTrue(resp);

      resp = await groups.RemoveMembers(testGroup, removeTwo);
      assert.sameMembers(removeTwo, resp);
    });
    it('Should get group history', async function() {
      let resp = await groups.GetHistory(testGroup);
      assert.isAtLeast(resp.length, 1);
    });
    it('Should delete group', async function() {
      let resp = await groups.Delete([testGroup], true);
      assert.equal(resp[0], testGroup);
    });
  });

  describe('HRPWS Tests', function() {
    it('Should get a user from HRPWS', async function() {
      let resp = await hrp.Get(testNetids[0]);
      assert.equal(testNetids[0], resp.NetID);
    });
  });

  describe('IDCardWS Tests', function() {
    it('Should get a photo by regid', async function() {
      let resp = await idcard.GetPhoto(testRegid);
      assert.isNotNull(resp);
    });

    // Magstripe and Rfid values are sensitive and cannot be stored in repo
    // Uncomment and fill in real values to test
    //
    // it('Should translate magstripe to regid', async function() {
    //   const testMagstripe = '123456';
    //   const expectedRegid = '1A2B3C4D';
    //   let resp = await idcard.GetRegID(testMagstripe);
    //   assert.equal(resp, expectedRegid);
    // });
    // it('Should translate rfid to regid', async function() {
    //   const testRfid = '123456';
    //   const expectedRegid = '1A2B3C4D';
    //   let resp = await idcard.GetRegID('', testRfid);
    //   assert.equal(resp, expectedRegid);
    // });
  });

  describe('PWS Tests', function() {
    it('Should get a user', async function() {
      let resp = await pws.Get(testNetids[0]);
      assert.equal(testNetids[0], resp.UWNetID);
    });
    it('Should get many users', async function() {
      let resp = await pws.GetMany(testNetids);
      assert.equal(testNetids.length, resp.length);
    });
    it('Should search users', async function() {
      let resp = await pws.Search(`uwnetid=${testNetids[0]}`);
      assert.equal(testNetids[0], resp.Persons[0].PersonURI.UWNetID);
    });
  });
});
