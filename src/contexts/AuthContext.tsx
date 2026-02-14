import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { User as AppUser } from '../types';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';

interface AuthContextType {
    user: AppUser | null;
    session: Session | null;
    isLoading: boolean;
    signOut: () => Promise<void>;
    updateProfile: (updates: { name?: string; avatarUrl?: string; email?: string }) => Promise<{ error: any }>;
    updatePassword: (newPassword: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    session: null,
    isLoading: true,
    signOut: async () => { },
    updateProfile: async () => ({ error: null }),
    updatePassword: async () => ({ error: null }),
});


export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<AppUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);

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

    useEffect(() => {
        console.log('[AuthContext] Iniciando verificação de sessão...');
        // Check active session
        supabase.auth.getSession().then(({ data: { session } }) => {
            console.log('[AuthContext] Sessão obtida:', session ? 'Sim' : 'Não');
            setSession(session);
            if (session?.user) {
                mapSupabaseUserToAppUser(session.user);
            } else {
                console.log('[AuthContext] Nenhum usuário encontrado, parando loading.');
                setIsLoading(false);
            }
        }).catch(err => {
            console.error('[AuthContext] Erro ao buscar sessão:', err);
            setIsLoading(false);
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

        return () => {
            if (subscription) subscription.unsubscribe();
        };
    }, []);

    const updateProfile = async (updates: { name?: string; avatarUrl?: string; email?: string }) => {
        const { data, error } = await supabase.auth.updateUser({
            email: updates.email,
            data: {
                full_name: updates.name,
                avatar_url: updates.avatarUrl
            }
        });

        if (!error && data.user) {
            mapSupabaseUserToAppUser(data.user);
        }
        return { error };
    };

    const updatePassword = async (newPassword: string) => {
        const { error } = await supabase.auth.updateUser({
            password: newPassword
        });
        return { error };
    };

    const signOut = async () => {
        await supabase.auth.signOut();
        setUser(null);
        setSession(null);
    };

    return (
        <AuthContext.Provider value={{ user, session, isLoading, signOut, updateProfile, updatePassword }}>
            {children}
        </AuthContext.Provider>
    );
};
