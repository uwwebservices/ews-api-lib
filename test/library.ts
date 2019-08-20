import { assert } from 'chai';
import certificate from '../src/cert';
import pws from '../src/personWS';
import hrp from '../src/hrpWS';
import idcard from '../src/idcardWS';
import groups from '../src/groupsWS';
import whocan from '../src/whocanWS';
import path from 'path';

const s3Bucket = 'ews-certs';
const s3PfxFileName = 'aisdev/aisdev.cac.washington.edu.pfx';
const s3PassphraseFileName = 'aisdev/aisdev.cac.washington.edu.key';
//const s3PfxFileName = 'integrations/integrations.event.uw.edu.pfx';
//const s3PassphraseFileName = 'integrations/integrations.event.uw.edu.key';
const s3UWCAFileName = 'common/uwca.pem';
const s3IncommonCert = 'common/incommon.pem';

const fsPfxFilePath = path.resolve('config/cert.pfx');
const fsPassphraseFilePath = path.resolve('config/passphrase.key');
const fsUWCAFilePath = path.resolve('config/uwca.pem');
const fsIncommonFilePath = path.resolve('config/incommon.pem');

const pwsBaseUrl = 'https://wseval.s.uw.edu/identity/v2';
const hrpBaseUrl = 'https://wseval.s.uw.edu/hrp/v2';
const idcardBaseUrl = 'https://wseval.s.uw.edu/idcard/v1';
const groupsBaseUrl = 'https://eval.groups.uw.edu/group_sws/v3';
const whocanwsBaseUrl = 'https://wseval.s.uw.edu/whocan/v1';

const testGroup = 'uw_ais_sm_ews_ews-api-lib-test-group';

const testNetids = ['ptaladay', 'mattjm'];
const testEffectiveGroup = 'uw_ais_sm_ews';
const testRegid = '899D5562A55911DA84D4E43104487AB3';
const testDns = 'aisdev.cac.washington.edu';

const testApplication = 'edw';
const testRole = 'analyst';

describe('Certificate Tests', function() {
  it('Should load certificate from file system and call WS', async function() {
    certificate.Reset();
    let resp = null;
    try {
      const fscert = certificate.GetPFXFromFS(fsPfxFilePath, fsPassphraseFilePath, fsUWCAFilePath, fsIncommonFilePath);
      pws.Setup(fscert, pwsBaseUrl);
      resp = await pws.Get(testNetids[0], true);
      assert.equal(testNetids[0], resp.UWNetID);
    } catch (ex) {
      assert.isNotNull(resp, 'Failed to load certificates from FS (did you copy certs to /config?)');
    }
  });
  it('Should load files from S3 and call WS', async function() {
    certificate.Reset();
    const s3cert = await certificate.GetPFXFromS3(s3Bucket, s3PfxFileName, s3PassphraseFileName, s3UWCAFileName, s3IncommonCert);
    pws.Setup(s3cert, pwsBaseUrl);

    const resp = await pws.Get(testNetids[0], true);
    assert.equal(testNetids[0], resp.UWNetID);
  });
});

