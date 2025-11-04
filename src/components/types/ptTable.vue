<template lang="pug">
div.fix
  div.props-label
    strong.type-name {{type.name}}
  div.scroll
    table.table.is-narrow
      thead
        th name
        th unit
        th type
      tr(v-for="pt in type.propertyTypes")
        td {{pt.name}}
        td {{pt.unit}}
        td {{pt.type}}
</template>

<script lang="ts">
export default {
  name: "pt-table",
  props: ["type"]
}
</script>
<style lang="scss" scoped>
.fix {
  position: fixed;
}
.scroll {
  height: 80vh;
  overflow-y:scroll;
}
</style>
