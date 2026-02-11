import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { User as AppUser } from '../types';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';

interface AuthContextType {
    user: AppUser | null;
    session: Session | null;
    isLoading: boolean;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    session: null,
    isLoading: true,
    signOut: async () => { },
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<AppUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check active session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            if (session?.user) {
                mapSupabaseUserToAppUser(session.user);
            } else {
                setIsLoading(false);
            }
        });

        // Listen for changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            if (session?.user) {
                mapSupabaseUserToAppUser(session.user);
            } else {
                setUser(null);
                setIsLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const mapSupabaseUserToAppUser = (sbUser: SupabaseUser) => {
        const newUser: AppUser = {
            id: sbUser.id,
            name: sbUser.user_metadata?.full_name || sbUser.email?.split('@')[0] || 'Usuário',
            email: sbUser.email || '',
            avatar: sbUser.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${sbUser.email?.charAt(0)}&background=random`,
            plan: 'Free', // Default plan
        };
        setUser(newUser);
        setIsLoading(false);
    };

    const signOut = async () => {
        await supabase.auth.signOut();
        setUser(null);
        setSession(null);
    };

    return (
        <AuthContext.Provider value={{ user, session, isLoading, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};
