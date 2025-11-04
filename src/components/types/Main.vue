<template lang="pug">
div
  h2.subtitle.is-2.is-spaced Types
  div.columns
    div.column
      ul
        branch(
          v-for="type in $store.state.Types.types" 
          v-if="$store.getters['Types/isTopLevel'](type)" 
          :type="type" 
          :key="type.id"
        )
    div.column.is-one-third 
      pt-table(:type="this.activeType" v-show="Object.keys(this.activeType).length !== 0")
</template>

<script lang="ts">
import { Type } from "../../models"
import Branch from "./Branch.vue"
import ptTable from "./ptTable.vue"
import Bus from "../../event-bus"
export default {
  components: {
    Branch,
    ptTable
  },
  created() {
    if (
      !this.$store.getters["Account/isLoggedIn"] &&
      !this.$route.path.includes("/login")
    ) {
      this.$router.push("/login");
    }
    this.$store
    .dispatch("Types/fetchTypes")
    .catch((error: any) => {
      this.$buefy.toast.open({
        message: `Failed to get data: ${error.message}`,
        type: "is-danger",
        duration: 3000
      })
    })
    Bus.$on("activeType", this.setActiveType)
  },
  destroyed() {
    Bus.$off("activeType")
  },
  data: () => ({
    activeType: {}
  }),
  methods: {
    setActiveType(type: Type) {
      this.activeType = type
      console.log(type.name)
    }
  }
}
</script>

<style lang="scss">
.type-label {
  cursor: pointer;
  &:hover {
    color: orange;
  }
}

.props-label {
  cursor: pointer;
}

.props {
    margin-top: 0.7em;
    transition: transform 0.2s;
    background-color: #efefef;
    & * {
      background-color: #efefef;
    }
}

.props:hover {
  transform: translateX(5px);
}

.type-box {
  padding: 0.5em;
  margin-bottom: 0.5em !important;
  & .type-box {
    margin-left: 0.5em;
  }
  & :last-child {
    margin-bottom: 0.2em !important;
  }
  & .subtitle {
    margin-bottom: 0;
  }
}

.open-pt {
  background-color: red;
  height: 100%;
  width: auto;
  position: absolute;
}
</style>
