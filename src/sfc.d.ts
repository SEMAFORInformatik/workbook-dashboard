declare module "*.vue" {
  import Vue from 'vue'
  export default Vue
}

declare module "buefy" {
  let i: any;
  export default i;
}

declare module "swagger-ui-dist" {
  export let SwaggerUIBundle: any;
}
