<template lang="pug">
div
  h2.subtitle.is-2 Database Status
  liquibase-table

</template>

<script lang="ts">
import defaultConfig from "../../env-config";
import axios from "axios";
import liquibaseTable from "./LiquibaseTable.vue";

export default {
  components: {
    liquibaseTable
  }
}
</script>

<style lang="scss">

</style>
