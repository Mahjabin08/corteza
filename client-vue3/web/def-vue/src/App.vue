<template>
  <div id="app" class="h-screen flex flex-col">
    <header>
      <CTopbar
        :sidebar-expanded="false"
        :settings="topbarSettings"
        :labels="topbarLabels"
      />
    </header>

    <main class="flex-1 overflow-hidden bg-gray-100">
      <RouterView />

      <Menu :model="menuItems" />
    </main>

    <Toast />
  </div>
</template>

<script setup>
import { RouterView } from 'vue-router'
import { CTopbar, useI18n } from '@cortezaproject/corteza-vue-next'

const { t } = useI18n()

const topbarSettings = {
  hideAppSelector: true,
  hideNotifications: true,
  hideHelp: false,
  hideProfile: false,
}

const topbarLabels = {
  appMenu: t('appMenu') || 'Apps',
  helpForum: t('help.forum') || 'Forum',
  helpDocumentation: t('help.documentation') || 'Documentation',
  helpFeedback: t('help.feedback') || 'Feedback',
  helpVersion: t('help.version') || 'Version',
  userSettingsLoggedInAs: t('userSettings.loggedInAs') || 'Logged in as',
  userSettingsProfile: t('userSettings.profile') || 'Profile',
  userSettingsChangePassword: t('userSettings.changePassword') || 'Change Password',
  userSettingsLogout: t('userSettings.logout') || 'Logout',
  lightTheme: t('themes.labels.light') || 'Light',
  darkTheme: t('themes.labels.dark') || 'Dark',
}

const menuItems = [
  {
    label: 'Home',
    icon: 'pi pi-home',
    to: '/',
  },
]
</script>
