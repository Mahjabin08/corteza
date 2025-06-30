<template>
  <div class="header-navigation flex items-center py-2 px-3 gap-2">
    <div
      class="sidebar-spacer"
      :class="{ 'expanded': sidebarExpanded }"
    />

    <h2 class="title mb-0 flex-grow">
      <slot name="title" />
    </h2>

    <div class="tools-wrapper ml-auto">
      <slot name="tools" />
    </div>

    <div class="flex items-center ml-auto gap-1">
      <Button
        v-if="!hideAppSelector && !settings.hideAppSelector"
        data-test-id="app-selector"
        severity="secondary"
        text
        :label="labels.appMenu"
        @click="navigateToAppSelector"
        class="text-gray-700 border-0 px-1"
      />

      <slot name="right-tools" />

      <!-- Notification Button Placeholder -->
      <Button
        v-if="!settings.hideNotifications"
        icon="pi pi-bell"
        severity="secondary"
        class="nav-icon"
      />

      <!-- Help Dropdown -->
      <Menu
        v-if="!settings.hideHelp"
        ref="helpMenu"
        :model="helpMenuItems"
        :popup="true"
        class="topbar-dropdown-menu"
      />
      <Button
        v-if="!settings.hideHelp"
        data-test-id="dropdown-helper"
        icon="pi pi-question-circle"
        severity="secondary"
        class="nav-icon"
        @click="toggleHelpMenu"
      />

      <!-- User Profile Dropdown -->
      <Menu
        v-if="!settings.hideProfile"
        ref="profileMenu"
        :model="profileMenuItems"
        :popup="true"
        class="topbar-dropdown-menu"
      />
      <Button
        v-if="!settings.hideProfile"
        data-test-id="dropdown-profile"
        severity="secondary"
        class="nav-user-icon"
        @click="toggleProfileMenu"
      >
        <div
          v-if="avatarExists"
          class="avatar"
          :style="{ 'background-image': `url(${profileAvatarUrl})` }"
        />
        <i v-else class="pi pi-user" />
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, defineProps, inject } from 'vue'
import { useApiClients } from '../composables/useApiClients'
import Button from 'primevue/button'
import Menu from 'primevue/menu'

interface TopbarSettings {
  hideAppSelector?: boolean
  hideNotifications?: boolean
  hideHelp?: boolean
  hideProfile?: boolean
  hideForumLink?: boolean
  hideDocumentationLink?: boolean
  hideFeedbackLink?: boolean
  hideProfileLink?: boolean
  hideChangePasswordLink?: boolean
  hideThemeSelector?: boolean
  helpLinks?: Array<{ handle: string; url: string; newTab?: boolean }>
  profileLinks?: Array<{ handle: string; url: string; newTab?: boolean }>
}

interface TopbarLabels {
  appMenu: string
  helpForum: string
  helpDocumentation: string
  helpFeedback: string
  helpVersion: string
  userSettingsLoggedInAs: string
  userSettingsProfile: string
  userSettingsChangePassword: string
  userSettingsLogout: string
  lightTheme: string
  darkTheme: string
}

const props = defineProps<{
  sidebarExpanded: boolean
  hideAppSelector?: boolean
  appSelectorURL?: string
  settings: TopbarSettings
  labels: TopbarLabels
}>()

// Composables
const auth = inject('auth') as any
const { SystemAPI } = useApiClients()

// Refs
const helpMenu = ref()
const profileMenu = ref()
const currentTheme = ref('light')

// Computed
const userProfileURL = computed(() => {
  // Will need to implement auth access
  return '/auth/profile' // placeholder
})

const changePasswordURL = computed(() => {
  return '/auth/change-password' // placeholder
})

const documentationURL = computed(() => {
  // Simple version without VERSION access
  return 'https://docs.cortezaproject.org'
})

const helpLinks = computed(() => {
  const { helpLinks = [] } = props.settings || {}
  return (helpLinks || []).filter(({ handle, url }) => handle && url)
})

const profileLinks = computed(() => {
  const { profileLinks = [] } = props.settings || {}
  return (profileLinks || []).filter(({ handle, url }) => handle && url)
})

const frontendVersion = computed(() => {
  return '2025.9.0' // placeholder
})

const profileAvatarUrl = computed(() => {
  // Will need proper auth user access
  return '/api/system/attachment/avatar/0/original/profile-photo-avatar'
})

const avatarExists = computed(() => {
  // Will need proper auth user access
  return false // placeholder
})

