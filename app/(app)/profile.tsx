import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import { FONT_SIZE, FONT_WEIGHT, RADIUS, SPACING } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { useFamily } from '../../context/FamilyContext';
import { useTheme } from '../../context/ThemeContext';
import { supabase } from '../../lib/supabase';

function getInitials(name: string) {
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
}

export default function ProfileScreen() {
  const { colors, theme, toggleTheme } = useTheme();
  const { profile, session, signOut, refreshProfile } = useAuth();
  const { family } = useFamily();

  const [editing, setEditing] = useState(false);
  const [username, setUsername] = useState(profile?.username ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const isDark = theme === 'dark';

  const handleSave = async () => {
    if (!username.trim()) { setError('Username cannot be empty'); return; }
    if (!profile?.id) { setError('Profile not loaded'); return; }
    setSaving(true);
    const { error: err } = await supabase
      .from('profiles')
      .update({ username: username.trim() })
      .eq('id', profile.id);
    if (err) {
      setError(err.message);
    } else {
      await refreshProfile();
      setEditing(false);
    }
    setSaving(false);
  };

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: signOut },
    ]);
  };

  const AVATAR_BG = colors.primary;

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={colors.textPrimary === '#F0F0F0' ? 'light-content' : 'dark-content'} />


      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Profile</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        <View style={styles.avatarSection}>
          <View style={[styles.avatar, { backgroundColor: AVATAR_BG }]}>
            <Text style={styles.avatarText}>
              {getInitials(profile?.username ?? 'U')}
            </Text>
          </View>
          {!editing && (
            <>
              <Text style={[styles.name, { color: colors.textPrimary }]}>
                {profile?.username}
              </Text>
              {family && (
                <View style={[styles.familyPill, { backgroundColor: colors.primary + '22', borderColor: colors.primary + '44' }]}>
                  <Ionicons name="home-outline" size={12} color={colors.primary} />
                  <Text style={[styles.familyPillText, { color: colors.primary }]}>
                    {' '}{family.name}
                  </Text>
                </View>
              )}
              <TouchableOpacity
                onPress={() => setEditing(true)}
                style={[styles.editBtn, { borderColor: colors.border }]}
              >
                <Ionicons name="pencil-outline" size={14} color={colors.textSecondary} />
                <Text style={[styles.editBtnText, { color: colors.textSecondary }]}> Edit Name</Text>
              </TouchableOpacity>
            </>
          )}
        </View>


        {editing && (
          <Card style={{ marginBottom: SPACING.base }}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Edit Display Name</Text>
            {error ? (
              <Text style={[styles.errorText, { color: colors.danger }]}>{error}</Text>
            ) : null}
            <Input
              value={username}
              onChangeText={(t) => { setUsername(t); setError(''); }}
              placeholder="Your display name"
              leftIcon="person-outline"
              autoFocus
            />
            <View style={styles.editActions}>
              <Button title="Cancel" variant="ghost" onPress={() => { setEditing(false); setUsername(profile?.username ?? ''); }} style={{ flex: 1, marginRight: SPACING.sm }} />
              <Button title="Save" variant="primary" onPress={handleSave} loading={saving} style={{ flex: 1 }} />
            </View>
          </Card>
        )}


        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>APPEARANCE</Text>
        <Card style={{ marginBottom: SPACING.base }}>
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, { backgroundColor: colors.primary + '22' }]}>
                <Ionicons name={isDark ? 'moon' : 'sunny'} size={18} color={colors.primary} />
              </View>
              <View>
                <Text style={[styles.settingTitle, { color: colors.textPrimary }]}>
                  {isDark ? 'Dark Mode' : 'Light Mode'}
                </Text>
                <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>
                  {isDark ? 'Switch to light theme' : 'Switch to dark theme'}
                </Text>
              </View>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: colors.border, true: colors.primary + '88' }}
              thumbColor={isDark ? colors.primary : colors.textMuted}
            />
          </View>
        </Card>


        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>ACCOUNT</Text>
        <Card style={{ marginBottom: SPACING.base }}>
          <View style={[styles.infoRow, { borderBottomColor: colors.border }]}>
            <Ionicons name="mail-outline" size={16} color={colors.textMuted} />
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
              {session?.user?.email || 'No email provided'}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={16} color={colors.textMuted} />
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
              Joined {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : '—'}
            </Text>
          </View>
        </Card>


        {family && (
          <>
            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>FAMILY</Text>
            <Card style={{ marginBottom: SPACING.xl }}>
              <View style={styles.settingRow}>
                <View style={styles.settingLeft}>
                  <View style={[styles.settingIcon, { backgroundColor: colors.accent + '22' }]}>
                    <Ionicons name="people-outline" size={18} color={colors.accent} />
                  </View>
                  <View>
                    <Text style={[styles.settingTitle, { color: colors.textPrimary }]}>{family.name}</Text>
                    <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>
                      Your household
                    </Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
              </View>
            </Card>
          </>
        )}


        <Button
          title="Sign Out"
          variant="danger"
          onPress={handleSignOut}
          fullWidth
          size="lg"
        />
        <View style={{ height: SPACING.xxxl }} />
      </ScrollView>
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
  content: { padding: SPACING.base, paddingTop: SPACING.xl },
  avatarSection: { alignItems: 'center', marginBottom: SPACING.xl },
  avatar: {
    width: 88, height: 88, borderRadius: 44,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  avatarText: { color: '#fff', fontSize: FONT_SIZE.xxl, fontWeight: FONT_WEIGHT.bold },
  name: { fontSize: FONT_SIZE.xl, fontWeight: FONT_WEIGHT.bold, marginBottom: SPACING.xs },
  familyPill: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full, borderWidth: 1,
    marginBottom: SPACING.sm,
  },
  familyPillText: { fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.medium },
  editBtn: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full, borderWidth: 1,
  },
  editBtnText: { fontSize: FONT_SIZE.sm },
  sectionLabel: {
    fontSize: FONT_SIZE.xs, fontWeight: FONT_WEIGHT.bold,
    letterSpacing: 1.2, marginBottom: SPACING.sm,
  },
  sectionTitle: { fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.bold, marginBottom: SPACING.md },
  errorText: { fontSize: FONT_SIZE.sm, marginBottom: SPACING.sm },
  editActions: { flexDirection: 'row', marginTop: SPACING.sm },
  settingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  settingLeft: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, flex: 1 },
  settingIcon: {
    width: 36, height: 36, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  settingTitle: { fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.semibold },
  settingSubtitle: { fontSize: FONT_SIZE.xs, marginTop: 1 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, paddingVertical: SPACING.sm },
  infoLabel: { fontSize: FONT_SIZE.sm },
});
