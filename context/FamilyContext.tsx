import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
} from 'react';
import { supabase } from '../lib/supabase';
import { Family, Profile } from '../lib/database.types';
import { useAuth } from './AuthContext';

interface FamilyContextValue {
  family: Family | null;
  members: Profile[];
  loading: boolean;
  isHead: boolean;
  createFamily: (name: string) => Promise<{ error: string | null }>;
  joinFamily: (code: string) => Promise<{ error: string | null }>;
  leaveFamily: () => Promise<{ error: string | null }>;
  kickMember: (memberId: string) => Promise<{ error: string | null }>;
  transferHead: (memberId: string) => Promise<{ error: string | null }>;
  renameFamily: (newName: string) => Promise<{ error: string | null }>;
  disbandFamily: () => Promise<{ error: string | null }>;
  regenerateCode: () => Promise<{ error: string | null }>;
  refresh: () => Promise<void>;
}

const FamilyContext = createContext<FamilyContextValue | undefined>(undefined);

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 6 }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join('');
}

export function FamilyProvider({ children }: { children: ReactNode }) {
  const { profile, refreshProfile } = useAuth();
  const [family, setFamily] = useState<Family | null>(null);
  const [members, setMembers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);

  const isHead = !!(family && profile && family.head_id === profile.id);

  const fetchFamily = useCallback(async () => {
    if (!profile?.family_id) {
      setFamily(null);
      setMembers([]);
      return;
    }
    setLoading(true);
    const { data: fam } = await supabase
      .from('families')
      .select('*')
      .eq('id', profile.family_id)
      .single();
    setFamily(fam ?? null);

    const { data: mems } = await supabase
      .from('profiles')
      .select('*')
      .eq('family_id', profile.family_id);
    setMembers(mems ?? []);
    setLoading(false);
  }, [profile?.family_id]);

  useEffect(() => {
    fetchFamily();
  }, [fetchFamily]);

  const createFamily = async (name: string) => {
    if (!profile) return { error: 'Not logged in' };
    const code = generateCode();
    const { data: fam, error } = await supabase
      .from('families')
      .insert({ name, head_id: profile.id, invite_code: code })
      .select()
      .single();
    if (error) return { error: error.message };
    await supabase
      .from('profiles')
      .update({ family_id: fam.id })
      .eq('id', profile.id);
    await refreshProfile();
    await fetchFamily();
    return { error: null };
  };

  const joinFamily = async (code: string) => {
    if (!profile) return { error: 'Not logged in' };
    // Use the secure RPC lookup to bypass RLS before joining
    const { data: fams, error } = await supabase
      .rpc('get_family_by_code', { code_input: code.toUpperCase().trim() });
      
    if (error || !fams || fams.length === 0) return { error: 'Invalid invite code' };
    const fam = fams[0];
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ family_id: fam.id })
      .eq('id', profile.id);
    if (updateError) return { error: updateError.message };
    await refreshProfile();
    await fetchFamily();
    return { error: null };
  };

  const leaveFamily = async () => {
    if (!profile) return { error: 'Not logged in' };
    if (isHead) return { error: 'Transfer the head role before leaving' };
    const { error } = await supabase
      .from('profiles')
      .update({ family_id: null })
      .eq('id', profile.id);
    if (error) return { error: error.message };
    setFamily(null);
    setMembers([]);
    await refreshProfile();
    return { error: null };
  };

  const kickMember = async (memberId: string) => {
    if (!isHead) return { error: 'Only the head can kick members' };
    const { error } = await supabase
      .from('profiles')
      .update({ family_id: null })
      .eq('id', memberId);
    if (error) return { error: error.message };
    await fetchFamily();
    return { error: null };
  };

  const transferHead = async (memberId: string) => {
    if (!isHead || !family) return { error: 'Only the head can transfer' };
    const { error } = await supabase
      .from('families')
      .update({ head_id: memberId })
      .eq('id', family.id);
    if (error) return { error: error.message };
    await fetchFamily();
    return { error: null };
  };

  const renameFamily = async (newName: string) => {
    if (!isHead || !family) return { error: 'Only the head can rename the family' };
    if (!newName.trim()) return { error: 'Family name cannot be empty' };
    const { error } = await supabase
      .from('families')
      .update({ name: newName.trim() })
      .eq('id', family.id);
    if (error) return { error: error.message };
    await fetchFamily();
    return { error: null };
  };

  const regenerateCode = async () => {
    if (!isHead || !family) return { error: 'Only the head can regenerate codes' };
    const code = generateCode();
    const { error } = await supabase
      .from('families')
      .update({ invite_code: code })
      .eq('id', family.id);
    if (error) return { error: error.message };
    await fetchFamily();
    return { error: null };
  };

  const disbandFamily = async () => {
    if (!isHead || !family) return { error: 'Only the head can disband the family' };
    const { error } = await supabase
      .from('families')
      .delete()
      .eq('id', family.id);
    if (error) return { error: error.message };
    
    setFamily(null);
    setMembers([]);
    await refreshProfile();
    return { error: null };
  };

  return (
    <FamilyContext.Provider
      value={{
        family,
        members,
        loading,
        isHead,
        createFamily,
        joinFamily,
        leaveFamily,
        kickMember,
        transferHead,
        renameFamily,
        disbandFamily,
        regenerateCode,
        refresh: fetchFamily,
      }}
    >
      {children}
    </FamilyContext.Provider>
  );
}

export function useFamily(): FamilyContextValue {
  const ctx = useContext(FamilyContext);
  if (!ctx) throw new Error('useFamily must be inside FamilyProvider');
  return ctx;
}
