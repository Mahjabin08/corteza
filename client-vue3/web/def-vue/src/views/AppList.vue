<template>
  <!-- Loading overlay -->
  <div v-if="loading" class="fixed inset-0 bg-white flex items-center justify-center z-50">
    <img
      v-if="logoUrl"
      :src="logoUrl"
      class="max-h-lg max-w-xl w-auto animate-pulse"
      alt="Loading..."
    />
  </div>

  <div class="app-selector flex flex-col h-full py-4 gap-3">
    <div class="flex flex-col justify-center items-center mx-4 my-4">
      <img v-if="logoUrl" :src="logoUrl" class="px-4 max-h-lg max-w-xl w-auto mb-6" alt="Logo" />

      <CInputSearch
        v-model="query"
        placeholder="Search applications..."
        class="w-full max-w-2xl mx-auto"
      />
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
              class="cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-200 w-80"
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

<script setup>
import { useApplicationsStore } from '@/stores/applications'
import { components } from '@cortezaproject/corteza-vue-next'
import { computed, getCurrentInstance, onMounted, ref } from 'vue'
const { CInputSearch } = components

const query = ref('')
const loading = ref(true)
const applicationsStore = useApplicationsStore()

const instance = getCurrentInstance()
const $Settings = instance.appContext.config.globalProperties.$Settings
const $SystemAPI = instance.appContext.config.globalProperties.$SystemAPI

const apps = computed(() => {
  return applicationsStore.unifyOnly
})

const filteredApps = computed(() => {
  const queryValue = (query.value || '').toUpperCase()
  return query.value
    ? apps.value.filter(
        app =>
          (app.name?.toUpperCase() || '').includes(queryValue) ||
          (app.unify?.name?.toUpperCase() || '').includes(queryValue),
      )
    : apps.value
})

const logoUrl = computed(() => {
  return $Settings.attachment('ui.mainLogo')
})

const getAppLogoUrl = app => {
  if (!app.unify?.logo) {
    return 'applications/default-app.png'
  }

  const apiSystem = '/api/system'
  const apiBaseUrl = new URL($SystemAPI.baseURL).toString()

  if (app.unify.logo.startsWith(apiSystem)) {
    return apiBaseUrl.substring(0, apiBaseUrl.length - apiSystem.length) + app.unify.logo
  }

  return app.unify.logo
}

const getAppTarget = app => {
  if (!app.enabled) return '_self'
  return app.unify.url?.includes('jitsi') ? '_blank' : '_self'
}

onMounted(() => {
  const fetchPromise = applicationsStore.fetchApplications()
  const delayPromise = new Promise(resolve => setTimeout(resolve, 2000))

  Promise.all([fetchPromise, delayPromise]).finally(() => {
    loading.value = false
  })
})
</script>
