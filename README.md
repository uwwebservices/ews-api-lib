# EWS API Library

Library to extract common API calls to UW Web Services into a library using UW certificate stored in S3 or locally.

## Usage

`npm install --save uwwebservices/ews-api-lib`

## Import the needed libraries

`import { Certificate, IDCardWebService, PersonWebService, HRPWebService, GroupsWebService } from 'ews-api-lib';`

or

`const Certificate = require('ews-api-lib').default.Certificate;`  
`const PersonWebService = require('ews-api-lib').default.PersonWebService;`  
`const HRPWebService = require('ews-api-lib').default.HRPWebService;`  
`const GroupsWebService = require('ews-api-lib').default.GroupsWebService;`  
`const IDCardWebService = require('ews-api-lib').default.IDCardWebService;`

## Get a Certificate Object

### S3 Bucket Storage

`const certificate = await Certificate.GetPFXFromS3('s3-bucket-name','cert-file.pfx', 'cert-key-file.key', 'uw-ca-file.pem');`

### Local FS Storage

`const certificate = Certificate.GetPFXFromFS('path to pfx', 'path to passphrase', 'path to uwca cert', 'path to incommon cert');`

### Use Certificate Object to setup WS

**PWS**: `PersonWebService.Setup(certificate, 'https://wseval.s.uw.edu/identity/v2');`  
**HRP**: `HRPWebService.Setup(certificate, 'https://wseval.s.uw.edu/hrp/v2');`  
**IDCard**: `IDCardWebService.Setup(certificate, 'https://wseval.s.uw.edu/idcard/v1');`  
**Groups**: `GroupsWebService.Setup(certificate, 'https://groups.uw.edu/group_sws/v3');`

## Make Calls to Web Service

### GWS

`GroupsWebService.Search('groupStem', 'depth', 'extraQueryParams');`  
`GroupsWebService.ReplaceMembers('groupName', ['members']);`  
`GroupsWebService.AddMembers('groupName', ['members']);`  
`GroupsWebService.AddMember('groupName', 'member');`  
`GroupsWebService.Create('groupName', ['admins'], ['readers'], classification, displayName, description, syncFlag, emailFlag');`  
`GroupsWebService.RemoveMembers('groupName', ['members'], syncFlag);`  
`GroupsWebService.RemoveMember('groupName, 'member', syncFlag);`  
`GroupsWebService.GetMembers('groupName', effectiveFlag, forceFlag);`  
`GroupsWebService.Info(['groups']);`  
`GroupsWebService.GetHistory('groupName');`  
`GroupsWebService.Delete('groupName', 'syncFlag')`

### HRPWS

`HRPWebService.Get('idenfitier');`

### IDCard WS

`IDCardWebService.GetRegID('magstripe', 'rfid');`  
`IDCardWebService.GetPhoto('regid');`

### PWS

`PersonWebService.Get('identifier');`  
`PersonWebService.GetMany(['identifiers']);`  
`PersonWebService.Search('query');`

## Updating ews-api-lib

- Code:
  - Make code changes
  - Rev package.json version
  - `npm run build`
  - commit and push
- Github:
  - Create new release
  - Match version to newly revved version above
- Update:
  - `npm update ews-api-lib`
