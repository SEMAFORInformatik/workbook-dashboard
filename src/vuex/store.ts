import Vuex, { StoreOptions } from "vuex";
import Account from "./modules/Account";
import Users from "./modules/Users";
import Types from "./modules/Types";
import Projects from "./modules/Projects";
import Components from "./modules/Components";
import Variants from "./modules/Variants";
import Loggers from "./modules/Loggers";
import Database from "./modules/Database";

const storeConfig: StoreOptions<any> = {
  modules: {
    Users,
    Account,
    Types,
    Projects,
    Components,
    Variants,
    Loggers,
    Database
  }
};

export default storeConfig;
