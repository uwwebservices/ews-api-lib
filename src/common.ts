import { Pfx } from './cert';
import rp from 'request-promise';

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
  timeout: number;
  ca: string[];
  encoding: string | undefined | null;
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
   * @param method HTTP Method to use (default: 'GET')
   * @param body A body object to send with the request (default: {})
   * @param timeout How long to wait before giving up on the call (default: 4000)
   * @param encoding What encoding to expect (default: undefined)
   * @returns A request/request-promise configuration object
   */
  protected async MakeRequest<T>(url: string, method: string = 'GET', body: any = {}, timeout: number = 5000, encoding: string | undefined | null = undefined): Promise<T> {
    const request = this.CreateRequest(url, method, body, timeout, encoding);
    return rp(request);
  }

  /**
   * Default configuration for an API request
   * @param url The full URL to make ar equest to
   * @param method HTTP Method to use
   * @param body A body object to send with the request
   * @param timeout How long to wait before giving up on the call
   * @param encoding What encoding to expect
   * @returns A request/request-promise configuration object
   */
  protected CreateRequest(url: string, method: string, body: any, timeout: number, encoding: string | undefined | null = undefined) {
    const options: Request = {
      method,
      url,
      body,
      json: true,
      time: true,
      ca: [],
      timeout,
      encoding,
      agentOptions: {
        pfx: this.Config.certificate.pfx,
        passphrase: this.Config.certificate.passphrase !== null ? this.Config.certificate.passphrase : '',
        securityOptions: 'SSL_OP_NO_SSLv3'
      }
    };

    if (this.Config.certificate.ca) {
      options.ca.push(this.Config.certificate.ca);
    }

    if (this.Config.certificate.incommon) {
      options.ca.push(this.Config.certificate.incommon);
    }

    return options;
  }
}
