import React from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { useTheme } from '../../context/ThemeContext';
import { PurchaseRecord } from '../../lib/database.types';
import { RADIUS, SPACING, FONT_SIZE, FONT_WEIGHT } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';

const screenWidth = Dimensions.get('window').width;

interface PriceHistoryChartProps {
  records: PurchaseRecord[];
  itemName: string;
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

export default function PriceHistoryChart({ records, itemName }: PriceHistoryChartProps) {
  const { colors, theme } = useTheme();

  if (records.length === 0) {
    return (
      <View style={[styles.empty, { borderColor: colors.border }]}>
        <Ionicons name="receipt-outline" size={32} color={colors.textMuted} />
        <Text style={[styles.emptyText, { color: colors.textMuted }]}>
          No purchase records yet
        </Text>
      </View>
    );
  }

  const sorted = [...records].sort(
    (a, b) => new Date(a.bought_at).getTime() - new Date(b.bought_at).getTime()
  );

  const prices = sorted.map((r) => r.price);
  const labels = sorted.map((r) => formatDate(r.bought_at));
  const latest = prices[prices.length - 1];
  const previous = prices.length > 1 ? prices[prices.length - 2] : null;

  const trend =
    previous === null
      ? null
      : latest > previous
      ? 'up'
      : latest < previous
      ? 'down'
      : 'same';

  const trendColor =
    trend === 'up'
      ? colors.priceUp
      : trend === 'down'
      ? colors.priceDown
      : colors.priceSame;

  const trendIcon =
    trend === 'up'
      ? 'trending-up'
      : trend === 'down'
      ? 'trending-down'
      : 'remove-outline';

  const trendLabel =
    trend === 'up'
      ? `↑ Up from $${previous?.toFixed(2)}`
      : trend === 'down'
      ? `↓ Down from $${previous?.toFixed(2)}`
      : trend === 'same'
      ? '→ Same as last time'
      : 'First record';

  const chartData = {
    labels: labels.length > 6 ? labels.slice(-6) : labels,
    datasets: [{ data: prices.length > 6 ? prices.slice(-6) : prices, strokeWidth: 2.5 }],
  };

  const isDark = theme === 'dark';

  return (
    <View>

      <View style={[styles.summaryRow, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
        <View>
          <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
            Latest Price
          </Text>
          <Text style={[styles.summaryPrice, { color: colors.textPrimary }]}>
            ${latest.toFixed(2)}
          </Text>
        </View>
        {trend !== null && (
          <View style={[styles.trendBadge, { backgroundColor: trendColor + '22', borderColor: trendColor + '44' }]}>
            <Ionicons name={trendIcon as any} size={16} color={trendColor} />
            <Text style={[styles.trendText, { color: trendColor }]}>{trendLabel}</Text>
          </View>
        )}
      </View>


      {prices.length > 1 && (
        <View style={styles.chartWrapper}>
          <LineChart
            data={chartData}
            width={screenWidth - SPACING.xl * 2 - SPACING.base * 2}
            height={180}
            yAxisLabel="$"
            yAxisSuffix=""
            withDots
            withInnerLines={false}
            withOuterLines={false}
            withVerticalLabels
            withHorizontalLabels
            chartConfig={{
              backgroundColor: colors.surface,
              backgroundGradientFrom: colors.surface,
              backgroundGradientTo: colors.surface,
              decimalPlaces: 2,
              color: () => colors.primary,
              labelColor: () => colors.textSecondary,
              propsForDots: {
                r: '5',
                strokeWidth: '2',
                stroke: colors.primaryDark,
                fill: colors.primary,
              },
              propsForLabels: {
                fontSize: 10,
              },
            }}
            bezier
            style={{ borderRadius: RADIUS.md }}
          />
        </View>
      )}


      <Text style={[styles.historyLabel, { color: colors.textSecondary }]}>
        Purchase History
      </Text>
      {[...sorted].reverse().map((record, idx) => {
        const prevPrice = idx < sorted.length - 1
          ? sorted[sorted.length - 1 - idx - 1]?.price
          : null;
        const diff = prevPrice !== null ? record.price - prevPrice : null;
        return (
          <View
            key={record.id}
            style={[styles.recordRow, { borderBottomColor: colors.border }]}
          >
            <View>
              <Text style={[styles.recordDate, { color: colors.textMuted }]}>
                {new Date(record.bought_at).toLocaleDateString()}
              </Text>
              {record.notes && (
                <Text style={[styles.recordNotes, { color: colors.textMuted }]}>
                  {record.notes}
                </Text>
              )}
            </View>
            <View style={styles.recordRight}>
              <Text style={[styles.recordPrice, { color: colors.textPrimary }]}>
                ${record.price.toFixed(2)}
              </Text>
              {diff !== null && diff !== 0 && (
                <Text
                  style={[
                    styles.recordDiff,
                    { color: diff > 0 ? colors.priceUp : colors.priceDown },
                  ]}
                >
                  {diff > 0 ? '+' : ''}${diff.toFixed(2)}
                </Text>
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  empty: {
    alignItems: 'center',
    paddingVertical: SPACING.xxxl,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  emptyText: {
    marginTop: SPACING.sm,
    fontSize: FONT_SIZE.sm,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: RADIUS.md,
    borderWidth: 1,
    padding: SPACING.base,
    marginBottom: SPACING.base,
  },
  summaryLabel: {
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.medium,
  },
  summaryPrice: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: FONT_WEIGHT.bold,
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: RADIUS.full,
    borderWidth: 1,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    gap: SPACING.xs,
  },
  trendText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.semibold,
  },
  chartWrapper: {
    marginBottom: SPACING.base,
    borderRadius: RADIUS.md,
    overflow: 'hidden',
  },
  historyLabel: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.semibold,
    marginBottom: SPACING.sm,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  recordRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
  },
  recordDate: {
    fontSize: FONT_SIZE.sm,
  },
  recordNotes: {
    fontSize: FONT_SIZE.xs,
    marginTop: 2,
  },
  recordRight: {
    alignItems: 'flex-end',
  },
  recordPrice: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
  },
  recordDiff: {
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.medium,
  },
});
