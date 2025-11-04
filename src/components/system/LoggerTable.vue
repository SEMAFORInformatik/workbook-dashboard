<template lang="pug">
div
  h3.subtitle.is-3 Loggers
  b-loading(:active.sync="isLoading")
  b-table(:data="loggers" striped hoverable)
    b-table-column(v-slot="props" label="Name" field="name" sortable searchable)
      span.logger-name {{ props.row.name }}
    b-table-column(v-slot="props" label="Log Level" field="level")
      div.button-bar
        button(v-for="level in currentLogLevels"
          :class="getButtonStyling(level, props.row.effectiveLevel)"
          @click="changeLogLevel(props.row.name, level)")
           | {{level}}
</template>
<script lang="ts">
import Vue from "vue";
import { Logger } from "../../models"
export default {
    name: "logger-table",
    created() {
      this.isLoading = true;
      this.getAllLoggers()
    },
    data() {
      return {
        isLoading: false,
        loggers: [],
      };
    },
    methods: {
      getAllLoggers() {
        this.$store
          .dispatch("Loggers/fetch")
          .then((response: any) => {
            this.loggers = this.$store.state.Loggers.loggers;
            this.isLoading = false;
          })
          .catch((error: any) => {
            this.$buefy.toast.open({
            message: `Failed to get data: ${error.message}`,
            type: "is-danger",
            duration: 3000
          })
        })
      },
      getButtonStyling(selectedLevel, activeLevel) {
        if(selectedLevel == activeLevel) {
          switch(activeLevel) {
            case 'OFF':
              return 'button-off';
            case 'ERROR':
              return 'button-error';
            case 'WARN':
              return 'button-warn';
            case 'INFO':
              return 'button-info';
            case 'DEBUG':
              return 'button-debug';
            case 'TRACE':
              return 'button-trace';
          }
        } else {
          // In case that button doesn't represent active level
          return 'button-inactive'
        }
      },
      changeLogLevel(loggerName, logLevel) {
        let logger = {
          name: loggerName,
          effectiveLevel: logLevel,
          configuredLevel: logLevel
        }
        this.$store
          .dispatch("Loggers/update", logger)
          .then((response: any) => {
            this.getAllLoggers();
          })
          .catch((error: any) => {
            this.$buefy.toast.open({
            message: `Failed to get data: ${error.message}`,
            type: "is-danger",
            duration: 3000
          })
        })
      }
    },
    computed: {
      currentLogLevels() {
        return this.$store.state.Loggers.levels;
      }
  }
}
</script>
<style lang="scss">
.logger-name {
  font-size: 0.8em;
  word-break: break-all;
}

// Button Bar 
.button-bar button {
  border: 0px solid black;
  padding: 10px 15px; 
  cursor: pointer; 
  float: left; 
}

.button-bar button:not(:last-child) {
  border-right: none;
}

.button-bar:after {
  content: "";
  clear: both;
  display: table;
}

.button-inactive {
  background-color: #e8e8e8;
  color: black;
}
.button-off {
  background-color: black;
  color: white;
}
.button-error {
  background-color: #FF0039;
  color: white; 
}
.button-warn {
  background-color: #FF7518;
  color: white; 
}
.button-info {
  background-color: #9954BB;
  color: white; 
}
.button-debug {
  background-color: #3FB618;
  color: white; 
}
.button-trace {
  background-color: #2780E3;
  color: white; 
}
</style>
