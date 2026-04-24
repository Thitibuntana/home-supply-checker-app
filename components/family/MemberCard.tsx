import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Profile } from '../../lib/database.types';
import { useTheme } from '../../context/ThemeContext';
import { RADIUS, SPACING, FONT_SIZE, FONT_WEIGHT } from '../../constants/theme';

interface MemberCardProps {
  member: Profile;
  isHead: boolean;
  isSelf: boolean;
  canManage: boolean;
  onKick: (member: Profile) => void;
  onTransfer: (member: Profile) => void;
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

const AVATAR_COLORS = [
  '#6C63FF', '#FF6584', '#4FC3F7', '#FFB74D', '#4CAF50',
  '#E91E8C', '#00BCD4', '#FF7043',
];

function avatarColor(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export default function MemberCard({
  member,
  isHead,
  isSelf,
  canManage,
  onKick,
  onTransfer,
}: MemberCardProps) {
  const { colors } = useTheme();
  const bg = avatarColor(member.id);

  const handleKick = () => {
    Alert.alert(
      'Remove Member',
      `Remove ${member.username} from the family?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => onKick(member) },
      ]
    );
  };

  const handleTransfer = () => {
    Alert.alert(
      'Transfer Head',
      `Make ${member.username} the new family head? You will lose head privileges.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Transfer', onPress: () => onTransfer(member) },
      ]
    );
  };

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>

      <View style={[styles.avatar, { backgroundColor: bg }]}>
        <Text style={styles.avatarText}>{getInitials(member.username)}</Text>
      </View>


      <View style={styles.info}>
        <View style={styles.nameRow}>
          <Text style={[styles.name, { color: colors.textPrimary }]} numberOfLines={1}>
            {member.username}
          </Text>
          {isSelf && (
            <View style={[styles.selfBadge, { backgroundColor: colors.primary + '22' }]}>
              <Text style={[styles.selfText, { color: colors.primary }]}>You</Text>
            </View>
          )}
        </View>
        {isHead && (
          <View style={styles.headRow}>
            <Ionicons name="star" size={12} color={colors.monthly} />
            <Text style={[styles.headText, { color: colors.monthly }]}> Family Head</Text>
          </View>
        )}
      </View>


      {canManage && !isSelf && !isHead && (
        <View style={styles.actions}>
          <TouchableOpacity
            onPress={handleTransfer}
            style={[styles.actionBtn, { backgroundColor: colors.primary + '22' }]}
          >
            <Ionicons name="swap-horizontal" size={16} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleKick}
            style={[styles.actionBtn, { backgroundColor: colors.danger + '22', marginLeft: SPACING.xs }]}
          >
            <Ionicons name="person-remove-outline" size={16} color={colors.danger} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: RADIUS.md,
    borderWidth: 1,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  avatarText: {
    color: '#FFF',
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
  },
  info: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  name: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semibold,
  },
  selfBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
  },
  selfText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.bold,
  },
  headRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  headText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.medium,
  },
  actions: {
    flexDirection: 'row',
  },
  actionBtn: {
    padding: SPACING.sm,
    borderRadius: RADIUS.sm,
  },
});
