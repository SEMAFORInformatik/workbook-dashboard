import Vue from "vue";
import Router from "vue-router";
import Vuex from "vuex";
import Buefy from "buefy";
import "buefy/dist/buefy.css";
import "swagger-ui-dist/swagger-ui.css";

import VueMoment from "./vue-moment-tiny";

import { sync } from "vuex-router-sync";

import App from "./components/App.vue";
import routerConfig from "./router-config";
import storeConfig from "./vuex/store";

Vue.use(Vuex);
Vue.use(Router);
Vue.use(Buefy, {
  defaultIconPack: "fa"
})
Vue.use(VueMoment);

const store = new Vuex.Store(storeConfig);
const router = new Router(routerConfig);

sync(store, router);

const vm = new Vue({
  el: "#v-app",
  render: (h) => h(App),
  router,
  store,
});
