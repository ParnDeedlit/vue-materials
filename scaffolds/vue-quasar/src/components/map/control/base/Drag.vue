<template>
  <q-page-container class="mapbox-page-container">
    <q-page
      padding
      :style-fn="layerPage"
    >
      <slot></slot>
      <!-- <q-page-sticky
        position="bottom-right"
        :offset="fabPos"
        label="可拖拽图层"
      >
        <q-fab
          color="primary"
          glossy
          :disable="draggingFab"
          v-touch-pan.prevent.mouse="moveFab"
          direction="down"
          label="图层控制"
        >
          <slot></slot>
        </q-fab>
      </q-page-sticky> -->
    </q-page>
  </q-page-container>
</template>
<script>

export default {
  name: 'BasePageContainer',
  components: {

  },
  props: {

  },
  mounted() {

  },
  created() { },
  data() {
    return {
      fabPos: [100, 100],
      draggingFab: false,
    };
  },
  watch: {

  },
  computed: {

  },
  methods: {
    moveFab(ev) {
      this.draggingFab = ev.isFirst !== true && ev.isFinal !== true;

      this.fabPos = [
        this.fabPos[0] - ev.delta.x,
        this.fabPos[1] - ev.delta.y,
      ];
    },
    layerPage(offset) {
      return { maxHeight: offset ? `calc(100vh - ${offset}px)` : '100vh' };
    },
  },
};
</script>

<style lang="scss">
.mapbox-page-container {
  .q-btn.disabled {
    opacity: 0.95 !important;
  }
  .disabled,
  .disabled *,
  [disabled],
  [disabled] * {
    outline: 0 !important;
    cursor: pointer !important;
  }
}
</style>
