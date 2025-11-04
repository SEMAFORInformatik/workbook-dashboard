<template lang="pug">
div
  div.columns
    h2.subtitle.is-2 Projects
    div.column.is-2-desktop.is-3-tablet
      p.control.has-icons-right
        input(type="text", placeholder="Search Project" v-model="searchText").input
        span.icon.is-small.is-right
          i.fa.fa-search
    div.column.is-2-desktop
      div.field
        b-checkbox(v-model="showObsoleteProjects") Show obsolete projects
      div.field
        b-checkbox(v-model="showObsoleteVariants" @input="toggleShowObsoleteVariants") Show obsolete variants
  div.columns
    div.column.is-12-desktop.is-11-tablet
      b-table(:data="filteredProjects"
              :per-page="10"
              :loading="isLoading"
              :paginated="true"
              :selected.sync="selectedProject"
              detail-key="id"
              @details-open="getVariants"
              detailed)
        // Projects
        b-table-column(v-slot="props" label="Id" field="id" sortable)
          p {{ props.row.id }}
        b-table-column(v-slot="props" label="Name" field="name" sortable)
          //- If row is selected and status not obsolete --> edit
          div(v-if="selectedProject.id == props.row.id && !isObsolete(selectedProject.status)")
            input(v-model="props.row.name" @keyup.enter="saveProject")
          //- else show simple text
          p(v-else) {{props.row.name}}

        b-table-column(v-slot="props" label="State" field="status" sortable)
          div(v-if="selectedProject.id == props.row.id && !isObsolete(selectedProject.status)")
            select(v-model="props.row.status")
              option(v-for="state in projectStates") {{state}}
          div(v-else)
            p(:class="{'has-text-danger' : isObsolete(props.row.status)}") {{props.row.status}}

        b-table-column(v-slot="props" label="Owner" field="owner" sortable)
          div(v-if="selectedProject.id == props.row.id && !isObsolete(selectedProject.status)")
            select(v-model="props.row.owner")
              option(v-for="user in $store.state.Users.users") {{user.username}}
          p(v-else) {{props.row.owner}}

        b-table-column(v-slot="props" label="Group" field="group" sortable)
          div(v-if="selectedProject.id == props.row.id && !isObsolete(selectedProject.status)")
            select(v-model="props.row.group")
              option(v-for="group in $store.state.Users.Groups.groups") {{group.name}}
          p(v-else) {{props.row.group}}

        b-table-column(v-slot="props" label="Created" field="created" sortable) {{props.row.created | moment("YYYY-MM-DD HH:MM")}}

        // Variants
        template(slot="detail" slot-scope="props")
          div.column
            div(v-if="selectedProject.id == props.row.id && !isObsolete(selectedProject.status)")
              textarea(v-model="props.row.desc" placeholder="Enter new description" rows="3" cols="70").textarea
            p(v-else) {{props.row.desc}}
            br
            h6.title.is-6 Variants:
            template(v-if="$store.state.Variants.variants[props.row.id] != undefined && $store.state.Variants.variants[props.row.id].length != 0")
              b-table(:data="$store.state.Variants.variants[props.row.id]"
                      :selected.sync="selectedVariant"
                      :per-page="10"
                      :paginated="true"
                      sortable)
                b-table-column(v-slot="variant" label="Id" field="id" sortable)
                  p {{variant.row.id}}
                b-table-column(v-slot="variant" label="Name" field="name" sortable)
                  div(v-if="variant.id == variant.row.id && !isObsolete(selectedVariant.approval)")
                    input(v-model="variant.row.name")
                  p(v-else) {{variant.row.name}}

                b-table-column(v-slot="variant" label="State" field="approval" sortable)
                  div(v-if="variant.id == variant.row.id && !isObsolete(selectedVariant.approval)")
                    select(v-model="variant.row.approval")
                      option(v-for="state in variantStates") {{state}}
                  p(v-else :class="{'has-text-danger' : isObsolete(variant.row.approval)}") {{variant.row.approval}}

                b-table-column(v-slot="variant" label="Owner" field="owner" sortable)
                  div(v-if="variant.id == variant.row.id && !isObsolete(selectedVariant.approval)")
                    select(v-model="variant.row.owner")
                      option(v-for="user in $store.state.Users.users") {{user.username}}
                  p(v-else) {{variant.row.owner}}

                b-table-column(v-slot="variant" label="Group" field="group" sortable)
                  div(v-if="selectedVariant.id == variant.row.id && !isObsolete(selectedVariant.approval)")
                    select(v-model="variant.row.group")
                      option(v-for="group in $store.state.Users.Groups.groups") {{group.name}}
                  p(v-else) {{variant.row.group}}

                b-table-column(v-slot="variant" label="Created" field="created" sortable) {{variant.row.created  | moment("YYYY-MM-DD HH:MM")}}
                b-table-column(v-slot="variant" label="Revision" field="rev" sortable) {{variant.row.rev }}
                template(slot="footer")
                  div.field.is-grouped
                    p.control
                      button(v-on:click="saveVariant" :class="{'is-loading': savingVariant}" :disabled="selectedVariant.id == undefined").button.is-success Save
                    p.control
                      button(v-on:click="deleteVariant" :disabled="selectedVariant.id == undefined").button.is-danger Change to Obsolete
            p(v-else) No variants available in this Project
        template(slot="footer")
          div.columns
            div.column.is-4-desktop
              div.field.is-grouped
                p.control
                  button(v-on:click="modalpactive = true").button New
                p.control
                  button(v-on:click="saveProject" :class="{'is-loading': savingProject}" :disabled="selectedProject.id == undefined").button.is-success Save
                p.control
                  button(v-on:click="deleteProject" :disabled="selectedProject.id == undefined").button.is-danger Change to Obsolete
            div.column.is-8-desktop
              p.control.is-pulled-right
                button(@click="refresh").button Reload Projects
                button(v-on:click="selectedProject = {}; selectedVariant = {}" :disabled="selectedProject.id == undefined && selectedVariant.id == undefined").button.is-primary Clear selection
      div.modal(:class="{'is-active' : modalpactive}")
        div.modal-background
        div.modal-card
          header.modal-card-head
            p.modal-card-title New Project
            button.delete(aria-label="close" v-on:click="modalpactive = false")
          section.modal-card-body
            div.field
              b-field(label="Name")
                b-input(type="text" placeholder="Project name" v-model="newproject.name" required)
              b-field(label="Description:")
                b-input(v-model="newproject.desc" placeholder="Project Description" type="textarea")
          footer.modal-card-foot
            button(v-on:click="newProject").button.is-success Save Project
            button(v-on:click="modalpactive = false").button.is-danger Cancel
      div.modal(:class="{'is-active' : modalvactive}")
        div.modal-background
        div.modal-card
          header.modal-card-head
            p.modal-card-title New Variant
            button.delete(aria-label="close" v-on:click="modalvactive = false")
          section.modal-card-body
            div.field
              b-field(label="Name")
                b-input(type="text" placeholder="Variant name" v-model="newvariant.name" required)
              b-field(label="State:")
                b-select(v-model="newvariant.approval" placeholder="Select a state" required)
                  option(v-for="state in variantStates" :value="state" :key="state") {{state}}
          footer.modal-card-foot
            button().button.is-success Save Variant
            button(@click="modalvactive = false").button.is-danger Cancel
