<template>
  <mapbox-map
    class="onemap-mapbox-map"
    :accessToken="accessToken"
    :mapStyle="mapStyle"
    :zoom="mapZoom"
    :center="center"
    :crs="crs"
    @load="handleLoad"
    @move="handMove"
    @zoom="handZoom"
  >
    <!-- <q-page-container class="mapbox-page-container"> -->
    <q-page
      padding
      :style-fn="layerPage"
    >
<!--       <mapgis-document
        :wrapperStyle="docStyle"
        :document="document"
      >
        <template v-slot:document>
          <mapgis-document-quasar
            :document="document"
            :handleDocument="handleDocument"
          />
        </template>
      </mapgis-document> -->
      <mapbox-igs-tdt-layer
        v-for="l in backgrounds"
        :key="l.id"
        :layer="{}"
        :layerId="l.id"
        :sourceId="l.id"
        :baseURL="l.tileUrl"
        :token="l.token"
        :crs="crs"
      >
      </mapbox-igs-tdt-layer>
      <div
        v-for="l in vectors"
        :key="l.id"
      >
        <mapbox-vector-layer
          v-if="isVecterLayer(l.subtype)"
          :layerId="l.id"
          :layer="l"
          :sourceId="l.sourceId"
          :source="sources[l.sourceId]"
        />
      </div>
      <div
        v-for="l in rasters"
        :key="l.id"
      >
        <mapbox-raster-layer
          v-if="isRasterLayer(l.subtype)"
          :layerId="l.id"
          :layer="l"
          :sourceId="l.id"
          :source="l.source"
        />
        <mapbox-igs-tile-layer
          v-if="isIgsTileLayer(l.subtype)"
          :layer="l"
          :layerId="l.id"
          :sourceId="l.id"
          :url="l.url"
          :zoomOffset="1"
        />
        <mapbox-igs-doc-layer
          v-if="isIgsDocLayer(l.subtype)"
          :layer="l"
          :layerId="l.id"
          :sourceId="l.id"
          :url="l.url"
        />
      </div>
      <ellipsoid-bar v-if="control.Ellipsoid" v-bind="control.Ellipsoid" :center="center"/>
      <simple-draw v-if="control.SimpleDraw" v-bind="control.SimpleDraw" />
     <!--  <draw></draw>
      <measure></measure>
      <query-position></query-position>
      <query-features></query-features> -->
      <statebar v-if="control.Statebar" v-bind="control.Statebar"/>
    </q-page>
  </mapbox-map>
</template>

<script>
import '@mapgis/mapbox-gl/dist/mapbox-gl.css';
import Mapbox from '@mapgis/mapbox-gl';
import {
  MapboxMap,
  // MapgisDocument,
  MapboxVectorLayer,
  MapboxRasterLayer,
  MapboxIgsTileLayer,
  MapboxIgsDocLayer,
  MapboxIgsTdtLayer,
  // MapboxIgsWmtsLayer
} from '@mapgis/webclient-vue-mapboxgl';
import {
  IDocument,
  Layer,
  VectorTile,
  Util,
} from '@mapgis/webclient-store';

// import MapgisDocumentQuasar from './document/Document';
import EllipsoidBar from './control/ellipsoid/Ellipsoid';
import Statebar from './control/statebar/Statebar';
import SimpleDraw from './control/draw/SimpleDraw';
/* import Draw from './control/draw/Draw';
import Measure from './control/measure/Measure';
import QueryPosition from './query/queryPositon/QueryPosition';
import QueryFeatures from './query/queryFeatures/QueryFeatures'; */

const { IgsLayerType } = Layer;
const { UUID } = Util;
const { Convert } = VectorTile;

