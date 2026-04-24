import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Alert, Share, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { FONT_SIZE, FONT_WEIGHT, RADIUS, SPACING } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';

interface InviteCodeCardProps {
  code: string;
  isHead: boolean;
  onRegenerate: () => Promise<any>;
}

export default function InviteCodeCard({ code, isHead, onRegenerate }: InviteCodeCardProps) {
  const { colors } = useTheme();
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    await Share.share({
      message: `Join our family on Home Supply Checker! Use invite code: ${code}`,
    });
  };

  const handleRegenerate = async () => {
    Alert.alert(
      'Regenerate Code',
      'The old code will stop working immediately. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Regenerate',
          onPress: async () => {
            setLoading(true);
            await onRegenerate();
            setLoading(false);
          },
        },
      ]
    );
  };

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.primary + '15', borderColor: colors.primary + '44' },
      ]}
    >
      <View style={styles.header}>
        <Ionicons name="key-outline" size={18} color={colors.primary} />
        <Text style={[styles.title, { color: colors.primary }]}>Family Invite Code</Text>
      </View>

      <View style={[styles.codeBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.code, { color: colors.textPrimary }]} selectable>
          {code}
        </Text>
      </View>

      <Text style={[styles.hint, { color: colors.textMuted }]}>
        Share this code with people you want to add to your family.
      </Text>

      <View style={styles.actions}>
        <TouchableOpacity
          onPress={handleShare}
          style={[styles.actionBtn, { backgroundColor: colors.primary, flex: 1, marginRight: SPACING.sm }]}
        >
          <Ionicons name="share-outline" size={16} color="#fff" />
          <Text style={styles.actionText}>Share</Text>
        </TouchableOpacity>

        {isHead && (
          <TouchableOpacity
            onPress={handleRegenerate}
            style={[styles.actionBtn, { backgroundColor: colors.surfaceAlt, borderWidth: 1, borderColor: colors.border }]}
            disabled={loading}
          >
            <Ionicons name="refresh-outline" size={16} color={colors.textSecondary} />
            <Text style={[styles.actionText, { color: colors.textSecondary }]}>
              {loading ? 'Regenerating...' : 'New Code'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: RADIUS.lg,
    borderWidth: 1.5,
    padding: SPACING.base,
    marginBottom: SPACING.base,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
  },
  codeBox: {
    borderRadius: RADIUS.md,
    borderWidth: 1,
    paddingVertical: SPACING.lg,
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  code: {
    fontSize: FONT_SIZE.display,
    fontWeight: FONT_WEIGHT.extrabold,
    letterSpacing: 8,
  },
  hint: {
    fontSize: FONT_SIZE.xs,
    marginBottom: SPACING.md,
    lineHeight: 18,
  },
  actions: {
    flexDirection: 'row',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.md,
  },
  actionText: {
    color: '#fff',
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.semibold,
  },
});
