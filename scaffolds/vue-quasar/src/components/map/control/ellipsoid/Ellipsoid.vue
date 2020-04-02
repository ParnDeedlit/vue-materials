<template>
  <div>
    <q-page-sticky
      :position="position.zoom"
      :offset="offset.zoom"
    >
      <q-btn-group>
        <q-btn
          v-for="b in buttons"
          :key="b.name"
          round
          dark
          size="sm"
          :color="color"
          @click="b.click"
        >
          <q-icon :name="b.icon" />
        </q-btn>
      </q-btn-group>
    </q-page-sticky>
    <q-page-sticky
      :position="position.compass"
      :offset="offset.compass"
    >
      <q-btn
        round
        dark
        :color="color"
        @click="this.handleBearing"
        :style="rotateBearing"
      >
        <q-icon :name="icons.compass" />
      </q-btn>
    </q-page-sticky>
    <q-page-sticky
      :position="position.viewmode"
      :offset="offset.viewmode"
    >
      <q-btn
        round
        :color="color"
        @click="this.handlePitch"
      >
        <q-icon :name="icons.viewmode" />
      </q-btn>
    </q-page-sticky>
    <q-page-sticky
      :position="position.vr"
      :offset="offset.vr"
    >
      <q-btn
        round
        :color="color"
      >
        <q-icon :name="icons.vr" />
      </q-btn>
    </q-page-sticky>
    <q-page-sticky
      :position="position.gnss"
      :offset="offset.gnss"
    >
      <q-btn
        round
        :color="color"
        @click="this.handleGnss"
      >
        <q-icon :name="icons.gnss" />
      </q-btn>
    </q-page-sticky>
    <q-page-sticky
      :position="position.tellurion"
      :offset="offset.tellurion"
    >
      <tellurion :center="center" :bounds="bounds"/>
    </q-page-sticky>
  </div>
</template>

<script>
import {
  mdiCompass, mdiRotate3d, mdiHumanMale, mdiCrosshairsGps, mdiEarth,
  mdiPlusThick, mdiMinus,
} from '@quasar/extras/mdi-v4';
import componentMixin from '../../mixins/componentMixin';
import Tellurion from './Tellurion';

export default {
  mixins: [componentMixin],
  components: { Tellurion },
  props: {
    map: {
      type: Object,
      required: false,
    },
    center: {
      type: Object,
      required: false,
    },
    bounds: {
      type: Object,
      required: false,
    },
    bearing: {
      type: Number,
      default: 30,
      required: false,
    },
  },
  data() {
    return {
      buttons: [
        {
          name: '放大',
          tip: '放大',
          icon: mdiPlusThick,
          click: this.handleZoomIn,
        },
        {
          name: '缩小',
          tip: '缩小',
          icon: mdiMinus,
          click: this.handleZoomOut,
        },
      ],
      icons: {
        compass: mdiCompass,
        viewmode: mdiRotate3d,
        vr: mdiHumanMale,
        gnss: mdiCrosshairsGps,
        tellurion: mdiEarth,
      },
      position: {
        zoom: 'bottom-right',
        compass: 'bottom-right',
        viewmode: 'bottom-right',
        vr: 'bottom-right',
        gnss: 'bottom-right',
        tellurion: 'bottom-right',
      },
      offset: {
        zoom: [200, 40],
        compass: [130, 40],
        viewmode: [125, 95],
        vr: [85, 140],
        gnss: [20, 150],
        tellurion: [20, 35],
      },
      rotateBearing: {},
    };
  },
  watch: {
    bearing(val) {
      console.log('bearing', val);
      const rotate = val - 50;
      this.rotateBearing = { transform: `rotate(${rotate}deg)` };
    },
  },
  methods: {
    handleZoomIn() {
      if (this.map) {
        this.map.zoomIn();
      }
    },
    handleZoomOut() {
      if (this.map) {
        this.map.zoomOut();
      }
    },
    handlePitch() {
      if (this.map) {
        const pitch = this.map.getPitch();
        if (pitch <= 0) {
          this.map.setPitch(40);
        } else {
          this.map.setPitch(0);
        }
      }
    },
    handleBearing() {
      if (this.map) {
        this.map.setBearing(0);
      }
    },
    handleGnss() {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(this.handleGnssSuccess);
      } else {
        alert('浏览器不支持GPS定位!');
      }
    },
    handleGnssSuccess(positon) {
      if (this.map) {
        console.log('gnss', positon);
        this.map.setCenter({ lng: positon.coords.longitude, lat: positon.coords.latitude });
        this.map.setZoom(16);
      }
    },
  },
};
</script>
