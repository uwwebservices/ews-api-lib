'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _requestPromise = require('request-promise');

var _requestPromise2 = _interopRequireDefault(_requestPromise);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {
  Config: {
    certificate: {
      pfx: null,
      passphrase: null,
      ca: null
    },
    baseUrl: ''
  },

  Setup(certificate, baseUrl) {
    this.Config.certificate = certificate;
    this.Config.baseUrl = baseUrl;
  },

  async Search(stemId, depth = 'one', extraQueryParams = '') {
    const request = this.CreateRequest(`${this.Config.baseUrl}/search?stem=${stemId}&scope=${depth}${extraQueryParams}`, this.Config.certificate);

    let start = new Date();
    let wsGroups = (await (0, _requestPromise2.default)(request)).data;
    console.log(`Found ${wsGroups.length} subgroups of ${stemId} in ${(+new Date() - +start).toString()}ms`);

    return wsGroups.map(group => group.id);
  },

  async UpdateMembers(group, members) {
    let newMembers = {
      data: members.map(id => {
        return {
          type: 'group',
          id
        };
      })
    };

    const request = this.CreateRequest(`${this.Config.baseUrl}/group/${group}/member`, this.Config.certificate, 'PUT', newMembers);

    let start = new Date();
    let response = await (0, _requestPromise2.default)(request);
    console.log(`Added ${members.length} users/groups to ${group} in ${(+new Date() - +start).toString()}ms`);

    return response.errors[0].status === 200;
  },

  async Info(groups) {
    const infoGroups = [];
    await Promise.all(groups.map(group => {
      const searchOpts = this.CreateRequest(`${this.Config.baseUrl}/group/${group}`, this.Config.certificate);
      return (0, _requestPromise2.default)(searchOpts).then(resp => {
        const wsGroup = resp.data;

        infoGroups.push({
          id: wsGroup.id,
          created: wsGroup.created
        });
      }).catch(error => {
        console.log(`Info: Error trying to fetch info for ${group}; ${error}`);
      });
    }));

    return infoGroups;
  },

  async Delete(groups) {
    const deletedGroups = [];
    await Promise.all(groups.map(group => {
      const deleteGroupOpts = this.CreateRequest(`${this.Config.baseUrl}/group/${group}`, this.Config.certificate);
      return (0, _requestPromise2.default)(deleteGroupOpts).then(resp => {
        if (Array.isArray(resp.errors) && resp.errors.length > 0 && resp.errors[0].status === 200) {
          deletedGroups.push(group);
        }
      }).catch(error => {
        console.log(`Delete: Error trying to delete ${group}; ${error}`);
      });
    }));

    return deletedGroups;
  },

  CreateRequest(url, certificate, method = 'GET', body = {}) {
    return {
      method,
      url,
      body,
      json: true,
      time: true,
      ca: [certificate.ca],
      agentOptions: {
        pfx: certificate.pfx,
        passphrase: certificate.passphrase,
        securityOptions: 'SSL_OP_NO_SSLv3'
      }
    };
  }
};