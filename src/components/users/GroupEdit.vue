<template lang="pug">
tr(@click.prevent="edit" :class="{disabled}")
  td
    //- v-show so that vue can get a reference to the element
    div(v-show="editing && !disabled")
      div.field
        div(:class="{'is-loading': loading}").control
          input(type="text"
            @blur.prevent="stopedit"
            @keyup.esc="stopedit"
            @keyup.enter="save"
            v-model="tempName"
            ref="nameInput").input.is-fullwidth.group-edit-field

    span(v-show="!editing || disabled") {{group.name}}
</template>

<script lang="ts">
import { escapeHtml } from "../../models";

export default {
  props: ["group", "disabled"],
  created() {
    this.tempName = this.group.name;
  },
  data() {
    return {
      editing: false,

      // Variable to temporarily store the name of the group.
      tempName: "",
      loading: false
    };
  },

  methods: {
    edit() {
      this.editing = true;

      // Wait a short while until Vue starts showing the element before getting focus
      setTimeout(() => {
        (<HTMLElement>this.$refs["nameInput"]).focus();
      }, 10);
    },
    stopedit() {
      this.editing = false;
      this.tempName = this.group.name;
    },
    save() {
      // If the name wasn't changed don't update
      if (this.tempName !== this.group.name) {
        this.loading = true;
        this.$store
          .dispatch("Users/Groups/rename", {
            oldName: this.group.name,
            newName: this.tempName
          })
          .then((result: any) => {
            this.loading = false;
            this.editing = false;
            this.$buefy.toast.open({
              message: "Group updated",
              type: "is-success"
            });
          })
          .catch((error: any) => {
            console.log(error)
            this.loading = false;
            // Show the error message longer to let the user read it.
            this.$buefy.toast.open({
              message: `${error.message.replace(
                "${newName}",
                escapeHtml(this.tempName)
              )}`,
              type: "is-danger",
              duration: 3000
            });
          });
      } else {
        this.editing = false;
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.disabled {
  background: lightgrey !important;
  border-color: grey;
}
</style>
