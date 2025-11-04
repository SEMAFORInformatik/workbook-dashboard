<template lang="pug">
div
  router-link(:to="availableLinks[currentLink].href")
    button.component
      h3.subtitle.is-3 {{ availableLinks[currentLink].name }}
      span.icon
        i(:class="availableLinks[currentLink].icon").fa

  b-dropdown
    button(slot="trigger").button
      span Edit
      i.fa.fa-angle-down
    b-dropdown-item(v-for="(link, i) in availableLinks" :key="link.name" @click="change(i)")
      span.icon.is-small
        i(:class="availableLinks[i].icon").fa
      |{{ link.name }}
</template>

<script lang="ts">
export default {
  mounted() {
    this.currentLink =
      window.localStorage.getItem(`hpBTN_${this.index}`) || this.index || 0;
  },
  data() {
    return {
      availableLinks: [
        {
          name: "Users",
          href: "/users",
          icon: "fa-user"
        },
        {
          name: "Types",
          href: "/types",
          icon: "fa-cubes"
        },
        {
          name: "Components",
          href: "/components",
          icon: "fa-th"
        },
        {
          name: "Projects",
          href: "/projects",
          icon: "fa-folder-open"
        },
        {
          name: "API Docs",
          href: "/swagger",
          icon: "fa-book"
        },
        {
          name: "Database Status",
          href: "/dbStatus",
          icon: "fa-database"
        }
      ],
      currentLink: 0
    };
  },
  methods: {
    change(value) {
      this.currentLink = value;
      window.localStorage.setItem(`hpBTN_${this.index}`, value);
    }
  },
  props: ["index"]
};
</script>

<style lang="scss" scoped>
$buttonColor: #627182;

.component {
  background: $buttonColor;
  border-radius: 10px;
  border: none;
  cursor: pointer;
  height: 200px;
  width: 100%;
  * {
    color: #fff;
  }
}
</style>
