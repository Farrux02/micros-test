<template>
  <div>
    <PageHeader
      title="Документы"
      subtitle="Управление документооборотом организации"
      icon="mdi-file-document-multiple"
    >
      <template #actions>
        <v-btn
          color="primary"
          prepend-icon="mdi-plus"
          @click="openCreateDialog"
        >
          Добавить документ
        </v-btn>
      </template>
    </PageHeader>

    <v-card class="mb-6" elevation="1">
      <v-card-text>
        <v-row align="center">
          <v-col cols="12" md="4">
            <v-text-field
              v-model="searchQuery"
              label="Поиск по номеру или описанию"
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              density="compact"
              hide-details
              clearable
            />
          </v-col>

          <v-col cols="12" md="3">
            <v-select
              v-model="typeFilter"
              label="Тип документа"
              :items="documentTypeOptions"
              variant="outlined"
              density="compact"
              hide-details
              clearable
            />
          </v-col>

          <v-col cols="12" md="3">
            <v-autocomplete
              v-model="employeeFilter"
              label="Сотрудник"
              :items="employeeOptions"
              item-title="fullName"
              item-value="id"
              variant="outlined"
              density="compact"
              hide-details
              clearable
              :loading="employeeStore.loading"
            />
          </v-col>

          <v-col cols="12" md="2">
            <v-btn variant="outlined" color="grey" @click="clearFilters" block>
              Сбросить
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <v-card elevation="2">
      <v-data-table
        :headers="headers"
        :items="filteredDocuments"
        :loading="documentStore.loading"
        :server-items-length="documentStore.pagination.total"
        v-model:page="page"
        v-model:items-per-page="itemsPerPage"
        @update:options="loadDocuments"
        class="elevation-0"
        item-value="id"
      >
        <template v-slot:item.type="{ item }">
          <div class="d-flex align-center">
            <v-avatar
              :color="getDocumentColor(item.type)"
              size="32"
              class="mr-3"
            >
              <v-icon color="white">
                {{ getDocumentIcon(item.type) }}
              </v-icon>
            </v-avatar>
            <div>
              <div class="font-weight-medium">
                {{ getDocumentTypeLabel(item.type) }}
              </div>
              <div class="text-caption text-grey">
                {{ item.number }}
              </div>
            </div>
          </div>
        </template>

        <template v-slot:item.date="{ item }">
          {{ formatDate(item.date) }}
        </template>

        <template v-slot:item.employee="{ item }">
          <div v-if="getEmployeeById(item.employeeId)">
            <div class="font-weight-medium">
              {{ getEmployeeById(item.employeeId).firstName }}
              {{ getEmployeeById(item.employeeId).lastName }}
            </div>
            <div class="text-caption text-grey">
              {{ getEmployeeById(item.employeeId).passportNumber }}
            </div>
          </div>
          <div v-else class="text-grey">Сотрудник не найден</div>
        </template>

        <template v-slot:item.description="{ item }">
          <div class="text-truncate" style="max-width: 200px">
            {{ item.description }}
          </div>
        </template>

        <template v-slot:item.additionalInfo="{ item }">
          <v-chip
            v-if="item.type === 'invoice'"
            :color="item.invoiceType === 'standard' ? 'success' : 'warning'"
            size="small"
            variant="flat"
          >
            {{
              item.invoiceType === "standard" ? "Стандартная" : "Дополнительная"
            }}
          </v-chip>
          <div
            v-else-if="item.type === 'power_of_attorney'"
            class="text-caption"
          >
            {{ item.attorneyName }}
          </div>
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
              @click="openEditDialog(item)"
            />
            <v-btn
              icon="mdi-delete"
              variant="text"
              size="small"
              color="error"
              @click="confirmDelete(item)"
            />
          </div>
        </template>

        <template v-slot:no-data>
          <div class="text-center py-8">
            <v-icon size="64" color="grey">mdi-file-document-off</v-icon>
            <div class="text-h6 mt-4">Документы не найдены</div>
            <div class="text-grey">Попробуйте изменить параметры поиска</div>
          </div>
        </template>
      </v-data-table>
    </v-card>

    <DocumentDialog
      v-model="dialogOpen"
      :document="selectedDocument"
      @saved="handleDocumentSaved"
    />

    <ConfirmDialog
      v-model="deleteDialog"
      title="Удалить документ"
      :text="`Вы уверены, что хотите удалить документ ${selectedDocument?.number}?`"
      @confirm="deleteDocument"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useDocumentStore } from "../document.store";
