import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { PurchaseRecord } from '../lib/database.types';

export function usePurchaseHistory(familyId: string | null | undefined) {
  const [records, setRecords] = useState<PurchaseRecord[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchRecords = useCallback(async () => {
    if (!familyId) { setRecords([]); return; }
    setLoading(true);
    const { data } = await supabase
      .from('purchase_records')
      .select('*')
      .eq('family_id', familyId)
      .order('bought_at', { ascending: false });
    setRecords(data ?? []);
    setLoading(false);
  }, [familyId]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const getRecordsForItem = (itemId: string) =>
    records.filter((r) => r.item_id === itemId);

  const addRecord = async (data: {
    item_id: string;
    price: number;
    bought_by: string;
    notes?: string;
  }) => {
    if (!familyId) return { error: 'Not in a family' };
    const { error } = await supabase.from('purchase_records').insert({
      ...data,
      family_id: familyId,
      bought_at: new Date().toISOString(),
    });
    if (error) return { error: error.message };
    await fetchRecords();
    return { error: null };
  };

  return { records, loading, getRecordsForItem, addRecord, refresh: fetchRecords };
}
