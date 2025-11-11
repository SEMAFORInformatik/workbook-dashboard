import { Module, ActionContext } from "vuex";
import Vue from "vue";
import { AxiosResponse, AxiosError } from "axios";

import Groups from "./Groups";

import { User, Group, Role, clone, sortBy } from "../../models";
import defaultConfig from "../../env-config";
import instance from "../../axios-instance";

const Users: Module<any, any> = {
  namespaced: true,
  modules: {
    Groups
  },
  state: {
    users: [],
    roles: [{ name: "ROLE_ADMIN", description: null }],
  },
  getters: {
    // Return the user with the specified username
    oneByName: (state, getters) => (username: String) => {
      return state.users.filter((user: User) => user.username === username)[0];
    },
  },
  mutations: {
    set: (state, users: User[]) => {
      state.users = users;
    },
    update: (state, user: User) => {
      const index = state.users.findIndex((u: User) => u.username === user.username);
      // Updating the variable in the array with the index causes vue not to register a change in the list
      if (index < 0) {
        state.users.push(clone(user))
      } else {
        Vue.set(state.users, index, clone(user));
      }
      state.users = state.users.sort(sortBy("username"));
    },
    updateUserGroups: (state, { oldName, newName }) => {
      // Get the index of the group
      const index = state.Groups.groups.findIndex((g: Group) => g.name === oldName);
      const newGroup: Group = { name: newName };

      // Update the group for every user
      state.users.forEach((user: User) => {
        // Get the group's index in the user
        const i = user.groups.findIndex((g: Group) => g.name === oldName);
        // If the user isn't in that group return
        if (i === -1) {
          return;
        }
        // Update it if it was found
        Vue.set(user.groups, i, newGroup);
        // Update the active group
        if (user.activeGroup && user.activeGroup.name === oldName) {
          user.activeGroup = newGroup
        }
      });
    }
  },
  actions: {
    fetch: (context) => {
      return new Promise<void>((resolve, reject) => {
        instance.get(`${defaultConfig.apiPath}/users`)
          .then(response => {
            // Set role descriptions to null to fix admin role not being recognized
            for (let user of response.data) {
              for (let role of user.roles) {
                role.description = null;
              }
            }
            // Sort the list of users and commit it.
            context.commit("set", response.data.sort(sortBy("username")));
            resolve();
          })
          .catch(error => {
            // TODO: Make better error
            reject(error);
          })
      });
    },
    save: (context, user: User) => {
      return new Promise<AxiosResponse>((resolve, reject) => {
        instance
          .put(`${defaultConfig.apiPath}/users`, user)
          .then(response => {
            context.commit("update", user);
            resolve(response);
          }).catch(error => {
            reject(error);
          });
      });
    }
  }
};

export default Users;
