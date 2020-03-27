<template>
  <mapbox-state-control
    :default="false"
    @added="handleAdded"
  >
    <template v-slot:default="slotProps">
      <q-page-sticky
        :position="position"
        :offset="currentOffset"
        label="可拖拽图层"
        v-touch-pan.prevent.mouse="move"
      >
      <div class="row mapbox-statebar">
        <q-bar :dark="parseTheme()" v-bind:class="className" :style="cssStyle">
          <span class="text-body2">MapGIS &nbsp;&nbsp;</span>
          <q-spinner-bars
            color="whtie"
            size="1em"
          />
          <span class="text-subtitle2 text-weight-light">
            &nbsp;&nbsp;{{percent}}% &nbsp;&nbsp;</span>
          <q-space />
          <q-separator :dark="parseTheme()" vertical inset/>
          <div class="text-subtitle2 text-weight-light">比例尺1:{{scale(slotProps)}} </div>
          <q-separator :dark="parseTheme()" vertical/>
          <div class="text-subtitle2 text-weight-light">级别:{{level(slotProps)}}</div>
          <div class="text-subtitle2 text-weight-light">经度:{{lng(slotProps)}}</div>
          <div class="text-subtitle2 text-weight-light">纬度:{{lat(slotProps)}}</div>
        </q-bar>
      </div>
      </q-page-sticky>
    </template>
  </mapbox-state-control>
</template>

<script>
// import { //mdiVectorCircleVariant,} from '@quasar/extras/mdi-v4';

import {
  MapboxStateControl,
} from '@mapgis/webclient-vue-mapboxgl';

import controlMixin from '../../mixins/controMixin';
import componentMixin from '../../mixins/componentMixin';

export default {
  name: 'Statebar',
  mixins: [controlMixin, componentMixin],
  data() {
    return {
      percent: '100',
    };
  },
  components: {
    MapboxStateControl,
  },
  methods: {
    parseTheme() {
      return this.theme === 'dark';
    },
    handleAdded(e) {
      const { control, map } = e;
      this.control = control;
      this.map = map;
    },
    scale(slotProps) {
      return parseInt(slotProps.state.scale, 10);
    },
    level(slotProps) {
      return slotProps.state.level.toFixed(2);
    },
    lng(slotProps) {
      return slotProps.state.lng.toFixed(8);
    },
    lat(slotProps) {
      return slotProps.state.lat.toFixed(8);
    },
  },
};
</script>

<style lang="scss">
.mapbox-statebar{
  // position: relative;
  .text-subtitle2{
    font-size: 11px;
  }
  .left {
    // float: left !important;
    // display     : flex;
  }
  .right{
    margin-right: 5px;
    // float: right !important;
    // display     : flex;
  }
}
</style>
