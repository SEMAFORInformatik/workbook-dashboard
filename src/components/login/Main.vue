<template lang="pug">
div
  div.login-background(:style="{'background-image': 'url(' + bgImage + ')' }")
    span.copyright-text
      |© Semafor AG 2023
      |<br/>
      |Background Photo © https://flic.kr/p/n8GY3W
  div.columns.is-vcentered.login-container
    div.column.is-half.is-offset-one-quarter.columns.main-login
      div.column.is-half
        h3.subtitle.is-3 Intens DB Service Dashboard
        img(:src="logo")

      div.column.is-half
        h4.title.is-4 Login
        form(@submit.prevent="login")
          b-notification(:active.sync="error" type="is-danger") Invalid login data
          template(v-if="!useOIDC")
            div.field
              div.control.has-icons-left
                input(type="text" name="username" v-model="username" placeholder="Username" required).input.is-medium
                span.icon.is-medium.is-left
                  i.fa.fa-user

            div.field
              div.control.has-icons-left
                input(type="password" name="password" v-model="password" placeholder="Password" required).input.is-medium
                span.icon.is-medium.is-left
                  i.fa.fa-key

          button(type="submit" :class="{'is-loading': loading}").button.is-primary.is-fullwidth.is-medium
            |Login
</template>

<script lang="ts">
import defaultConfig from "../../env-config";

import logoLink from "../../assets/logo.png";
import bgLink from "../../assets/loginBG.jpg";
export default {
  async created() {
    if (this.$store.getters["Account/isLoggedIn"]) {
      this.$router.push("/");
    }
    this.useOIDC = !!(await defaultConfig.springProps).authorizationEndpoint
  },
  data() {
    return {
      username: "",
      password: "",
      useJWT: false,
      useOIDC: false,

      loading: false,
      error: false,
      logo: logoLink,
      bgImage: bgLink
    };
  },
  methods: {
    async login() {
      this.loading = true;
      let username = this.username;
      let password = this.password;
      let method = this.useOIDC ? "auth-oidc" : "auth-jwt";
      this.$store
        .dispatch("Account/tryLogin", { username, password, method })
        .then(() => {
          this.loading = false;
          this.error = false;
          this.$router.push("/");
        })
        .catch((error: any) => {
          if (error.response.data.detail === "No Authenticator code") {
            this.$buefy.dialog.prompt({
              message: "Type 2 factor auth code",
              closeOnConfirm: false,
              inputAttrs: {
                type: "text",
                placeholder: "Authenticator code",
              },
              trapFocus: true,
              onConfirm: async (totp, { close }) => {
                try {
                  await this.$store.dispatch("Account/tryLogin", { username, password, method, totp })
                } catch (_) {
                  this.$buefy.toast.open({
                    message: "Invalid 2FA code",
                    type: "is-danger",
                    duration: 3000
                  });
                  return;
                }
                close();
                this.loading = false;
                this.error = false;
                this.$router.push("/");
              }
            })
          } else {
            this.loading = false;
            this.error = true;
          }
        });
    }
  }
};
</script>

<style lang="scss" scoped>
.section {
  @media screen and (max-width: 1024px) {
    margin: 0 0 0 12px;
    z-index: 10;
    overflow: hidden;
  }
}

.copyright-text {
  position: absolute;
  right: 0;
  bottom: 0;
  color: white;
}

.login-container {
  height: calc(100vh - 6rem);
}

.login-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: -1;
  // Foto von: https://flic.kr/p/n8GY3W
  // Entweder durch copyright-freies bild ersetzen oder irgendwo sichtbar diesen Link anbringen
  background-size: cover;
  background-position: center;
}

.main-login {
  background: rgba(255, 255, 255, 0.5);
}
</style>
