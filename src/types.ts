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

/**
 * Passed to {@link OAuthAgentClient#startLogin} function. The SPA can pass extra authorization parameters
 * (such as `login_hint` or `ui_locales`). These parameters will be used in the authorization request.
 * Each parameter has to be explicitly allowed in the configuration of the token handler application
 * in the Curity server.
 *
 */
export class StartLoginRequest {
  constructor(readonly extraAuthorizationParameters?: Map<string, string>) {
  }
}

/**
 * Returned from {@link OAuthAgentClient#startLogin} function. Contains the `authorizationUrl`.
 */
export class StartLoginResponse {
  constructor(readonly authorizationUrl: string) {
  }
}

/**
 * Passed to {@link OAuthAgentClient#endLogin} function. The SPA is supposed to pass
 * the query string of the current page into this request.
 */
export class EndLoginRequest {
  constructor(readonly queryString: string) {
  }
}

/**
 * Returned from {@link OAuthAgentClient#session}, {@link OAuthAgentClient#endLogin} and
 * {@link OAuthAgentClient#onPageLoad} functions. Contains:
 * - `isLoggedIn` - a boolean flag indicationg whether a user is logged in
 * - `idTokenClaims` - a map of claims from ID token. This will be `null` if the user is
 *                     logged out; or the user is logged in but no ID token was issued.
 */
export class SessionResponse {
  constructor(readonly isLoggedIn: boolean, readonly idTokenClaims?: Map<string, any>) {
  }
}

/**
 * Returned from {@link OAuthAgentClient#logout} function. Contains the `logoutUrl` (if logout is enabled in
 * the configuration of the token handler application in the Curity server).
 */
export class LogoutResponse {
  constructor(readonly logoutUrl?: string) {
  }
}

/**
 * This error is thrown from all the {@link OAuthAgentClient} functions in case a call to the
 * token handler application failed.
 */
export class OAuthAgentRemoteError extends Error {
  /**
   *
   * @param status the HTTP status from the server
   * @param code the error code
   * @param details the detailed error message (available only when exposing detailed
   *                error messages is enabled in the Curity server)
   */
  constructor(readonly status: number, readonly code: string, readonly details?: string) {
    super(`${status}: ${code}`)
  }
}