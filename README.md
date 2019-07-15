# EWS API Library

Library to extract common API calls to UW Web Services into a library using UW certificate stored in S3.

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

### GWS

`GroupsWebService.Search('groupStem', 'depth', 'extraQueryParams');`  
`GroupsWebService.UpdateMembers('groupName', ['members']);`  
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
