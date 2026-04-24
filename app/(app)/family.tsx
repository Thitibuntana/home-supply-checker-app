import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  StatusBar,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useFamily } from '../../context/FamilyContext';
import MemberCard from '../../components/family/MemberCard';
import InviteCodeCard from '../../components/family/InviteCodeCard';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';
import { Profile } from '../../lib/database.types';
import { SPACING, FONT_SIZE, FONT_WEIGHT, RADIUS } from '../../constants/theme';

type Tab = 'members' | 'setup';

export default function FamilyScreen() {
  const { colors } = useTheme();
  const { profile } = useAuth();
  const {
    family,
    members,
    loading,
    isHead,
    createFamily,
    joinFamily,
    leaveFamily,
    kickMember,
    transferHead,
    renameFamily,
    regenerateCode,
  } = useFamily();

  const [tab, setTab] = useState<Tab>('members');
  const [familyName, setFamilyName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [isRenaming, setIsRenaming] = useState(false);
  const [editName, setEditName] = useState('');

  const handleCreate = async () => {
    if (!familyName.trim()) { setError('Family name is required'); return; }
    setActionLoading(true);
    setError('');
    const { error: err } = await createFamily(familyName.trim());
    if (err) setError(err);
    setActionLoading(false);
  };

  const handleJoin = async () => {
    if (!inviteCode.trim()) { setError('Enter an invite code'); return; }
    setActionLoading(true);
    setError('');
    const { error: err } = await joinFamily(inviteCode.trim());
    if (err) setError(err);
    setActionLoading(false);
  };

  const handleLeave = () => {
    Alert.alert(
      'Leave Family',
      isHead
        ? 'You must transfer the head role before leaving.'
        : 'Are you sure you want to leave this family? You will lose access to the shared list.',
      isHead
        ? [{ text: 'OK' }]
        : [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Leave',
              style: 'destructive',
              onPress: async () => {
                const { error: err } = await leaveFamily();
                if (err) Alert.alert('Error', err);
              },
            },
          ]
    );
  };

  const handleKick = async (member: Profile) => {
    const { error: err } = await kickMember(member.id);
    if (err) Alert.alert('Error', err);
  };

  const handleTransfer = async (member: Profile) => {
    const { error: err } = await transferHead(member.id);
    if (err) Alert.alert('Error', err);
  };

  const handleRename = async () => {
    if (!editName.trim() || editName.trim() === family?.name) {
      setIsRenaming(false);
      return;
    }
    setActionLoading(true);
    const { error: err } = await renameFamily(editName.trim());
    if (err) Alert.alert('Error', err);
    setIsRenaming(false);
    setActionLoading(false);
  };


  if (!family) {
    return (
      <View style={[styles.screen, { backgroundColor: colors.background }]}>
        <StatusBar barStyle={colors.textPrimary === '#F0F0F0' ? 'light-content' : 'dark-content'} />
        <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Family</Text>
        </View>


        <View style={[styles.tabRow, { borderBottomColor: colors.border }]}>
          {(['members', 'setup'] as Tab[]).map((t) => (
            <TouchableOpacity
              key={t}
              onPress={() => { setTab(t); setError(''); }}
              style={[
                styles.tabBtn,
                tab === t && { borderBottomColor: colors.primary, borderBottomWidth: 2 },
              ]}
            >
              <Text
                style={[
                  styles.tabText,
                  { color: tab === t ? colors.primary : colors.textSecondary },
                ]}
              >
                {t === 'members' ? '🏠 Create Family' : '🔑 Join Family'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <ScrollView contentContainerStyle={styles.setupContent}>
          <View style={styles.setupHero}>
            <Text style={styles.setupEmoji}>{tab === 'members' ? '🏠' : '🔑'}</Text>
            <Text style={[styles.setupTitle, { color: colors.textPrimary }]}>
              {tab === 'members' ? 'Create Your Family' : 'Join a Family'}
            </Text>
            <Text style={[styles.setupSub, { color: colors.textSecondary }]}>
              {tab === 'members'
                ? 'Start a new household and invite members'
                : 'Enter the invite code from your family head'}
            </Text>
          </View>

          {error ? (
            <View style={[styles.errorBox, { backgroundColor: colors.notBoughtBg, borderColor: colors.danger + '44' }]}>
              <Text style={[styles.errorText, { color: colors.danger }]}>{error}</Text>
            </View>
          ) : null}

          {tab === 'members' ? (
            <>
              <Input
                label="Family / Household Name"
                placeholder="e.g. The Smiths"
                value={familyName}
                onChangeText={(t) => { setFamilyName(t); setError(''); }}
                leftIcon="home-outline"
              />
              <Button
                title="Create Family"
                onPress={handleCreate}
                loading={actionLoading}
                fullWidth
                size="lg"
              />
            </>
          ) : (
            <>
              <Input
                label="Invite Code"
                placeholder="e.g. XK9P2A"
                value={inviteCode}
                onChangeText={(t) => { setInviteCode(t.toUpperCase()); setError(''); }}
                leftIcon="key-outline"
                autoCapitalize="characters"
                maxLength={6}
              />
              <Button
                title="Join Family"
                onPress={handleJoin}
                loading={actionLoading}
                fullWidth
                size="lg"
              />
            </>
          )}
        </ScrollView>
      </View>
    );
  }


  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={colors.textPrimary === '#F0F0F0' ? 'light-content' : 'dark-content'} />
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <View style={{ flex: 1, marginRight: SPACING.md }}>
          <Text style={[styles.headerSub, { color: colors.textSecondary }]}>Your Family</Text>
          {isRenaming ? (
            <TextInput
              value={editName}
              onChangeText={setEditName}
              autoFocus
              onBlur={handleRename}
              onSubmitEditing={handleRename}
              returnKeyType="done"
              editable={!actionLoading}
              style={[styles.headerTitle, { color: colors.textPrimary, padding: 0, margin: 0, marginTop: SPACING.xs, borderBottomWidth: 1, borderBottomColor: colors.primary }]}
            />
          ) : (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={[styles.headerTitle, { color: colors.textPrimary }]} numberOfLines={1}>
                {family.name}
              </Text>
              {isHead && (
                <TouchableOpacity
                  onPress={() => { setEditName(family.name); setIsRenaming(true); }}
                  style={{ padding: SPACING.xs, marginLeft: SPACING.xs }}
                >
                  <Ionicons name="pencil" size={16} color={colors.textSecondary} />
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
        {isHead && (
          <View style={[styles.headBadge, { backgroundColor: colors.monthly + '22', borderColor: colors.monthly + '44' }]}>
            <Ionicons name="star" size={12} color={colors.monthly} />
            <Text style={[styles.headBadgeText, { color: colors.monthly }]}> Head</Text>
          </View>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.familyContent} showsVerticalScrollIndicator={false}>

        <InviteCodeCard
          code={family.invite_code}
          isHead={isHead}
          onRegenerate={regenerateCode}
        />


        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
          MEMBERS ({members.length})
        </Text>
        {members.map((member) => (
          <MemberCard
            key={member.id}
            member={member}
            isHead={member.id === family.head_id}
            isSelf={member.id === profile?.id}
            canManage={isHead}
            onKick={handleKick}
            onTransfer={handleTransfer}
          />
        ))}


        <Button
          title="Leave Family"
          variant="danger"
          onPress={handleLeave}
          fullWidth
          style={{ marginTop: SPACING.xl }}
          size="md"
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xxxl + SPACING.base,
    paddingBottom: SPACING.base,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: FONT_SIZE.xxl, fontWeight: FONT_WEIGHT.bold },
  headerSub: { fontSize: FONT_SIZE.xs, fontWeight: FONT_WEIGHT.medium, letterSpacing: 0.5, textTransform: 'uppercase' },
  headBadge: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full, borderWidth: 1,
  },
  headBadgeText: { fontSize: FONT_SIZE.xs, fontWeight: FONT_WEIGHT.bold },
  tabRow: { flexDirection: 'row', borderBottomWidth: 1 },
  tabBtn: { flex: 1, alignItems: 'center', paddingVertical: SPACING.md },
  tabText: { fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.semibold },
  setupContent: { padding: SPACING.xl },
  setupHero: { alignItems: 'center', marginBottom: SPACING.xl },
  setupEmoji: { fontSize: 56, marginBottom: SPACING.md },
  setupTitle: { fontSize: FONT_SIZE.xxl, fontWeight: FONT_WEIGHT.bold, marginBottom: SPACING.sm },
  setupSub: { fontSize: FONT_SIZE.md, textAlign: 'center', lineHeight: 22 },
  errorBox: {
    borderRadius: RADIUS.sm, borderWidth: 1,
    padding: SPACING.md, marginBottom: SPACING.md,
  },
  errorText: { fontSize: FONT_SIZE.sm },
  sectionTitle: {
    fontSize: FONT_SIZE.xs, fontWeight: FONT_WEIGHT.bold,
    letterSpacing: 1.2, marginBottom: SPACING.sm,
  },
  familyContent: { padding: SPACING.base, paddingBottom: SPACING.xxxl },
});
