<template>
  <v-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    max-width="700"
    persistent
  >
    <v-card>
      <v-card-title class="d-flex align-center">
        <v-icon class="mr-2" color="primary">
          {{ isEditing ? "mdi-pencil" : "mdi-plus" }}
        </v-icon>
        {{ isEditing ? "Редактировать документ" : "Добавить документ" }}
      </v-card-title>

      <v-form ref="form" @submit.prevent="handleSubmit">
        <v-card-text>
          <v-row>
            <v-col cols="12" md="6">
              <v-select
                v-model="formData.type"
                label="Тип документа"
                :items="documentTypeOptions"
                :rules="typeRules"
                variant="outlined"
                required
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-model="formData.number"
                label="Номер документа"
                :rules="numberRules"
                variant="outlined"
                required
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-model="formData.date"
                label="Дата документа"
                type="date"
                :rules="dateRules"
                variant="outlined"
                required
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-autocomplete
                v-model="formData.employeeId"
                label="Сотрудник"
                :items="employeeOptions"
                item-title="fullName"
                item-value="id"
                :rules="employeeRules"
                variant="outlined"
                required
                :loading="employeeStore.loading"
              />
            </v-col>

            <v-col cols="12">
              <v-textarea
                v-model="formData.description"
                label="Описание"
                :rules="descriptionRules"
                variant="outlined"
                rows="3"
                required
              />
            </v-col>

            <v-col v-if="formData.type === 'invoice'" cols="12">
              <v-card variant="outlined" class="pa-4">
                <v-card-title class="pa-0 mb-3">
                  <v-icon class="mr-2" color="warning">mdi-receipt</v-icon>
                  Параметры счета-фактуры
                </v-card-title>

                <v-select
                  v-model="formData.invoiceType"
                  label="Тип счета-фактуры"
                  :items="invoiceTypeOptions"
                  :rules="invoiceTypeRules"
                  variant="outlined"
                  required
                />
              </v-card>
            </v-col>

            <v-col v-if="formData.type === 'power_of_attorney'" cols="12">
              <v-card variant="outlined" class="pa-4">
                <v-card-title class="pa-0 mb-3">
                  <v-icon class="mr-2" color="info"
                    >mdi-file-certificate</v-icon
                  >
                  Параметры доверенности
                </v-card-title>

                <v-text-field
                  v-model="formData.attorneyName"
                  label="ФИО доверенного лица"
                  :rules="attorneyNameRules"
                  variant="outlined"
                  placeholder="Иван Иванович Иванов"
                  required
                />
              </v-card>
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
import { ref, watch, computed, onMounted } from "vue";
import { useDocumentStore } from "../document.store";
import { useEmployeeStore } from "@/modules/employee";
import {
  dateRules,
  descriptionRules,
  employeeRules,
  numberRules,
  typeRules,
} from "../document.form-rules";

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  document: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(["update:modelValue", "saved"]);

const documentStore = useDocumentStore();
const employeeStore = useEmployeeStore();
const form = ref(null);
const loading = ref(false);

const isEditing = computed(() => !!props.document?.id);

const formData = ref({
  type: null,
  number: "",
  date: "",
  description: "",
  employeeId: null,
  invoiceType: null,
  attorneyName: "",
});

const documentTypeOptions = [
  { title: "Счет-фактура", value: "invoice" },
  { title: "Доверенность", value: "power_of_attorney" },
];

const invoiceTypeOptions = [
  { title: "Стандартная", value: "standard" },
  { title: "Дополнительная", value: "additional" },
];

const employeeOptions = computed(() => {
  return employeeStore.employees.map((emp) => ({
    id: emp.id,
    fullName: `${emp.firstName} ${emp.lastName}`,
    ...emp,
  }));
});

const resetForm = () => {
  formData.value = {
    type: null,
    number: "",
    date: new Date().toISOString().split("T")[0],
    description: "",
    employeeId: null,
    invoiceType: null,
    attorneyName: "",
  };
  form.value?.resetValidation();
};

const invoiceTypeRules = [
  (v) =>
    formData.value.type !== "invoice" || !!v || "Тип счета-фактуры обязателен",
];

const attorneyNameRules = [
  (v) =>
    formData.value.type !== "power_of_attorney" ||
    !!v ||
    "ФИО доверенного лица обязательно",
  (v) =>
    formData.value.type !== "power_of_attorney" ||
    (v && v.length >= 5) ||
    "Минимум 5 символов",
  (v) =>
    formData.value.type !== "power_of_attorney" ||
    (v && v.length <= 100) ||
    "Максимум 100 символов",
];

const loadDocumentData = () => {
  if (props.document) {
    formData.value = { ...props.document };
  } else {
    resetForm();
  }
};

const handleSubmit = async () => {
  const { valid } = await form.value.validate();
  if (!valid) return;

  loading.value = true;
  try {
    const cleanData = { ...formData.value };

    if (cleanData.type === "invoice") {
      delete cleanData.attorneyName;
    } else if (cleanData.type === "power_of_attorney") {
      delete cleanData.invoiceType;
    }

    if (isEditing.value) {
      await documentStore.updateDocument(props.document.id, cleanData);
    } else {
      await documentStore.createDocument(cleanData);
    }
    emit("saved");
  } catch (error) {
    console.error("Error saving document:", error);
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
      loadDocumentData();
      if (employeeStore.employees.length === 0) {
        loadEmployees();
      }
    }
  }
);

watch(
  () => props.document,
  () => {
    if (props.modelValue) {
      loadDocumentData();
    }
  }
);

watch(
  () => formData.value.type,
  (newType, oldType) => {
    if (newType !== oldType) {
      if (newType === "invoice") {
        formData.value.attorneyName = "";
        formData.value.invoiceType = null;
      } else if (newType === "power_of_attorney") {
        formData.value.invoiceType = null;
        formData.value.attorneyName = "";
      }
    }
  }
);

const loadEmployees = async () => {
  await employeeStore.fetchEmployees(1, 100);
};

onMounted(() => {
  if (employeeStore.employees.length === 0) {
    loadEmployees();
  }
});
</script>

<style scoped>
.v-card-title {
  font-size: 1.1rem;
}
</style>
