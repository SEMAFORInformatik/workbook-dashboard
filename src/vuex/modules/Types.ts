import { Module } from "vuex";
import { AxiosResponse, AxiosError } from "axios";
import Components from "./Components";

import { Type, sortBy } from "../../models";
import defaultConfig from "../../env-config";

import instance from "../../axios-instance";

const Types: Module<any, any> = {
  namespaced: true,
  modules: {
    Components
  },
  state: {
    types: [],
    topLevelTypes: []
  },
  getters: {
    isTopLevel: (state, getters) => (type: Type) => state.topLevelTypes.indexOf(type.name) > -1,
    getTypeByName: (state, getters) => (name: string) => {
      for (let type of state.types) {
        if (type.name === name) {
          return type
        }
      }
      return {}
    },
  },
  mutations: {
    setTypes(state, types: Type[]) {
      state.types = types;
    },
    // Returns a list of types that are never referenced
    setTopLevelTypes(state) {
      let names: string[] = [];
      let refs: string[] = [];
      for (let type of state.types) {
        names.push(type.name);
        for (let reference of type.references) {
          refs.push(reference.type);
        }
      }
      state.topLevelTypes = names.filter((name) => refs.indexOf(name) === -1);
    },
  },
  actions: {
    fetchTypes: (context) => {
      return new Promise<void>((resolve, reject) => {
        instance.get(`${defaultConfig.apiPath}/components/types`)
        .then(response => {
            context.commit("setTypes", response.data.sort(sortBy("name")));
            context.commit("setTopLevelTypes");
            resolve();
          })
        .catch(error => {
          reject(error);
        })
      })
    },
  },
};

export default Types;
