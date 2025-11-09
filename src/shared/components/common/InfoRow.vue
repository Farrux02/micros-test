<template>
  <div class="info-row d-flex align-start mb-3">
    <v-icon :color="iconColor" size="20" class="mr-3 mt-1">
      {{ icon }}
    </v-icon>

    <div class="flex-grow-1">
      <div class="text-body-2 text-grey mb-1">{{ label }}</div>
      <div class="text-body-1 font-weight-medium">
        <slot>{{ value }}</slot>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  icon: {
    type: String,
    required: true,
  },
  label: {
    type: String,
    required: true,
  },
  value: {
    type: String,
    default: "",
  },
  iconColor: {
    type: String,
    default: "grey",
  },
});
</script>

<style scoped>
.info-row {
  min-height: 48px;
}
</style>
