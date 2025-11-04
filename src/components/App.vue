<template lang="pug">
div#app
  div(v-show="$store.getters['Account/isLoggedIn']").is-hidden-desktop.topbar-touch-space
    div#topbar-touch
      button(type="button" @click="mobileNavOpen = !mobileNavOpen" :class="{'on-nav': mobileNavOpen}").button.sidenav-button.is-large.toggle-button.top-button
        span.icon.is-medium
          i(:class="{'fa-rotate-180': !mobileNavOpen}").fa.fa-arrow-circle-o-left            

      transition(name="slide-left")
        sidebar(v-if="mobileNavOpen" isMobile)

  //- margin-right to prevent scrolling to the right with the arrow keys
  div(style="margin-right: 0;").columns
    //- Spacing
    div(v-if="hasAuth && $store.getters['Account/isLoggedIn']").is-hidden-touch#sidebar-spacer
      sidebar

    main.column
      router-view.section
</template>

<script lang="ts">
import Sidebar from "./Sidebar.vue";
import defaultConfig from "../env-config";
import instance from "../axios-instance";
import { OAuth2Client } from '@badgateway/oauth2-client';

export default {
  async created() {
    const springProps = await defaultConfig.springProps
    this.hasAuth = !springProps.noAuth || springProps.shardMode === null
    console.log(springProps)
    try {
      if (springProps?.authorizationEndpoint) {

        /**
         * Create the oauth2 client
         */
        const client = new OAuth2Client({
          authorizationEndpoint: springProps.authorizationEndpoint,
          tokenEndpoint: springProps.tokenEndpoint,
          clientId: springProps.clientId,
        });

        this.$store.commit("Account/setAuthMethod", "auth-oidc")
        try {
          const oauth2Token = await client.authorizationCode.getTokenFromCodeRedirect(
            document.location as any,
            {
              redirectUri: springProps.dashboardUrl,
            }
          );

          const token = `Bearer ${oauth2Token.accessToken}`;
          this.$store.commit("Account/setLoggedIn", true)
          window.sessionStorage.setItem("jwt", token);
          instance.defaults.headers.common['Authorization'] = token;
          // Remove authorization_code path param from url
          window.history.replaceState(null, '', window.location.pathname);
          this.$router.push("/")
        } catch (_) {
          if (window.sessionStorage.getItem("jwt")) {
            const token = window.sessionStorage.getItem("jwt");
            this.$store.commit("Account/setLoggedIn", true)
            instance.defaults.headers.common['Authorization'] = token;
            try {
              await instance.get(`${defaultConfig.apiPath}/users`);
              this.$store.commit("Account/setAdmin", true)
            } finally {
              this.$router.push("/")
            }
          }
        }
      } else {
        const token = window.sessionStorage.getItem("jwt")
        if (!token) {
          if (springProps.noAuth) {
            await this.$store.dispatch("Account/tryLogin", { username: "admin", password:"none", method:"auth-jwt"})
          }
          throw "Token not found"
        }
        instance.defaults.headers.common['Authorization'] = token;
        this.$store.commit("Account/setAuthMethod", "auth-jwt")
        this.$store.commit("Account/setUsername", window.sessionStorage.getItem("username"))
        this.$store.commit("Account/setLoggedIn", true)
        try {
          await instance.get(`${defaultConfig.apiPath}/users`);
          this.$store.commit("Account/setAdmin", true)
        } finally {
          this.$router.push("/")
        }
      }
    } catch (e) {
    }
    if (
      !this.$store.getters["Account/isLoggedIn"] &&
      !this.$route.path.includes("/login")
    ) {
      this.$router.push("/login");
    }

    if (springProps.noAuth) {
      this.$router.push("/export");
    }
  },
  components: {
    Sidebar
  },
  data() {
    return {
      mobileNavOpen: true,
      hasAuth: true
    };
  }
};
</script>

<style lang="scss">
$sidenav-color: #414b56;
$text-color: #f0f0f0;

main {
  @media screen and (max-width: 1024px) {
    height: calc(100vh - 60px);
    overflow-y: scroll;
  }
}

.slide-left-enter {
  -webkit-transform: translate(-10em, 0);
  transform: translate(-10em, 0);
}

.slide-left-leave-active {
  -webkit-transform: translate(-10em, 0);
  transform: translate(-10em, 0);
}

#topbar-touch {
  width: 100%;
  height: inherit;
  background: $sidenav-color;
  position: absolute;

  #sidebar {
    transition: transform 1s;
  }
}

.topbar-touch-space {
  height: 60px;
}

#sidebar-spacer {
  width: 70px;

  // Go against bulma's default margin
  margin-left: 0.75rem;
  margin-top: 0.75rem;
}

.sidenav-button {
  width: 100%;
  background: $sidenav-color;
  border: 0;
  margin: 0;
  color: $text-color;
  border-radius: 0px;
  display: flex;
  flex-direction: column;
  height: 3em;

  transition: background 0.25s;

  &>.sidebar-text {
    font-size: 1rem;
    transition: opacity 1s;
    opacity: 0;
  }

  &.top-button {
    width: 4em;
    height: 100%;
    transition: color 1s;
    z-index: 200;
    // Prevent the input fields from clipping trough the top-bar
    box-shadow: 500px -500px 0px 500px $sidenav-color !important;

    &:hover,
    &:focus,
    &:active {
      box-shadow: 500px -500px 0px 500px $sidenav-color !important;
    }

    i {
      // Make the arrow inside rotate
      transition: transform 0.5s;
    }
  }

  &:hover,
  &:focus,
  &:active {
    background: lighten($sidenav-color, 15%);
    outline: none;
    box-shadow: none !important;
    color: $text-color;
  }

  &.current {
    background: lighten($sidenav-color, 20%);
  }
}
</style>