</template>

<script lang="ts">
import {Project, Variant, escapeHtml, Group, User} from "../../models"
import Vue from "vue";
import defaultConfig from "../../env-config";

export default {
  created() {
    if (
      !this.$store.getters["Account/isLoggedIn"] &&
      !this.$route.path.includes("/login")
    ) {
      this.$router.push("/login");
    }
    this.isLoading = true;
    this.$store
      .dispatch("Projects/fetch")
      .catch((error: any) => {
      this.$buefy.toast.open({
        message: `Failed to get data: ${error.message}`,
        type: "is-danger",
        duration: 3000
      })
    }).finally(() => this.isLoading = false)
    this.$store
      .dispatch("Users/fetch")
      .catch((error: any) => {
      this.$buefy.toast.open({
        message: `Failed to get data: ${error.message}`,
        type: "is-danger",
        duration: 3000
      })
    })
    this.$store
      .dispatch("Users/Groups/fetch")
      .catch((error: any) => {
      this.$buefy.toast.open({
        message: `Failed to get data: ${error.message}`,
        type: "is-danger",
        duration: 3000
      })
    })
  },
  methods: {
    isObsolete(status) {
      return status.localeCompare('obsolete') === 0;
    },
    getVariants(project) {
      this.$store
        .dispatch("Variants/fetch", {id: project.id, obsolete: this.showObsoleteVariants})
        .then(() => {
        })
        .catch((error: any) => {
          console.log(error)
          this.refreshing = false;
          this.$buefy.toast.open({
            message: `Failed to get data: ${error.response.data}`,
            type: "is-danger",
            duration: 3000
          });
        });
    },
    saveProject() {
      this.project = this.selectedProject;
      this.project["reason"] = "Edited";
      this.savingProject = true;
      this.$store
        .dispatch("Projects/save", this.project)
        .then((response: any) => {
          this.savingProject = false;
          this.selectedProject = {};

          this.$buefy.toast.open({
            duration: 3000,
            message: `Project "${escapeHtml(this.project.name)}" saved`,
            position: "is-bottom",
            type: "is-success"
          });
        })
        .catch((error: any) => {
          console.log(`Error: ${error}`);
          this.savingProject = false;
          this.selectedProject = {};
          this.$buefy.toast.open({
            duration: 3000,
            message: `Failed to save project: ${error}`,
            position: "is-bottom",
            type: "is-danger"
          });
        });
    },
    newProject() {
      this.modalpactive = false;
      this.project = this.newproject;
      this.project["reason"] = "new Project";
      this.$store
        .dispatch("Projects/new", this.project)
        .then((response: any) => {
          this.newproject = {};
          this.$buefy.toast.open({
            duration: 3000,
            message: `Created project "${escapeHtml(this.project.name)}"`,
            position: "is-bottom",
            type: "is-success"
          });
          this.$store.dispatch("Projects/fetch");
        })
        .catch((error: any) => {
          console.log(`Error: ${error}`);
          this.newproject = {};
          this.$buefy.toast.open({
            duration: 3000,
            message: `Failed to create project: ${error}`,
            position: "is-bottom",
            type: "is-danger"
          });
        });
    },
    deleteProject() {
      this.project = this.selectedProject;
      this.project["reason"] = "Set to Obsolete";
      this.project["status"] = "obsolete";

      this.$store
        .dispatch("Projects/delete", this.project)
        .then((response: any) => {
          this.selectedProject = {};
          this.$buefy.toast.open({
            duration: 3000,
            message: `Set project "${escapeHtml(this.project.name)}" to obsolete`,
            position: "is-bottom",
            type: "is-success"
          });
          this.$store.dispatch("Projects/fetch");
        })
        .catch((error: any) => {
          console.log(`Error: ${error}`);
          this.selectedProject = {};
          this.$buefy.toast.open({
            duration: 3000,
            message: `Failed to delete project: ${error}`,
            position: "is-bottom",
            type: "is-danger"
          });
        });
    },
    saveVariant() {
      this.variant = this.selectedVariant;
      this.variant["reason"] = "Edited";
      this.savingVariant = true;
      this.$store
        .dispatch("Variants/save", this.variant)
        .then((response: any) => {
          this.savingVariant = false;
          this.selectedVariant = {};

          this.$buefy.toast.open({
            duration: 3000,
            message: `Variant "${escapeHtml(this.variant.name)}" saved`,
            position: "is-bottom",
            type: "is-success"
          });
        })
        .catch((error: any) => {
          console.log(`Error: ${error}`);
          this.savingVariant = false;
          this.selectedVariant = {};
          this.$buefy.toast.open({
            duration: 3000,
            message: `Failed to save variant: ${error}`,
            position: "is-bottom",
            type: "is-danger"
          });
        });
    },
    newVariant() {
      this.modalvactive = false;
      this.variant = this.newvariant;
      this.project["reason"] = "Created new Variant";
      this.$store
        .dispatch("Variants/new", this.project)
        .then((response: any) => {
          this.newvariant = {};
          this.$buefy.toast.open({
            duration: 3000,
            message: `Created variant "${escapeHtml(this.variant.name)}"`,
            position: "is-bottom",
            type: "is-success"
          });
          this.$store.dispatch("Variant/fetch");
        })
        .catch((error: any) => {
          console.log(`Error: ${error}`);
          this.newproject = {};
          this.$buefy.toast.open({
            duration: 3000,
            message: `Failed to create variant: ${error}`,
            position: "is-bottom",
            type: "is-danger"
          });
        });
    },
    deleteVariant() {
      this.variant = this.selectedVariant;
      this.variant["reason"] = "Set to Obsolete";
      this.variant["approval"] = "obsolete";

      this.$store
        .dispatch("Variants/delete", this.variant)
        .then((response: any) => {
          this.selectedVariant = {};
          this.$buefy.toast.open({
            duration: 3000,
            message: `Set variant "${escapeHtml(this.variant.name)}" to obsolete`,
            position: "is-bottom",
            type: "is-success"
          });
        })
        .catch((error: any) => {
          console.log(`Error: ${error}`);
          this.selectedVariant = {};
          this.$buefy.toast.open({
            duration: 3000,
            message: `Failed to delete variant: ${error}`,
            position: "is-bottom",
            type: "is-danger"
          });
        });
    },
    toggleShowObsoleteVariants(obsolete: boolean) {
      Object.keys(this.$store.state.Variants.variants).forEach(key => {
        this.$store.dispatch("Variants/fetch", {id: key, obsolete})
      })
    },
    refresh() {
      this.$store.state.Projects.projects = [];
      this.isLoading = true;
      this.$store
        .dispatch("Projects/fetch")
        .catch((error: any) => {
        this.$buefy.toast.open({
          message: `Failed to get data: ${error.message}`,
          type: "is-danger",
          duration: 3000
        })
      }).finally(() => this.isLoading = false)
    }
  },

  computed: {
    filteredProjects(){
      return this.$store.state.Projects.projects.filter((project:Project) => {
        if (project.status.localeCompare("obsolete") === 0 ){
          if(this.showObsoleteProjects === false) {
            return false;
          }
        }
        return project.name?.toLowerCase()?.includes(this.searchText?.toLowerCase())
            || project.owner?.toLowerCase()?.includes(this.searchText?.toLowerCase())
            || project.ownername?.toLowerCase()?.includes(this.searchText?.toLowerCase())

      })
    },
  },
  data() {
    return {
      searchText: "",
      newproject: {},
      newvariant: {},
      selectedProject: {},
      selectedVariant: {},
      project: {},
      variant: {},
      isLoading: false,
      projectStates: ["local", "global", "delivered", "obsolete"],
      variantStates: ["experimental", "inPreparation", "shared", "approved", "tested", "tendered", "obsolete"],
      savingProject: false,
      savingVariant: false,
      showObsoleteProjects: false,
      showObsoleteVariants: false,
      modalpactive: false,
      modalvactive: false,
    }
  }
}
</script>

<style lang="scss">
tr.is-selected {
  span {
    color: #fff;
  }
  td {
      background-color: #7957d5 !important;
  }
}
</style>
