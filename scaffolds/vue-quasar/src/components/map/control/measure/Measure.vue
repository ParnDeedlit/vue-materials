<template>
  <q-page-sticky
    position="top-left"
    :offset="fabPos"
    label="可拖拽图层"
    v-touch-pan.prevent.mouse="move"
  >
    <div class="row mapbox-measure-wrapper">
      <q-card>
        <q-card-section class="bg-title text-title">
          <div class="text-h7">测量</div>
        </q-card-section>

        <q-separator inset />

        <q-card-section>
          <q-btn
            v-for="(item,i) in buttons"
            :key="i"
            flat
            :color="item.type"
            @click="item.click"
          >
            <q-icon :name="item.icon" />
            {{item.tip}}
          </q-btn>
          <div class="q-px-sm">
            <q-select
              v-model="unit"
              :options="units"
              prefix="单位："
            />
          </div>
        </q-card-section>
      </q-card>

      <mapbox-measure
        class="measure-draw-wrapper"
        position="bottom-left"
        ref="measure"
        :measureMode="measureMode"
        @added="handleAdded"
        @measureResult="getMeasureResult"
      >
        <div slot="measureMarker">
          <mapbox-marker
            v-for="(item,i) in measureMarkers"
            :key="'measuer-marker-'+i"
            :coordinates="item.coordinates"
          >
            <div
              slot="marker"
              :style="item.style"
            >{{item.text}}
            </div>
          </mapbox-marker>
        </div>
      </mapbox-measure>
    </div>
  </q-page-sticky>
</template>

<script>
import {
  MapboxMeasure,
  MapboxMarker
} from '@mapgis/webclient-vue-mapboxgl'
import { mdiMapMarkerPath, mdiChartAreaspline, mdiDelete } from '@quasar/extras/mdi-v4'
import { getCenterOfGravityPoint } from "../../util/util"

const measureModes = {
  measureLength: 'measure-length',
  measureArea: 'measure-area'
}
export default {
  name: 'Measure',
  data () {
    return {
      fabPos: [10, 70],
      buttons: [
        {
          icon: mdiMapMarkerPath,
          type: 'primary',
          tip: '长度测量',
          click: this.toggleMeasureLength
        },
        {
          icon: mdiChartAreaspline,
          type: 'primary',
          tip: '面积测量',
          click: this.toggleMeasureArea
        },
        {
          icon: mdiDelete,
          type: 'primary',
          tip: '删除',
          click: this.toggleDelete
        }
      ],
      unit: '千米',
      units: ['m', 'km', '米', '千米'],
      measureMode: null,
      measureMarkers: []
    }
  },
  watch: {
    measureMode: {
      deep: true,
      handler () {
        this.measureMarkers = [];
      }
    },
		unit:{
			deep: true,
			handler () {
				this.toggleDelete ();
			}
		}
  },
  components: {
    MapboxMeasure,
    MapboxMarker
  },
  methods: {
    move (ev) {
      this.fabPos = [
        this.fabPos[0] + ev.delta.x,
        this.fabPos[1] + ev.delta.y
      ]
    },
    handleAdded (e) {
      let { measure } = e
      this.measure = measure
    },
    getMeasureResult (result) {
      console.log(result)
      let formateResult
      let marker
      let r = 1;
      if (this.unit === 'km' || this.unit === '千米') {
        r = 1000
      } else if (this.unit === 'km2' || this.unit === '平方千米') {
        r = 1000 * 1000
      }
      formateResult = (result.result / r).toFixed(2)
      switch (this.measureMode) {
        case measureModes.measureLength:
          marker = {
            coordinates: result.coordinates[result.coordinates.length - 1],
            text: formateResult + this.unit,
            style: 'color:red'
          }
          this.measureMarkers.push(marker)
          break
        case measureModes.measureArea:
          marker = {
            coordinates: getCenterOfGravityPoint(result.coordinates[0]),
            text: formateResult + this.unit,
            style: 'color:red'
          }
          this.measureMarkers.push(marker)
          break
      }
    },
    enableMeasure () {
      let component = this.$refs.measure
      component && component.enableMeasure()
    },
    toggleMeasureLength () {
      this.enableMeasure()
      this.measureMode = measureModes.measureLength;
      this.units = ['m', 'km', '米', '千米']
			if(this.units.indexOf(this.unit)===-1){
				this.unit = '千米'
			}
      this.measure && this.measure.changeMode('draw_line_string')
    },
    toggleMeasureArea () {
      this.enableMeasure()
      this.measureMode = measureModes.measureArea
      this.units = ['m2', 'km2', '平方米', '平方千米']
			if(this.units.indexOf(this.unit)===-1){
				this.unit = '平方千米'
			}
      this.measure && this.measure.changeMode('draw_polygon')
    },
    toggleDelete () {
      this.enableMeasure()
      this.measureMarkers = []
      this.measure && this.measure.deleteAll()
    }
  }
}
</script>

<style lang="css">
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
}

.main {
  height: 100vh;
  width: 100%;
}

.button {
  border: #000 2px solid;
  height: 30px;
  text-align: center;
}

.mapbox-measur-wrapper {
  width: 250px;
}
</style>
