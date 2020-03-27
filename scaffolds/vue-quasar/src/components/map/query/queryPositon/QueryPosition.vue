<template xmlns:v-slot="http://www.w3.org/1999/XSL/Transform">
  <q-page-sticky
    position="top-right"
    :offset="fabPos"
  >
    <q-fab
      color="primary"
      glossy
      :disable="draggingFab"
      :icon="icons.locate"
      v-touch-pan.prevent.mouse="moveFab"
      direction="down"
      label="综合查询"
    >
      <q-fab-action
        disable
        color="primary"
        icon="keyboard_arrow_down"
      >
        <q-card class="query-position-card">
          <q-card-section>
            <q-toolbar>
              <q-btn
                round
                dense
                flat
                class="q-mr-xs"
                @click="showPos"
              >
                <q-icon
                  :name="icons.locate"
                  class="icon-style"
                />
              </q-btn>
              <q-input
                outlined
                v-model="text"
                class="q-ml-sm"
                @focus="hindPos"
                clearable
              />
              <q-btn
                round
                dense
                flat
                class="q-mr-xs"
              >
                <q-icon
                  :name="icons.path"
                  class="icon-style"
                />
              </q-btn>
            </q-toolbar>
            <position v-show="showPosition"></position>
            <ShowPosition
              v-show="showShowPosition"
              :input-focus-count="inputFocusCount"
            ></ShowPosition>
          </q-card-section>
        </q-card>
      </q-fab-action>
    </q-fab>
  </q-page-sticky>
</template>

<script>
import { mdiMagnify, mdiMapMarkerLeftOutline } from '@quasar/extras/mdi-v4'
import Position from "./Position";
import ShowPosition from "./ShowPosition";

export default {
  name: 'QueryPosition',
  inject: ['map'],
  components: {
    ShowPosition,
    Position
  },
  data () {
    return {
      fabPos: [280, 10],
      draggingFab: false,
      icons: {
        locate: mdiMapMarkerLeftOutline,
        path: mdiMagnify
      },
      text: '',
      showPosition: false,
      showShowPosition: false,
      inputFocusCount: 0
    }
  },
  created () {
  },
  methods: {
    moveFab (ev) {
      this.draggingFab = ev.isFirst !== true && ev.isFinal !== true

      this.fabPos = [
        this.fabPos[0] - ev.delta.x,
        this.fabPos[1] + ev.delta.y
      ]
    },
    layerPage (offset) {
      return { maxHeight: offset ? `calc(100vh - ${offset}px)` : '100vh' }
    },
    showPos () {
      this.showPosition = true
      this.showShowPosition = false
    },
    hindPos () {
      this.inputFocusCount++;
      this.showPosition = false;
      this.showShowPosition = true
    }
  }
}
</script>

<style lang="scss">
.query-position-card {
  width: 350px;
}

.icon-style {
  color: black;
  font-size: 30px;
}
</style>
