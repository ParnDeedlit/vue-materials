<template>
  <mapbox-base-draw
    ref="drawer"
    :controls="controls"
    @added="handleAdded"
    @drawCreate="handleCreate"
  >
    <q-page-sticky
      position="top-left"
      :offset="fabPos"
      label="可拖拽图层"
      v-touch-pan.prevent.mouse="move"
    >
      <div class="row mapbox-draw-wrapper">
        <q-toolbar class="col-8 bg-grey-3">
          <q-toolbar-title>绘制</q-toolbar-title>
          <q-btn
            flat
            round
            dense
            class="q-mr-sm"
            v-for="(item,i) in draws"
            :key="i"
            @click="item.click"
          >
            <q-icon :name="item.icon" />
            <q-tooltip>{{item.tip}}</q-tooltip>
          </q-btn>
        </q-toolbar>
        <!--<q-toolbar class="col-4 bg-primary text-white">-->
          <!--<q-toolbar-title>查询</q-toolbar-title>-->
          <!--&lt;!&ndash; <q-space /> &ndash;&gt;-->
          <!--<q-btn-->
            <!--flat-->
            <!--round-->
            <!--dense-->
            <!--class="q-mr-sm"-->
            <!--v-for="(item,i) in querys"-->
            <!--:key="i"-->
            <!--@click="item.click"-->
          <!--&gt;-->
            <!--<q-icon :name="item.icon" />-->
            <!--<q-tooltip>{{item.tip}}</q-tooltip>-->
          <!--</q-btn>-->
        <!--</q-toolbar>-->
      </div>
    </q-page-sticky>
  </mapbox-base-draw>
</template>

<script>
import BasePageContainer from '../base/Drag'

import {
  mdiVectorCircleVariant, mdiVectorLine, mdiVectorPolygon, mdiVectorRectangle,
  mdiDelete, mdiDeleteSweep
} from '@quasar/extras/mdi-v4'


import {
  MapboxBaseDraw
} from '@mapgis/webclient-vue-mapboxgl'

export default {
  name: 'Draw',
  data () {
    return {
      fabPos: [10, 10],
      controls: {
        point: false,
        line_string: false,
        polygon: false,
        trash: false,
        combine_features: false,
        uncombine_features: false
      },
      draws: [
        {
          icon: mdiVectorCircleVariant,
          type: "primary",
          tip: "画点",
          click: this.togglePoint
        },
        {
          icon: mdiVectorLine,
          type: "primary",
          tip: "画线",
          click: this.togglePolyline
        },
        {
          icon: mdiVectorRectangle,
          type: "primary",
          tip: "画矩形",
          click: this.toggleRect
        },
        {
          icon: mdiVectorPolygon,
          type: "primary",
          tip: "画多边形",
          click: this.togglePolygon
        },
        {
          icon: mdiDelete,
          type: "primary",
          tip: "删除选中图元",
          click: this.toggleDelete
        },
        {
          icon: mdiDeleteSweep,
          type: "primary",
          tip: "删除全部",
          click: this.toggleDeleteAll
        }
      ],
      // querys: [
      //   {
      //     icon: mdiVectorRectangle,
      //     type: "default",
      //     tip: "矩形查询",
      //     click: this.toggleQueryByRect
      //   },
      //   {
      //     icon: mdiVectorPolygon,
      //     type: "default",
      //     tip: "多边形查询",
      //     click: this.toggleQueryByPolygon
      //   }
      // ],
    }
  },
  components: {
    MapboxBaseDraw,
    BasePageContainer
  },
  methods: {
    move (ev) {
      this.fabPos = [
        this.fabPos[0] + ev.delta.x,
        this.fabPos[1] + ev.delta.y
      ]
    },
    handleAdded (e, data) {
      let { drawer, map } = e;
      this.drawer = drawer;
    },
    handleCreate (e) {
      if (this.mode == "QueryByRect" || this.mode == "QueryByPolygon") {
        this.drawer.delete(e.features[0].id);
        // 执行查询操作
      }
    },
    enableDrawer () {
      let component = this.$refs.drawer
      component && component.enableDrawer()
    },
    toggleSimple (e) {
      this.enableDrawer();
      this.drawer && this.drawer.changeMode("simple_select");
    },
    toggleDirect (e) {
      this.enableDrawer();
      this.drawer &&
        this.drawer.changeMode("direct_select", {
          featureId: "" // The id of the feature that will be directly selected (required)
        });
    },
    togglePoint (e) {
      this.enableDrawer();
      this.drawer && this.drawer.changeMode("draw_point");
    },
    togglePolyline () {
      this.enableDrawer();
      this.drawer && this.drawer.changeMode("draw_line_string");
    },
    toggleRect () {
      this.enableDrawer();
      this.drawer && this.drawer.changeMode("draw_rectangle");
    },
    togglePolygon () {
      this.enableDrawer();
      this.drawer && this.drawer.changeMode("draw_polygon");
    },
    toggleCombine () { },
    toggleUncombine () { },
    toggleDelete () {
      this.drawer && this.drawer.trash();
    },
    toggleDeleteAll () {
      this.drawer && this.drawer.deleteAll();
    },
    toggleQueryByRect (e) {
      this.enableDrawer();
      this.drawer && this.drawer.changeMode("draw_rectangle");
      this.mode = "QueryByRect";
    },
    toggleQueryByPolygon (e) {
      this.enableDrawer();
      this.drawer && this.drawer.changeMode("draw_polygon");
      this.mode = "QueryByPolygon";
    }
  }
}
</script>

<style lang="scss">
.mapbox-draw-wrapper {
  width: 500px;
}
</style>
