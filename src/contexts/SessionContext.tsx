import React, { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Session states following the spec
export type SessionState = 'entered' | 'committed' | 'verified' | 'expired';

export interface Session {
  sessionId: string;
  sourceId: string;
  entryTimestamp: Date;
  precommitTimestamp: Date | null;
  state: SessionState;
  terminationReason?: string;
  serverSynced: boolean;
}

interface SessionContextType {
  session: Session | null;
  initSession: (sourceId: string) => Promise<void>;
  updateState: (state: SessionState) => void;
  commitSession: () => Promise<boolean>;
  isWithinTimeWindow: () => boolean;
  clearSession: () => void;
  isLoading: boolean;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

// 48-hour window in milliseconds
const TIME_WINDOW_MS = 48 * 60 * 60 * 1000;

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const initAttemptedRef = useRef<string | null>(null);

  // Initialize session from storage on mount
  useEffect(() => {
    const stored = sessionStorage.getItem('liferecycled_session');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setSession({
          ...parsed,
          entryTimestamp: new Date(parsed.entryTimestamp),
          precommitTimestamp: parsed.precommitTimestamp ? new Date(parsed.precommitTimestamp) : null,
        });
        // Mark as already attempted for this source
        initAttemptedRef.current = parsed.sourceId;
      } catch (e) {
        console.error('Failed to parse stored session');
        sessionStorage.removeItem('liferecycled_session');
      }
    }
  }, []);

  // Persist session changes
  useEffect(() => {
    if (session) {
      sessionStorage.setItem('liferecycled_session', JSON.stringify(session));
    }
  }, [session]);

  const initSession = useCallback(async (sourceId: string) => {
    // Don't reinitialize if session exists for same source
    if (session && session.sourceId === sourceId && session.serverSynced) {
      return;
    }

    // Prevent repeated attempts for the same sourceId (stops retry storms)
    if (initAttemptedRef.current === sourceId) {
      return;
    }
    initAttemptedRef.current = sourceId;

    setIsLoading(true);

    try {
      // Request session creation from server - session ID is generated server-side
      const { data, error } = await supabase.functions.invoke('session-manager', {
        body: {
          action: 'create',
          source_id: sourceId,
        },
      });

      if (error) {
        console.error('Server session creation failed:', error);
        setSession(null);
        return;
      }

      // Use the server-generated session ID
      const newSession: Session = {
        sessionId: data.session_id,
        sourceId,
        entryTimestamp: new Date(),
        precommitTimestamp: null,
        state: data.state || 'entered',
        serverSynced: true,
      };
      setSession(newSession);
    } catch (err) {
      console.error('Session init error:', err);
      setSession(null);
    } finally {
      setIsLoading(false);
    }
  }, [session]);

  const updateState = useCallback((state: SessionState) => {
    setSession(prev => prev ? { ...prev, state } : null);
  }, []);

  const commitSession = useCallback(async (): Promise<boolean> => {
    if (!session) return false;

    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('session-manager', {
        body: {
          action: 'commit',
          session_id: session.sessionId,
        },
      });

      if (error) {
        console.error('Server commit failed:', error);
        setSession(prev => prev ? { 
          ...prev, 
          precommitTimestamp: new Date(),
          state: 'committed',
          serverSynced: false,
        } : null);
        return false;
      }

      setSession(prev => prev ? { 
        ...prev, 
        precommitTimestamp: new Date(),
        state: 'committed',
        serverSynced: true,
      } : null);
      return true;
    } catch (err) {
      console.error('Commit error:', err);
      setSession(prev => prev ? { 
        ...prev, 
        precommitTimestamp: new Date(),
        state: 'committed',
        serverSynced: false,
      } : null);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [session]);

  const isWithinTimeWindow = useCallback((): boolean => {
    if (!session?.precommitTimestamp) return false;
    
    const now = new Date();
    const precommit = session.precommitTimestamp;
    const timeDiff = now.getTime() - precommit.getTime();
    
    return timeDiff > 0 && timeDiff < TIME_WINDOW_MS;
  }, [session]);

  const clearSession = useCallback(() => {
    sessionStorage.removeItem('liferecycled_session');
    initAttemptedRef.current = null;
    setSession(null);
  }, []);

  return (
    <SessionContext.Provider value={{
      session,
      initSession,
      updateState,
      commitSession,
      isWithinTimeWindow,
      clearSession,
      isLoading,
    }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
}
