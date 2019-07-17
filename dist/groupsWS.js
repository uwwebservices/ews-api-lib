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
    try {
      let wsGroups = (await (0, _requestPromise2.default)(request)).data;
      return wsGroups.map(group => group.id);
    } catch (error) {
      console.log(`GroupSearch: Error trying to search ${stemId}; ${error}`);
      return [];
    }
  },

  async ReplaceMembers(group, members, memberType = 'group') {
    return this.ReplaceMembersFormatted(group, members.map(id => ({ type: memberType, id })));
  },

  async ReplaceMembersFormatted(group, formattedMembers) {
    const request = this.CreateRequest(`${this.Config.baseUrl}/group/${group}/member`, this.Config.certificate, 'PUT', { data: formattedMembers });
    try {
      let resp = await (0, _requestPromise2.default)(request);
      return resp.errors[0].status === 200;
    } catch (error) {
      console.log(`ReplaceMembers: Error trying to add members to ${group}; ${error}`);
      return false;
    }
  },

  async AddMembers(group, members) {
    return await this.AddMember(group, members.join(','));
  },

  async AddMember(group, member) {
    const request = this.CreateRequest(`${this.Config.baseUrl}/group/${group}/member/${member}`, this.Config.certificate, 'PUT');
    try {
      const resp = await (0, _requestPromise2.default)(request);
      return resp.errors[0].status === 200;
    } catch (error) {
      console.log(`AddMember: Error trying to add ${member} to ${group}; ${error}`);
      return false;
    }
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
        return [];
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
    await Promise.all(groups.map(async group => {
      const request = this.CreateRequest(`${this.Config.baseUrl}/group/${group}?synchronized=${synchronized}`, this.Config.certificate, 'DELETE');
      try {
        const resp = await (0, _requestPromise2.default)(request);
        if (Array.isArray(resp.errors) && resp.errors.length > 0 && resp.errors[0].status === 200) {
          deletedGroups.push(group);
        }
      } catch (error) {
        console.log(`Delete: Error trying to delete ${group}; ${error}`);
        return [];
      }
    }));

    return deletedGroups;
  },

  async Create(group, admins, readers = [], classification = 'u', displayName = '', description = '', synchronized = true, email = false) {
    if (!group || !admins) {
      return false;
    }
    const body = {
      data: {
        id: group,
        displayName,
        description,
        admins,
        readers,
        classification
      }
    };
    const request = this.CreateRequest(`${this.Config.baseUrl}/group/${group}?synchronized=${synchronized}`, this.Config.certificate, 'PUT', body);

    try {
      let res = await (0, _requestPromise2.default)(request);
      if (email) {
        await (0, _requestPromise2.default)(this.CreateRequest(`${this.Config.baseUrl}/group/${group}/affiliate/google?status=active&sender=member`, this.Config.certificate, 'PUT'));
      }
      return res.data;
    } catch (error) {
      console.log(`Create: Error trying to create ${group}; ${error}`);
      return false;
    }
  },

  async RemoveMembers(group, members, synchronized = true) {
    return await this.RemoveMember(group, members.join(','), synchronized);
  },

  async RemoveMember(group, member, synchronized = true) {
    const request = this.CreateRequest(`${this.Config.baseUrl}/group/${group}/member/${member}?synchronized=${synchronized.toString()}`, this.Config.certificate, 'DELETE');
    try {
      const resp = await (0, _requestPromise2.default)(request);
      return resp.errors[0].status === 200;
    } catch (error) {
      console.log(`RemoveMembers: Error trying to remove ${member} from ${group}; ${error}`);
      return false;
    }
  },

  async GetMembers(group, effective = false, force = false) {
    const endpoint = effective ? 'effective_member' : 'member';
    const request = this.CreateRequest(`${this.Config.baseUrl}/group/${group}/${endpoint}${force ? '?source=registry' : ''}`, this.Config.certificate);
    try {
      const res = await (0, _requestPromise2.default)(request);
      return res.data;
    } catch (error) {
      console.log(`Get Members: Error getting members for group ${group}; ${error}`);
      return [];
    }
  },

  CreateRequest(url, certificate, method = 'GET', body = {}) {
    let options = {
      method,
      url,
      body,
      json: true,
      time: true,
      ca: [],
      timeout: 60000,
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