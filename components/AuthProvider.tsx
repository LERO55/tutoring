'use client';

import { ReactNode, createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { PublicClientApplication, AccountInfo } from '@azure/msal-browser';
import { msalConfig, loginRequest } from '@/lib/msal-config';

interface AuthContextType {
  isAuthenticated: boolean;
  user: { name: string; email: string } | null;
  login: () => Promise<void>;
  logout: () => void;
  inProgress: boolean;
  msalInstance: PublicClientApplication | null;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  login: async () => {},
  logout: () => {},
  inProgress: false,
  msalInstance: null,
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

// Pre-initialize MSAL instance
let msalInstance: PublicClientApplication | null = null;
const clientId = process.env.NEXT_PUBLIC_AZURE_CLIENT_ID;

if (typeof window !== 'undefined' && clientId && clientId !== 'YOUR_CLIENT_ID_HERE') {
  msalInstance = new PublicClientApplication(msalConfig);
}

export default function AuthProvider({ children }: AuthProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [inProgress, setInProgress] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const initRef = useRef(false);

  // Initialize MSAL and check for existing session
  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    const init = async () => {
      if (msalInstance) {
        try {
          await msalInstance.initialize();
          
          // Handle redirect response if coming back from login
          const response = await msalInstance.handleRedirectPromise();
          if (response?.account) {
            await fetchUserProfile(response.account);
          } else {
            // Check for existing session
            const accounts = msalInstance.getAllAccounts();
            if (accounts.length > 0) {
              await fetchUserProfile(accounts[0]);
            }
          }
        } catch (error) {
          console.error('MSAL init error:', error);
        }
      }
      setInitialized(true);
    };

    init();
  }, []);

  const fetchUserProfile = async (account: AccountInfo) => {
    if (!msalInstance) return;
    
    try {
      const tokenResponse = await msalInstance.acquireTokenSilent({
        ...loginRequest,
        account,
      });

      const graphResponse = await fetch('https://graph.microsoft.com/v1.0/me', {
        headers: { Authorization: `Bearer ${tokenResponse.accessToken}` },
      });

      if (graphResponse.ok) {
        const data = await graphResponse.json();
        setUser({
          name: data.displayName || data.givenName || 'Student',
          email: data.mail || data.userPrincipalName || '',
        });
      } else {
        setUser({
          name: account.name || 'Student',
          email: account.username || '',
        });
      }
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      setUser({
        name: account.name || 'Student',
        email: account.username || '',
      });
      setIsAuthenticated(true);
    }
  };

  const login = useCallback(async () => {
    setInProgress(true);

    if (msalInstance) {
      try {
        // Use redirect instead of popup - more reliable
        await msalInstance.loginRedirect(loginRequest);
        // Page will redirect, so we won't reach here
      } catch (error) {
        console.error('Login error:', error);
        setInProgress(false);
      }
    } else {
      // Demo mode
      setTimeout(() => {
        setUser({
          name: 'Demo Student',
          email: 'student@school.edu',
        });
        setIsAuthenticated(true);
        setInProgress(false);
      }, 1000);
    }
  }, []);

  const logout = useCallback(() => {
    if (msalInstance) {
      msalInstance.logoutRedirect();
    } else {
      setIsAuthenticated(false);
      setUser(null);
    }
  }, []);

  // Show loading while initializing
  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-8 h-8 border-2 border-neutral-200 border-t-neutral-900 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, inProgress, msalInstance }}>
      {children}
    </AuthContext.Provider>
  );
}
