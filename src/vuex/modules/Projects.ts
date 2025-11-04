import { Module, ActionContext } from "vuex";
import { AxiosResponse, AxiosError } from "axios";
import Vue from "vue";

import { Project, sortBy, clone } from "../../models";
import defaultConfig from "../../env-config";
import instance from "../../axios-instance";

const Projects: Module<any, any> = {
  namespaced: true,
  state: {
    projects: []
  },
  getters: {
    byId: (state, getters) => (id: Number) => {
      return state.projects.filter((project: Project) => project.id == id)[0];
    }
  },
  mutations: {
    set: (state, projects: Project[]) => {
      state.projects = projects;
    },
    update: (state, project: Project) => {
      const index = state.projects.findIndex((p: Project) => p.id === project.id);
      // Updating the variable in the array with the index causes vue not to register a change in the list
      if (index < 0) {
        state.projects.push(clone(project))
      } else {
        Vue.set(state.projects, index, clone(project));
      }
      state.projects = state.projects.sort(sortBy("name"));
    }
  },
  actions: {
    fetch: (context) => {
      return new Promise<void>((resolve, reject) => {
        instance.get(`${defaultConfig.apiPath}/projects?status=(local,global,delivered,obsolete)`)
          .then(response => {
            context.commit("set", response.data.sort(sortBy("name")));
            resolve();
          })
          .catch(error => {
            reject(error);
          })
      });
    },
    save: (context, project: Project) => {
      return new Promise<AxiosResponse>((resolve, reject) => {
        instance
          .put(`${defaultConfig.apiPath}/projects/${project.id}`, project)
          .then(response => {
            context.commit("update", project)
            resolve(response);
          }).catch(error => {
            reject(error);
          });
      });
    },
    new: (context, project: Project) => {
      return new Promise<AxiosResponse>((resolve, reject) => {
        instance
          .put(`${defaultConfig.apiPath}/projects`, project)
          .then(response => {
            context.commit("update", project)
            resolve(response);
          }).catch(error => {
            reject(error);
          });
      });
    },
      delete: (context, project: Project) => {
        return new Promise<AxiosResponse>((resolve, reject) => {
          instance
            .delete(`${defaultConfig.apiPath}/projects/${project.id}`)
            .then(response => {
              context.commit("update", project);
              resolve(response);
            }).catch(error => {
              instance
                .put(`${defaultConfig.apiPath}/projects/${project.id}`, project)
                .then(response => {
                  context.commit("update", project);
                  resolve(response);
                }).catch(error => {
                  reject(error);
                });
            })
        });
      }
    }
};
export default Projects;
