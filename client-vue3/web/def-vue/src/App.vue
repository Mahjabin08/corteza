<template>
  <div id="app" class="h-screen flex flex-col">
    <header>
      <CTopbar
        :sidebar-expanded="sidebarExpanded"
        :hide-app-selector="false"
        app-selector-url="../"
        :settings="topbarSettings"
        :labels="topbarLabels"
      >
        <template #title> Test Application Dashboard </template>
        <template #tools>
          <Button label="Tools" size="small" outlined />
        </template>
        <template #right-tools>
          <Button
            :icon="sidebarExpanded ? 'pi pi-angle-left' : 'pi pi-angle-right'"
            text
            @click="sidebarExpanded = !sidebarExpanded"
            :title="sidebarExpanded ? 'Collapse Sidebar' : 'Expand Sidebar'"
          />
        </template>
      </CTopbar>
    </header>

    <main class="flex-1 overflow-hidden">
      <Button label="Show" @click="show()" />

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
import { inject, onMounted, ref } from 'vue'
import { RouterView } from 'vue-router'

const { CTopbar } = components

// Test data for CTopbar
const sidebarExpanded = ref(false)

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

const topbarLabels = ref({
  appMenu: 'App Menu',
  helpForum: 'Help Forum',
  helpDocumentation: 'Documentation',
  helpFeedback: 'Feedback',
  helpVersion: 'Version',
  userSettingsLoggedInAs: 'Logged in as admin@example.com',
  userSettingsProfile: 'Profile',
  userSettingsChangePassword: 'Change Password',
  userSettingsLogout: 'Logout',
  lightTheme: 'Light Theme',
  darkTheme: 'Dark Theme',
})

const $toast = inject('$toast')

onMounted(() => {
  $toast.addToast({
    severity: 'success',
    summary: 'Success',
    detail: 'Message sent',
    life: 3000,
  })
})
</script>