export default {
  name: 'OmMap',
  props: {
    propsStyle: {
      type: Object,
      required: true,
    },
    propsDocument: {
      type: Object,
      required: true,
    },
    changePropsDocument: {
      type: Function,
      required: true,
    },
  },
  data() {
    return {
      // 样式
      docStyle: {},
      // 使用mapbox样式需要的秘钥
      accessToken: 'pk.eyJ1IjoicGFybmRlZWRsaXQiLCJhIjoiY2o1MjBtYTRuMDhpaTMzbXhpdjd3YzhjdCJ9.sCoubaHF9-nhGTA-sgz0sA',
      mapStyle: this.propsStyle, // 地图样式
      document: this.initDocument(),
      mapZoom: 4, // 地图初始化级数
      center: { lng: 110, lat: 32 }, // 地图显示中心
      crs: 'EPSG:3857',
      sources: {},
      backgrounds: [],
      rasters: [],
      vectors: [],
      control: this.initControl(),
      map: {},
    };
  },
  components: {
    EllipsoidBar,
    Statebar,
    SimpleDraw,
    /*     QueryFeatures,
    QueryPosition,
    Draw,
    Measure, */
    MapboxMap,
    // MapboxArrayLayer,
    MapboxIgsTileLayer,
    MapboxIgsDocLayer,
    MapboxRasterLayer,
    MapboxVectorLayer,
    MapboxIgsTdtLayer,
    // MapboxIgsWmtsLayer,
    // MapgisDocument,
    // MapgisDocumentQuasar,
  },
  created() {
    // 在组件中使用mapbox-gl.js的脚本库功能
    this.mapbox = Mapbox;
    this.parseBackgroud();
    this.parseRasterTile();
    this.parseVecterTile();
  },
  watch: {
    propsDocument(doc) {
      this.handleDocument(doc);
    },
  },
  methods: {
    layerPage(offset) {
      return { maxHeight: offset ? `calc(100vh - ${offset}px)` : '100vh' };
    },
    initDocument() {
      const doc = this.propsDocument;
      if (Object.keys(doc).length <= 0) {
        return {};
      }
      this.handleDocument(doc);
      return doc;
    },
    initControl() {
      const doc = this.initDocument();
      if (!doc || !doc.widget) { return {}; }
      return doc.widget.control;
    },
    handleDocument(doc) {
      this.document = doc;
      this.crs = doc.crs;
      this.parseBackgroud();
      this.parseRasterTile();
      this.parseVecterTile();
    },
    // 事件内
    handleLoad(payload) {
      const uid = UUID.uuid();
      console.log('handleLoad', uid, payload);
      const { map } = payload;
      this.map = map;
    },
    handMove(e) {
      this.center = e.map.getCenter();
    },
    handZoom(e) {
      this.center = e.map.getCenter();
    },
    isRasterLayer(subtype) {
      return subtype === 'Raster';
    },
    isVecterLayer(subtype) {
      return subtype === 'vectortile';
    },
    isIgsDocLayer(subtype) {
      return subtype === IgsLayerType.IgsDocLayer;
    },
    isIgsTileLayer(subtype) {
      return subtype === IgsLayerType.IgsTileLayer;
    },
    isIgsVectorLayer(subtype) {
      return subtype === IgsLayerType.IgsVectorLayer;
    },
    isIgsWmsLayer(subtype) {
      return subtype === IgsLayerType.IgsWmsLayer;
    },
    isIgsWmtsLayer(subtype) {
      return subtype === IgsLayerType.IgsWmtsLayer;
    },
    parseBackgroud() {
      if (!this.document) return;
      const idoc = IDocument.deepclone(this.document);
      this.backgrounds = idoc.backgrounds;
    },
    parseRasterTile() {
      if (!this.document) return;
      const idoc = IDocument.deepclone(this.document);
      const layers = new Convert().docTomvtLayers(idoc, false);
      const rasters = layers.filter((l) => {
        l.source = { type: 'raster', tiles: [l.url] };
        return l.type === 'raster';
      });
      this.rasters = rasters;
    },
    parseVecterTile() {
      if (!this.document) return;
      const idoc = IDocument.deepclone(this.document);
      const convert = new Convert();
      const layers = convert.docTomvtLayers(idoc, false);
      this.sources = convert.docTomvtSources(idoc);
      const vectors = layers.filter((l) => {
        if (l.subtype === 'vectortile') {
          l.sourceId = l.source;
          return true;
        }
        return false;
      });
      this.vectors = vectors;
    },
  },
};
</script>

<style lang="scss">
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
}

.onemap-page {
  // float: left;
}

.mapbox-page-container {
  height: calc(100vh - 100px);
  width: 100%;
  // float: left;
}

.cesium-page-container {
  height: calc(100vh - 50px);
  width: 100%;
  // float: left;
}

.onemap-mapbox-map {
  height: calc(100vh - 50px);
  width: 100%;
}
</style>
