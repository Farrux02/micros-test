<template>
  <v-app-bar app color="primary" dark elevation="4">

    <v-toolbar-title class="d-flex align-center">
      <v-icon class="mr-2">mdi-office-building</v-icon>
      <span class="font-weight-bold">Управление персоналом</span>
    </v-toolbar-title>

    <v-spacer />

    <v-menu offset-y>
      <template v-slot:activator="{ props }">
        <v-btn icon v-bind="props">
          <v-avatar size="36">
            <v-icon>mdi-account-circle</v-icon>
          </v-avatar>
        </v-btn>
      </template>

      <v-list>
        <v-list-item>
          <v-list-item-title>Администратор</v-list-item-title>
          <v-list-item-subtitle>admin@company.com</v-list-item-subtitle>
        </v-list-item>

        <v-divider />

        <v-list-item @click="logout">
          <v-list-item-title>
            <v-icon class="mr-2">mdi-logout</v-icon>
            Выйти
          </v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
  </v-app-bar>
</template>

<script setup>
import { inject } from "vue";

const toggleSidebar = inject("toggleSidebar");

const logout = () => {
  console.log("Logout clicked");
};
</script>

<style scoped>
.v-toolbar-title {
  font-size: 1.2rem;
}
</style>
