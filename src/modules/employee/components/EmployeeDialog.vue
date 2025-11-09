<template>
  <v-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    max-width="600"
    persistent
  >
    <v-card>
      <v-card-title class="d-flex align-center">
        <v-icon class="mr-2" color="primary">
          {{ isEditing ? "mdi-pencil" : "mdi-plus" }}
        </v-icon>
        {{ isEditing ? "Редактировать сотрудника" : "Добавить сотрудника" }}
      </v-card-title>

      <v-form ref="form" @submit.prevent="handleSubmit">
        <v-card-text>
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="formData.firstName"
                label="Имя"
                :rules="nameRules"
                variant="outlined"
                required
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-model="formData.lastName"
                label="Фамилия"
                :rules="nameRules"
                variant="outlined"
                required
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-model="formData.birthDate"
                label="Дата рождения"
                type="date"
                variant="outlined"
                :rules="dateRules"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-model="formData.passportNumber"
                label="Серия и номер паспорта"
                :rules="passportRules"
                variant="outlined"
                placeholder="AD1234567"
                required
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-select
                v-model="formData.gender"
                label="Пол"
                :items="genderOptions"
                variant="outlined"
                :rules="genderRules"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-switch
                v-model="formData.isActive"
                label="Активность"
                color="success"
                inset
              />
            </v-col>
          </v-row>
        </v-card-text>

        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn color="grey" variant="text" @click="handleCancel">
            Отмена
          </v-btn>
          <v-btn
            color="primary"
            variant="elevated"
            type="submit"
            :loading="loading"
          >
            {{ isEditing ? "Сохранить" : "Создать" }}
          </v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, watch, computed } from "vue";
import { useEmployeeStore } from "../employee.store";
import {
  dateRules,
  genderRules,
  nameRules,
  passportRules,
} from "../employee.form-rules";

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  employee: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(["update:modelValue", "saved"]);

const employeeStore = useEmployeeStore();
const form = ref(null);
const loading = ref(false);

const isEditing = computed(() => !!props.employee?.id);

const formData = ref({
  firstName: "",
  lastName: "",
  birthDate: "",
  passportNumber: "",
  gender: null,
  isActive: true,
});

const genderOptions = [
  { title: "Не указан", value: null },
  { title: "Мужской", value: "male" },
  { title: "Женский", value: "female" },
];

const resetForm = () => {
  formData.value = {
    firstName: "",
    lastName: "",
    birthDate: "",
    passportNumber: "",
    gender: null,
    isActive: true,
  };
  form.value?.resetValidation();
};

const loadEmployeeData = () => {
  if (props.employee) {
    formData.value = { ...props.employee };
  } else {
    resetForm();
  }
};

const handleSubmit = async () => {
  const { valid } = await form.value.validate();
  if (!valid) return;

  loading.value = true;
  try {
    if (isEditing.value) {
      await employeeStore.updateEmployee(props.employee.id, formData.value);
    } else {
      await employeeStore.createEmployee(formData.value);
    }
    emit("saved");
  } catch (error) {
    console.error("Error saving employee:", error);
  } finally {
    loading.value = false;
  }
};

const handleCancel = () => {
  resetForm();
  emit("update:modelValue", false);
};

watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal) {
      loadEmployeeData();
    }
  }
);

watch(
  () => props.employee,
  () => {
    if (props.modelValue) {
      loadEmployeeData();
    }
  }
);
</script>

<style scoped>
.v-switch {
  margin-top: 16px;
}
</style>
