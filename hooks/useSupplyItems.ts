import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { SupplyItem } from '../lib/database.types';
import { useAuth } from '../context/AuthContext';

export function useSupplyItems(familyId: string | null | undefined) {
  const { profile } = useAuth();
  const [items, setItems] = useState<SupplyItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchItems = useCallback(async () => {
    if (!familyId) { setItems([]); return; }
    setLoading(true);
    const { data, error: err } = await supabase
      .from('supply_items')
      .select('*')
      .eq('family_id', familyId)
      .order('created_at', { ascending: false });
    if (err) setError(err.message);
    else setItems(data ?? []);
    setLoading(false);
  }, [familyId]);

  useEffect(() => {
    fetchItems();

    if (!familyId) return;
    const channelId = `supply_items_${familyId}_${Math.random().toString(36).substring(7)}`;
    const channel = supabase
      .channel(channelId)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'supply_items', filter: `family_id=eq.${familyId}` },
        () => fetchItems()
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [familyId, fetchItems]);

  const addItem = async (data: {
    name: string;
    category: string;
    frequency: 'weekly' | 'monthly';
  }) => {
    if (!familyId || !profile) return { error: 'Not in a family' };
    const { error: err } = await supabase.from('supply_items').insert({
      ...data,
      family_id: familyId,
      created_by: profile.id,
      is_bought: false,
    });
    if (err) return { error: err.message };
    return { error: null };
  };

  const toggleBought = async (item: SupplyItem) => {
    const { error: err } = await supabase
      .from('supply_items')
      .update({ is_bought: !item.is_bought, updated_at: new Date().toISOString() })
      .eq('id', item.id);
    if (err) return { error: err.message };
    return { error: null };
  };

  const deleteItem = async (itemId: string) => {
    await supabase.from('purchase_records').delete().eq('item_id', itemId);
    const { error: err } = await supabase.from('supply_items').delete().eq('id', itemId);
    if (err) return { error: err.message };
    return { error: null };
  };

  return { items, loading, error, addItem, toggleBought, deleteItem, refresh: fetchItems };
}
