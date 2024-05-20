/*
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

import {
  EndLoginRequest,
  LogoutResponse,
  OAuthAgentRemoteError,
  SessionResponse,
  StartLoginRequest,
  StartLoginResponse
} from "./types";

/**
 * The OAuth Agent Client configuration.
 */
export interface Configuration {
  /**
   * The base URL of the OAuth Agent which issues the SPA’s cookies. This must be in the same parent
   * site as the SPA’s web origin. The URL has the form `<host>/<app-anonymous-endpoint>/<token-handler-app-id>`.
   * If the SPA runs at https://www.example.com then the base URL could be one of the following values:
   * - `https://api.example.com/apps/oauth-agent1`
   * - `https://www.example.com/apps/oauth-agent1`
   */
  readonly oauthAgentBaseUrl: string;
}

/**
 * The main class that communicates with Token Handler's OAuth Agent.
 */
export class OAuthAgentClient {
  private readonly config: Configuration

  public constructor(config: Configuration) {
    this.config = config;
  }

  /**
   * Refreshes the access token. Calls the `/refresh` endpoint.
   *
   * @throws OAuthAgentRemoteError when OAuth Agent responded with an error
   */
  async refresh(): Promise<void> {
    return await this.fetch("POST", "refresh")
  }

  /**
   * Returns the currently logged-in user's session data.
   * Calls the `/session` endpoint. A more generic {@link onPageLoad} can be used instead.
   *
   * @return the session response containing claims about currently logged-in user
   *
   * @throws OAuthAgentRemoteError when OAuth Agent responded with an error
   */
  async session(): Promise<SessionResponse> {
    const sessionResponse = await this.fetch("GET", "session");
    return new SessionResponse(sessionResponse.is_logged_in as boolean, this.toMap(sessionResponse.id_token_claims))
  }

  /**
   * Starts the login. This function is supposed to be called when the user is supposed to log in.
   * Calls the `/login/start` endpoint. The `extraAuthorizationParameters` supplied in the
   * {@link StartLoginRequest} will be sent in the request. Note that any extra authorization
   * parameters have to allowed in the configuration of the token handler application in the Curity server.
   *
   * @param request the start login request possible containing extra parameters
   *
   * @return response containing the authorization URL that the SPA is supposed to redirect the user to.
   *
   * @throws OAuthAgentRemoteError when OAuth Agent responded with an error
   */
  async startLogin(request: StartLoginRequest): Promise<StartLoginResponse> {
    const body = this.toUrlEncodedString(request.extraAuthorizationParameters)
    const startLoginResponse = await this.fetch("POST", "login/start", body)
    return new StartLoginResponse(startLoginResponse.authorization_url as string)
  }

  /**
   * Finishes the login. This function is supposed to be called when the authorization server
   * redirects to the SPA after the user has been authenticated. A more generic {@link onPageLoad} can be called instead.
   *
   * @param request the request object containing the current page's query string (with authorization response parameters)
   *
   * @return the response containing claims about currently logged-in user (same as calling the {@link session} function)
   *
   * @throws OAuthAgentRemoteError when OAuth Agent responded with an error
   */
  async endLogin(request: EndLoginRequest): Promise<SessionResponse> {
    let queryString = request.queryString
    if (queryString != null && queryString.startsWith('?')) {
      queryString = queryString.substring(1)
    }
    const endLoginResponse = await this.fetch("POST", "login/end", queryString)
    const isLoggedIn = endLoginResponse.is_logged_in as boolean
    return new SessionResponse(isLoggedIn, this.toMap(endLoginResponse.id_token_claims))
  }

  /**
   * Logouts the user (removes all token handler cookies). Calls to `/logout` endpoint.
   * If the logout is configured in the token handler application, then a logout URL is returned.
   * The SPA is required to redirect the user to that URL.
   *
   * @return response possibly containing the logout URL
   *
   * @throws OAuthAgentRemoteError when OAuth Agent responded with an error
   */
  async logout(): Promise<LogoutResponse> {
    const logoutResponse = await this.fetch("POST", "logout")
    const logoutUrl = logoutResponse.logout_url as string
    return new LogoutResponse(logoutUrl)
  }

  /**
   * This function is supposed to be called when the SPA page is loaded. It either calls
   * the `/login/end` endpoint or the `/session` endpoint depending on whether the current page
   * query string contains authorization response parameters or not.
   *
   * @param pageUrl current page URL string
   *
   * @returns the response containing claims about currently logged-in user
   *
   * @throws OAuthAgentRemoteError when OAuth Agent responded with an error
   */
  async onPageLoad(pageUrl: string): Promise<SessionResponse> {
    const url = new URL(pageUrl)
    if (this.isOAuthResponse(url)) {
      return await this.endLogin(new EndLoginRequest(url.search))
    } else {
      return await this.session()
    }
  }

  private isOAuthResponse(url: URL): boolean {
    const params = url.searchParams
    const isPlainOAuthResponse = params.has('state') && params.has('code')
    const isJarmOAuthResponse = params.has('response') && Array.from(params).length == 1
    const isErrorOAuthResponse = params.has('error') && params.has('state')

    return isPlainOAuthResponse || isJarmOAuthResponse || isErrorOAuthResponse

  }

  private toUrlEncodedString(data: Map<string, string> | undefined): string {
    if (!data) {
      return ""
    }

    const str: Array<string> = [];
    data.forEach((value, key) => {
      str.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
    })
    return str.join("&");
  }

  private toMap(data: Object | undefined): Map<string, any> | undefined {
    if (!data) {
      return
    }

    return new Map<string, any>(Object.entries(data))
  }

  private async fetch(method: string, path: string, content?: string): Promise<any> {
    const url = this.config.oauthAgentBaseUrl.endsWith('/') ? `${this.config.oauthAgentBaseUrl}${path}` : `${this.config.oauthAgentBaseUrl}/${path}`;

    const headers= {
      accept: 'application/json'
    } as Record<string, string>

    if (path == 'login/start' || path == 'login/end') {
      headers["content-type"] = 'application/x-www-form-urlencoded'
    }

    const init = {
      credentials: "include",
      headers: headers,
      method: method,
      mode: "cors"
    } as RequestInit

    if (content != null) {
      init['body'] = content
    }
    const response = await window.fetch(url, init);
    if (response.ok) {
      return await response.json()
    }

    if (response.headers.get('content-type') == 'application/json') {
      const errorResponse = await response.json()
      throw new OAuthAgentRemoteError(response.status, errorResponse.error_code as string, errorResponse.detailed_error as string)
    } else {
      throw new OAuthAgentRemoteError(response.status, response.statusText)
    }
  }
}