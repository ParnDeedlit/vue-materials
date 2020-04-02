<template>
  <mapbox-base-draw
    ref="drawer"
    :controls="controls"
    @added="handleAdded"
    @drawCreate="handleCreate"
  >
    <q-page-sticky
      :position="position"
      :offset="currentOffset"
      label="可拖拽图层"
      v-touch-pan.prevent.mouse="$_move"
    >
      <div class="row">
        <q-toolbar rounded v-bind:class="className" :style="cssStyle">
        <!-- <q-btn-group v-bind:class="className" :style="cssStyle"> -->
          <q-btn
            flat
            round
            dense
            class="q-mr-xs"
            v-for="(item,i) in draws"
            :key="i"
            @click="item.click"
          >
            <q-icon :name="item.icon" :style="{'font-size': '24px', color:'#DADCE0'}"/>
            <q-tooltip transition-show="flip-right" transition-hide="flip-left"
              anchor="top middle">
              {{item.tip}}
            </q-tooltip>
          </q-btn>
        <!-- </q-btn-group> -->
        </q-toolbar>
      </div>
    </q-page-sticky>
  </mapbox-base-draw>
</template>

<script>
import {
  mdiMapMarkerOutline, mdiVectorLine, mdiVectorPolygon, mdiVectorRectangle,
  mdiDelete, mdiDeleteSweep,
} from '@quasar/extras/mdi-v4';

import {
  MapboxBaseDraw,
} from '@mapgis/webclient-vue-mapboxgl';

import controlMixin from '../../mixins/controMixin';
import componentMixin from '../../mixins/componentMixin';

export default {
  name: 'SimpleDraw',
  mixins: [controlMixin, componentMixin],
  data() {
    return {
      controls: {
        point: false,
        line_string: false,
        polygon: false,
        trash: false,
        combine_features: false,
        uncombine_features: false,
      },
      draws: [
        {
          icon: mdiMapMarkerOutline,
          type: 'primary',
          tip: '画点',
          click: this.togglePoint,
        },
        {
          icon: mdiVectorLine,
          type: 'primary',
          tip: '画线',
          click: this.togglePolyline,
        },
        {
          icon: mdiVectorRectangle,
          type: 'primary',
          tip: '画矩形',
          click: this.toggleRect,
        },
        {
          icon: mdiVectorPolygon,
          type: 'primary',
          tip: '画多边形',
          click: this.togglePolygon,
        },
        {
          icon: mdiDelete,
          type: 'primary',
          tip: '删除选中图元',
          click: this.toggleDelete,
        },
        {
          icon: mdiDeleteSweep,
          type: 'primary',
          tip: '删除全部',
          click: this.toggleDeleteAll,
        },
      ],
    };
  },
  components: {
    MapboxBaseDraw,
  },
  methods: {
    handleAdded(e) {
      const { drawer } = e;
      this.drawer = drawer;
    },
    handleCreate(e) {
      console.log('handleCreate', e);
      if (this.mode === 'QueryByRect' || this.mode === 'QueryByPolygon') {
        this.drawer.delete(e.features[0].id);
        // 执行查询操作
      }
    },
    enableDrawer() {
      const component = this.$refs.drawer;
      if (component) { component.enableDrawer(); }
    },
    toggleSimple() {
      this.enableDrawer();
      if (this.drawer) { this.drawer.changeMode('simple_select'); }
    },
    toggleDirect() {
      this.enableDrawer();
      if (this.drawer) {
        this.drawer.changeMode('direct_select', {
          featureId: '',
        });
      }
    },
    togglePoint() {
      this.enableDrawer();
      if (this.drawer) { this.drawer.changeMode('draw_point'); }
    },
    togglePolyline() {
      this.enableDrawer();
      if (this.drawer) { this.drawer.changeMode('draw_line_string'); }
    },
    toggleRect() {
      this.enableDrawer();
      if (this.drawer) { this.drawer.changeMode('draw_rectangle'); }
    },
    togglePolygon() {
      this.enableDrawer();
      if (this.drawer) { this.drawer.changeMode('draw_polygon'); }
    },
    toggleCombine() { },
    toggleUncombine() { },
    toggleDelete() {
      if (this.drawer) { this.drawer.trash(); }
    },
    toggleDeleteAll() {
      if (this.drawer) { this.drawer.deleteAll(); }
    },
    toggleQueryByRect() {
      this.enableDrawer();
      if (this.drawer) { this.drawer.changeMode('draw_rectangle'); }
      this.mode = 'QueryByRect';
    },
    toggleQueryByPolygon() {
      this.enableDrawer();
      if (this.drawer) { this.drawer.changeMode('draw_polygon'); }
      this.mode = 'QueryByPolygon';
    },
  },
};
</script>

<style lang="scss">
</style>
