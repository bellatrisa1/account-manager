import { defineStore } from "pinia";
import type { Account } from "../types";

export const useAccountsStore = defineStore("accounts", {
  state: () => ({
    accounts: [] as Account[],
  }),
  actions: {
    add(account: Account) {
      this.accounts.push(account);
      this.save();
    },
    update(id: string, patch: Partial<Account>) {
      const idx = this.accounts.findIndex((a) => a.id === id);
      if (idx >= 0) {
        this.accounts[idx] = { ...this.accounts[idx], ...patch };
        this.save();
      }
    },
    remove(id: string) {
      this.accounts = this.accounts.filter((a) => a.id !== id);
      this.save();
    },
    save() {
      localStorage.setItem("accounts", JSON.stringify(this.accounts));
    },
    load() {
      const raw = localStorage.getItem("accounts");
      if (raw) {
        this.accounts = JSON.parse(raw);
      }
    },
  },
});
