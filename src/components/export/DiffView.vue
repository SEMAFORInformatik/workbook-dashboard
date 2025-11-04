<template>
  <div>
    <b-table :data="tableData" height="400px" :sticky-header="true" checkable
      :checked-rows="tableData.filter(({ status }) => status !== 'upToDateConflict')" striped @check="checked">

      <b-table-column label="Status" field="warning" v-slot="props" centered>
        <span title="Merge conflict">
          <b-icon v-if="props.row.warning" pack="fa" icon="warning">
          </b-icon>
        </span>
      </b-table-column>

      <b-table-column v-slot="props" field="type" label="Type">
        <p>{{ props.row.type }}</p>
      </b-table-column>
      <b-table-column v-slot="props" field="name" label="Name">
        <p>{{ props.row.name }}</p>
      </b-table-column>
      <b-table-column v-slot="props" field="status" label="Status">
        <p>{{ props.row.status }}</p>
      </b-table-column>
      <b-table-column v-slot="props" field="modText" label="Changes">
        <p v-html="props.row.modText"></p>
      </b-table-column>
    </b-table>
  </div>
</template>

<script>
export default {
  props: ["diff"],
  computed: {
    tableData() {
      return this.diff.map(({ modifications, ...rest }) => {
        const excludedFields = ["type", "changed", "modcomment"];
        let modText = "";

        for (let name of Object.keys(modifications).filter(k => !excludedFields.includes(k))) {
          if (modifications[name].length === 2 &&
            (typeof modifications[name][0] === "string" || typeof modifications[name][0] === "number") &&
            (typeof modifications[name][0] === "string" || typeof modifications[name][0] === "number")) {
            if (modifications[name][0] === modifications[name][1]) continue;
            modText = `${modText}${name}: ${modifications[name][0]} -> ${modifications[name][1]}<br>`;
          } else {
            modText = `${modText}${name} changed<br>`;
          }
        }

        return { modText, warning: rest.status === "upToDateConflict", ...rest }
      })
    }
  },
  methods: {
    checked(checkedList) {
      this.$emit("checked", checkedList.map(({ id }) => id))
    }
  }
}
</script>
