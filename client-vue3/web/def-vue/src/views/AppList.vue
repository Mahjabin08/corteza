<template>
  <div class="app-selector flex flex-col h-full py-4 gap-3">
    <div class="flex flex-col justify-center items-center mx-4 my-4">
      <img v-if="logoUrl" :src="logoUrl" class="px-4 max-h-lg max-w-xl w-auto mb-6" alt="Logo" />

      <IconField class="w-full max-w-2xl mx-auto">
        <InputText v-model="query" :placeholder="'Search applications...'" class="w-full" />
        <InputIcon :class="getSearchIconClass()" @click="query = ''" />
      </IconField>
    </div>

    <div v-if="filteredApps.length" class="flex-1 overflow-auto">
      <div class="container-xl mx-auto sm:px-8 2xl:px-48">
        <div class="flex flex-wrap justify-center gap-7 p-5 px-7">
          <a
            v-for="app in filteredApps"
            :key="app.applicationID"
            :href="app.enabled ? app.unify.url : '#'"
            :target="getAppTarget(app)"
            class="block"
            @click="!app.enabled && $event.preventDefault()"
          >
            <Card
              class="cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-200 w-80 flex-shrink-0"
            >
              <template #header>
                <img :src="getAppLogoUrl(app)" :alt="app.unify?.name || app.name" />
              </template>

              <template #title>
                <div class="text-center text-nowrap text-ellipsis overflow-hidden ...">
                  {{ app.unify?.name || app.name }}
                </div>
              </template>
            </Card>
          </a>
        </div>
      </div>
    </div>

    <div v-else class="flex justify-center items-center mt-20 w-full">
      <label class="text-muted-color text-lg">
        {{ query ? 'No applications found' : 'No applications available' }}
      </label>
    </div>
  </div>
</template>

<script>
import { useApplicationsStore } from '@/stores/applications'
import InputText from 'primevue/inputtext'

export default {
  name: 'AppList',

  components: {
    InputText,
  },

  data() {
    return {
      query: '',
      applicationsStore: useApplicationsStore(),
    }
  },

  computed: {
    apps() {
      return this.applicationsStore.unifyOnly
    },

    filteredApps() {
      const query = (this.query || '').toUpperCase()
      return this.query
        ? this.apps.filter(
            (app) =>
              (app.name?.toUpperCase() || '').includes(query) ||
              (app.unify?.name?.toUpperCase() || '').includes(query),
          )
        : this.apps
    },

    logoUrl() {
      // Get logo using Settings attachment helper - same as original Layout.vue
      return this.$Settings.attachment('ui.mainLogo')
    },
  },

  async created() {
    await this.applicationsStore.fetchApplications()
  },

  methods: {
    getAppLogoUrl(app) {
      if (!app.unify?.logo) {
        return 'applications/default-app.png'
      }

      const apiSystem = '/api/system'
      const apiBaseUrl = new URL(this.$SystemAPI.baseURL).toString()

      // Handle uploaded logos
      if (app.unify.logo.startsWith(apiSystem)) {
        return apiBaseUrl.substring(0, apiBaseUrl.length - apiSystem.length) + app.unify.logo
      }

      // Provisioned app logos
      return app.unify.logo
    },

    getAppTarget(app) {
      if (!app.enabled) return '_self'
      return app.unify.url?.includes('jitsi') ? '_blank' : '_self'
    },

    getSearchIconClass() {
      return !this.query
        ? 'pi pi-search text-primary'
        : 'pi pi-times cursor-pointer hover:text-primary'
    },
  },
}
</script>
