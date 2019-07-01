# EWS API Library

Library to extract common API calls to EWS Web Services into a library

## Usage

`npm install --save uwwebservices/ews-api-lib`

## Import the needed libraries

`import { Certificate, IDCardWebService, PersonWebService, HRPWebService, GroupsWebService } from 'ews-api-lib';`

or

`const Certificate = require('ews-api-lib').Certificate;`  
`const PersonWebService = require('ews-api-lib').PersonWebService;`  
`const HRPWebService = require('ews-api-lib').HRPWebService;`  
`const GroupsWebService = require('ews-api-lib').GroupsWebService;`  
`const IDCardWebService = require('ews-api-lib').IDCardWebService;`

### Get a Certificate Object

`const certificate = await Certificate.GetPFXFromS3('s3-bucket-name','cert-file.pfx', 'cert-key-file.key', 'uw-ca-file.pem');`

### Use Certificate Object to setup WS

PWS: `PersonWebService.Setup(certificate, 'https://wseval.s.uw.edu/identity/v2');`  
HRP: `HRPWebService.Setup(certificate, 'https://wseval.s.uw.edu/hrp/v2');`  
IDCard: `IDCardWebService.Setup(certificate, 'https://wseval.s.uw.edu/idcard/v2');`  
Groups: `GroupsWebService.Setup(certificate, 'https://groups.uw.edu/group_sws/v3/');`

## Make Calls to Web Service

`PersonWebService.Get('identifier');`  
`PersonWebService.GetMany(['identifiers']);`
`PersonWebService.Search('query');`

`GroupsWebService.Search('groupStem', 'depth', 'extraQueryParams');`  
`GroupsWebService.UpdateMembers('groupName', ['members']);`  
`GroupsWebService.Info(['groups']);`  
`GroupsWebService.GetHistory('groupName');`  
`GroupsWebService.Delete('groupName', 'syncFlag')`

`HRPWebService.Get('idenfitier');`

`IDCardWebService.GetRegID('magstripe', 'rfid');`  
`IDCardWebService.GetPhoto('regid');`

## Updating ews-api-lib

- Code:
  - Make code changes
  - Rev package.json version
  - `npm run build`
  - commit and push
- Github:
  - Create new release
  - Match version to newly revved version above
- Install:
  - `npm update ews-api-lib`

## Provided Functionality

- Certificates - A utility to load certificates; current functionality limited to getting certificates from S3.
- Groups Web Service - search groups, get group info, update members, get group history, delete group
- Person Web Service - get one or many users by netid/eid/regid, search by query string
- HRP Web Service - get one user by netid/eid/regid
- IDCard Web Service - get regid from magstripe/rfid, get photo by regid
