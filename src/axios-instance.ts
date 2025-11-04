import axios from "axios";
import defaultConfig from "./env-config";

const instance = axios.create({
    baseURL: location.pathname,
    withCredentials: true
});

(async () => {
  instance.defaults.baseURL = (await defaultConfig.springProps).dbUrl
})()

export default instance;
