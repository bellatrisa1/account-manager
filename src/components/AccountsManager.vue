<template>
  <v-container>
    <v-row align="center" justify="space-between" class="mb-4">
      <h2 class="text-h6">Учетные записи</h2>
      <v-btn @click="onAdd" icon size="small">
        <v-icon>mdi-plus</v-icon>
      </v-btn>
    </v-row>

    <v-alert type="info" class="mb-4" border="start" variant="tonal">
      Для указания нескольких меток для одной пары логин/пароль используйте
      разделитель <strong>;</strong>
    </v-alert>

    <div v-if="accounts.length > 0">
      <v-row
        v-for="acc in accounts"
        :key="acc.id"
        class="account-row"
        align="center"
        no-gutters
      >
        <v-col cols="3">
          <v-text-field
            label="Метки"
            v-model="acc.labelRaw"
            maxlength="50"
            :error="errors[acc.id]?.label"
            @blur="onLabelBlur(acc.id, acc.labelRaw)"
            hide-details="auto"
            variant="outlined"
            density="compact"
          />
        </v-col>

        <v-col cols="2">
          <v-select
            label="Тип записи"
            :items="types"
            v-model="acc.type"
            :error="errors[acc.id]?.type"
            @update:model-value="() => validateAndSave(acc.id)"
            hide-details="auto"
            variant="outlined"
            density="compact"
          />
        </v-col>

        <v-col cols="3">
          <v-text-field
            label="Логин"
            v-model="acc.login"
            :error="errors[acc.id]?.login"
            @blur="() => validateAndSave(acc.id)"
            hide-details="auto"
            variant="outlined"
            density="compact"
          />
        </v-col>

        <v-col cols="3">
          <v-text-field
            label="Пароль"
            v-model="acc.password"
            :error="errors[acc.id]?.password"
            @blur="() => validateAndSave(acc.id)"
            :append-inner-icon="
              showPassword[acc.id] ? 'mdi-eye' : 'mdi-eye-off'
            "
            :type="showPassword[acc.id] ? 'text' : 'password'"
            @click:append-inner="togglePassword(acc.id)"
            hide-details="auto"
            variant="outlined"
            density="compact"
          />
        </v-col>

        <v-col cols="1" class="text-center">
          <v-btn icon @click="onDelete(acc.id)" size="small">
            <v-icon>mdi-delete</v-icon>
          </v-btn>
        </v-col>
      </v-row>
    </div>

    <div v-else class="text-grey text-center mt-4">
      Список пуст — добавьте учетную запись
    </div>
  </v-container>
</template>

<script lang="ts">
import { defineComponent, reactive, computed } from "vue";
import { v4 as uuidv4 } from "uuid";
import { useAccountsStore } from "../stores/accounts";
import type { Account, LabelItem } from "../types";

export default defineComponent({
  name: "AccountsManager",
  setup() {
    const store = useAccountsStore();
    store.load();

    const errors = reactive<Record<string, Record<string, boolean>>>({});
    const showPassword = reactive<Record<string, boolean>>({});

    const accounts = computed(() => store.accounts);

    const types = [
      "Локальная",
      "LDAP",
      "Email",
      "Социальная",
      "Банк",
      "Другое",
    ];

    function parseLabels(raw: string): LabelItem[] {
      return raw
        .split(";")
        .map((s) => s.trim())
        .filter(Boolean)
        .map((text) => ({ text }));
    }

    function onAdd() {
      const newAcc: Account = {
        id: uuidv4(),
        labelRaw: "",
        labels: [],
        type: null,
        login: "",
        password: "",
        isValid: false,
      };
      store.add(newAcc);
      showPassword[newAcc.id] = false;
    }

    function onDelete(id: string) {
      store.remove(id);
      delete errors[id];
      delete showPassword[id];
    }

    function onLabelBlur(id: string, value: string) {
      const labels = parseLabels(value);
      if ((value ?? "").length > 50) {
        setError(id, "label", true);
      } else {
        setError(id, "label", false);
        store.update(id, { labels, labelRaw: value });
        validateAndSave(id);
      }
    }

    function validateAndSave(id: string) {
      const acc = store.accounts.find((a) => a.id === id);
      if (!acc) return;

      const errs: Record<string, boolean> = {};
      errs.type = !acc.type;
      errs.login = !(acc.login && acc.login.trim().length > 0);
      errs.password = !(acc.password && acc.password.trim().length > 0);
      errs.label = (acc.labelRaw ?? "").length > 50;

      errors[id] = errs;
      const isValid = !Object.values(errs).some(Boolean);
      store.update(id, { isValid });
    }

    function setError(id: string, field: string, val: boolean) {
      if (!errors[id]) errors[id] = {};
      errors[id][field] = val;
    }

    function togglePassword(id: string) {
      showPassword[id] = !showPassword[id];
    }

    return {
      accounts,
      onAdd,
      onDelete,
      onLabelBlur,
      validateAndSave,
      errors,
      showPassword,
      togglePassword,
      types,
    };
  },
});
</script>

<style scoped>
.account-row {
  border-bottom: 1px solid #eee;
  padding: 8px 0;
  margin-bottom: 8px;
}

.v-text-field,
.v-select {
  margin-top: 0 !important;
  padding: 4px 8px;
}

.v-btn {
  min-width: 32px !important;
  height: 32px !important;
  padding: 0;
}

.v-input__append-inner {
  margin-left: 4px;
}

.v-btn--icon {
  margin: 0;
}
</style>
