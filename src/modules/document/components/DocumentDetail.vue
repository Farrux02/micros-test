<template>
  <div>
    <PageHeader
      :title="document?.number || 'Документ'"
      subtitle="Подробная информация о документе"
      icon="mdi-file-document"
      :show-back="true"
      back-to="/documents"
    >
      <template #actions>
        <v-btn
          color="warning"
          prepend-icon="mdi-pencil"
          @click="openEditDialog"
          :disabled="!document"
        >
          Редактировать
        </v-btn>
        <v-btn
          color="error"
          prepend-icon="mdi-delete"
          variant="outlined"
          @click="confirmDelete"
          :disabled="!document"
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

    <v-row v-else-if="document">
      <v-col cols="12" lg="6">
        <v-card elevation="2" class="h-100">
          <v-card-title class="d-flex align-center">
            <v-avatar
              :color="getDocumentColor(document.type)"
              size="40"
              class="mr-3"
            >
              <v-icon color="white">
                {{ getDocumentIcon(document.type) }}
              </v-icon>
            </v-avatar>
            <div>
              <div class="text-h6">
                {{ getDocumentTypeLabel(document.type) }}
              </div>
              <div class="text-caption text-grey">{{ document.number }}</div>
            </div>
          </v-card-title>

          <v-card-text>
            <div class="mb-6">
              <InfoRow
                icon="mdi-calendar"
                label="Дата документа"
                :value="formatDate(document.date)"
              />

              <InfoRow
                icon="mdi-file-document-outline"
                label="Номер документа"
                :value="document.number"
              />

              <InfoRow
                icon="mdi-text"
                label="Описание"
                :value="document.description"
              />
            </div>

            <v-divider class="my-4" />

            <div v-if="document.type === 'invoice'">
              <h3 class="text-h6 mb-3 d-flex align-center">
                <v-icon class="mr-2" color="warning">mdi-receipt</v-icon>
                Информация о счете-фактуре
              </h3>

              <InfoRow
                icon="mdi-tag"
                label="Тип счета-фактуры"
                :value="
                  document.invoiceType === 'standard'
                    ? 'Стандартная'
                    : 'Дополнительная'
                "
              />

              <v-chip
                :color="
                  document.invoiceType === 'standard' ? 'success' : 'warning'
                "
                class="mt-2"
              >
                {{
                  document.invoiceType === "standard"
                    ? "Стандартная"
                    : "Дополнительная"
                }}
              </v-chip>
            </div>

            <div v-else-if="document.type === 'power_of_attorney'">
              <h3 class="text-h6 mb-3 d-flex align-center">
                <v-icon class="mr-2" color="info">mdi-file-certificate</v-icon>
                Информация о доверенности
              </h3>

              <InfoRow
                icon="mdi-account"
                label="ФИО доверенного лица"
                :value="document.attorneyName"
              />
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" lg="6">
        <v-card elevation="2" class="h-100" v-if="employeeInfo">
          <v-card-title class="d-flex align-center">
            <v-icon class="mr-2" color="primary">mdi-account</v-icon>
            Ответственный сотрудник
          </v-card-title>

          <v-card-text>
            <div class="d-flex align-center mb-4">
              <v-avatar
                :color="employeeInfo.isActive ? 'success' : 'grey'"
                size="64"
                class="mr-4"
              >
                <v-icon color="white" size="32">
                  {{
                    employeeInfo.gender === "female"
                      ? "mdi-account-box-outline"
                      : "mdi-account-circle"
                  }}
                </v-icon>
              </v-avatar>
              <div>
                <h3 class="text-h6">
                  {{ employeeInfo.firstName }} {{ employeeInfo.lastName }}
                </h3>
                <v-chip
                  :color="employeeInfo.isActive ? 'success' : 'grey'"
                  size="small"
                  class="mt-1"
                >
                  {{ employeeInfo.isActive ? "Активен" : "Неактивен" }}
                </v-chip>
              </div>
            </div>

            <v-divider class="my-4" />

            <InfoRow
              icon="mdi-calendar"
              label="Дата рождения"
              :value="formatDate(employeeInfo.birthDate)"
            />

            <InfoRow
              icon="mdi-card-account-details"
              label="Паспорт"
              :value="employeeInfo.passportNumber"
            />

            <InfoRow
              icon="mdi-gender-male-female"
              label="Пол"
              :value="getGenderLabel(employeeInfo.gender)"
            />

            <v-btn
              :to="`/employees/${employeeInfo.id}`"
              color="primary"
              variant="outlined"
              class="mt-4"
              block
            >
              Подробнее о сотруднике
            </v-btn>
          </v-card-text>
        </v-card>

        <v-card v-else elevation="2" class="h-100">
          <v-card-text class="text-center py-8">
            <v-icon size="64" color="grey">mdi-account-off</v-icon>
            <div class="text-h6 mt-4">Сотрудник не найден</div>
            <div class="text-grey">Информация о сотруднике недоступна</div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row v-if="document && relatedDocuments.length > 0" class="mt-4">
      <v-col cols="12">
        <v-card elevation="2">
          <v-card-title class="d-flex align-center">
            <v-icon class="mr-2" color="primary"
              >mdi-file-document-multiple</v-icon
            >
            Другие документы этого сотрудника
          </v-card-title>

          <v-card-text>
            <v-list>
              <v-list-item
                v-for="relatedDoc in relatedDocuments"
                :key="relatedDoc.id"
                :to="`/documents/${relatedDoc.id}`"
                class="rounded mb-2"
              >
                <template v-slot:prepend>
                  <v-avatar :color="getDocumentColor(relatedDoc.type)">
                    <v-icon color="white">
                      {{ getDocumentIcon(relatedDoc.type) }}
                    </v-icon>
                  </v-avatar>
                </template>

                <v-list-item-title>
                  {{ relatedDoc.number }}
                </v-list-item-title>

                <v-list-item-subtitle>
                  {{ formatDate(relatedDoc.date) }} •
                  {{ getDocumentTypeLabel(relatedDoc.type) }}
                </v-list-item-subtitle>

                <template v-slot:append>
                  <v-btn icon="mdi-arrow-right" variant="text" size="small" />
                </template>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row v-else>
      <v-col cols="12">
        <v-card>
          <v-card-text class="text-center py-12">
            <v-icon size="64" color="error">mdi-alert-circle</v-icon>
            <div class="mt-4 text-h6">Документ не найден</div>
            <div class="text-grey">
              Возможно, документ был удален или не существует
            </div>
            <v-btn to="/documents" color="primary" class="mt-4">
              Вернуться к списку
            </v-btn>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <DocumentDialog
      v-model="editDialog"
      :document="document"
      @saved="handleDocumentSaved"
    />

    <ConfirmDialog
      v-model="deleteDialog"
      title="Удалить документ"
      :text="`Вы уверены, что хотите удалить документ ${document?.number}? Это действие нельзя отменить.`"
      @confirm="deleteDocument"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useDocumentStore } from "../document.store";
