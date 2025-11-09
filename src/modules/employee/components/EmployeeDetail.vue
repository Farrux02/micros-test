<template>
  <div>
    <PageHeader
      :title="`${employee?.firstName || ''} ${employee?.lastName || ''}`"
      subtitle="Подробная информация о сотруднике"
      icon="mdi-account"
      :show-back="true"
      back-to="/employees"
    >
      <template #actions>
        <v-btn
          color="warning"
          prepend-icon="mdi-pencil"
          @click="openEditDialog"
          :disabled="!employee"
        >
          Редактировать
        </v-btn>
        <v-btn
          color="error"
          prepend-icon="mdi-delete"
          variant="outlined"
          @click="confirmDelete"
          :disabled="!employee"
        >
          Удалить
        </v-btn>
      </template>
    </PageHeader>

    <v-row v-if="loading">
      <v-col cols="12">
        <v-card>
          <v-card-text class="text-center py-12">
            <v-progress-circular indeterminate color="primary" size="64" />
            <div class="mt-4 text-h6">Загрузка...</div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row v-else-if="employee">
      <v-col cols="12" lg="4">
        <v-card elevation="2" class="h-100">
          <v-card-text class="text-center pa-6">
            <v-avatar
              size="120"
              :color="employee.isActive ? 'success' : 'grey'"
              class="mb-4"
            >
              <v-icon size="60" color="white">
                {{
                  employee.gender === "female"
                    ? "mdi-account-box-outline"
                    : "mdi-account-circle"
                }}
              </v-icon>
            </v-avatar>

            <h2 class="text-h4 mb-2">
              {{ employee.firstName }} {{ employee.lastName }}
            </h2>

            <v-chip
              :color="employee.isActive ? 'success' : 'grey'"
              size="large"
              class="mb-4"
            >
              {{ employee.isActive ? "Активен" : "Неактивен" }}
            </v-chip>

            <v-divider class="my-4" />

            <div class="text-left">
              <InfoRow
                icon="mdi-calendar"
                label="Дата рождения"
                :value="formatDate(employee.birthDate)"
              />

              <InfoRow
                icon="mdi-card-account-details"
                label="Паспорт"
                :value="employee.passportNumber"
              />

              <InfoRow
                icon="mdi-gender-male-female"
                label="Пол"
                :value="getGenderLabel(employee.gender)"
              />
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" lg="8">
        <v-card elevation="2" class="h-100">
          <v-card-title class="d-flex align-center">
            <v-icon class="mr-2" color="primary"
              >mdi-file-document-multiple</v-icon
            >
            Документы сотрудника
            <v-spacer />
            <v-btn
              color="primary"
              prepend-icon="mdi-plus"
              size="small"
              @click="openCreateDocumentDialog"
            >
              Добавить документ
            </v-btn>
          </v-card-title>

          <v-card-text>
            <v-data-table
              :headers="documentHeaders"
              :items="employeeDocuments"
              :loading="documentsLoading"
              class="elevation-0"
              item-value="id"
              hide-default-footer
              :items-per-page="-1"
            >
              <template v-slot:item.type="{ item }">
                <div class="d-flex align-center">
                  <v-icon :color="getDocumentColor(item.type)" class="mr-2">
                    {{ getDocumentIcon(item.type) }}
                  </v-icon>
                  {{ getDocumentTypeLabel(item.type) }}
                </div>
              </template>

              <template v-slot:item.date="{ item }">
                {{ formatDate(item.date) }}
              </template>

              <template v-slot:item.actions="{ item }">
                <div class="d-flex gap-1">
                  <v-btn
                    icon="mdi-eye"
                    variant="text"
                    size="small"
                    color="primary"
                    :to="`/documents/${item.id}`"
                  />
                  <v-btn
                    icon="mdi-pencil"
                    variant="text"
                    size="small"
                    color="warning"
                    @click="openEditDocumentDialog(item)"
                  />
                  <v-btn
                    icon="mdi-delete"
                    variant="text"
                    size="small"
                    color="error"
                    @click="confirmDeleteDocument(item)"
                  />
                </div>
              </template>

              <template v-slot:no-data>
                <div class="text-center py-8">
                  <v-icon size="64" color="grey">mdi-file-document-off</v-icon>
                  <div class="text-h6 mt-4">Документы не найдены</div>
                  <div class="text-grey">
                    У этого сотрудника пока нет документов
                  </div>
                </div>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row v-else>
      <v-col cols="12">
        <v-card>
          <v-card-text class="text-center py-12">
            <v-icon size="64" color="error">mdi-alert-circle</v-icon>
            <div class="mt-4 text-h6">Сотрудник не найден</div>
            <div class="text-grey">
              Возможно, сотрудник был удален или не существует
            </div>
            <v-btn to="/employees" color="primary" class="mt-4">
              Вернуться к списку
            </v-btn>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <EmployeeDialog
      v-model="editDialog"
      :employee="employee"
      @saved="handleEmployeeSaved"
    />

    <ConfirmDialog
      v-model="deleteDialog"
      title="Удалить сотрудника"
      :text="`Вы уверены, что хотите удалить сотрудника ${employee?.firstName} ${employee?.lastName}? Это действие нельзя отменить.`"
      @confirm="deleteEmployee"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useEmployeeStore } from "../employee.store";
