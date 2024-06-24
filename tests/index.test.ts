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

import fetchMock from "jest-fetch-mock"
import {Configuration, OAuthAgentClient} from '../src';

const serverUrl = 'https://example.com'
const authzUrl = serverUrl + '/authz'
const client = new OAuthAgentClient({oauthAgentBaseUrl: serverUrl} as Configuration)

beforeEach(() => {
  fetchMock.enableMocks()
  fetchMock.mockIf(/^https?:\/\/example.com.*$/, async req => {
    if (req.url.endsWith("/login/start")) {
      const body = JSON.stringify({
        authorization_url: authzUrl + '?' + await req.text() // pass extra authz params back
      })
      return Promise.resolve(body)
    } else if (req.url.endsWith("/login/end")) {
      const body = JSON.stringify({
        is_logged_in: true,
        id_token_claims: {
          sub: 'login-end' // we are using 'sub' claims to distinguish between call to /login/end and /session (otherwise they return the same JSON structure)
        },
        access_token_expires_in: 300
      })
      return Promise.resolve(body)
    } else if (req.url.endsWith("/session")) {
      const body = JSON.stringify({
        is_logged_in: true,
        id_token_claims: {
          sub: 'session'
        },
        access_token_expires_in: 300
      })
      return Promise.resolve(body)
    }
    return Promise.resolve("{}")
  })
})

describe('test onPageLoad() function', () => {
  const redirectUri = "https://www.product.com"

  test('when url contains state and code, /login/end should be called', async () => {
    const queryString = '?state=foo&code=bar'
    const response = await client.onPageLoad(redirectUri + queryString);
    expect(response.idTokenClaims?.sub).toBe('login-end');
    expect(response.isLoggedIn).toBe(true);
    expect(response.accessTokenExpiresIn).toBe(300);
  });

  test('when url contains state and error, /login/end should be called', async () => {
    const queryString = '?state=foo&error=bar'
    const response = await client.onPageLoad(redirectUri + queryString);
    expect(response.idTokenClaims?.sub).toBe('login-end');
  });

  test('when url contains just "response" param, /login/end should be called', async () => {
    const queryString = '?response=eyjwt'
    const response = await client.onPageLoad(redirectUri + queryString);
    expect(response.idTokenClaims?.sub).toBe('login-end');
  });

  test('when url contains just response param and another param, /session should be called', async () => {
    const queryString = '?response=eyjwt&state=foo'
    const response = await client.onPageLoad(redirectUri + queryString);
    expect(response.idTokenClaims?.sub).toBe('session');
    expect(response.isLoggedIn).toBe(true);
    expect(response.accessTokenExpiresIn).toBe(300);
  });

  test('when url contains only state, /session should be called', async () => {
    const queryString = '?state=foo'
    const response = await client.onPageLoad(redirectUri + queryString);
    expect(response.idTokenClaims?.sub).toBe('session');
  });

  test('when url contains only code, /session should be called', async () => {
    const queryString = '?code=foo'
    const response = await client.onPageLoad(redirectUri + queryString);
    expect(response.idTokenClaims?.sub).toBe('session');
  });
});


describe('test startLogin() function', () => {
  test('extra parameters are passed to authorization url', async () => {
    const response = await client.startLogin({
      extraAuthorizationParameters: {
        ui_locales: 'sv',
        login_hint: 'tomas'
      }
    })
    expect(response.authorizationUrl).toBe(authzUrl + '?ui_locales=sv&login_hint=tomas');
  });
});