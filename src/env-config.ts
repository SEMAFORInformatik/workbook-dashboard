import { generateCodeVerifier } from "@badgateway/oauth2-client";
import { CustomWindow } from "./models";
declare let window: CustomWindow;

interface SpringProps {
  dbUrl?: string
  authorizationEndpoint?: string
  tokenEndpoint?: string
  clientId?: string
  dashboardUrl?: string
  shardMode?: "main" | "replica"
  noAuth: boolean
  oauthAdditionalClaims: string[] | null;
  useOauthGroups: boolean;
}

if (!window.sessionStorage.getItem("code_verifier")) {
  window.sessionStorage.setItem("code_verifier", await generateCodeVerifier());
}

interface WebAdminConfiguration {
  springProps: Promise<SpringProps>,
  apiPath: string;
  apiDocs: string;
  migrationPath: string;
  statusPath: string;
  codeVerifier: string;
}

let initialized = false;
let configQueue = null;
let springProps: SpringProps = null

const getConfig = async () => {
  if (!initialized) {
    initialized = true
    configQueue = (async () => {
      try {
        const response = await fetch("properties")
        try {
          springProps = await response.json();
        } catch (_) {
          alert("No rest path found")
        }
      } catch (e) {
        alert("Outdated db-service detected. This dashboard only supports the latest version of the intens-db-service")
      }
    })()
  }
  await configQueue
  return springProps
}

// All URLs have to be defined as env variables!
let defaultConfig: WebAdminConfiguration = {
  get springProps() { return getConfig() },
  apiPath: "/services/rest", // api path of db-service
  apiDocs: "/v3/api-docs",
  migrationPath: "/services/liquibase", // api path for liquibase migrations
  statusPath: "/services/management", // configured path of spring actuator
  get codeVerifier() { return window.sessionStorage.getItem("code_verifier")}
};

export default defaultConfig;
