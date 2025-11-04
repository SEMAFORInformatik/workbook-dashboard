<template lang="pug">
li.box.type-box.type
  div(@click="toggle()").type-label
    div(v-if="name")
      strong {{type.name}}:
      i.type-name  {{name}}
    div(v-else)
      strong {{type.name}}
  ul(v-show="open").box.type-box.props
    li(@click="emitActiveType()").props-label
      div propertyTypes >>>
    //-li
      div( @click="togglePt()").props-label propertyTypes
      table(v-show="this.openPt").table.is-narrow
        thead
          th name 
          th unit
          th type
        tr(v-for="pt in type.propertyTypes")
          td {{pt.name}}
          td {{pt.unit}}
          td {{pt.type}}
  ul(v-show="open")
    branch(
      v-for="reference in type.references"
      :name="reference.name"
      :type="$store.getters['Types/getTypeByName'](reference.type)" 
      :key="$store.getters['Types/getTypeByName'](reference.type).id"
    )  
</template>

<script lang="ts">
import Bus from "../../event-bus"
export default {
  name: "branch",
  props: ["type", "name"],
  data: () => ({
    open: false,
    openPt: false
  }),
  methods: {
    toggle() {
      this.open = ! this.open
      if(this.open) {
        this.emitActiveType()
      }
    },
    togglePt() {
      this.openPt = !this.openPt
    },
    emitActiveType() {
      Bus.$emit("activeType", this.type)
    }
  }
}
</script>
<style>
i.type-name {
  color: #4a4a4a !important;
}

</style>
