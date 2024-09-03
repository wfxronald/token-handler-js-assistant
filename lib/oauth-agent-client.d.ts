import { EndLoginRequest, LogoutResponse, RefreshResponse, SessionResponse, StartLoginRequest, StartLoginResponse } from "./types";
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
export declare class OAuthAgentClient {
    private readonly oauthAgentBaseUrl;
    constructor(config: Configuration);
    /**
     * Refreshes the access token. Calls the `/refresh` endpoint.
     *
     * @return the refresh token response possibly containing the new access token's expiration time
     *
     * @throws OAuthAgentRemoteError when OAuth Agent responded with an error
     */
    refresh(): Promise<RefreshResponse>;
    /**
     * Returns the currently logged-in user's session data.
     * Calls the `/session` endpoint. A more generic {@link onPageLoad} can be used instead.
     *
     * @return the session response containing claims about currently logged-in user
     *
     * @throws OAuthAgentRemoteError when OAuth Agent responded with an error
     */
    session(): Promise<SessionResponse>;
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
    startLogin(request?: StartLoginRequest): Promise<StartLoginResponse>;
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
    endLogin(request: EndLoginRequest): Promise<SessionResponse>;
    /**
     * Logouts the user (removes all token handler cookies). Calls to `/logout` endpoint.
     * If the logout is configured in the token handler application, then a logout URL is returned.
     * The SPA is required to redirect the user to that URL.
     *
     * @return response possibly containing the logout URL
     *
     * @throws OAuthAgentRemoteError when OAuth Agent responded with an error
     */
    logout(csrfKeyValue: string): Promise<LogoutResponse>;
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
    onPageLoad(pageUrl: string): Promise<SessionResponse>;
    private isOAuthResponse;
    private toUrlSearchParams;
    private fetch;
}
