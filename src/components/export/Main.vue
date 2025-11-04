<template>
  <div>
    <h2 class="title is-2">Database imports and exports</h2>
    <p class="container block">Current workbook mode: {{ shardMode }}</p>
    <div class="columns" style="position: relative">
      <b-loading
        :is-full-page="isLoadingFullscreen"
        v-model="isLoading"
      ></b-loading>
      <div class="column is-3-desktop is-3-tablet card">
        <h3 class="subtitle is-3">
          Import {{ shardMode === "main" ? "modifications" : "database" }} file
        </h3>
        <b-field class="file is-primary-light" :class="{ 'has-name': !!file }">
          <b-upload v-model="file" class="file-label">
            <span class="file-cta">
              <b-icon class="file-icon" icon="upload"></b-icon>
              <span class="file-label">Click to upload</span>
            </span>
            <span class="file-name" v-if="file">
              {{ file.name }}
            </span>
          </b-upload>
        </b-field>
        <b-button class="is-primary" @click="uploadFile"> Import </b-button>
      </div>

      <div class="column is-3-desktop is-3-tablet card">
        <h3 class="subtitle is-3">
          Export {{ shardMode === "replica" ? "modifications" : "database" }} to
          file
        </h3>
        <b-button
          class="is-primary"
          @click="
            shardMode === 'main'
              ? downloadFile('export.json')
              : downloadFile('modifications.json')
          "
        >
          Export
        </b-button>
      </div>
    </div>
    <b-modal
      v-model="mainImportModalOpen"
      has-modal-card
      trap-focus
      width="400"
    >
      <template #default="props">
        <div class="card container" style="padding: 2em">
          <h3 class="title is-3">Import status:</h3>
          <div v-if="diff.length">
            <p>The following entries are about to be updated:</p>
            <b-message
              v-model="showWarning"
              title="Up to date conflicts detected"
              type="is-warning"
              has-icon
              aria-close-label="Close message"
            >
              There are entries which have since been modified. <br />
              To override these changes with your own, please select them
              manually. Affected entries have been marked with a
              <b-icon pack="fa" icon="warning"></b-icon>
            </b-message>
            <diff-view
              :key="updateCount"
              :diff="diff"
              @checked="(ids) => (diffDataToKeep = ids)"
            ></diff-view>
          </div>
          <h4 v-else class="title is-4">No conflicts detected!</h4>
          <b-field label="Comment" label-position="on-border">
            <input
              type="text"
              v-model="modcomment"
              placeholder="Imported"
              class="input is-medium"
            />
          </b-field>
          <b-button @click="uploadWithDiff"> Import </b-button>
        </div>
      </template>
    </b-modal>
  </div>
</template>

<script lang="ts">
import instance from "../../axios-instance";
import DiffView from "./DiffView.vue";
import defaultConfig from "../../env-config";

export default {
  components: {
    DiffView,
  },

  data() {
    return {
      file: null,
      diff: null,
      updateCount: 0,
      modcomment: "",
      isLoading: false,
      isLoadingFullscreen: false,
      fileData: null,
      diffDataToKeep: [],
      showWarning: false,
      shardMode: "",
      mainImportModalOpen: false,
    };
  },
  async created() {
    this.shardMode = (await defaultConfig.springProps).shardMode;
  },
  methods: {
    async uploadFile() {
      this.fileData = JSON.parse(await this.file.text());
      this.upload();
    },
    async upload() {
      this.isLoading = true;
      try {
        const response = await instance.post("/import", this.fileData);
        this.mainImportModalOpen = false;
        this.file = false;
        this.$buefy.toast.open({
          message: `Successfully imported data!`,
          type: "is-success",
          duration: 3000,
        });
      } catch (error) {
        if (error.response.status !== 409) return;
        // Only take exceptions that have a modification
        const exceptions: any[] = error.response.data.exceptions.filter(
          (e) => e?.modifications,
        );

        this.diff = exceptions;

        // Pre-select every entry in the diff list that is not an upToDateConflict
        this.diffDataToKeep = exceptions
          .filter(({ status }) => status !== "upToDateConflict")
          .map(({ id }) => id);

        // Determine if we should show a warning about conflicts
        this.showWarning = exceptions.reduce(
          (acc, e) => acc || e.status === "upToDateConflict",
          false,
        );
        this.updateCount++;
        this.mainImportModalOpen = true;
      }
      this.isLoading = false;
      this.isLoadingFullscreen = false;
    },

    async uploadWithDiff() {
      this.isLoadingFullscreen = true;
      // Remove only the ones that were not part of the diff we got back and not new
      const removeUnwanted = (arr) =>
        arr.filter(
          (e) =>
            e.id === undefined ||
            this.diffDataToKeep.includes(Number(e.id)) ||
            !this.diff.find((e2) => e.id == e2.id),
        );

      const addMod = (arr) =>
        arr.map((e) => {
          return { interactiveReason: this.modcomment || "Imported", ...e };
        });

      // If upToDateConflicts reach here, it means they were checked by the user
      // to override the current saved version. To solve the conflict and overwrite
      // the contents we set the version to the one we got sent in the conflict
      const solveUpToDateConflict = (arr) =>
        arr.map((e) => {
          const diff = this.diff.find((e2) => e.id == e2.id);
          if (diff?.status !== "upToDateConflict") return e;
          return { ...e, version: diff.version };
        });

      const newData = {
        components: solveUpToDateConflict(
          addMod(removeUnwanted(this.fileData.components)),
        ),
        projects: solveUpToDateConflict(
          addMod(removeUnwanted(this.fileData.projects)),
        ),
        variants: solveUpToDateConflict(
          addMod(removeUnwanted(this.fileData.variants)),
        ),
      };
      this.fileData = newData;
      this.upload();
    },
    async downloadFile(name) {
      this.isLoading = true;
      const response = await instance.post(
        "/export",
        {},
        {
          responseType: "text",
        },
      );
      const file = new Blob([response.data], { type: "text/plain" });
      const a = document.createElement("a");
      const url = URL.createObjectURL(file);
      a.href = url;
      a.download = name;
      document.body.appendChild(a);
      a.click();
      this.isLoading = false;
    },
  },
};
</script>
