<template>
	<div>
		<q-page-sticky
						position="top-left"
						:offset="fabPos"
						label="可拖拽图层"
						v-touch-pan.prevent.mouse="move"
		>
			<div class="row query-feature-wrapper">
				<q-card>
					<q-card-section class="bg-title text-title">
						<div class="text-h7">要素查询</div>
					</q-card-section>

					<q-separator inset/>

					<q-card-section>
						<div>
							<q-btn
											v-for="(item,i) in buttons"
											:key="i"
											flat
											:color="item.type"
											@click="item.click"
							>
								<q-icon
												:name="item.icon"
								/>
								<div
												class="text-h9"
												style="color:black"
								>{{item.tip}}
								</div>
							</q-btn>
						</div>
						<q-card-section>
							<div>
								<div
												class="text-h9"
												style="color:black;float: left"
								>查询范围(km):
								</div>
								<q-slider
												style="float: right;width: 13em"
												v-model="queryRange"
												:min="0"
												:max="5"
												:step="0.1"
												:label-value="queryRange + 'km'"
												label
												label-always
												color="primary"
								/>
							</div>
						</q-card-section>
					</q-card-section>
				</q-card>
				<mapbox-base-draw
								ref="query"
								class="custom-draw-wrapper"
								position="bottom-left"
								:controls="controls"
								@added="handleAdded"
								@drawCreate="handleCreate"
				>
					<mapbox-marker v-for="(item,i) in markersInfos"
												 :key="'queryposition-marker-'+i"
												 :coordinates="item.coordinates">
						<mapbox-popup :coordinates="item.coordinates"
													:showed="true">
							<div style="max-height: 150px;overflow: auto;">
								<div v-for="(child,n) in item.attrs"
										 v-show="child!==''"
										 :key="'queryfeature-marker-'+i+'attrs-'+n"
										 class="popup-text">{{attrTableData.header[n]}} : {{child}}
								</div>
							</div>
						</mapbox-popup>
					</mapbox-marker>
				</mapbox-base-draw>
			</div>
		</q-page-sticky>
		<attribute-table
						:tab-names="layerNames"
						:tableData="attrTableData"
						:max-page="maxPage"
						@selectedTab="getQueryLayerName"
						@currentPageIndex="getCurrentPageIndex"
		></attribute-table>
	</div>
</template>

