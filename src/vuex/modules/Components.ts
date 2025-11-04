import { Module } from "vuex";
import {AxiosResponse} from "axios";
import Vue from "vue";

import { Type, Component } from "../../models";
import defaultConfig from "../../env-config";
import instance from "../../axios-instance";

const Components: Module<any, any> = {
  namespaced: true,
  state: {
    components: {},
    currentType: null,
  },
  mutations: {
    set: (state, { type, components }) => {
      Vue.set(state.components, type, components);
    }
  },
  actions: {
    fetch: (context, type) => {
      return new Promise<AxiosResponse>((resolve, reject) => {
        instance.get(`${defaultConfig.apiPath}/components/type/${type}`)
          .then(response => {
            context.commit("set", { type, components: response.data });
            resolve(response);
          })
          .catch(error => {
            reject(error);
          })
      });
    },
    save: (context, component: Component) => {
      return new Promise<AxiosResponse>((resolve, reject) => {
        instance
          .put(`${defaultConfig.apiPath}/components/${component.id}`, component)
          .then(response => {
            //context.commit("update", component)
            resolve(response);
          }).catch(error => {
            reject(error);
          });
      });
    }
  }
}

export default Components;
