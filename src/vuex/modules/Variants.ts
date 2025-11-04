import { Module } from "vuex";
import { AxiosResponse, AxiosError } from "axios";
import Vue from "vue";

import { Variant, sortBy, clone } from "../../models";
import defaultConfig from "../../env-config";
import instance from "../../axios-instance";

const Variants: Module<any, any> = {
  namespaced: true,
  state: {
    variants: {},
  },
  getters: {

  },
  mutations: {
    set: (state, {id, variants}) => {
      Vue.set(state.variants, id, variants);
    },
    update: (state, variant: Variant) => {
      const index = state.variants.findIndex((v: Variant) => v.id === variant.id);
      // Updating the variable in the array with the index causes vue not to register a change in the list
      if (index < 0) {
        state.variants.push(clone(variant))
      } else {
        Vue.set(state.variants, index, clone(variant));
      }
      state.variants = state.variants.sort(sortBy("name"));
    },
  },
  actions: {
    fetch: (context, {id, obsolete}) => {
      instance.get(`${defaultConfig.apiPath}/variants?projectId=${id}&_projection=rev`)
        .then(response => {
          const variants = response.data.sort(sortBy("name")).filter(v => obsolete || v.approval !== "obsolete");
          context.commit("set", {id, variants});
        })
        .catch(error => {
        })
    },
    save: (context, variant: Variant) => {
      return new Promise<AxiosResponse>((resolve, reject) => {
        instance
          .put(`${defaultConfig.apiPath}/variants/${variant.id}`, variant)
          .then(response => {
            //context.commit("update", variant)
            resolve(response);
          }).catch(error => {
            reject(error);
          });
      });
    },
    new: (context, variant: Variant) => {
      return new Promise<AxiosResponse>((resolve, reject) => {
        instance
          .put(`${defaultConfig.apiPath}/projects/`, variant)
          .then(response => {
            //context.commit("update", variant)
            resolve(response);
          }).catch(error => {
            reject(error);
          });
      });
    },
    delete: (context, variant: Variant) => {
      return new Promise<AxiosResponse>((resolve, reject) => {
        instance
          .delete(`${defaultConfig.apiPath}/variants/${variant.id}`)
          .then(response => {
            //context.commit("update", variant);
            resolve(response);
          }).catch(error => {
            instance
              .put(`${defaultConfig.apiPath}/variants/${variant.id}`, variant)
              .then(response => {
                //context.commit("update", variant);
                resolve(response);
              }).catch(error => {
                reject(error);
              });
          });
        });
    }
  }
};
export default Variants;
