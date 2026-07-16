/**
 * Passed to {@link OAuthAgentClient#startLogin} function. The SPA can pass extra authorization parameters
 * (such as `scope`, `login_hint` or `ui_locales`). These parameters will be used in the authorization request.
 * Each parameter has to be explicitly allowed in the configuration of the token handler application
 * in the Curity server.
 *
 */
export interface StartLoginRequest {
    readonly extraAuthorizationParameters?: {
        [key: string]: string;
    };
}
/**
 * Returned from {@link OAuthAgentClient#startLogin} function. Contains the `authorizationUrl` that the SPA
 * is supposed to redirect the user to.
 */
export interface StartLoginResponse {
    readonly authorizationUrl: string;
}
/**
 * Passed to {@link OAuthAgentClient#endLogin} function. The SPA is supposed to pass
 * the {@link URLSearchParams} of the current page URL into this request.
 */
export interface EndLoginRequest {
    readonly searchParams: URLSearchParams;
}
/**
 * Returned from {@link OAuthAgentClient#session}, {@link OAuthAgentClient#endLogin} and
 * {@link OAuthAgentClient#onPageLoad} functions. Contains:
 * - `isLoggedIn` - a boolean flag indicationg whether a user is logged in
 * - `idTokenClaims` - an object containing ID token claims. This will be `null` if the user is
 *                     logged out; or the user is logged in but no ID token was issued.
 * - `accessTokenExpiresIn` - expiration time of access token in seconds (`null` if no `expires_in` parameter
 *                            was returned from the Authorization Server's token endpoint)
 */
export interface SessionResponse {
    readonly isLoggedIn: boolean;
    readonly csrfToken?: string;
    readonly idTokenClaims?: any;
    readonly accessTokenExpiresIn?: number;
}
/**
 * Returned from the {@link OAuthAgentClient#refresh} function. Contains:
 * - `accessTokenExpiresIn` - expiration time of access token in seconds (`null` if no `expires_in` parameter
 *                            was returned from the Authorization Server's token endpoint)
 */
export interface RefreshResponse {
    readonly accessTokenExpiresIn?: number;
}
/**
 * Returned from {@link OAuthAgentClient#logout} function. Contains the `logoutUrl` (if logout is enabled in
 * the configuration of the token handler application in the Curity server). The SPA is
 * supposed to redirect the user to the returned logout URL.
 */
export interface LogoutResponse {
    readonly logoutUrl?: string;
}
/**
 * This error is thrown from all the {@link OAuthAgentClient} functions in case a call to the
 * token handler application failed.
 */
export declare class OAuthAgentRemoteError extends Error {
    readonly status: number;
    readonly code: string;
    readonly details?: string | undefined;
    /**
     *
     * @param status the HTTP status from the server
     * @param code the error code
     * @param details the detailed error message (available only when exposing detailed
     *                error messages is enabled in the Curity server)
     */
    constructor(status: number, code: string, details?: string | undefined);
}
