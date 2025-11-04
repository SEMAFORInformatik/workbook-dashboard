<template lang="pug">
div(ref="swagger")
</template>

<script lang="ts">
import { SwaggerUIBundle } from "swagger-ui-dist";
import defaultConfig from "../../env-config";

export default {
  async mounted() {
    const ui = SwaggerUIBundle({
      tryItOutEnabled: true,
      domNode: this.$refs.swagger,
      url: `${(await defaultConfig.springProps).dbUrl}${defaultConfig.apiDocs}`,
      onComplete: () => {
        ui.preauthorizeApiKey("bearer-key", window.sessionStorage.getItem("jwt").split(" ")[1])
      }
    })
  },
}
</script>

<style lang="scss">
.swagger-ui {
  pre {
    background: transparent;
  }

  .auth-wrapper,
  .authorization__btn {
    display: none;
  }
}
</style>
