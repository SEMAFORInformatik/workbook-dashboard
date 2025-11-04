import { Module, ActionContext } from "vuex";
import Vue from "vue";
import { AxiosResponse, AxiosError } from "axios";

import { DBServiceError, groupErrors, genericErrors } from "../../error-messages";
import { Group, clone, sortBy } from "../../models";
import defaultConfig from "../../env-config";
import instance from "../../axios-instance";

const Groups: Module<any, any> = {
  namespaced: true,
  state: {
    groups: [],
  },
  mutations: {
    set: (state, groups: Group[]) => {
      state.groups = groups;
    },
    add: (state, group: Group) => {
      const index = state.groups.findIndex((g: Group) => g.name === group.name);
      if (index < 0) {
        state.groups.push(clone(group))
      }
    },
    rename: (state, { oldName, newName }) => {
      // Get the index of the group
      const index = state.groups.findIndex((g: Group) => g.name === oldName);
      const newGroup: Group = { name: newName };

      // Replace the old one with the new one
      Vue.set(state.groups, index, newGroup);
    }
  },
  actions: {
    rename: (context: ActionContext<any, any>, { oldName, newName }) => {
      // Use a promise to notify the group list
      return new Promise<AxiosResponse>((resolve, reject) => {
        instance.put(
          `${defaultConfig.apiPath}/users/groups/rename/${encodeURIComponent(oldName)}/${encodeURIComponent(newName)}`)
          .then(response => {
            // Commit the new changes to the store
            context.commit("rename", { oldName, newName });
            context.commit("Users/updateUserGroups", { oldName, newName }, { root: true });
            // Pass the axios response along to the caller
            resolve(response);
          })
          .catch((error: AxiosError) => {
            // Get the error-message
            const message = groupErrors[error.response.statusText] ||
              genericErrors[error.response.statusText] || error.response.statusText;

            // Error object
            const dbError: DBServiceError = {
              status: error.response.status,
              statusText: error.response.statusText,
              message
            }
            // Reject the promise
            reject(dbError);
          });
      });
    },
    fetch: (context) => {
      instance.get(`${defaultConfig.apiPath}/users/groups`)
        .then(response => {
          context.commit("set", response.data.sort(sortBy("name")));
        })
        .catch(error => {
        })
    },
  }

}

export default Groups;
