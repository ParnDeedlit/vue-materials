<template>
	<div>
		<q-tabs v-model="tab"
						dense
						class="text-grey"
						active-color="primary"
						indicator-color="primary"
						align="justify"
						narrow-indicator
		>
			<q-tab name="坐标定位"
						 label="坐标定位"/>
			<q-tab name="行政区划定位"
						 label="行政区划定位"/>
			<q-tab name="图幅号定位"
						 label="图幅号定位"/>
		</q-tabs>

		<q-separator/>

		<q-tab-panels v-model="tab" animated>
			<q-tab-panel name="坐标定位">
				<q-form class="q-gutter-md">
					<q-input outlined
									 prefix="X坐标:"
									 v-model="posCoord.lng"/>
					<q-input outlined
									 prefix="X坐标:"
									 v-model="posCoord.lat"/>
					<div class="q-gutter-sm checkbox-label">
						<q-checkbox v-model="useCrs"
												label="设置空间参考"/>
						<q-checkbox v-model="pickCoord"
												label="鼠标拾取坐标"/>
					</div>
					<q-select v-show="useCrs"
										outlined
										v-model="selectCrs"
										:options="crsOptions"/>
					<q-btn color="primary"
								 label="定位坐标"
								 class="q-mr-xs"
								 @click="positionCoord"/>
				</q-form>
				<mapbox-marker :coordinates="markerCoord">
				</mapbox-marker>
			</q-tab-panel>

			<q-tab-panel name="行政区划定位">
				<div class="text-h6">行政区划定位</div>
			</q-tab-panel>

			<q-tab-panel name="图幅号定位">
				<div class="text-h6">图幅号定位</div>
			</q-tab-panel>
		</q-tab-panels>
	</div>
</template>

<script>
	import {MapboxMarker} from '@mapgis/webclient-vue-mapboxgl'

	export default {
		name: "Position",
		components: {
			MapboxMarker
		},
		data() {
			return {
				tab: "坐标定位",
				posCoord: {
					lng: 114,
					lat: 30
				},
				useCrs: false,
				pickCoord: false,
				selectCrs: '',
				crsOptions: ['默认', '地理坐标系(北京)_度', '地理坐标系(北京)_分', '地理坐标系(北京)_秒', '地理坐标系(西安)_度', '地理坐标系(西安)_分'],
				markerCoord: [null, null]
			}
		},
		methods: {
			positionCoord() {
				this.markerCoord = [this.posCoord.lng, this.posCoord.lat]
			}
		}
	}
</script>

<style scoped>
	.checkbox-label {
		color: rgba(0, 0, 0, 0.87)
	}
</style>
