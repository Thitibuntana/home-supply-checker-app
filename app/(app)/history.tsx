import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useFamily } from '../../context/FamilyContext';
import { useSupplyItems } from '../../hooks/useSupplyItems';
import { usePurchaseHistory } from '../../hooks/usePurchaseHistory';
import PriceHistoryChart from '../../components/history/PriceHistoryChart';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { SPACING, FONT_SIZE, FONT_WEIGHT, RADIUS } from '../../constants/theme';
import { router } from 'expo-router';

export default function HistoryScreen() {
  const { colors } = useTheme();
  const { family } = useFamily();
  const { items } = useSupplyItems(family?.id);
  const { records, loading } = usePurchaseHistory(family?.id);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);


  const itemsWithHistory = useMemo(() => {
    const itemIds = new Set(records.map((r) => r.item_id));
    return items.filter((i) => itemIds.has(i.id));
  }, [items, records]);

  const selectedItem = items.find((i) => i.id === selectedItemId);
  const selectedRecords = records.filter((r) => r.item_id === selectedItemId);

  if (!family) {
    return (
      <View style={[styles.noFamily, { backgroundColor: colors.background }]}>
        <StatusBar barStyle={colors.textPrimary === '#F0F0F0' ? 'light-content' : 'dark-content'} />
        <Text style={styles.emoji}>📊</Text>
        <Text style={[styles.noFamilyTitle, { color: colors.textPrimary }]}>No Family Yet</Text>
        <Text style={[styles.noFamilyText, { color: colors.textSecondary }]}>
          Join or create a family to view price history.
        </Text>
        <Button
          title="Set Up Family"
          onPress={() => router.push('/(app)/family')}
          style={{ marginTop: SPACING.xl, alignSelf: 'center' }}
        />
      </View>
    );
  }

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={colors.textPrimary === '#F0F0F0' ? 'light-content' : 'dark-content'} />


      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Price History</Text>
        <Text style={[styles.headerSub, { color: colors.textSecondary }]}>
          Track price changes over time
        </Text>
      </View>

      {itemsWithHistory.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emoji}>💸</Text>
          <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>No Price Records Yet</Text>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            When you mark items as bought and enter a price, they'll appear here.
          </Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>SELECT ITEM</Text>
          <FlatList
            horizontal
            data={itemsWithHistory}
            keyExtractor={(i) => i.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.itemList}
            renderItem={({ item }) => {
              const active = selectedItemId === item.id;
              const itemRecords = records.filter((r) => r.item_id === item.id);
              const latest = itemRecords.sort(
                (a, b) => new Date(b.bought_at).getTime() - new Date(a.bought_at).getTime()
              )[0];
              return (
                <TouchableOpacity
                  onPress={() => setSelectedItemId(active ? null : item.id)}
                  style={[
                    styles.itemChip,
                    {
                      backgroundColor: active ? colors.primary : colors.surface,
                      borderColor: active ? colors.primary : colors.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.itemChipName,
                      { color: active ? '#fff' : colors.textPrimary },
                    ]}
                  >
                    {item.name}
                  </Text>
                  {latest && (
                    <Text
                      style={[
                        styles.itemChipPrice,
                        { color: active ? 'rgba(255,255,255,0.8)' : colors.textSecondary },
                      ]}
                    >
                      ${latest.price.toFixed(2)}
                    </Text>
                  )}
                </TouchableOpacity>
              );
            }}
          />


          {selectedItem ? (
            <Card style={{ marginTop: SPACING.base }}>
              <Text style={[styles.chartTitle, { color: colors.textPrimary }]}>
                {selectedItem.name}
              </Text>
              <Text style={[styles.chartSub, { color: colors.textSecondary }]}>
                {selectedItem.category} · {selectedItem.frequency}
              </Text>
              <View style={{ marginTop: SPACING.md }}>
                <PriceHistoryChart
                  records={selectedRecords}
                  itemName={selectedItem.name}
                />
              </View>
            </Card>
          ) : (
            <View style={[styles.selectHint, { borderColor: colors.border }]}>
              <Ionicons name="bar-chart-outline" size={32} color={colors.textMuted} />
              <Text style={[styles.selectHintText, { color: colors.textMuted }]}>
                Select an item above to view its price history
              </Text>
            </View>
          )}


          <Text style={[styles.sectionTitle, { color: colors.textSecondary, marginTop: SPACING.xl }]}>
            OVERVIEW
          </Text>
          <View style={styles.statsRow}>
            <Card style={[styles.statCard, { flex: 1, marginRight: SPACING.sm }]} padding={SPACING.md}>
              <Ionicons name="receipt-outline" size={20} color={colors.primary} />
              <Text style={[styles.statValue, { color: colors.textPrimary }]}>
                {records.length}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Total Records
              </Text>
            </Card>
            <Card style={[styles.statCard, { flex: 1, marginRight: SPACING.sm }]} padding={SPACING.md}>
              <Ionicons name="cube-outline" size={20} color={colors.accent} />
              <Text style={[styles.statValue, { color: colors.textPrimary }]}>
                {itemsWithHistory.length}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Tracked Items
              </Text>
            </Card>
            <Card style={[styles.statCard, { flex: 1 }]} padding={SPACING.md}>
              <Ionicons name="cash-outline" size={20} color={colors.bought} />
              <Text style={[styles.statValue, { color: colors.textPrimary }]}>
                ${records.reduce((s, r) => s + r.price, 0).toFixed(0)}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Total Spent
              </Text>
            </Card>
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xxxl + SPACING.base,
    paddingBottom: SPACING.base,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: FONT_SIZE.xxl, fontWeight: FONT_WEIGHT.bold },
  headerSub: { fontSize: FONT_SIZE.sm, marginTop: 2 },
  content: { padding: SPACING.base, paddingBottom: SPACING.xxxl },
  sectionTitle: {
    fontSize: FONT_SIZE.xs, fontWeight: FONT_WEIGHT.bold,
    letterSpacing: 1.2, marginBottom: SPACING.sm,
  },
  itemList: { paddingBottom: SPACING.sm, gap: SPACING.sm },
  itemChip: {
    borderRadius: RADIUS.md, borderWidth: 1.5,
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm,
    alignItems: 'center', minWidth: 80,
  },
  itemChipName: { fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.semibold },
  itemChipPrice: { fontSize: FONT_SIZE.xs, marginTop: 2 },
  chartTitle: { fontSize: FONT_SIZE.lg, fontWeight: FONT_WEIGHT.bold },
  chartSub: { fontSize: FONT_SIZE.sm, marginTop: 2 },
  selectHint: {
    marginTop: SPACING.base, borderRadius: RADIUS.md, borderWidth: 1,
    borderStyle: 'dashed', alignItems: 'center', paddingVertical: SPACING.xxxl,
  },
  selectHintText: { fontSize: FONT_SIZE.sm, marginTop: SPACING.sm, textAlign: 'center' },
  statsRow: { flexDirection: 'row' },
  statCard: { alignItems: 'center' },
  statValue: { fontSize: FONT_SIZE.xl, fontWeight: FONT_WEIGHT.bold, marginTop: SPACING.xs },
  statLabel: { fontSize: FONT_SIZE.xs, marginTop: 2, textAlign: 'center' },
  noFamily: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: SPACING.xxxl },
  emoji: { fontSize: 56, marginBottom: SPACING.lg },
  noFamilyTitle: { fontSize: FONT_SIZE.xl, fontWeight: FONT_WEIGHT.bold, marginBottom: SPACING.sm },
  noFamilyText: { fontSize: FONT_SIZE.md, textAlign: 'center', lineHeight: 22 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: SPACING.xxxl },
  emptyTitle: { fontSize: FONT_SIZE.xl, fontWeight: FONT_WEIGHT.bold, marginBottom: SPACING.sm, marginTop: SPACING.md },
  emptyText: { fontSize: FONT_SIZE.md, textAlign: 'center', lineHeight: 22 },
});
