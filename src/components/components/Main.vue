<template lang="pug">
div
	div.columns
		h2.subtitle.is-2 Components
		div.column.is-7
			div.field.has-addons
				p.control
					b-select(placeholder="Component Type" v-model="type")
						option(v-for="t in filteredTypes") {{t}}
				p.control
					b-input(type="search", icon="search" ,v-model="searchText", placeholder="Search Components...")
	div.columns
		div.column.is-4-desktop.is-5-tablet
			div.columns
				div.column.is-6-desktop
					b-field(label="Created before:")
						b-datetimepicker(
							placeholder="Click to select..."
							v-model="createdBefore"
							:datepicker="datepicker"
							:timepicker="timepicker"
							editable
							icon="calendar")
							template(slot="left")
								button(@click="createdBefore = getDateNowRound()").button.is-primary
									b-icon(icon="calendar")
									span Now
							template(slot="right")
								button(@click="createdBefore = null").button.is-danger
									b-icon(icon="close")
									span Clear

				div.column.is-6-desktop
					b-field(label="Created after:")
						b-datetimepicker(
							placeholder="Click to select..."
							v-model="createdAfter"
							:datepicker="datepicker"
							:timepicker="timepicker"
							editable
							icon="calendar")
							template(slot="left")
								button(@click="createdAfter = getDateNowRound()").button.is-primary
									b-icon(icon="calendar")
									span Now
							template(slot="right")
								button(@click="createdAfter = null").button.is-danger
									b-icon(icon="close")
									span Clear

		div.column.is-8-desktop.is-7-tablet
			div.field
				div.label Approval State
				div
					div(v-for="state in this.states" :key="state").control.checkbox
						label.checkbox
							input( type="checkbox" :value="state" v-model="checkedStates" native-value="state").checkbox
							span {{state}}
	b(v-if="type") Show {{filteredComponents.length}} of total {{numberOfComponents}} 
	div.columns
		div.column.is-12
			section(v-if="type")
				b-table(
					:data="type ? filteredComponents : []"
					:paginated="true"
					:per-page="13"
					:loading="isLoading"
					:selected.sync="selectedComponent")
					b-table-column(v-slot="component" label="Id" field="id" sortable)
						| {{ component.row.id }}
					b-table-column(v-slot="component" label="Name" field="name" sortable)
						| {{ component.row.name }}
					b-table-column(v-slot="component" label="Approval State" field="approval" sortable)
						div(v-if="selectedComponent.id == component.row.id")
							select(v-model="component.row.approval")
								option(v-for="state in componentStates") {{state}}
						p(v-else) {{ component.row.approval }}
					b-table-column(v-slot="component" label="Type")
						| {{ type }}
					b-table-column(v-slot="component" label="Owner" field="owner" sortable)
						div(v-if="selectedComponent.id == component.row.id")
							select(v-model="component.row.owner")
								option(v-for="user in $store.state.Users.users") {{user.username}}
						p(v-else) {{component.row.owner}}
					b-table-column(v-slot="component" label="Group" field="group" sortable)
						div(v-if="selectedComponent.id == component.row.id")
							select(v-model="component.row.group")
								option(v-for="group in $store.state.Users.Groups.groups") {{group.name}}
						p(v-else) {{ component.row.group }}
					b-table-column(v-slot="component" label="Created" field="created" sortable)
						| {{ component.row.created || null | moment("YYYY-MM-DD HH:MM")}}
					b-table-column(v-slot="component" label="Revision" field="rev" sortable)
						| {{ component.row.rev }}
					template(slot="footer")
						div.columns
							div.column.is-4-desktop
								div.field.is-grouped
									p.control
										button(@click="saveComponent" :disabled="selectedComponent.id == undefined" :class="{'is-loading': savingComponent}").button.is-success Save
							div.column.is-8-desktop
								p.control.is-pulled-right
									button(@click="refreshComponents").button Reload Components
									button(@click="selectedComponent = {}" :disabled="selectedComponent.id == undefined").button.is-primary Clear selection
</template>