import { useDocumentStore } from "@/modules/document";
import PageHeader from "@/shared/components/common/PageHeader.vue";
import InfoRow from "@/shared/components/common/InfoRow.vue";
import EmployeeDialog from "./EmployeeDialog.vue";
import ConfirmDialog from "@/shared/components/common/ConfirmDialog.vue";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
});

const route = useRoute();
const router = useRouter();
const employeeStore = useEmployeeStore();
const documentStore = useDocumentStore();

const employee = ref(null);
const loading = ref(true);
const documentsLoading = ref(false);
const editDialog = ref(false);
const deleteDialog = ref(false);

const documentHeaders = [
  { title: "Тип", key: "type", sortable: false },
  { title: "Номер", key: "number" },
  { title: "Дата", key: "date", align: "center" },
  { title: "Описание", key: "description" },
  {
    title: "Действия",
    key: "actions",
    sortable: false,
    align: "center",
    width: "120",
  },
];

const employeeDocuments = computed(() => {
  return documentStore.documents.filter(
    (doc) => doc.employeeId === parseInt(props.id)
  );
});

const loadEmployee = async () => {
  loading.value = true;
  try {
    employee.value = await employeeStore.fetchEmployeeById(props.id);
    await loadEmployeeDocuments();
  } catch (error) {
    console.error("Error loading employee:", error);
    employee.value = null;
  } finally {
    loading.value = false;
  }
};

const loadEmployeeDocuments = async () => {
  documentsLoading.value = true;
  try {
    await documentStore.fetchDocuments(1, 100, parseInt(props.id));
  } catch (error) {
    console.error("Error loading employee documents:", error);
  } finally {
    documentsLoading.value = false;
  }
};

const openEditDialog = () => {
  editDialog.value = true;
};

const confirmDelete = () => {
  deleteDialog.value = true;
};

const deleteEmployee = async () => {
  try {
    await employeeStore.deleteEmployee(props.id);
    router.push("/employees");
  } catch (error) {
    console.error("Error deleting employee:", error);
  }
};

const handleEmployeeSaved = async () => {
  editDialog.value = false;
  await loadEmployee();
};

const openCreateDocumentDialog = () => {
  console.log("Create document for employee:", props.id);
};

const openEditDocumentDialog = (document) => {
  console.log("Edit document:", document);
};

const confirmDeleteDocument = (document) => {
  console.log("Delete document:", document);
};

const formatDate = (dateString) => {
  return format(new Date(dateString), "dd MMMM yyyy", { locale: ru });
};

const getGenderLabel = (gender) => {
  switch (gender) {
    case "male":
      return "Мужской";
    case "female":
      return "Женский";
    default:
      return "Не указан";
  }
};

const getDocumentColor = (type) => {
  return type === "invoice" ? "warning" : "info";
};

const getDocumentIcon = (type) => {
  return type === "invoice" ? "mdi-receipt" : "mdi-file-certificate";
};

const getDocumentTypeLabel = (type) => {
  return type === "invoice" ? "Счет-фактура" : "Доверенность";
};

watch(
  () => props.id,
  () => {
    loadEmployee();
  }
);

onMounted(() => {
  loadEmployee();
});
</script>

<style scoped>
.v-data-table {
  background-color: transparent;
}
</style>
