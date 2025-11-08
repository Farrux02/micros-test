<template>
  <v-navigation-drawer
    v-model="drawer"
    app
    permanent
    color="grey-lighten-5"
    width="280"
  >
    <template v-slot:prepend>
      <v-list-item class="pa-4">
        <v-list-item-avatar>
          <v-icon color="primary" size="32">mdi-domain</v-icon>
        </v-list-item-avatar>
        <v-list-item-content>
          <v-list-item-title class="font-weight-bold text-h6">
            Система управления
          </v-list-item-title>
        </v-list-item-content>
      </v-list-item>
    </template>

    <v-divider />

    <v-list nav>
      <v-list-item
        v-for="item in menuItems"
        :key="item.title"
        :to="item.to"
        :prepend-icon="item.icon"
        :title="item.title"
        :subtitle="item.subtitle"
        class="mb-1"
        rounded="xl"
        exact
      />
    </v-list>

    <template v-slot:append>
      <v-divider />
      <v-list>
        <v-list-item
          prepend-icon="mdi-cog"
          title="Настройки"
          @click="openSettings"
        />
        <v-list-item
          prepend-icon="mdi-help-circle"
          title="Помощь"
          @click="openHelp"
        />
      </v-list>
    </template>
  </v-navigation-drawer>
</template>

<script setup>
import { ref, provide } from "vue";
import { useRoute } from "vue-router";

const drawer = ref(true);
const route = useRoute();

const menuItems = [
  {
    title: "Сотрудники",
    subtitle: "Управление персоналом",
    icon: "mdi-account-group",
    to: "/employees",
  },
  {
    title: "Документы",
    subtitle: "Документооборот",
    icon: "mdi-file-document-multiple",
    to: "/documents",
  },
];

const toggleSidebar = () => {
  drawer.value = !drawer.value;
};

const openSettings = () => {
  console.log("Settings clicked");
};

const openHelp = () => {
  console.log("Help clicked");
};

provide("toggleSidebar", toggleSidebar);
</script>

<style scoped>
.v-list-item {
  margin: 0 8px;
}

.v-list-item--active {
  background-color: rgba(25, 118, 210, 0.1);
  color: #1976d2;
}
</style>
