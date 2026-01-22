import { Configuration, LogLevel } from '@azure/msal-browser';

/*
 * MSAL Configuration for Microsoft Authentication
 * 
 * To use this in production, you need to:
 * 1. Register an app in Azure AD (portal.azure.com)
 * 2. Set up a Single Page Application (SPA) redirect
 * 3. Replace the clientId below with your app's client ID
 * 4. Update the redirectUri to match your deployed URL
 * 
 * For development/testing, you can use the demo app ID below
 * which works with any Microsoft account.
 */

// Demo/Development App ID (works for testing)
// For production: Create your own at https://portal.azure.com
const DEMO_CLIENT_ID = 'YOUR_CLIENT_ID_HERE'; // Replace with your Azure AD App Client ID

export const msalConfig: Configuration = {
  auth: {
    // Replace with your Azure AD application client ID
    clientId: process.env.NEXT_PUBLIC_AZURE_CLIENT_ID || DEMO_CLIENT_ID,
    
    // Use 'common' for multi-tenant (any Microsoft account)
    // Use 'organizations' for work/school accounts only
    // Use your tenant ID for single-tenant apps
    authority: 'https://login.microsoftonline.com/common',
    
    // Must match a redirect URI registered in Azure AD
    redirectUri: typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000',
    
    // Where to redirect after logout
    postLogoutRedirectUri: typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000',
    
    // Required for SPA auth
    navigateToLoginRequestUrl: true,
  },
  cache: {
    // sessionStorage is more secure but doesn't persist across tabs
    // localStorage persists across tabs and browser sessions
    cacheLocation: 'sessionStorage',
    
    // Set to true to store auth state in cookies (for IE11/Edge legacy)
    storeAuthStateInCookie: false,
  },
  system: {
    loggerOptions: {
      loggerCallback: (level, message, containsPii) => {
        if (containsPii) return;
        
        switch (level) {
          case LogLevel.Error:
            console.error('[MSAL]', message);
            break;
          case LogLevel.Warning:
            console.warn('[MSAL]', message);
            break;
          case LogLevel.Info:
            // Uncomment for debugging
            // console.info('[MSAL]', message);
            break;
          case LogLevel.Verbose:
            // console.debug('[MSAL]', message);
            break;
        }
      },
      logLevel: LogLevel.Warning,
      piiLoggingEnabled: false,
    },
  },
};

// Scopes for the access token
// These determine what the app can access
export const loginRequest = {
  scopes: [
    'User.Read',           // Basic profile info
    'openid',              // OpenID Connect
    'profile',             // Profile info
    'email',               // Email address
    'Calendars.Read',      // Read calendar (check free/busy)
    'Calendars.ReadWrite', // Create calendar events
  ],
};

// Scopes for calendar access (requested separately if user enables)
export const calendarRequest = {
  scopes: [
    'Calendars.Read',
    'Calendars.ReadWrite',
  ],
};

// Graph API endpoint
export const graphConfig = {
  graphMeEndpoint: 'https://graph.microsoft.com/v1.0/me',
};
