import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { useTheme } from '../../context/ThemeContext';
import { SupplyItem } from '../../lib/database.types';
import { SPACING, FONT_SIZE, FONT_WEIGHT } from '../../constants/theme';

interface PriceEntryModalProps {
  visible: boolean;
  item: SupplyItem | null;
  onClose: () => void;
  onConfirm: (price: number, notes?: string) => Promise<void>;
}

export default function PriceEntryModal({
  visible,
  item,
  onClose,
  onConfirm,
}: PriceEntryModalProps) {
  const { colors } = useTheme();
  const [price, setPrice] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleConfirm = async () => {
    const parsed = parseFloat(price);
    if (isNaN(parsed) || parsed < 0) {
      setError('Please enter a valid price (or 0 if free)');
      return;
    }
    setLoading(true);
    setError('');
    await onConfirm(parsed, notes.trim() || undefined);
    setLoading(false);
    setPrice('');
    setNotes('');
    onClose();
  };

  const handleSkip = async () => {
    setLoading(true);
    await onConfirm(0, undefined);
    setLoading(false);
    setPrice('');
    setNotes('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title={`Mark as Bought${item ? ': ' + item.name : ''}`}
    >
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        Record the price you paid to track price changes over time.
      </Text>

      <Input
        label="Price Paid"
        placeholder="0.00"
        value={price}
        onChangeText={(t) => { setPrice(t); setError(''); }}
        keyboardType="decimal-pad"
        leftIcon="pricetag-outline"
        error={error}
        autoFocus
      />

      <Input
        label="Notes (optional)"
        placeholder="e.g. On sale at Walmart"
        value={notes}
        onChangeText={setNotes}
        leftIcon="create-outline"
      />

      <View style={styles.buttonRow}>
        <Button
          title="Skip"
          variant="ghost"
          onPress={handleSkip}
          loading={loading}
          style={{ flex: 1, marginRight: SPACING.sm }}
        />
        <Button
          title="Confirm"
          variant="success"
          onPress={handleConfirm}
          loading={loading}
          style={{ flex: 1 }}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  subtitle: {
    fontSize: FONT_SIZE.sm,
    lineHeight: 20,
    marginBottom: SPACING.lg,
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: SPACING.base,
  },
});