import { useEmployeeStore } from "@/modules/employee";
import PageHeader from "@/shared/components/common/PageHeader.vue";
import InfoRow from "@/shared/components/common/InfoRow.vue";
import DocumentDialog from "./DocumentDialog.vue";
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
const documentStore = useDocumentStore();
const employeeStore = useEmployeeStore();

const document = ref(null);
const loading = ref(true);
const editDialog = ref(false);
const deleteDialog = ref(false);

const employeeInfo = computed(() => {
  if (!document.value?.employeeId) return null;
  return employeeStore.employees.find(
    (emp) => emp.id === document.value.employeeId
  );
});

const relatedDocuments = computed(() => {
  if (!document.value?.employeeId) return [];
  return documentStore.documents.filter(
    (doc) =>
      doc.employeeId === document.value.employeeId &&
      doc.id !== document.value.id
  );
});

const loadDocument = async () => {
  loading.value = true;
  try {
    document.value = await documentStore.fetchDocumentById(props.id);
    await Promise.all([
      employeeStore.fetchEmployees(1, 100),
      documentStore.fetchDocuments(1, 100, document.value.employeeId),
    ]);
  } catch (error) {
    console.error("Error loading document:", error);
    document.value = null;
  } finally {
    loading.value = false;
  }
};

const openEditDialog = () => {
  editDialog.value = true;
};

const confirmDelete = () => {
  deleteDialog.value = true;
};

const deleteDocument = async () => {
  try {
    await documentStore.deleteDocument(props.id);
    router.push("/documents");
  } catch (error) {
    console.error("Error deleting document:", error);
  }
};

const handleDocumentSaved = async () => {
  editDialog.value = false;
  await loadDocument();
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
    loadDocument();
  }
);

onMounted(() => {
  loadDocument();
});
</script>

<style scoped>
.v-list-item {
  margin-bottom: 4px;
}

.v-list-item:hover {
  background-color: rgba(0, 0, 0, 0.04);
}
</style>
