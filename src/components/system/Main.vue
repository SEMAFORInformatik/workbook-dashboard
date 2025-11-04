<template lang="pug">
div
  b-tabs(content-class="mt-2" v-model="activeTab")
    b-tab-item(label="Health" key="health-tab")
      h2.subtitle.is-2 Health Check
    b-tab-item(label="Loggers" key="logger-tab")
      logger-table
</template>
<script lang="ts">
import Vue from 'vue';
import axios from "axios";
import loggerTable from "./LoggerTable.vue";
import defaultConfig from "../../env-config";

export default {
  components: {
    loggerTable
  },
  created() {
    if (
      !this.$store.getters["Account/isLoggedIn"] &&
      !this.$route.path.includes("/login")
    ) {
      this.$router.push("/login");
    }
  },
  data() {
    return {
      activeTab: 0,
    }
  }
    
}
</script>
<style lang="scss">

</style>
