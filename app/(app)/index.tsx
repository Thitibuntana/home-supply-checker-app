import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from 'react-native';
import AddItemModal from '../../components/items/AddItemModal';
import PriceEntryModal from '../../components/items/PriceEntryModal';
import SupplyItemCard from '../../components/items/SupplyItemCard';
import Button from '../../components/ui/Button';
import { FONT_SIZE, FONT_WEIGHT, RADIUS, SPACING } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { useFamily } from '../../context/FamilyContext';
import { useTheme } from '../../context/ThemeContext';
import { usePurchaseHistory } from '../../hooks/usePurchaseHistory';
import { useSupplyItems } from '../../hooks/useSupplyItems';
import { SupplyItem } from '../../lib/database.types';

type Filter = 'all' | 'weekly' | 'monthly' | 'bought' | 'notBought';

export default function ShoppingListScreen() {
  const { colors } = useTheme();
  const { profile } = useAuth();
  const { family, members } = useFamily();
  const { items, loading, addItem, toggleBought, deleteItem, refresh } = useSupplyItems(family?.id);
  const { addRecord } = usePurchaseHistory(family?.id);

  const [showAddModal, setShowAddModal] = useState(false);
  const [priceItem, setPriceItem] = useState<SupplyItem | null>(null);
  const [filter, setFilter] = useState<Filter>('all');

  const memberMap = useMemo(() => {
    const m: Record<string, string> = {};
    members.forEach((mem) => { m[mem.id] = mem.username; });
    return m;
  }, [members]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (filter === 'all') return true;
      if (filter === 'weekly') return item.frequency === 'weekly';
      if (filter === 'monthly') return item.frequency === 'monthly';
      if (filter === 'bought') return item.is_bought;
      if (filter === 'notBought') return !item.is_bought;
      return true;
    });
  }, [items, filter]);


  const grouped = useMemo(() => {
    const groups: Record<string, SupplyItem[]> = {};
    filteredItems.forEach((item) => {
      if (!groups[item.category]) groups[item.category] = [];
      groups[item.category].push(item);
    });
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
  }, [filteredItems]);

  const handleToggle = async (item: SupplyItem) => {
    if (!item.is_bought) {
      setPriceItem(item);
    } else {
      const { error } = await toggleBought(item);
      if (error) Alert.alert('Error', error);
      else refresh();
    }
  };

  const handlePriceConfirm = async (price: number, notes?: string) => {
    if (!priceItem || !profile) return;
    const { error } = await toggleBought(priceItem);
    if (error) {
      Alert.alert('Error', error);
      return;
    }
    if (price > 0 || notes) {
      await addRecord({
        item_id: priceItem.id,
        price,
        bought_by: profile.id,
        notes,
      });
    }
    setPriceItem(null);
    refresh();
  };

  const stats = useMemo(() => {
    const total = items.length;
    const bought = items.filter((i) => i.is_bought).length;
    return { total, bought, percent: total > 0 ? Math.round((bought / total) * 100) : 0 };
  }, [items]);


  if (!family) {
    return (
      <View style={[styles.noFamily, { backgroundColor: colors.background }]}>
        <StatusBar barStyle={colors.textPrimary === '#F0F0F0' ? 'light-content' : 'dark-content'} />
        <Text style={styles.noFamilyEmoji}>🏠</Text>
        <Text style={[styles.noFamilyTitle, { color: colors.textPrimary }]}>
          No Family Yet
        </Text>
        <Text style={[styles.noFamilyText, { color: colors.textSecondary }]}>
          Create or join a family to start managing your shared supply list.
        </Text>
        <Button
          title="Set Up Family"
          onPress={() => router.push('/(app)/family')}
          style={{ marginTop: SPACING.xl, alignSelf: 'center' }}
          size="lg"
        />
      </View>
    );
  }

  const FILTERS: { key: Filter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'notBought', label: '🔴 Needed' },
    { key: 'bought', label: '🟢 Bought' },
    { key: 'weekly', label: '📅 Weekly' },
    { key: 'monthly', label: '🗓️ Monthly' },
  ];

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={colors.textPrimary === '#F0F0F0' ? 'light-content' : 'dark-content'} />


      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <View>
          <Text style={[styles.familyName, { color: colors.textSecondary }]}>{family.name}</Text>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Shopping List</Text>
        </View>
        <TouchableOpacity
          onPress={() => setShowAddModal(true)}
          style={[styles.addBtn, { backgroundColor: colors.primary }]}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>


      {stats.total > 0 && (
        <View style={[styles.progress, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
          <View style={styles.progressInfo}>
            <Text style={[styles.progressText, { color: colors.textSecondary }]}>
              {stats.bought}/{stats.total} items bought
            </Text>
            <Text style={[styles.progressPercent, { color: stats.percent === 100 ? colors.bought : colors.primary }]}>
              {stats.percent}%
            </Text>
          </View>
          <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${stats.percent}%`,
                  backgroundColor: stats.percent === 100 ? colors.bought : colors.primary,
                },
              ]}
            />
          </View>
        </View>
      )}


      <View style={[styles.filtersWrapper, { borderBottomColor: colors.border }]}>
        <FlatList
          horizontal
          data={FILTERS}
          keyExtractor={(f) => f.key}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterList}
          renderItem={({ item: f }) => {
            const active = filter === f.key;
            return (
              <TouchableOpacity
                onPress={() => setFilter(f.key)}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: active ? colors.primary : colors.surfaceAlt,
                    borderColor: active ? colors.primary : colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.filterText,
                    { color: active ? '#fff' : colors.textSecondary },
                  ]}
                >
                  {f.label}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>


      {grouped.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>🛒</Text>
          <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
            {filter === 'all' ? 'No items yet' : 'Nothing here'}
          </Text>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            {filter === 'all'
              ? 'Tap + to add your first supply item'
              : 'Try changing the filter above'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={grouped}
          keyExtractor={([cat]) => cat}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={refresh}
              tintColor={colors.primary}
            />
          }
          renderItem={({ item: [category, categoryItems] }) => (
            <View style={styles.section}>
              <Text style={[styles.categoryLabel, { color: colors.textMuted }]}>
                {category.toUpperCase()}
              </Text>
              {categoryItems.map((item) => (
                <SupplyItemCard
                  key={item.id}
                  item={item}
                  onToggleBought={handleToggle}
                  onDelete={async (i) => {
                    const { error } = await deleteItem(i.id);
                    if (error) Alert.alert('Error deleting item', error);
                    else refresh();
                  }}
                  boughtByName={item.created_by ? memberMap[item.created_by] : undefined}
                />
              ))}
            </View>
          )}
        />
      )}

      <AddItemModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={async (data) => {
          const res = await addItem(data);
          if (res?.error) Alert.alert('Error adding item', res.error);
          else {
            refresh();
            setShowAddModal(false);
          }
          return res;
        }}
      />
      <PriceEntryModal
        visible={!!priceItem}
        item={priceItem}
        onClose={() => setPriceItem(null)}
        onConfirm={handlePriceConfirm}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xxxl + SPACING.base,
    paddingBottom: SPACING.base,
    borderBottomWidth: 1,
  },
  familyName: { fontSize: FONT_SIZE.xs, fontWeight: FONT_WEIGHT.medium, letterSpacing: 0.5, textTransform: 'uppercase' },
  headerTitle: { fontSize: FONT_SIZE.xxl, fontWeight: FONT_WEIGHT.bold },
  addBtn: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center',
  },
  progress: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
  },
  progressInfo: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.xs },
  progressText: { fontSize: FONT_SIZE.xs },
  progressPercent: { fontSize: FONT_SIZE.xs, fontWeight: FONT_WEIGHT.bold },
  progressBar: { height: 4, borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 2 },
  filtersWrapper: { borderBottomWidth: 1 },
  filterList: { paddingHorizontal: SPACING.xl, paddingVertical: SPACING.sm, gap: SPACING.sm },
  filterChip: {
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full, borderWidth: 1.5,
  },
  filterText: { fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.medium },
  listContent: { padding: SPACING.base, paddingTop: SPACING.md },
  section: { marginBottom: SPACING.md },
  categoryLabel: {
    fontSize: FONT_SIZE.xs, fontWeight: FONT_WEIGHT.bold,
    letterSpacing: 1, marginBottom: SPACING.sm,
  },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: SPACING.xxxl },
  emptyEmoji: { fontSize: 56, marginBottom: SPACING.lg },
  emptyTitle: { fontSize: FONT_SIZE.xl, fontWeight: FONT_WEIGHT.bold, marginBottom: SPACING.sm },
  emptyText: { fontSize: FONT_SIZE.md, textAlign: 'center' },
  noFamily: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: SPACING.xxxl },
  noFamilyEmoji: { fontSize: 64, marginBottom: SPACING.lg },
  noFamilyTitle: { fontSize: FONT_SIZE.xxl, fontWeight: FONT_WEIGHT.bold, marginBottom: SPACING.sm },
  noFamilyText: { fontSize: FONT_SIZE.md, textAlign: 'center', lineHeight: 22 },
});
