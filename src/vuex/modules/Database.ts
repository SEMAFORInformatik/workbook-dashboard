import { Module } from "vuex";
import axios, { AxiosResponse } from "axios";

import { LiquibaseChangeSet } from "../../models";
import defaultConfig from "../../env-config";
import instance from "../../axios-instance";

const Database: Module<any, any> = {
  namespaced: true,
  state: {
    technology: "",
    appVersion: "",
    changeSets: []
  },
  mutations: {
    setChangeSets: (state, changeSets: LiquibaseChangeSet[]) => {
      state.changeSets = changeSets;
    }
  },
  actions: {
    fetchChangeSets: (context) => {
      return new Promise<void>((resolve, reject) => {
        instance.get(`${defaultConfig.statusPath}/liquibase`)
          .then(response => {
            let changeSets = response.data.contexts.application.liquibaseBeans.liquibase.changeSets;
            context.commit("setChangeSets", changeSets);
            resolve();
          })
          .catch(error => {
            reject(error);
          })
      });
    },
    updateDatabase: (context) => {
      return new Promise<void>((resolve, reject) => {
        instance
          .post(`${defaultConfig.migrationPath}/migration`, null)
          .then(response => {
            resolve();
          }).catch(error => {
            reject(error);
          });
      });
    }
  }
};
export default Database;
