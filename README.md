# token-handler-js-assistant
A helper library to help SPAs interact with OAuth Agent in the Token Handler pattern. 

## Add to project
Add to your project using npm

```
npm install @curity/token-handler-js-assistant
```

## How to use in your project

Import the Assistant into your project and initialize it using `Configuration` object.
```typescript
import {OAuthAgentClient} from "@curity/token-handler-js-assistant";
const client = new OAuthAgentClient({oauthAgentBaseUrl: 'https://login.example.com/apps/token-handler1'})
```
The `Configuration` object contains just one property:
- `oauthAgentBaseUrl` - a URL with path to the token handler application created in the Curity Identity Server (this URL ends with a token handler application ID
  as defined in the Curity Identity Server configuration).

### Using the initialized client

1. Starting the user login
   ```typescript
   const extraAuthzParams = new Map<string, string>()
   extraAuthzParams.set('login_hint', 'user')
   extraAuthzParams.set('ui_locales', 'sv')
   const response = await client.startLogin(new StartLoginRequest(extraAuthzParams))
   ```
2. Finishing the user login
   ```typescript
   const url = new URL(pageUrl)
   const response = await client.endLogin(new EndLoginRequest(url.search))
   ``` 
Note: The `endLogin` function should only be called with authorization response parameters (when the authorization
server redirected user to the SPA after a successful user login). It's recommended to call `onPageLoad()` instead
on every load of the SPA. This function makes a decision based the query string and either calls `endLogin()` or `session()`.

3. Handling page load
   ```typescript
   const response = await client.onPageLoad(location.href)
   ```
4. Refreshing tokens
   ```typescript
   await client.refresh()
   ```
5. Retrieving user data
   ```typescript
   const sessionResponse = await client.session()
   ```
6. Logging out
   ```typescript
   const logoutResponse = await client.logout()
   if (logoutResponse.logoutUrl) {
       location.href = logoutResponse.logoutUrl;
   }
   ```

## Building

Run `npm install` followed by `npm run build`

## Running unit tests

This repo contains unit tests implemented by `jest`. To execute them, run `npm test`
