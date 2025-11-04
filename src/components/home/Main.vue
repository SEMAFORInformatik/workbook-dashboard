<template lang="pug">
div
  h2.subtitle.is-2 Welcome
  div.columns
    div(v-for="i in [0,1,2]").column
      landing-page-link(:index="i")
  h2.subtitle.is-2 MFA
    totp-enable
    b-button(@click="disableTOPT") Disable 2-Factor auth

</template>

<script lang="ts">
import instance from "../../axios-instance";
import defaultConfig from "../../env-config";
import LandingPageLink from "./LandingPageLink.vue";
import TotpEnable from "./TotpEnable.vue";

export default {
  components: {
    LandingPageLink,
    TotpEnable
  },
  created() {
    if (
      !this.$store.getters["Account/isLoggedIn"] &&
      !this.$route.path.includes("/login")
    ) {
      this.$router.push("/login");
    } else if (!this.$store.getters["Account/isAdmin"]) {
      this.$router.push("/export");
    }
  },
  methods: {
    async disableTOPT() {
      try {
        await instance.put(`${defaultConfig.apiPath}/users/${this.$store.getters["Account/getUsername"]}/deactivateTOTP`);
        this.$buefy.toast.open({
          message: "2FA Disabled",
          type: "is-success"
        });
      } catch (error) {
        this.$buefy.toast.open({
          message: `Failed to disable 2FA: ${error.message}`,
          type: "is-danger",
          duration: 3000
        })
      }

    }
  }
};
</script>

<style></style>
