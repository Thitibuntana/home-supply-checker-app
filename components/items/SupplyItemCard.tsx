import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SectionList,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SupplyItem } from '../../lib/database.types';
import Badge from '../ui/Badge';
import { useTheme } from '../../context/ThemeContext';
import { RADIUS, SPACING, FONT_SIZE, FONT_WEIGHT } from '../../constants/theme';

interface SupplyItemCardProps {
  item: SupplyItem;
  onToggleBought: (item: SupplyItem) => void;
  onDelete: (item: SupplyItem) => void;
  boughtByName?: string;
}

export default function SupplyItemCard({
  item,
  onToggleBought,
  onDelete,
  boughtByName,
}: SupplyItemCardProps) {
  const { colors } = useTheme();

  const handleDelete = () => {
    Alert.alert('Delete Item', `Remove "${item.name}" from the list?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => onDelete(item),
      },
    ]);
  };

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: item.is_bought ? colors.bought + '44' : colors.border,
          borderLeftColor: item.is_bought ? colors.bought : colors.notBought,
        },
      ]}
    >

      <TouchableOpacity
        onPress={() => onToggleBought(item)}
        style={[
          styles.checkCircle,
          {
            backgroundColor: item.is_bought ? colors.boughtBg : colors.notBoughtBg,
            borderColor: item.is_bought ? colors.bought : colors.notBought,
          },
        ]}
      >
        <Ionicons
          name={item.is_bought ? 'checkmark' : 'close'}
          size={18}
          color={item.is_bought ? colors.bought : colors.notBought}
        />
      </TouchableOpacity>


      <View style={styles.content}>
        <Text
          style={[
            styles.name,
            {
              color: item.is_bought ? colors.textSecondary : colors.textPrimary,
              textDecorationLine: item.is_bought ? 'line-through' : 'none',
            },
          ]}
          numberOfLines={1}
        >
          {item.name}
        </Text>
        <View style={styles.badges}>
          <Badge
            label={item.frequency.charAt(0).toUpperCase() + item.frequency.slice(1)}
            variant={item.frequency === 'weekly' ? 'weekly' : 'monthly'}
            size="sm"
          />
          <Badge
            label={item.is_bought ? 'Bought' : 'Not Bought'}
            variant={item.is_bought ? 'bought' : 'notBought'}
            size="sm"
            style={{ marginLeft: SPACING.xs }}
          />
        </View>
        {item.is_bought && boughtByName && (
          <Text style={[styles.boughtBy, { color: colors.textMuted }]}>
            ✓ by {boughtByName}
          </Text>
        )}
      </View>


      <TouchableOpacity onPress={handleDelete} style={styles.deleteBtn}>
        <Ionicons name="trash-outline" size={18} color={colors.textMuted} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderLeftWidth: 4,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
  },
  checkCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  content: {
    flex: 1,
  },
  name: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semibold,
    marginBottom: SPACING.xs,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  boughtBy: {
    fontSize: FONT_SIZE.xs,
    marginTop: SPACING.xs,
  },
  deleteBtn: {
    padding: SPACING.sm,
    marginLeft: SPACING.xs,
  },
});
