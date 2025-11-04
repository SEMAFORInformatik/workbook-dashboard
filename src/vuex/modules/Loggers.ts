import { Module } from "vuex";
import { AxiosResponse } from "axios";

import { LoggerList, Logger } from "../../models";
import defaultConfig from "../../env-config";
import instance from "../../axios-instance";

const Loggers: Module<any, any> = {
  namespaced: true,
  state: {
    loggers: [],
    levels: []
  },
  mutations: {
    set: (state, loggerList: LoggerList) => {
      state.loggers = loggerList.loggers;
      state.levels = loggerList.levels
    }
  },
  actions: {
    fetch: (context) => {
      return new Promise<void>((resolve, reject) => {
        instance.get(`${defaultConfig.statusPath}/loggers`)
          .then(response => {
            // Flatten hierarchy -> make logger name from key to value
            let loggers = []
            for(let i in response.data.loggers) {
              let logger = {
                name: i,
                configuredLevel: response.data.loggers[i].configuredLevel,
                effectiveLevel: response.data.loggers[i].effectiveLevel,
              }
              loggers.push(logger)
            } 
            let data = {
              levels: response.data.levels,
              loggers: loggers
            }
            context.commit("set", data);
            resolve();
          })
          .catch(error => {
            reject(error);
          })
      });
    },
    update: (context, logger: Logger) => {
      return new Promise<void>((resolve, reject) => {
        instance
          .post(`${defaultConfig.statusPath}/loggers/` + logger.name , logger)
          .then(response => {
            resolve();
          }).catch(error => {
            reject(error);
          });
      });
    }
  }
};
export default Loggers;
