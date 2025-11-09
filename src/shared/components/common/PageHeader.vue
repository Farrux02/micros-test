<template>
  <div class="page-header mb-6">
    <v-card elevation="1" class="pa-6">
      <div class="d-flex align-center justify-space-between">
        <div class="d-flex align-center">
          <v-btn
            v-if="showBack"
            icon="mdi-arrow-left"
            variant="text"
            size="large"
            class="mr-3"
            :to="backTo"
          />

          <div class="d-flex align-center">
            <v-avatar :color="iconColor" size="48" class="mr-4">
              <v-icon color="white" size="24">{{ icon }}</v-icon>
            </v-avatar>

            <div>
              <h1 class="text-h4 font-weight-bold mb-1">{{ title }}</h1>
              <p class="text-body-1 text-grey ma-0">{{ subtitle }}</p>
            </div>
          </div>
        </div>

        <div class="d-flex gap-2" v-if="$slots.actions">
          <slot name="actions" />
        </div>
      </div>
    </v-card>
  </div>
</template>

<script setup>
const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  subtitle: {
    type: String,
    default: "",
  },
  icon: {
    type: String,
    required: true,
  },
  iconColor: {
    type: String,
    default: "primary",
  },
  showBack: {
    type: Boolean,
    default: false,
  },
  backTo: {
    type: String,
    default: "/",
  },
});
</script>

<style scoped>
.page-header {
  background: linear-gradient(
    135deg,
    rgba(25, 118, 210, 0.1) 0%,
    rgba(25, 118, 210, 0.05) 100%
  );
  border-radius: 12px;
}
</style>
