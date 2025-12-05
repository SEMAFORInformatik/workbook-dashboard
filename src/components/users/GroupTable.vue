<template lang="pug">
div
  div.table-container.groups
    table.table.is-striped.is-fullwidth.top-table
      thead
        tr
          th Group

      tbody
        group-edit(v-for="group in $store.state.Users.Groups.groups" :group="group" :key="group.name" :disabled="hasOauth && oauthGroups").clickable-row
          td {{group.name}}

  form(@submit.prevent="addGroup" v-if="!hasOauth || !oauthGroups")
    div.field.has-addons
      div.control.is-expanded
          input(type="text" placeholder="Group name" v-model="newGroupName").input.is-info

      div.control
        button(type="submit").button.is-info Add

</template>

<script lang="ts">
import defaultConfig from "../../env-config";
import { Group, escapeHtml } from "../../models";
import GroupEdit from "./GroupEdit.vue";

export default {
  async created() {
    this.hasOauth = !!(await defaultConfig.springProps).clientId
    this.oauthGroups = !!(await defaultConfig.springProps).useOauthGroups
  },
  components: {
    GroupEdit
  },
  data() {
    return {
      newGroupName: "",

      error: false,
      hasOauth: false,
      oauthGroups: true,
    };
  },
  methods: {
    addGroup() {
      let group: Group = { name: this.newGroupName };
      // If the group already exists set error to true
      if (
        this.$store.state.Users.Groups.groups.some(
          (g: Group) => g.name === group.name
        )
      ) {
        this.error = true;
        this.$buefy.toast.open({
          duration: 3000,
          message: `Error: Group ${escapeHtml(
            this.newGroupName
          )} already exists.`,
          position: "is-top",
          type: "is-danger"
        });
      } else {
        this.$store.commit("Users/Groups/add", group);
        this.newGroupName = "";
        this.error = false;
      }
    }
  }
};
</script>

<style lang="scss">

</style>
