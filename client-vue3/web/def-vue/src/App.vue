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
        <template #title>
          Test Application Dashboard
        </template>
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

    <main class="flex-1 overflow-hidden p-6 bg-gray-50">
      <div class="max-w-4xl mx-auto">
        <Card class="mb-6">
          <template #title>
            <div class="flex items-center gap-2">
              <i class="pi pi-check-circle text-green-500"></i>
              Tailwind + PrimeVue Integration Test
            </div>
          </template>
          <template #content>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="space-y-4">
                <h3 class="text-lg font-semibold text-gray-800">PrimeVue Components</h3>
                <Button label="Click Me" severity="success" class="w-full" />
                <InputText placeholder="Type something..." class="w-full" />
                <Dropdown :options="['Option 1', 'Option 2', 'Option 3']" placeholder="Select option" class="w-full" />
              </div>
              <div class="space-y-4">
                <h3 class="text-lg font-semibold text-gray-800">Tailwind Classes</h3>
                <div class="p-4 bg-blue-100 rounded-lg border-l-4 border-blue-500">
                  <p class="text-blue-800">This uses Tailwind utility classes</p>
                </div>
                <div class="flex gap-2">
                  <span class="px-3 py-1 bg-green-200 text-green-800 rounded-full text-sm">Success</span>
                  <span class="px-3 py-1 bg-yellow-200 text-yellow-800 rounded-full text-sm">Warning</span>
                  <span class="px-3 py-1 bg-red-200 text-red-800 rounded-full text-sm">Error</span>
                </div>
              </div>
            </div>
          </template>
        </Card>
        <RouterView />
      </div>
    </main>

    <Toast />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { RouterView } from 'vue-router'
import { components } from '@cortezaproject/corteza-vue-next'

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
</script>
