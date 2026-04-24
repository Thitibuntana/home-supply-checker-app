import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { useTheme } from '../../context/ThemeContext';
import { CATEGORIES } from '../../constants/theme';
import { RADIUS, SPACING, FONT_SIZE, FONT_WEIGHT } from '../../constants/theme';

interface AddItemModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (data: {
    name: string;
    category: string;
    frequency: 'weekly' | 'monthly';
  }) => Promise<any>;
}

const CUSTOM_CATEGORY_PLACEHOLDER = '__custom__';

export default function AddItemModal({ visible, onClose, onAdd }: AddItemModalProps) {
  const { colors } = useTheme();
  const [name, setName] = useState('');
  const [category, setCategory] = useState<string>(CATEGORIES[0]);
  const [customCategory, setCustomCategory] = useState('');
  const [frequency, setFrequency] = useState<'weekly' | 'monthly'>('weekly');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAdd = async () => {
    if (!name.trim()) {
      setError('Item name is required');
      return;
    }
    const finalCategory =
      category === CUSTOM_CATEGORY_PLACEHOLDER
        ? customCategory.trim() || 'Other'
        : category;
    setLoading(true);
    setError('');
    await onAdd({ name: name.trim(), category: finalCategory, frequency });
    setLoading(false);
    setName('');
    setCategory(CATEGORIES[0]);
    setCustomCategory('');
    setFrequency('weekly');
    onClose();
  };

  return (
    <Modal visible={visible} onClose={onClose} title="Add Supply Item">
      <Input
        label="Item Name"
        placeholder="e.g. Whole Milk"
        value={name}
        onChangeText={(t) => { setName(t); setError(''); }}
        leftIcon="bag-add-outline"
        error={error}
        autoFocus
      />


      <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Category</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
      >
        {[...CATEGORIES, 'Custom'].map((cat) => {
          const val = cat === 'Custom' ? CUSTOM_CATEGORY_PLACEHOLDER : cat;
          const active = category === val;
          return (
            <TouchableOpacity
              key={cat}
              onPress={() => setCategory(val)}
              style={[
                styles.chip,
                {
                  backgroundColor: active ? colors.primary : colors.surfaceAlt,
                  borderColor: active ? colors.primary : colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.chipText,
                  { color: active ? '#fff' : colors.textSecondary },
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {category === CUSTOM_CATEGORY_PLACEHOLDER && (
        <Input
          label="Custom Category"
          placeholder="e.g. Spices"
          value={customCategory}
          onChangeText={setCustomCategory}
          leftIcon="create-outline"
        />
      )}


      <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Frequency</Text>
      <View style={styles.frequencyRow}>
        {(['weekly', 'monthly'] as const).map((f) => {
          const active = frequency === f;
          const fColor = f === 'weekly' ? colors.weekly : colors.monthly;
          const fBg = f === 'weekly' ? colors.weeklyBg : colors.monthlyBg;
          return (
            <TouchableOpacity
              key={f}
              onPress={() => setFrequency(f)}
              style={[
                styles.freqChip,
                {
                  backgroundColor: active ? fBg : colors.surfaceAlt,
                  borderColor: active ? fColor : colors.border,
                  flex: 1,
                  marginRight: f === 'weekly' ? SPACING.sm : 0,
                },
              ]}
            >
              <Text
                style={[
                  styles.freqText,
                  { color: active ? fColor : colors.textSecondary },
                ]}
              >
                {f === 'weekly' ? '📅 Weekly' : '🗓️ Monthly'}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Button
        title="Add Item"
        onPress={handleAdd}
        loading={loading}
        fullWidth
        style={{ marginTop: SPACING.lg }}
      />
    </Modal>
  );
}

const styles = StyleSheet.create({
  sectionLabel: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.medium,
    marginBottom: SPACING.sm,
    letterSpacing: 0.3,
  },
  scroll: {
    marginBottom: SPACING.base,
  },
  scrollContent: {
    paddingRight: SPACING.base,
  },
  chip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    borderWidth: 1.5,
    marginRight: SPACING.sm,
  },
  chipText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.medium,
  },
  frequencyRow: {
    flexDirection: 'row',
    marginBottom: SPACING.base,
  },
  freqChip: {
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  freqText: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semibold,
  },
});
