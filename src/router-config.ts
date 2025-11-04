import Loggers from "./vuex/modules/Loggers";

const Home = () => import("./components/home/Main.vue");
const Users = () => import("./components/users/Main.vue");
const Login = () => import("./components/login/Main.vue");
const Types = () => import("./components/types/Main.vue");
const Swagger = () => import("./components/swagger/Main.vue");
const Projects = () => import("./components/projects/Main.vue");
const Database = () => import("./components/database/Main.vue");
const Export = () => import("./components/export/Main.vue");
const Components = () => import("./components/components/Main.vue");
const System = () => import("./components/system/Main.vue");

const routerConfig: any = {
  mode: "hash",
  routes: [
    {
      children: [],
      component: Home,
      path: "/",
    },
    {
      children: [],
      component: Login,
      path: "/login",
    },
    // When selecting a user to edit or when creating a new one.
    {
      children: [],
      component: Users,
      path: "/users",
    },
    // When editing the user with ':username'
    {
      children: [],
      component: Users,
      path: "/users/:username",
    },
    {
      children: [],
      component: Types,
      path: "/types",
    },
    {
      children: [],
      component: Components,
      path: "/components",
    },
    {
      children: [],
      component: Swagger,
      path: "/swagger"
    },
    {
      children: [],
      component: Projects,
      path: "/projects",
    },
    {
      children: [],
      component: Projects,
      path: "/projects/:id"
    },
    {
      children: [],
      component: Database,
      path: "/dbStatus"
    },
    {
      children: [],
      component: Export,
      path: "/export"
    },
    {
      children: [],
      component: System,
      path: "/system"
    }
  ],
};

export default routerConfig;
