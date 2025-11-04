<template lang="pug">
include ../../mixins/HorizontalField.pug
form(@submit.prevent="saveUser")
  div.columns
    div.column.is-half
      +horizontal-field("Username")
        div.field
          div.control
            input(type="text" v-model="user.username" placeholder="Username"
              :disabled="$route.path !== '/users' && $route.path !== '/users/'").input.is-medium

      +horizontal-field("First name")
        div.field
          div.control
            input(type="text" v-model="user.firstName" placeholder="First name").input.is-medium

      +horizontal-field("Last name")
        div.field
          div.control
            input(type="text" v-model="user.lastName" placeholder="Last name").input.is-medium

      +horizontal-field("Password")
        div.field
          div.control
            input(type="password" v-model="user.password" placeholder="Password").input.is-medium

      +horizontal-field("Enabled")
        div.field
          div.control
            label.checkbox
              input(type="checkbox" v-model="user.enabled")

      +horizontal-field("Active Group")
        div.field
          div.control
            div.select
              select(v-model="user.activeGroup")
                option(v-for="group in user.groups" :key="group.name" :value="group") {{group.name}}

    div.column.is-2-desktop.is-3-tablet
      div.field
        div.label Groups
        div.checkbox-list
          div(v-for="group in $store.state.Users.Groups.groups").control
            label.checkbox
              input(type="checkbox" :value="group" v-model="user.groups")
              span {{group.name}}
                span.icon.is-small
                  i.fa.fa-check

    div.column.is-2-desktop.is-3-tablet
      div.field
        div.label Roles
        div.checkbox-list
          div(v-for="role in $store.state.Users.roles").control
            label.checkbox
              input(type="checkbox" :value="role" v-model="user.roles")
              span {{role.name}}
                span.icon.is-small
                  i.fa.fa-check

  div.field.is-grouped
    p.control
      button(type="submit" :class="{'is-loading': saving}").button.is-primary
        |Save

    p.control
      router-link(to="/users").button
        |New

</template>

<script lang="ts">
import { clone, isSame, escapeHtml, User, Group } from "../../models";

export default {
  created() {
    this.getUser();
  },

  data() {
    return {
      user: {},

      saving: false
    };
  },
  watch: {
    $route: "getUser",
    "$store.state.Users.Groups.groups": "updateGroups",
    "user.groups": "assignActiveGroup"
  },

  methods: {
    assignActiveGroup() {
      // If the user is in at least one group but not his active one change his active one
      if (
        this.user.groups.length &&
        !this.user.groups.some(
          (g: Group) => g.name === this.user.activeGroup.name
        )
      ) {
        this.user.activeGroup = this.user.groups[0] || null;
      }
    },
    // Update the user's groups if they are changed in the state
    updateGroups() {
      // Get the current user's store instance
      const storeUser: User = this.$store.getters["Users/oneByName"](
        this.$route.params.username
      );
      // If it exists
      if (storeUser) {
        // And the groups have changed
        if (!isSame(storeUser.groups, this.user.groups, "name")) {
          // Copy them back (if you changed the user's groups without saving they get set back to the loaded state)
          this.user.groups = clone(storeUser.groups);
          this.user.activeGroup = clone(storeUser.activeGroup);
        }
      }
    },
    getUser() {
      // Use this method to clone the user to prevent the state from changing when the user gets changed
      // It is done with JSON.parse and JSON.stringify because Javascript doesn't support cloning yet.
      this.user = JSON.parse(
        JSON.stringify(
          this.$store.getters["Users/oneByName"](
            this.$route.params.username
          ) || {
            groups: [],
            roles: [],
            activeGroup: {}
          }
        )
      );
    },
    saveUser() {
      // If creating a new user and a user with that username already exists
      if (
        !this.$route.params.username &&
        this.$store.getters["Users/oneByName"](this.user.username)
      ) {
        this.$buefy.toast.open({
          duration: 3000,
          message: `Error: User "${escapeHtml(
            this.user.username
          )}" already exists`,
          position: "is-bottom",
          type: "is-danger"
        });
        return;
      }

      if (!this.user.groups.length) {
        this.$buefy.toast.open({
          duration: 3000,
          message: `Error: User has no groups`,
          position: "is-bottom",
          type: "is-danger"
        });
        return;
      }
      this.saving = true;

      this.$store
        .dispatch("Users/save", this.user)
        .then((response: any) => {
          this.saving = false;
          this.$router.push(`/users/${encodeURIComponent(this.user.username)}`);
          // Show a toast message
          this.$buefy.toast.open({
            duration: 3000,
            message: `User "${escapeHtml(this.user.username)}" saved`,
            position: "is-bottom",
            type: "is-success"
          });
        })
        .catch((error: any) => {
          console.log(`Error: ${error}`);
          this.saving = false;
          this.$buefy.toast.open({
            duration: 3000,
            message: `Failed to save user: ${error}`,
            position: "is-bottom",
            type: "is-danger"
          });
        });
    }
  }
};
</script>

<style lang="scss" scoped>
$list-selected: #63ed85;

.checkbox-list {
  max-height: 254px; // Exactly 7 entries
  overflow-y: scroll;
  border: 1px solid #dbdbdb;

  label {
    display: flex;

    & > span {
      padding: 0.5em 5px;
      width: 100%;

      -ms-user-select: none;
      -moz-user-select: none;
      -webkit-user-select: none;
      user-select: none;

      transition: background 0.1s;

      .icon {
        opacity: 0;
        float: right;

        transition: opacity 0.1s;
      }
    }

    & > input {
      display: none; // Hide the checkbox itself
    }
    & > input:checked + span {
      // If the checkbox is checked apply a dark background around the entire thing
      background: $list-selected;

      .icon {
        opacity: 1;
      }
    }
  }
}
</style>