import { useEmployeeStore } from "@/modules/employee";
import PageHeader from "@/shared/components/common/PageHeader.vue";
import DocumentDialog from "./DocumentDialog.vue";
import ConfirmDialog from "@/shared/components/common/ConfirmDialog.vue";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

const documentStore = useDocumentStore();
const employeeStore = useEmployeeStore();

const page = ref(1);
const itemsPerPage = ref(10);
const searchQuery = ref("");
const typeFilter = ref(null);
const employeeFilter = ref(null);
const dialogOpen = ref(false);
const deleteDialog = ref(false);
const selectedDocument = ref(null);

const documentTypeOptions = [
  { title: "Счет-фактура", value: "invoice" },
  { title: "Доверенность", value: "power_of_attorney" },
];

const headers = [
  { title: "Документ", key: "type", sortable: false },
  { title: "Дата", key: "date", align: "center" },
  { title: "Сотрудник", key: "employee", sortable: false },
  { title: "Описание", key: "description", sortable: false },
  {
    title: "Доп. информация",
    key: "additionalInfo",
    sortable: false,
    align: "center",
  },
  {
    title: "Действия",
    key: "actions",
    sortable: false,
    align: "center",
    width: "120",
  },
];

const employeeOptions = computed(() => {
  return employeeStore.employees.map((emp) => ({
    id: emp.id,
    fullName: `${emp.firstName} ${emp.lastName}`,
    ...emp,
  }));
});

const filteredDocuments = computed(() => {
  let filtered = documentStore.documents;

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(
      (doc) =>
        doc.number.toLowerCase().includes(query) ||
        doc.description.toLowerCase().includes(query)
    );
  }

  if (typeFilter.value) {
    filtered = filtered.filter((doc) => doc.type === typeFilter.value);
  }

  if (employeeFilter.value) {
    filtered = filtered.filter(
      (doc) => doc.employeeId === employeeFilter.value
    );
  }

  return filtered;
});

const loadDocuments = async (options = {}) => {
  const { page: currentPage = 1, itemsPerPage: currentItemsPerPage = 10 } =
    options;
  await documentStore.fetchDocuments(
    currentPage,
    currentItemsPerPage,
    employeeFilter.value,
    typeFilter.value
  );
};

const loadEmployees = async () => {
  await employeeStore.fetchEmployees(1, 100);
};

const getEmployeeById = (employeeId) => {
  return employeeStore.employees.find((emp) => emp.id === employeeId);
};

const openCreateDialog = () => {
  selectedDocument.value = null;
  dialogOpen.value = true;
};

const openEditDialog = (document) => {
  selectedDocument.value = { ...document };
  dialogOpen.value = true;
};

const confirmDelete = (document) => {
  selectedDocument.value = document;
  deleteDialog.value = true;
};

const deleteDocument = async () => {
  try {
    await documentStore.deleteDocument(selectedDocument.value.id);
    deleteDialog.value = false;
    selectedDocument.value = null;
    await loadDocuments({ page: page.value, itemsPerPage: itemsPerPage.value });
  } catch (error) {
    console.error("Error deleting document:", error);
  }
};

const handleDocumentSaved = async () => {
  dialogOpen.value = false;
  selectedDocument.value = null;
  await loadDocuments({ page: page.value, itemsPerPage: itemsPerPage.value });
};

const clearFilters = () => {
  searchQuery.value = "";
  typeFilter.value = null;
  employeeFilter.value = null;
};

const formatDate = (dateString) => {
  return format(new Date(dateString), "dd.MM.yyyy", { locale: ru });
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

watch([searchQuery, typeFilter, employeeFilter], () => {
  page.value = 1;
});

onMounted(() => {
  Promise.all([
    loadDocuments({ page: page.value, itemsPerPage: itemsPerPage.value }),
    loadEmployees(),
  ]);
});
</script>

<style scoped>
.v-data-table {
  background-color: transparent;
}

.text-truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
