import { Module, ActionContext } from "vuex";
import axios, { AxiosResponse, AxiosError } from "axios";
import defaultConfig from "../../env-config";
import instance from "../../axios-instance";
import { OAuth2Client, generateCodeVerifier } from "@badgateway/oauth2-client";


const Account: Module<any, any> = {
  namespaced: true,
  state: {
    authMethod: "",
    activeProfiles: [],
    username: "",
    loggedIn: false,
    admin: false
  },
  getters: {
    isLoggedIn: (state, getters) => { 
      return state.loggedIn;
    },
    isAdmin: (state, getters) => state.admin,
    getActiveProfiles: (state, getters) => {return state.activeProfiles},
    getUsername: (state, getters) => state.username,
  },
  mutations: {
    setAuthMethod: (state, method: String) => {
      state.authMethod = method;
    },
    setEnvData: (state, activeProfiles: String[]) => {
      state.activeProfiles = activeProfiles;
    },
    setUsername: (state, username: String) => {
      state.username = username
    },
    setAdmin: (state, admin: boolean) => {
      state.admin = admin
    },
    setLoggedIn: (state, loggedIn: Boolean) => {
      state.loggedIn = loggedIn;
    }
  },
  actions: {
    tryLogin: async (context: ActionContext<any, any>, { username, password, method, totp }) => {
      // Set auth method (basic,jwt)
      context.commit("setAuthMethod", method);

      if (method == "auth-jwt") {
        return new Promise<AxiosResponse>((resolve, reject) => {
          // Try the users endpoint
          instance.post('/login', {
              "username" : username,
              "password" : password,
              "token": totp
          })
            .then(response => {
              let token = response.headers.authorization || `Bearer ${response.data}`
              instance.defaults.headers.common['Authorization'] = token;
              window.sessionStorage.setItem("jwt", token);
              window.sessionStorage.setItem("username", username);
              context.commit("setUsername", username);
              context.commit("setLoggedIn", true);

              instance.get(`${defaultConfig.apiPath}/users`, {
                headers: {Authorization: token}
              })
              .then(response => {
                // Admin user has logged in with jwt
                context.commit("setAdmin", true)
              })
              .finally(() => {
                // User has not role_admin
                resolve(null);
              });
            })
            .catch((error: AxiosError) => {
              // Could not generate jwt
              reject(error);
            });
        });
      } else if (method === "auth-oidc") {
        const springProps = await defaultConfig.springProps;
        const client = new OAuth2Client({
          authorizationEndpoint: springProps.authorizationEndpoint,
          tokenEndpoint: springProps.tokenEndpoint,
          clientId: springProps.clientId,
        });

        document.location = await client.authorizationCode.getAuthorizeUri({

          // URL in the app that the user should get redirected to after authenticating
          redirectUri: springProps.dashboardUrl,

          codeVerifier: defaultConfig.codeVerifier,

          scope: ["openid", "profile", "email", ...(springProps.oauthAdditionalClaims || [])],

        });
      }
    },
    logout: (context: ActionContext<any, any>) => {
      context.commit("setLoggedIn", false);
      context.commit("setAdmin", false);
      if(context.state.authMethod === "auth-basic") {
        instance.defaults.auth = undefined;
      } else if(context.state.authMethod === "auth-jwt") {
        instance.defaults.headers.common['Authorization'] = undefined;
        window.sessionStorage.removeItem("jwt");
      } else if(context.state.authMethod === "auth-oidc") {
        window.sessionStorage.removeItem("jwt");
      }
      context.state.authMethod = "";
    },
    getEnv: (context: ActionContext<any, any>) => {
      return new Promise<void>((resolve, reject) => {
        instance.get(`${defaultConfig.statusPath}/env`)
        .then(response => {
          // Set the data if successful
          context.commit("setEnvData", response.data.activeProfiles);
          resolve();
        })
        .catch((error: AxiosError) => {
          reject(error);
        });
      });
    },
  }
};

export default Account;