<script lang="ts">
import { Component, User, escapeHtml, clone } from "../../models";
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
	this.$store
    	.dispatch("Types/fetchTypes")
    	.catch((error: any) => {
      this.$buefy.toast.open({
        message: `Failed to get data: ${error.message}`,
        type: "is-danger",
        duration: 3000
      })
    })
		this.$store.dispatch("Users/fetch");
		this.$store.dispatch("Users/Groups/fetch");
		if(this.$store.state.Components.currentType != null) {
			this.type = this.$store.state.Components.currentType;
		}
  },
  data() {
    return {
		original: {},
      	type: null, // Current selected type
		component: {}, // Component used for saving/deleting methods (copy from selectedComponent)
      	searchText: "", // Search Text for filtering Components
      	createdBefore: this.getDateNowRound(),
      	createdAfter: null,
      	checkedStates: [], // Checked approval states -> filter
      	states: [], // All states for checkbox -> filter
		componentStates: ["experimental", "inPreparation", "shared", "approved", "tested", "tendered", "obsolete"],
      	isLoading: false, // For loading-animation in table
		selectedComponent: {}, // Current selected component
		savingComponent: false, // For saving animation
		timepicker: {
            incrementMinutes: 5,
        },
		datepicker: {
			showWeekNumber: true,
		}
    }
  },
  watch: {
    type: "getComponents",
	selectedComponent: "cloneComponent"
  },
  computed: {
    filteredComponents() {
      if (this.$store.state.Components.components[this.type]) {
        return this.$store.state.Components.components[this.type].filter((component: Component) => {

          if (this.checkedStates.indexOf(component.approval) == -1 && this.checkedStates.length != 0) {
            return false;
          }
          if (this.createdAfter && this.convertDate(this.createdAfter) > this.convertDate(component.created)) {
            return false;
          }
          if (this.createdBefore && this.convertDate(this.createdBefore) < this.convertDate(component.created)) {
            return false;
          }
          if (component.name && component.name.toLowerCase().includes(this.searchText.toLowerCase()) ||
            component.owner.toLowerCase().includes(this.searchText.toLowerCase())) {
            return true;
          }
        })
      } else {
        return [];
      }
    },
	// Removes Variant & Project from type dropdown
	filteredTypes() {
		return this.$store.state.Types.topLevelTypes.filter((type: string) => {
			if (type.localeCompare("Variant") != 0 && type.localeCompare("Project") != 0) {
				return true;
			}
		})
	},
	numberOfComponents() {
		if (this.$store.state.Components.components[this.type]) {
			return this.$store.state.Components.components[this.type].length;
		} else {
			return 0;
		}
	}
  },
  methods: {
		cloneComponent(e) {
			this.original[e.id] = clone(e);
		},
		searchIndex(id : number) {
			let i = 0;
			for(let index of this.$store.state.Components.components[this.type]) {
				if(index.id === id) {
					return i;
				}
				i++
			}
		},
		saveComponent() {
			this.component = this.selectedComponent;
			this.component["reason"] = "Edited";
			this.component["type"] = this.type;
			this.savingComponent = true;
			this.$store
        .dispatch("Components/save", this.component)
        .then((response: any) => {
          this.savingComponent = false;
          this.selectedComponent = {};
					this.getStates();
          this.$buefy.toast.open({
            duration: 3000,
            message: `Component "${escapeHtml(this.component.name)}" saved`,
            position: "is-bottom",
            type: "is-success"
          });
        })
        .catch((error: any) => {
          console.log(error);
          this.savingComponent = false;
					let i = this.searchIndex(this.component.id);
					Vue.set(this.$store.state.Components.components[this.type], i , this.original[this.component.id])
					this.selectedComponent = {};
          this.$buefy.toast.open({
            duration: 8000,
            message: `Failed to save component: ${error.response.data}`,
            position: "is-bottom",
            type: "is-danger"
          });
        });
		},
    getStates() {
      if (this.$store.state.Components.components[this.type]) {
        this.states = [];
        for (let i of this.$store.state.Components.components[this.type]) {
          if (i.approval && this.states.indexOf(i.approval) == -1) {
            Vue.set(this.states, this.states.length, i.approval);
          }
        }
      }
    },
    convertDate(date) {
      return Date.parse(date) / 1000;
    },
	getDateNowRound() {
		// Round minutes to 5
		let date = new Date();
		date.setSeconds(0);
		date.setMinutes(Math.ceil(date.getMinutes()/5)*5);
		return date;
	},
    getComponents() {
	  this.searchText = "";
	  this.$store.state.Components.currentType = this.type;
      if (this.$store.state.Components.components[this.type] === undefined) {
        this.isLoading = true;
        this.$store
          .dispatch("Components/fetch", this.type)
          .then(() => {
            this.isLoading = false;
            this.getStates();
          })
          .catch((error: any) => {
            console.log(error)
            this.refreshing = false;
            this.$buefy.toast.open({
              message: `Failed to get data: ${error.message}`,
              type: "is-danger",
              duration: 8000
            });
          });
      } else {
        this.getStates();
      }
    },
		refreshComponents() {
			this.$store.state.Components.components = {};
			this.getComponents();
		}
  }
}
</script>

<style lang="scss">
label .checkbox {
	margin-right: 5px;
	margin-left: 10px;
}
</style>
