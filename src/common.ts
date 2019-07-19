import { Pfx } from './cert';

interface WebServiceConfig {
  certificate: Pfx;
  baseUrl: string;
}

interface Request {
  method: string;
  url: string;
  body: any;
  json: boolean;
  time: boolean;
  ca: string[];
  agentOptions: { pfx: string; passphrase: string; securityOptions: string };
}

export class BaseWebService {
  protected Config: WebServiceConfig;

  constructor() {
    this.Config = {
      certificate: {
        pfx: null,
        passphrase: null,
        ca: null,
        incommon: null
      },
      baseUrl: ''
    };
  }

  /**
   * Initial setup for the web service
   * @param certificate
   * @param baseUrl
   */
  public Setup(certificate: Pfx, baseUrl: string) {
    this.Config.certificate = certificate;
    this.Config.baseUrl = baseUrl;
  }

  /**
   * Reset the setup for the web service
   */
  public Reset() {
    this.Config = {
      certificate: {
        pfx: null,
        passphrase: null,
        ca: null,
        incommon: null
      },
      baseUrl: ''
    };
  }

  /**
   * Default configuration for an API request
   * @param url The full URL to make ar equest to
   * @param certificate Certificate informationg for the request
   * @param method HTTP Method to use (default: 'GET')
   * @param body A body object to send with the request (default: {})
   * @returns A request/request-promise configuration object
   */
  protected CreateRequest(url: string, certificate: Pfx, method: string = 'GET', body: any = {}, timeout: number = 5000) {
    let options = {
      method,
      url,
      body,
      json: true,
      time: true,
      ca: [],
      timeout,
      agentOptions: {
        pfx: certificate.pfx,
        passphrase: certificate.passphrase,
        securityOptions: 'SSL_OP_NO_SSLv3'
      }
    } as Request;
    if (certificate.ca) {
      options.ca.push(certificate.ca);
    }
    if (certificate.incommon) {
      options.ca.push(certificate.incommon);
    }
    return options;
  }
}