<script>
	import getLayersInfo from "./getLayersInfos"
	import AttributeTable from "../../control/attributeTable/AttributeTable"
	import {MapboxBaseDraw, MapboxMarker, MapboxPopup} from '@mapgis/webclient-vue-mapboxgl'
	import {mdiVectorRectangle, mdiVectorPolygon, mdiDelete} from '@quasar/extras/mdi-v4'
	import axios from "axios"
	import {lngLatToMercatorCoord, mercatorCoordToLngLat, getCenterOfGravityPoint} from "../../util/util"

	export default {
		name: "QueryFeatures",
		components: {AttributeTable, MapboxBaseDraw, MapboxMarker, MapboxPopup},
		mixins: [getLayersInfo],
		inject: ["mapbox"],
		data() {
			return {
				fabPos: [10, 300],
				buttons: [
					{
						icon: mdiVectorRectangle,
						type: 'primary',
						tip: '矩形查询',
						click: this.toggleQueryByRect
					},
					{
						icon: mdiVectorPolygon,
						type: 'primary',
						tip: '多边形查询',
						click: this.toggleQueryByPolygon
					},
					{
						icon: mdiDelete,
						type: 'primary',
						tip: '删除',
						click: this.toggleDelete
					}
				],
				controls: {
					point: false,
					line_string: false,
					polygon: false,
					trash: false,
					combine_features: false,
					uncombine_features: false
				},
				mode: null,
				queryLayers: [],
				currentPageIndex: 0,
				queryLayerInfo: null,
				attrTableData: null,
				maxPage: 1,
				queryRange: 0,
				markersInfos: []
			}
		},
		mounted() {
			this.init()
		},
		methods: {
			move(ev) {
				this.fabPos = [
					this.fabPos[0] + ev.delta.x,
					this.fabPos[1] + ev.delta.y
				]
			},
			async init() {
				this.queryLayers = await this.getLayers();
				console.log(this.queryLayers)
				this.queryLayerInfo = this.queryLayers[0]
			},
			handleAdded(e) {
				let {drawer} = e;
				this.drawer = drawer;
			},
			handleCreate(e) {
				if (this.mode === "QueryByRect" || this.mode === "QueryByPolygon") {
					let geometry = e.features[0].geometry;
					let geo = [];
					let coords = geometry.coordinates[0];
					if (geometry.type === "Polygon") {
						for (let i = 0; i < coords.length; i++) {
							let point = lngLatToMercatorCoord(coords[i]);
							geo = [...geo, ...point]
						}
					}
					this.geometry = {
						geometry: geo,
						geometryType: "polygon"
					};
					this.getFeatures()
					this.drawer && this.drawer.delete(e.features[0].id);
				}
			},
			enableQuery() {
				let component = this.$refs.query
				component && component.enableDrawer()
			},
			toggleQueryByRect() {
				this.enableQuery();
				this.drawer && this.drawer.changeMode("draw_rectangle");
				this.mode = "QueryByRect";
			},
			toggleQueryByPolygon() {
				this.enableQuery();
				this.drawer && this.drawer.changeMode("draw_polygon");
				this.mode = "QueryByPolygon";
			},
			toggleDelete() {
				this.enableQuery()
				this.markersInfos = []
				this.drawer && this.drawer.deleteAll()
			},
			getCurrentPageIndex(e) {
				this.currentPageIndex = e - 1;
				this.getFeatures();
			},
			getQueryLayerName(e) {
				for (let i = 0; i < this.queryLayers.length; i++) {
					if (this.queryLayers[i].layerName === e) {
						this.queryLayerInfo = this.queryLayers[i];
						this.getFeatures();
						return
					}
				}
			},
			getFeatures() {
				if (!this.queryLayerInfo || !this.geometry) {
					return
				}
				this.attrTableData = {
					header: [],
					data: []
				}
				this.markersInfos = []
				this.maxPage = 1
				let params = [
					"geometry=" + this.geometry.geometry,
					"geometryType=" + this.geometry.geometryType,
					"srsIds=" + "地理坐标系(西安)_度",
					"pageCount=" + 10,
					"page=" + this.currentPageIndex,
					"proj=" + "地理坐标系(西安)_度",
					"f=" + "json",
					"structs=" + JSON.stringify({IncludeAttribute: true, IncludeGeometry: true, IncludeWebGraphic: false})
				];
				let url = this.queryLayerInfo.baseUrl + "?" + params.join("&");
				axios.get(url).then(function ({data}) {
					console.log(data)
					let tableData = []
					let tags = data.AttStruct.FldName;
					let features = data.SFEleArray;
					if (!features || features.length < 1) {
						return
					}
					let markerCoords = [];
					let attrs = [];
					for (let i = 0; i < features.length; i++) {
						let bound = features[i].bound;
						let minXY = mercatorCoordToLngLat([bound.xmin, bound.ymin]);
						let maxXY = mercatorCoordToLngLat([bound.xmax, bound.ymax]);
						let bounds = [minXY, maxXY];
						let attValue = features[i].AttValue;
						let obj = {
							bounds: bounds
						}
						for (let j = 0; j < tags.length; j++) {
							obj[tags[j]] = attValue[j]
						}
						attrs.push(features[i].AttValue);
						let dots = features[i].fGeom.RegGeom[0].Rings[0].Arcs[0].Dots;
						let lnglats = []
						for (let i = 0; i < dots.length; i++) {
							let lnglat = mercatorCoordToLngLat([dots[i].x, dots[i].y]);
							lnglats.push(lnglat)
						}
						let coords = {
							coordinates: getCenterOfGravityPoint(lnglats),
							attrs: features[i].AttValue
						};
						markerCoords.push(coords)
						obj.coordinates = lnglats
						tableData.push(obj)
					}
					this.markersInfos = markerCoords;
					let attrTableData = {
						header: tags,
						data: tableData
					};
					console.log(attrTableData)
					this.attrTableData = attrTableData
					this.maxPage = Math.ceil(data.TotalCount / 10)
				}.bind(this))
			}
		}
	}
</script>

<style scoped>

	.query-feature-wrapper {
		width: 50em;
	}

	.popup-text {
		color: white
	}
</style>
