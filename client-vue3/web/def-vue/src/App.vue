<template>
  <div id="app" class="h-screen flex flex-col">
    <header>
      <CTopbar :settings="topbarSettings" :labels="topbarLabels" :hide-app-selector="true" />
    </header>

    <main class="flex-1 overflow-hidden">
      <RouterView />
    </main>

    <Toast
      :pt="{
        root: {
          style: {
            top: 'var(--topbar-height)',
          },
        },
        messageIcon: {
          style: {
            display: 'none',
          },
        },
      }"
    />
  </div>
</template>

<script setup>
import { components } from '@cortezaproject/corteza-vue-next'
import Toast from 'primevue/toast'
import { computed, inject, ref } from 'vue'
import { RouterView } from 'vue-router'

const { CTopbar } = components

const topbarSettings = ref({
  hideAppSelector: false,
  hideNotifications: false,
  hideHelp: false,
  hideProfile: false,
  hideForumLink: false,
  hideDocumentationLink: false,
  hideFeedbackLink: false,
  hideProfileLink: false,
  hideChangePasswordLink: false,
  hideThemeSelector: false,
})

const auth = inject('auth')
const user = computed(() => auth.user)

const topbarLabels = ref({
  appMenu: 'App Menu',
  helpForum: 'Help Forum',
  helpDocumentation: 'Documentation',
  helpFeedback: 'Feedback',
  helpVersion: 'Version',
  userSettingsLoggedInAs: `Logged in as ${user.value?.email}`,
  userSettingsProfile: 'Profile',
  userSettingsChangePassword: 'Change Password',
  userSettingsLogout: 'Logout',
  lightTheme: 'Light Theme',
  darkTheme: 'Dark Theme',
})
</script>
