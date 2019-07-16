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
      ca: null,
      incommon: null
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


    return wsGroups.map(group => group.id);
  },

  async UpdateMembers(group, members, memberType = 'group') {
    let newMembers = {
      data: members.map(id => {
        return {
          type: memberType,
          id
        };
      })
    };

    const request = this.CreateRequest(`${this.Config.baseUrl}/group/${group}/member`, this.Config.certificate, 'PUT', newMembers);
    const start = new Date();
    let response = await (0, _requestPromise2.default)(request);


    return response.errors[0].status === 200;
  },

  async Info(groups) {
    const infoGroups = [];
    await Promise.all(groups.map(group => {
      const start = new Date();
      const request = this.CreateRequest(`${this.Config.baseUrl}/group/${group}`, this.Config.certificate);
      return (0, _requestPromise2.default)(request).then(resp => {
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

  async GetHistory(group) {
    let history = [];
    let start = 0;
    let fetchHistory = true;

    while (fetchHistory) {
      const timerStart = new Date();
      const request = this.CreateRequest(`${this.Config.baseUrl}/group/${group}/history?activity=membership&order=a&start=${start}`, this.Config.certificate);
      try {
        let res = await (0, _requestPromise2.default)(request);

        if (!res || !res.data || res.data.length == 0) {
          fetchHistory = false;
          break;
        }

        history = history.concat(res.data);
        start = res.data.reduce((prev, current) => {
          return prev > current.timestamp ? prev : current.timestamp + 1;
        }, start);
      } catch (ex) {
        return null;
      }
    }

    return history;
  },

  async Delete(groups, synchronized = false) {
    const deletedGroups = [];
    await Promise.all(groups.map(group => {
      const start = new Date();
      const request = this.CreateRequest(`${this.Config.baseUrl}/group/${group}?synchronized=${synchronized}`, this.Config.certificate, 'DELETE');
      return (0, _requestPromise2.default)(request).then(resp => {
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
    let options = {
      method,
      url,
      body,
      json: true,
      time: true,
      ca: [],
      agentOptions: {
        pfx: certificate.pfx,
        passphrase: certificate.passphrase,
        securityOptions: 'SSL_OP_NO_SSLv3'
      }
    };
    if (certificate.ca) {
      options.ca.push(certificate.ca);
    }
    if (certificate.incommon) {
      options.ca.push(certificate.incommon);
    }
    return options;
  }
};