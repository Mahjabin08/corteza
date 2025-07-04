<template>
  <div id="app" class="h-screen flex flex-col">
    <header class="bg-white shadow-sm">
      <!-- Logo Section -->
      <div class="px-4 py-2 border-b">
        <div class="flex items-center space-x-4">
          <img
            v-if="logoUrl"
            :src="logoUrl"
            alt="Logo"
            class="h-12 w-auto object-contain"
          >
        </div>
      </div>

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
import { computed, inject } from 'vue'
import { RouterView } from 'vue-router'
import { CTopbar, useI18n } from '@cortezaproject/corteza-vue-next'

const { t } = useI18n()

const $Settings = inject('settings')

const logoUrl = computed(() => {
  return $Settings.attachment('ui.mainLogo')
})

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
