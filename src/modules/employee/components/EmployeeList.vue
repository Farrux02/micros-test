<template>
  <div>
    <PageHeader
      title="Сотрудники"
      subtitle="Управление списком сотрудников организации"
      icon="mdi-account-group"
    >
      <template #actions>
        <v-btn
          color="primary"
          prepend-icon="mdi-plus"
          @click="openCreateDialog"
        >
          Добавить сотрудника
        </v-btn>
      </template>
    </PageHeader>

    <v-card class="mb-6" elevation="1">
      <v-card-text>
        <v-row align="center">
          <v-col cols="12" md="4">
            <v-text-field
              v-model="searchQuery"
              label="Поиск по имени или фамилии"
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              density="compact"
              hide-details
              clearable
            />
          </v-col>

          <v-col cols="12" md="3">
            <v-select
              v-model="genderFilter"
              label="Пол"
              :items="genderOptions"
              variant="outlined"
              density="compact"
              hide-details
              clearable
            />
          </v-col>

          <v-col cols="12" md="3">
            <v-select
              v-model="statusFilter"
              label="Статус"
              :items="statusOptions"
              variant="outlined"
              density="compact"
              hide-details
              clearable
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
        :items="filteredEmployees"
        :loading="employeeStore.loading"
        :server-items-length="employeeStore.pagination.total"
        v-model:page="page"
        v-model:items-per-page="itemsPerPage"
        @update:options="loadEmployees"
        class="elevation-0"
        item-value="id"
      >
        <template v-slot:item.name="{ item }">
          <div class="d-flex align-center">
            <v-avatar
              :color="item.isActive ? 'success' : 'grey'"
              size="32"
              class="mr-3"
            >
              <v-icon color="white">
                {{
                  item.gender === "female"
                    ? "mdi-account-box-outline"
                    : "mdi-account-circle"
                }}
              </v-icon>
            </v-avatar>
            <div>
              <div class="font-weight-medium">
                {{ item.firstName }} {{ item.lastName }}
              </div>
              <div class="text-caption text-grey">
                {{ item.passportNumber }}
              </div>
            </div>
          </div>
        </template>

        <template v-slot:item.birthDate="{ item }">
          {{ formatDate(item.birthDate) }}
        </template>

        <template v-slot:item.gender="{ item }">
          <v-chip
            :color="getGenderColor(item.gender)"
            size="small"
            variant="flat"
          >
            {{ getGenderLabel(item.gender) }}
          </v-chip>
        </template>

        <template v-slot:item.isActive="{ item }">
          <v-chip
            :color="item.isActive ? 'success' : 'grey'"
            size="small"
            variant="flat"
          >
            {{ item.isActive ? "Активен" : "Неактивен" }}
          </v-chip>
        </template>

        <template v-slot:item.actions="{ item }">
          <div class="d-flex gap-1">
            <v-btn
              icon="mdi-eye"
              variant="text"
              size="small"
              color="primary"
              :to="`/employees/${item.id}`"
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
            <v-icon size="64" color="grey">mdi-account-off</v-icon>
            <div class="text-h6 mt-4">Сотрудники не найдены</div>
            <div class="text-grey">Попробуйте изменить параметры поиска</div>
          </div>
        </template>
      </v-data-table>
    </v-card>

    <EmployeeDialog
      v-model="dialogOpen"
      :employee="selectedEmployee"
      @saved="handleEmployeeSaved"
    />

    <ConfirmDialog
      v-model="deleteDialog"
      title="Удалить сотрудника"
      :text="`Вы уверены, что хотите удалить сотрудника ${selectedEmployee?.firstName} ${selectedEmployee?.lastName}?`"
      @confirm="deleteEmployee"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useEmployeeStore } from "../employee.store";
import PageHeader from "@/shared/components/common/PageHeader.vue";
import EmployeeDialog from "./EmployeeDialog.vue";
import ConfirmDialog from "@/shared/components/common/ConfirmDialog.vue";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

const employeeStore = useEmployeeStore();

const page = ref(1);
const itemsPerPage = ref(10);
const searchQuery = ref("");
const genderFilter = ref(null);
const statusFilter = ref(null);
const dialogOpen = ref(false);
const deleteDialog = ref(false);
const selectedEmployee = ref(null);

const genderOptions = [
  { title: "Мужской", value: "male" },
  { title: "Женский", value: "female" },
  { title: "Не указан", value: null },
];

const statusOptions = [
  { title: "Активен", value: true },
  { title: "Неактивен", value: false },
];

const headers = [
  { title: "Сотрудник", key: "name", sortable: false },
  { title: "Дата рождения", key: "birthDate", align: "center" },
  { title: "Пол", key: "gender", align: "center" },
  { title: "Статус", key: "isActive", align: "center" },
  {
    title: "Действия",
    key: "actions",
    sortable: false,
    align: "center",
    width: "120",
  },
];

const filteredEmployees = computed(() => {
  let filtered = employeeStore.employees;

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(
      (emp) =>
        emp.firstName.toLowerCase().includes(query) ||
        emp.lastName.toLowerCase().includes(query)
    );
  }

  if (genderFilter.value !== null && genderFilter.value !== undefined) {
    filtered = filtered.filter((emp) => emp.gender === genderFilter.value);
  }

  if (statusFilter.value !== null && statusFilter.value !== undefined) {
    filtered = filtered.filter((emp) => emp.isActive === statusFilter.value);
  }

  return filtered;
});

const loadEmployees = async (options = {}) => {
  const { page: currentPage = 1, itemsPerPage: currentItemsPerPage = 10 } =
    options;
  await employeeStore.fetchEmployees(currentPage, currentItemsPerPage);
};

const openCreateDialog = () => {
  selectedEmployee.value = null;
  dialogOpen.value = true;
};

const openEditDialog = (employee) => {
  selectedEmployee.value = { ...employee };
  dialogOpen.value = true;
};

const confirmDelete = (employee) => {
  selectedEmployee.value = employee;
  deleteDialog.value = true;
};

const deleteEmployee = async () => {
  try {
    await employeeStore.deleteEmployee(selectedEmployee.value.id);
    deleteDialog.value = false;
    selectedEmployee.value = null;
    await loadEmployees({ page: page.value, itemsPerPage: itemsPerPage.value });
  } catch (error) {
    console.error("Error deleting employee:", error);
  }
};

const handleEmployeeSaved = async () => {
  dialogOpen.value = false;
  selectedEmployee.value = null;
  await loadEmployees({ page: page.value, itemsPerPage: itemsPerPage.value });
};

const clearFilters = () => {
  searchQuery.value = "";
  genderFilter.value = null;
  statusFilter.value = null;
};

const formatDate = (dateString) => {
  return format(new Date(dateString), "dd.MM.yyyy", { locale: ru });
};

const getGenderColor = (gender) => {
  switch (gender) {
    case "male":
      return "blue";
    case "female":
      return "pink";
    default:
      return "grey";
  }
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

watch([searchQuery, genderFilter, statusFilter], () => {
  page.value = 1;
});

onMounted(() => {
  loadEmployees({ page: page.value, itemsPerPage: itemsPerPage.value });
});
</script>

<style scoped>
.v-data-table {
  background-color: transparent;
}
</style>
