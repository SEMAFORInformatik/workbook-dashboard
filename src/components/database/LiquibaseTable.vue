<template lang="pug">
div
  b-table(:data="changelogs"
          :loading="isLoading"
          :per-page="perPage"
          :paginated="isPaginated(changelogs)"
          detail-key="execdate"
          detailed
          striped)
    b-table-column(v-slot="clogs" label="Changelog File" field="name" sortable)
      div {{clogs.row.name}}
    b-table-column(v-slot="clogs" label="Tag" field="tag" sortable)
      div {{clogs.row.tag}}
    b-table-column(v-slot="clogs" label="Execution Date" field="execdate" sortable)
      div {{clogs.row.execdate | moment("YYYY-MM-DD HH:MM")}}
    b-table-column(v-slot="clogs" label="Changesets" field="changesets.length")
      div {{clogs.row.changesets.length}}
    b-table-column(v-slot="clogs" label="Status" field="status")
      div {{clogs.row.status}}
    template(slot="footer")
      div.has-text-right
        b-button(v-if="activeProfiles.includes('liquibase')" @click="updateDatabase()" type="is-info") Update Database
    template(slot="detail" slot-scope="props")
      div.detail-block
        div.detail-label
          b Filepath:
        div.detail-value
          p {{props.row.filepath}}
      b-table(:data="changelogs[props.index].changesets"
              :per-page="perPage"
              :paginated="isPaginated(changelogs[props.index].changesets)"
              detail-key="id"
              detailed
              striped
              narrowed).cset-table
        b-table-column(v-slot="csets" label="Id" field="id")
          div {{csets.row.id}}
        b-table-column(v-slot="csets" label="Comment" field="comments")
          div {{csets.row.comments}}
        b-table-column(v-slot="csets" label="Execution Date" field="execdate" sortable)
          div {{csets.row.execdate}}
        b-table-column(v-slot="csets" label="Author" field="author" sortable)
          div {{csets.row.author}}
        b-table-column(v-slot="csets" label="Status" field="status" sortable)
          div {{csets.row.status}}
        template(slot="detail" slot-scope="props")
          div.detail-block
            div.detail-label
              b Description:
            div.detail-value
              p {{props.row.description}}


</template>

<script lang="ts">
import { LiquibaseChangeSet } from "../../models";

export default {
  data() {
    return {
      changelogs: [],
      activeProfiles: [],
      isLoading: false,
      perPage: 15
    };
  },
  created() {
    this.getChangelogs()
    this.checkTechnology()
  },
  methods: {
    checkTechnology() {
      this.$store.dispatch("Account/getEnv")
        .then(() => {
          this.activeProfiles = this.$store.getters['Account/getActiveProfiles'];
        });
    },
    getChangelogs() {
      this.isLoading = true;
      this.$store.dispatch("Database/fetchChangeSets")
        .then(() => {
          this.createChangesets(this.$store.state.Database.changeSets);
          this.isLoading = false;
      });
    },
    createChangesets(changesets) {
      for(let cs of changesets) {
        let name = this.cutName(cs.changeLog)
        if(this.changelogs.filter(cl => cl.name == name).length === 0) {
          this.changelogs.push({
            name : name,
            tag: cs.tags,
            filepath: cs.changeLog,
            execdate: cs.dateExecuted,
            status: cs.execType,
            changesets: [],
          })
        }
        let cl = this.changelogs.filter(cl => cl.name == name)[0]
        if(cl.status !== cs.execType) {
          console.log("There are different exectypes within same changelog")
        }
        cl.changesets.push({
          id: cs.id,
          author: cs.author,
          description: cs.description,
          comments: cs.comments,
          status: cs.execType,
          execdate: cs.dateExecuted,
          tag: cs.tag,
          contexts: cs.contexts,
          labels: cs.lables,
        })
      }
    },
    updateDatabase: async function() {
      this.isLoading = true;
      try {
        await this.$store.dispatch("Database/updateDatabase")
        await this.$store.dispatch("Database/fetchChangeSets")
        this.createChangesets(this.$store.state.Database.changeSets);
      } catch (e) {
        this.$buefy.toast.open({
          duration: 3000,
          message: `Error: ${e}`,
          position: "is-top",
          type: "is-danger"
        });
      } finally {
        this.isLoading = false;
      }
    },
    cutName(path) {
      let parts = path.split('/')
      return parts[parts.length-1]
    },
    cutDescription(desc) {
      return ""
    },
    isPaginated(arr) {
      return arr.length > this.perPage;
    }
  }
};
</script>

<style lang="scss">
.detail-block {
  display: inline;

  .detail-label {
    display: inline-block;
    width: 10%;
  }
  .detail-value {
    display: inline-block;
    width: 90%;
    p {
      font-size: 0.9em;
    }
  }
}

.cset-table {
  margin-top: 30px;
  border-top: #bfbfbf 1px solid;
}
</style>
