<template>
  <v-app>
    <AppHeader />
    <AppSidebar />
    <v-main>
      <v-container fluid class="pa-6">
        <router-view />
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import AppHeader from "@/shared/components/layout/AppHeader.vue";
import AppSidebar from "@/shared/components/layout/AppSidebar.vue";
</script>

<style scoped>
.v-main {
  background-color: #f5f5f5;
}
</style>
