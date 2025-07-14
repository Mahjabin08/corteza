<template>
  <div class="header-navigation flex flex-wrap items-center py-2 px-3 gap-2">
    <div
      class="sidebar-spacer"
      :class="{ block: sidebarExpanded, hidden: !sidebarExpanded }"
    />

    <h2 class="title flex items-center pl-12 mb-0">
      <slot name="title" />
    </h2>

    <div class="tools-wrapper ml-auto">
      <slot name="tools" />
    </div>

    <div class="flex items-center gap-1">
      <Button
        v-if="!hideAppSelector && !settings?.hideAppSelector"
        data-test-id="app-selector"
        :href="appSelectorURL"
        text
        class="text-gray-800 border-0 px-1"
      >
        {{ labels.appMenu }}
      </Button>

      <slot name="right-tools" />

      <div v-if="!settings?.hideNotifications" class="notifications">
        <slot name="notifications" />
      </div>

      <div v-if="!settings?.hideHelp" class="help-dropdown">
        <Button
          ref="helpMenuRef"
          data-test-id="dropdown-helper"
          text
          rounded
          icon="pi pi-question-circle"
          size="large"
          class="text-color"
          @click="toggleHelpMenu"
        />

        <Menu
          ref="helpMenu"
          :model="helpMenuItems"
          :popup="true"
          class="mt-2"
        />
      </div>

      <div v-if="!settings?.hideProfile" class="profile-dropdown">
        <Button
          ref="profileMenuRef"
          data-test-id="dropdown-profile"
          text
          rounded
          icon="pi pi-user"
          size="large"
          class="text-color"
          @click="toggleProfileMenu"
        />

        <TieredMenu ref="profileMenu" :model="profileMenuItems" popup />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, inject, ref, watch } from "vue";

const props = defineProps({
  sidebarExpanded: {
    type: Boolean,
    default: false,
  },
  hideAppSelector: {
    type: Boolean,
    default: false,
  },
  appSelectorURL: {
    type: String,
    default: "../",
  },
  settings: {
    type: Object,
    required: true,
  },
  labels: {
    type: Object,
    required: true,
  },
});

const auth = inject("auth");

const helpMenuRef = ref();
const helpMenu = ref();
const profileMenuRef = ref();
const profileMenu = ref();
const currentTheme = ref("light");

const documentationURL = computed(() => {
  const [year, month] = VERSION.split(".");
  return `https://docs.cortezaproject.org/corteza-docs/${year}.${month}/index.html`;
});

const helpLinks = computed(() => {
  const { helpLinks = [] } = props.settings || {};
  return (helpLinks || []).filter(({ handle, url }) => handle && url);
});

const profileLinks = computed(() => {
  const { profileLinks = [] } = props.settings || {};
  return (profileLinks || []).filter(({ handle, url }) => handle && url);
});

const buildVersion = computed(() => {
  return VERSION;
});

const themes = computed(() => [
  {
    id: "light",
    label: props.labels.lightTheme,
  },
  {
    id: "dark",
    label: props.labels.darkTheme,
  },
]);

const helpMenuItems = computed(() => {
  const items = [];

  helpLinks.value.forEach((helpLink) => {
    items.push({
      label: helpLink.handle,
      url: helpLink.url,
      target: helpLink.newTab ? "_blank" : "",
    });
  });

  if (!props.settings?.hideForumLink) {
    items.push({
      label: props.labels.helpForum,
      url: "https://forum.cortezaproject.org/",
      target: "_blank",
    });
  }

  if (!props.settings?.hideDocumentationLink) {
    items.push({
      label: props.labels.helpDocumentation,
      url: documentationURL.value,
      target: "_blank",
    });
  }

  if (!props.settings?.hideFeedbackLink) {
    items.push({
      label: props.labels.helpFeedback,
      url: "mailto:info@cortezaproject.org",
      target: "_blank",
    });
  }

  if (items.length > 0) {
    items.push({ separator: true });
  }

  items.push({
    label: buildVersion.value,
    disabled: true,
    class: "text-sm",
  });

  return items;
});

const profileMenuItems = computed(() => {
  const items = [];

  items.push({
    label: props.labels.userSettingsLoggedInAs,
    disabled: true,
    class: "text-sm text-muted-color",
  });

  profileLinks.value.forEach((profileLink) => {
    items.push({
      label: profileLink.handle,
      url: profileLink.url,
      target: profileLink.newTab ? "_blank" : "",
    });
  });

  if (!props.settings?.hideProfileLink) {
    items.push({
      label: props.labels.userSettingsProfile,
      url: auth.cortezaAuthURL,
      target: "_blank",
    });
  }

  if (!props.settings?.hideChangePasswordLink) {
    items.push({
      label: props.labels.userSettingsChangePassword,
      url: `${auth.cortezaAuthURL}/change-password`,
      target: "_blank",
    });
  }

  if (!props.settings?.hideThemeSelector) {
    items.push({
      label: "Theme",
      items: themes.value.map((theme) => ({
        label: theme.label,
        disabled: currentTheme.value === theme.id,
        command: () => saveThemeMode(theme.id),
      })),
    });
  }

  items.push({ separator: true });

  items.push({
    label: props.labels.userSettingsLogout,
    command: () => logout(),
  });

  return items;
});

const toggleHelpMenu = (event) => {
  helpMenu.value.toggle(event);
};

const toggleProfileMenu = (event) => {
  profileMenu.value.toggle(event);
};

const saveThemeMode = async (theme) => {
  currentTheme.value = theme;

  if (window.$auth?.user?.meta) {
    window.$auth.user.meta.theme = theme;

    try {
      await window.$SystemAPI?.userUpdate(window.$auth.user);
      document
        .getElementsByTagName("html")[0]
        .setAttribute("data-color-mode", theme);
    } catch (error) {
      console.error(error);
    }
  }
};

const logout = () => {
  auth.logout();
};

watch(
  () => window.$auth?.user?.meta?.theme,
  (theme) => {
    if (theme) {
      currentTheme.value = theme;
    }
  },
  { immediate: true }
);
</script>

<style scoped>
.header-navigation {
  width: 100vw;
  min-height: var(--topbar-height);
  background-color: var(--topbar-bg);
}

.sidebar-spacer {
  min-width: calc(var(--sidebar-width) - 60px);
}

.nav-icon {
  width: calc(var(--topbar-height) - 24px);
  height: calc(var(--topbar-height) - 24px);
}

.title > :deep(*) {
  padding: 0.25rem 0;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tools-wrapper > :deep(*) {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  flex-wrap: wrap;
}
</style>
