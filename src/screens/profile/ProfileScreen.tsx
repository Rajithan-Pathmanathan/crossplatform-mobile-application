import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
  Switch,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { useAuth } from '../../context/AuthContext';
import { StorageService } from '../../services/storage';
import { EditProfileModal } from './EditProfileModal';

export const ProfileScreen: React.FC = () => {
  const { user, logout, activeRole, switchRole } = useAuth();
  const [editModalVisible, setEditModalVisible] = useState<boolean>(false);
  const [logoutModalVisible, setLogoutModalVisible] = useState<boolean>(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(true);
  const [favoriteCount, setFavoriteCount] = useState<number>(0);

  useEffect(() => {
    async function loadStats() {
      const favs = await StorageService.getFavorites();
      setFavoriteCount(favs.length);
    }
    loadStats();
  }, [editModalVisible]);

  const handleLogoutPress = () => {
    setLogoutModalVisible(true);
  };

  const handleConfirmLogout = async () => {
    setLogoutModalVisible(false);
    await logout();
  };

  const handleRoleToggle = async () => {
    const nextRole = activeRole === 'attendee' ? 'organizer' : 'attendee';
    await switchRole(nextRole);
    Alert.alert(
      'Role Switched',
      `You are now in ${nextRole === 'organizer' ? 'Organizer' : 'Attendee'} mode!`
    );
  };

  if (!user) return null;

  const isOrganizer = activeRole === 'organizer';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Profile Card */}
      <View style={styles.profileHeaderCard}>
        <View style={styles.avatarContainer}>
          {user.avatar ? (
            <Image source={{ uri: user.avatar }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarInitials}>
                {user.name.slice(0, 2).toUpperCase()}
              </Text>
            </View>
          )}
          <TouchableOpacity
            style={styles.avatarEditBadge}
            onPress={() => setEditModalVisible(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="pencil" size={14} color={Colors.white} />
          </TouchableOpacity>
        </View>

        <Text style={styles.userName}>{user.name}</Text>
        <Text style={styles.userEmail}>{user.email}</Text>
        <Text style={styles.userPhone}>{user.phone}</Text>

        <View style={[styles.roleBadge, isOrganizer ? styles.organizerBadge : styles.attendeeBadge]}>
          <Ionicons
            name={isOrganizer ? 'briefcase' : 'person'}
            size={13}
            color={isOrganizer ? Colors.secondary : Colors.primary}
            style={{ marginRight: 5 }}
          />
          <Text
            style={[
              styles.roleBadgeText,
              { color: isOrganizer ? Colors.secondary : Colors.primary },
            ]}
          >
            {isOrganizer ? 'EVENT ORGANIZER' : 'EVENT ATTENDEE'}
          </Text>
        </View>
      </View>

      {/* Role Switcher Banner */}
      <View style={styles.roleSwitcherCard}>
        <View style={styles.roleSwitcherLeft}>
          <Ionicons
            name={isOrganizer ? 'swap-horizontal' : 'swap-horizontal'}
            size={24}
            color={Colors.primary}
          />
          <View style={{ marginLeft: 12, flex: 1 }}>
            <Text style={styles.roleSwitcherTitle}>
              Switch to {isOrganizer ? 'Attendee' : 'Organizer'} Mode
            </Text>
            <Text style={styles.roleSwitcherSub}>
              {isOrganizer
                ? 'Switch to explore & book events as an attendee.'
                : 'Switch to create & manage events as a host.'}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={[
            styles.switchRoleButton,
            isOrganizer ? { backgroundColor: Colors.primary } : { backgroundColor: Colors.secondary },
          ]}
          onPress={handleRoleToggle}
          activeOpacity={0.8}
        >
          <Text style={styles.switchRoleBtnText}>Switch</Text>
        </TouchableOpacity>
      </View>

      {/* Account Settings Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account & Preferences</Text>

        {/* Edit Profile Action */}
        <TouchableOpacity
          style={styles.settingRow}
          onPress={() => setEditModalVisible(true)}
          activeOpacity={0.7}
        >
          <View style={styles.settingIconWrap}>
            <Ionicons name="person-circle-outline" size={22} color={Colors.primary} />
          </View>
          <View style={styles.settingTextWrap}>
            <Text style={styles.settingLabel}>Edit Profile Information</Text>
            <Text style={styles.settingSub}>Update name, phone, and avatar</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
        </TouchableOpacity>

        {/* Push Notifications Toggle */}
        <View style={styles.settingRow}>
          <View style={styles.settingIconWrap}>
            <Ionicons name="notifications-outline" size={22} color={Colors.primary} />
          </View>
          <View style={styles.settingTextWrap}>
            <Text style={styles.settingLabel}>In-App & Push Notifications</Text>
            <Text style={styles.settingSub}>Booking reminders and updates</Text>
          </View>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            trackColor={{ false: Colors.border, true: Colors.primary }}
            thumbColor={Colors.white}
          />
        </View>

        {/* Local Storage Info */}
        <View style={styles.settingRow}>
          <View style={styles.settingIconWrap}>
            <Ionicons name="server-outline" size={22} color={Colors.primary} />
          </View>
          <View style={styles.settingTextWrap}>
            <Text style={styles.settingLabel}>Local Storage Cache</Text>
            <Text style={styles.settingSub}>
              {favoriteCount} Bookmarked events stored on device
            </Text>
          </View>
          <View style={styles.cachePill}>
            <Text style={styles.cachePillText}>Active</Text>
          </View>
        </View>
      </View>

      {/* Logout Action */}
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={handleLogoutPress}
        activeOpacity={0.8}
      >
        <Ionicons name="log-out-outline" size={20} color={Colors.error} style={{ marginRight: 8 }} />
        <Text style={styles.logoutText}>Log Out of EventHub</Text>
      </TouchableOpacity>

      <Text style={styles.versionText}>EventHub Mobile • Version 1.0.0 (Expo SDK 57)</Text>

      {/* Edit Profile Modal */}
      <EditProfileModal
        visible={editModalVisible}
        onClose={() => setEditModalVisible(false)}
      />

      {/* Logout Confirmation Modal */}
      <Modal visible={logoutModalVisible} transparent animationType="fade">
        <View style={styles.logoutModalOverlay}>
          <View style={styles.logoutModalCard}>
            <View style={styles.logoutIconBadge}>
              <Ionicons name="log-out" size={28} color={Colors.error} />
            </View>
            <Text style={styles.logoutModalTitle}>Log Out of EventHub?</Text>
            <Text style={styles.logoutModalDesc}>
              You will need to sign in again to book tickets or manage your events.
            </Text>
            <View style={styles.logoutModalButtons}>
              <TouchableOpacity
                style={styles.logoutCancelBtn}
                onPress={() => setLogoutModalVisible(false)}
              >
                <Text style={styles.logoutCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.logoutConfirmBtn}
                onPress={handleConfirmLogout}
              >
                <Text style={styles.logoutConfirmText}>Yes, Log Out</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  contentContainer: {
    padding: 20,
    paddingTop: 30,
    paddingBottom: 40,
  },
  profileHeaderCard: {
    backgroundColor: Colors.surface,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    elevation: 3,
    shadowColor: Colors.cardShadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 10,
    marginBottom: 16,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 14,
  },
  avatarImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
    borderColor: Colors.primaryLight,
  },
  avatarPlaceholder: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: Colors.primary,
  },
  avatarInitials: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.primary,
  },
  avatarEditBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    backgroundColor: Colors.primary,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.surface,
  },
  userName: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: -0.3,
  },
  userEmail: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 3,
  },
  userPhone: {
    fontSize: 13,
    color: Colors.textMuted,
    marginTop: 2,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    marginTop: 12,
  },
  attendeeBadge: {
    backgroundColor: Colors.primaryLight,
  },
  organizerBadge: {
    backgroundColor: Colors.secondaryLight,
  },
  roleBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  roleSwitcherCard: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 20,
    elevation: 2,
  },
  roleSwitcherLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  roleSwitcherTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
  },
  roleSwitcherSub: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  switchRoleButton: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 12,
  },
  switchRoleBtnText: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: '700',
  },
  section: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 20,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
    marginLeft: 6,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 6,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  settingIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: Colors.surfaceVariant,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingTextWrap: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  settingSub: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  cachePill: {
    backgroundColor: Colors.successLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  cachePillText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.success,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.errorLight,
    height: 50,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.error,
    marginBottom: 16,
  },
  logoutText: {
    color: Colors.error,
    fontSize: 15,
    fontWeight: '700',
  },
  versionText: {
    textAlign: 'center',
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 4,
  },
  logoutModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  logoutModalCard: {
    backgroundColor: Colors.surface,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    width: '100%',
    maxWidth: 340,
    elevation: 6,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
  },
  logoutIconBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.errorLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoutModalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  logoutModalDesc: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  logoutModalButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  logoutCancelBtn: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutCancelText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  logoutConfirmBtn: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    backgroundColor: Colors.error,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutConfirmText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.white,
  },
});