describe('Webservice Tests', function() {
  before(async function() {
    const s3cert = await certificate.GetPFXFromS3(s3Bucket, s3PfxFileName, s3PassphraseFileName, s3UWCAFileName, s3IncommonCert);
    groups.Setup(s3cert, groupsBaseUrl);
    hrp.Setup(s3cert, hrpBaseUrl);
    idcard.Setup(s3cert, idcardBaseUrl);
    pws.Setup(s3cert, pwsBaseUrl);
    whocan.Setup(s3cert, whocanwsBaseUrl);
  });

  describe('GroupsWS Tests', function() {
    it('Should create a group', async function() {
      const resp = await groups.Create(testGroup, [{ id: testDns, type: 'dns' }, { id: testEffectiveGroup, type: 'group' }]);
      assert.equal(testGroup, resp.id);
    });
    it('Should get info about a group', async function() {
      const resp = await groups.Info([testGroup]);
      assert.equal(testGroup, resp[0].id);
    });
    it('Should get filtered info about a group', async function() {
      const filteredKeys = ['displayName', 'description', 'classification'];
      const groupInfo = (await groups.Info([testGroup], filteredKeys))[0];
      assert.hasAllKeys(groupInfo, [...filteredKeys, 'created', 'id']);
    });
    it('Should search for test group', async function() {
      const resp = await groups.Search(testGroup, 'one');
      assert.include(resp, testGroup);
    });
    it('Should add group members', async function() {
      const addedNetids = await groups.AddMembers(testGroup, testNetids);
      const addedGroup = await groups.AddMember(testGroup, testEffectiveGroup);

      assert.isTrue(addedNetids);
      assert.isTrue(addedGroup);
    });
    it('Should get group members', async function() {
      const members = await groups.GetMembers(testGroup, false, true);
      assert.lengthOf(members, 3);
    });
    it('Should get group effective members', async function() {
      const members = await groups.GetMembers(testGroup, true, true);
      assert.isAtLeast(members.length, 5);
    });
    it('Should replace group members', async function() {
      const resp1 = await groups.ReplaceMembers(testGroup, [...testNetids, testEffectiveGroup]);
      assert.isTrue(resp1);

      let formattedMembers = testNetids.map(id => ({ type: 'netid', id }));
      formattedMembers.push({ type: 'dns', id: testEffectiveGroup });
      const resp2 = await groups.ReplaceMembersFormatted(testGroup, formattedMembers);
      assert.isTrue(resp2);
    });
    it('Should remove group members', async function() {
      const removeOne = testNetids[0];
      const removeTwo = [testNetids[1], testEffectiveGroup];
      const resp1 = await groups.RemoveMember(testGroup, removeOne);
      assert.isTrue(resp1);

      const resp2 = await groups.RemoveMembers(testGroup, removeTwo);
      assert.isTrue(resp2);
    });
    it('Should get group history', async function() {
      const resp = await groups.GetHistory(testGroup);
      assert.isAtLeast(resp.length, 1);
    });
    it('Should delete group', async function() {
      const resp = await groups.Delete([testGroup], true);
      assert.equal(resp[0], testGroup);
    });
  });

  describe('HRPWS Tests', function() {
    it('Should get a user from HRPWS', async function() {
      const resp = await hrp.Get(testNetids[0]);
      assert.equal(testNetids[0], resp.NetID);
    });
  });

  describe('PWS Tests', function() {
    it('Should get a user', async function() {
      const resp = await pws.Get(testNetids[0]);
      assert.equal(testNetids[0], resp.UWNetID);
    });
    it('Should get many users', async function() {
      const resp = await pws.GetMany(testNetids);
      assert.equal(testNetids.length, resp.length);
    });
    it('Should search users', async function() {
      const resp = await pws.Search(`uwnetid=${testNetids[0]}`);
      assert.equal(testNetids[0], resp.Persons[0].PersonURI.UWNetID);
    });
  });

  describe('IDCardWS Tests', function() {
    it('Should get a photo by regid', async function() {
      const resp = await idcard.GetPhoto(testRegid);
      assert.isNotNull(resp);
    });

    // Magstripe and Rfid values are sensitive and cannot be stored in repo
    // Uncomment and fill in real values to test
    //
    // it('Should translate magstripe to regid', async function() {
    //   const testMagstripe = '123456';
    //   const expectedRegid = '1A2B3C4D';
    //   const resp = await idcard.GetRegID(testMagstripe);
    //   assert.equal(resp, expectedRegid);
    // });
    // it('Should translate rfid to regid', async function() {
    //   const testRfid = '123456';
    //   const expectedRegid = '1A2B3C4D';
    //   const resp = await idcard.GetRegID('', testRfid);
    //   assert.equal(resp, expectedRegid);
    // });
  });

  describe('WhoCanWS Tests', function() {
    it('Should get a list of applications', async function() {
      const resp = await whocan.Applications();
      assert.isAtLeast(resp.Applications.length, 1);
    });
    it('Should get a list of application roles', async function() {
      const resp = await whocan.Roles(testApplication);
      assert.equal(resp.Application, testApplication);
      assert.isAtLeast(resp.Roles.length, 1);
    });
    it('Should get authorizations for a user', async function() {
      const resp = await whocan.Get(testNetids[0], testApplication, testRole);
      assert.equal(resp.Application, testApplication);
      assert.equal(resp.Role, testRole);
      assert.equal(resp.UWNetID, testNetids[0]);
      assert.isArray(resp.Authorizers);
      assert.isArray(resp.Relationships);
    });
    it('Should not get authorizations for an invalid user', async function() {
      const invalid = 'totesNotARealUWNetID';
      const resp = await whocan.Get(invalid, testApplication, testRole);
      assert.isNull(resp);
    });
  });
});
