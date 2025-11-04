<template lang="pug">
div
  h2.subtitle.is-2.is-spaced User-Management
  
  div.columns
    div.column
      button(type="button" @click.prevent="refreshData").button
        span.icon
          i(:class="{'fa-spin': refreshing}").fa.fa-refresh

        span Refresh

  div.columns
    div.column.is-half
      //- Overflow scroll doesn't work on tables
      div.table-container
        //- The user-table
        table.table.is-striped.is-fullwidth.top-table
          thead
            tr
              th Name
              th First name
              th Last name
              th Enabled
              th Active group

          tbody
            tr(v-for="user in $store.state.Users.users"
              :key="user.username"
              @click="editUser(user)"
              :class="{'is-selected': $route.path === '/users/' + encodeURIComponent(user.username)}").clickable-row
              td {{user.username}}
              td {{user.firstName}}
              td {{user.lastName}}
              td
                input(type="checkbox" :checked="user.enabled" disabled).checkbox

              td {{user.activeGroup ? user.activeGroup.name : ""}}

    group-table.column.is-3-desktop.is-half-tablet
        
  //- Wait until the users are fetched before trying to render the edit-form
      this is done because if it tries to load it before the users are loaded
      the edit-form won't have any data to show on load
  user-edit(v-if="$store.state.Users.users.length > 0")

</template>

<script lang="ts">
import UserEdit from "./UserEdit.vue";
import GroupTable from "./GroupTable.vue";
import { User, Group } from "../../models";

export default {
  components: {
    UserEdit,
    GroupTable
  },
  created() {
    if (
      !this.$store.getters["Account/isLoggedIn"] &&
      !this.$route.path.includes("/login")
    ) {
      this.$router.push("/login");
    } else {
      this.refreshData();
    }
  },
  data() {
    return {
      refreshing: false
    };
  },

  methods: {
    editUser(user: User) {
      let escapedUsername: string = encodeURIComponent(user.username);
      this.$router.push(`/users/${escapedUsername}`);
    },
    refreshData() {
      this.refreshing = true;
      this.$store.dispatch("Users/Groups/fetch");
      this.$store
        .dispatch("Users/fetch")
        .then(() => {
          this.refreshing = false;
        })
        .catch((error: any) => {
          this.refreshing = false;
          this.$buefy.toast.open({
            message: `Failed to get data: ${error.message}`,
            type: "is-danger",
            duration: 3000
          });
        });
    }
  }
};
</script>

<style lang="scss">
.table-container {
  max-height: 288px; // Fit exactly 7 min height rows
  overflow-y: scroll;
  border: 1px solid #dbdbdb;
  &.groups {
    max-height: 206px; // Show 2 groups less to have space for the button
    margin-bottom: 41px;
  }

  td {
    overflow: hidden;
  }
}

.top-table {
  margin-bottom: 0;

  & td {
    word-break: break-all;
  }
}

.clickable-row {
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}
</style>
