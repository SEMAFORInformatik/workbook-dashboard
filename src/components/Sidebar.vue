<template lang="pug">
include ../mixins/SidebarLink.pug
div(:class="{'detail-view': detail}")#sidebar
  nav.menu
    div
      template(v-if="$store.getters['Account/isAdmin']")
        +sidebar-link("/", "Home", "fa-home")
        +sidebar-link("/users", "Users", "fa-user")
        +sidebar-link("/types", "Types", "fa-cubes")
        +sidebar-link("/components", "Components", "fa-th")
        +sidebar-link("/projects", "Projects", "fa-folder-open")
        +sidebar-link("/swagger", "API Docs", "fa-book")
        +sidebar-link("/dbStatus", "Database Status", "fa-database")
        +sidebar-link("/system", "System", "fa-area-chart")

      +sidebar-link("/export", "Export", "fa-download")

    div.bottom-nav
      a(type="button" @click.prevent="logout").button.sidenav-button.is-large
        div
          b-tooltip(label="Logout" position="is-right" active=false)
            span.icon.is-medium
              i(:class="{'icon-translate': !detail}").fa.fa-sign-out.translateable-icon

        span(:class="{visible: detail}").sidebar-text Logout

      div.is-hidden-touch
        a(type="button" @click.prevent="toggleNav").button.sidenav-button.is-large.toggle-button
          span.icon.is-medium
            i(:class="{'fa-rotate-180': detail}").smooth-rotate-icon.fa.fa-arrow-circle-o-right

    div.bottom-nav.is-hidden-touch
      button(type="button" @click="toggleNav").button.sidenav-button.is-large.toggle-button
        span.icon.is-medium
          i(:class="{'fa-rotate-180': detail}").smooth-rotate-icon.fa.fa-arrow-circle-o-right

</template>

<script lang="ts">
export default {
  props: ["isMobile"],
  created() {
    if (this.isMobile) {
      this.detail = true;
    }
  },
  data() {
    return {
      detail: false
    };
  },
  methods: {
    toggleNav() {
      this.detail = !this.detail;
    },
    logout() {
      this.$store.dispatch("Account/logout");
      this.$router.push("/login");
    }
  }
};
</script>

<style lang="scss" scoped>
$sidenav-color: #414b56;
$text-color: #f0f0f0;

#sidebar {
  background: $sidenav-color;
  // Make the sidebar always use the full screen height
  height: 100vh;
  width: inherit;
  // Always keep it on screen
  position: fixed;
  transition: width 0.5s cubic-bezier(0.17, 0.95, 0.96, 1);
  z-index: 25;
}

#sidebar.detail-view {
  width: 10em;
}

.translateable-icon {
  transition: transform 0.5s ease-out;
}

.icon-translate {
  transform: translateY(12px);
}

.smooth-rotate-icon {
  transition: transform 0.5s;
}

.menu {
  display: flex;
  flex-direction: column;
}

.bottom-nav {
  position: absolute;
  bottom: 0;
  width: 100%;

  @media screen and (max-width: 1024px) {
    bottom: 72px;
  }
}

#sidebar .sidenav-button .sidebar-text.visible {
  opacity: 1;
}
</style>
