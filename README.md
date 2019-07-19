# EWS API Library

Library to extract common API calls to UW Web Services into a library using UW certificate stored in S3 or locally.

## Usage

`npm install --save uwwebservices/ews-api-lib`

For type checking and method information, make sure to add `// @ts-check` to the top of your javascript files.

## Import the needed libraries

`import { Certificate, IDCardWebService, PersonWebService, HRPWebService, GroupsWebService } from 'ews-api-lib';`

or

`const Certificate = require('ews-api-lib').default.Certificate;`  
`const PersonWebService = require('ews-api-lib').default.PersonWebService;`  
`const HRPWebService = require('ews-api-lib').default.HRPWebService;`  
`const GroupsWebService = require('ews-api-lib').default.GroupsWebService;`  
`const IDCardWebService = require('ews-api-lib').default.IDCardWebService;`

## Get a Certificate Object

There are a variety of ways to obtain a certificate; please see the [certificate method definitions](./dist/cert.d.ts) for options (e.g. AWS S3, FileSystem, etc)

## Make Calls to Web Service

Be sure to call the Setup method on the web service object prior to the first resource call; please see [setup method description](./dist/common.d.ts).

Methods available to you can be found in the definition files:

- [GroupsWS method definitions](./dist/groupsWS.d.ts)
- [HRPWS method definitions](./dist/hrpWS.d.ts)
- [IDCardWS method definitions](./dist/idcardWS.d.ts)
- [PersonWS method definitions](./dist/personWS.d.ts)
- [WhoCanWS method definitions](./dist/whocanWS.d.ts)

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