const themes = computed(() => [
  { id: 'light', label: props.labels.lightTheme },
  { id: 'dark', label: props.labels.darkTheme },
])

// Menu items
const helpMenuItems = computed(() => {
  const items: any[] = []

  // Custom help links
  helpLinks.value.forEach(link => {
    items.push({
      label: link.handle,
      url: link.url,
      target: link.newTab ? '_blank' : undefined
    })
  })

  // Standard help links
  if (!props.settings.hideForumLink) {
    items.push({
      label: props.labels.helpForum,
      url: 'https://forum.cortezaproject.org/',
      target: '_blank'
    })
  }

  if (!props.settings.hideDocumentationLink) {
    items.push({
      label: props.labels.helpDocumentation,
      url: documentationURL.value,
      target: '_blank'
    })
  }

  if (!props.settings.hideFeedbackLink) {
    items.push({
      label: props.labels.helpFeedback,
      url: 'mailto:info@cortezaproject.org',
      target: '_blank'
    })
  }

  if (items.length > 0) {
    items.push({ separator: true })
  }

  items.push({
    label: `${props.labels.helpVersion}\n${frontendVersion.value}`,
    disabled: true
  })

  return items
})

const profileMenuItems = computed(() => {
  const items: any[] = []

  // User info header
  items.push({
    label: props.labels.userSettingsLoggedInAs,
    disabled: true,
    class: 'text-muted'
  })

  items.push({ separator: true })

  // Custom profile links
  profileLinks.value.forEach(link => {
    items.push({
      label: link.handle,
      url: link.url,
      target: link.newTab ? '_blank' : undefined
    })
  })

  // Standard profile links
  if (!props.settings.hideProfileLink) {
    items.push({
      label: props.labels.userSettingsProfile,
      url: userProfileURL.value,
      target: '_blank'
    })
  }

  if (!props.settings.hideChangePasswordLink) {
    items.push({
      label: props.labels.userSettingsChangePassword,
      url: changePasswordURL.value,
      target: '_blank'
    })
  }

  // Theme selector
  if (!props.settings.hideThemeSelector) {
    items.push({
      label: 'Theme',
      items: themes.value.map(theme => ({
        label: theme.label,
        command: () => saveThemeMode(theme.id),
        disabled: currentTheme.value === theme.id
      }))
    })
  }

  items.push({ separator: true })

  // Logout
  items.push({
    label: props.labels.userSettingsLogout,
    command: () => logout()
  })

  return items
})

// Methods
const navigateToAppSelector = () => {
  window.location.href = props.appSelectorURL || '../'
}

const toggleHelpMenu = (event: Event) => {
  helpMenu.value?.toggle(event)
}

const toggleProfileMenu = (event: Event) => {
  profileMenu.value?.toggle(event)
}

const saveThemeMode = async (theme: string) => {
  currentTheme.value = theme
  document.getElementsByTagName('html')[0].setAttribute('data-color-mode', theme)
  // TODO: Save theme to user profile via API
}

const logout = () => {
  auth.logout()
}
</script>

<style lang="scss" scoped>
$nav-icon-size: calc(var(--topbar-height, 60px) - 24px);
$nav-user-icon-size: calc(var(--topbar-height, 60px) - 16px);

.nav-icon {
  width: $nav-icon-size;
  height: $nav-icon-size;
}

.nav-user-icon {
  min-width: $nav-user-icon-size;
  min-height: $nav-user-icon-size;
}

.header-navigation {
  width: 100vw;
  min-height: var(--topbar-height, 60px);
  background-color: var(--topbar-bg, #ffffff);

  .sidebar-spacer {
    display: none;
    min-width: calc(var(--sidebar-width, 240px) - 60px);

    &.expanded {
      display: block;
    }
  }
}

.avatar {
  border-radius: 50%;
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center;
  width: 32px;
  height: 32px;

  &:hover {
    opacity: 0.8;
    transition: opacity .25s ease-in-out;
  }
}

.title {
  display: flex;
  align-items: center;
  min-height: $nav-user-icon-size;
  padding-left: 47px;

  > * {
    padding: 0.25rem 0;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 3;
    line-clamp: 3;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

.tools-wrapper {
  flex-grow: 1;

  > * {
    display: flex;
    justify-content: end;
    align-items: center;
    flex-wrap: wrap;
  }
}
</style>

<style lang="scss">
.topbar-dropdown-menu {
  z-index: 1100;
}
</style>