<template>
	<div>
		<div class="q-pa-md btn-div" v-show="!showRes">
			<div class="q-gutter-y-md">
				<q-btn v-for="item in queryPositionConfig.queryGdbp"
							 flat
							 :key="item.placeName"
							 :label="item.placeName"
							 @click="getPositions(item)"/>
			</div>
		</div>
		<div v-show="showRes">
			<div class="list-div">
				<q-list separator>
					<q-item clickable
									v-ripple
									v-for="(item,i) in positionInfos"
									:key="'positionInfos'+i">
						<q-item-section avatar>
							<q-avatar>
								<img :src="positionRed">
							</q-avatar>
						</q-item-section>

						<q-item-section>
							<q-item-label v-for="(child,n) in item"
														:key="i+child+n"
														caption>{{child}}
							</q-item-label>
						</q-item-section>
					</q-item>
				</q-list>
			</div>
			<q-pagination v-model="currentPageIndex"
										:max="maxPage"
										:input="true"/>
		</div>
		<mapbox-marker v-for="(item,i) in markersInfos"
									 :key="'queryposition-marker-'+i"
									 :coordinates="item.coordinates">
			<mapbox-popup :coordinates="item.coordinates"
										:showed="true">
				<div>
					<div v-for="(child,n) in item.attrs"
							 v-show="child!==''"
							 :key="'queryposition-marker-'+i+'attrs-'+n"
							 class="popup-text">{{fieldNames[n]}} : {{child}}
					</div>
				</div>
			</mapbox-popup>
		</mapbox-marker>
	</div>
</template>

<script>
	import queryPositionConfig from '../../json/queryPositionInOne.json'
	import positionRed from "../../../../assets/position-red.png"
	import axios from "axios"
	import {MapboxMarker, MapboxPopup} from '@mapgis/webclient-vue-mapboxgl'
	import "../mapControlStyle.css"

	console.log(queryPositionConfig)
	export default {
		name: "ShowPosition",
		inject: ['map'],
		components: {MapboxMarker, MapboxPopup},
		props: {
			inputFocusCount: {
				type: Number,
				default: 0
			}
		},
		watch: {
			inputFocusCount: {
				deep: true,
				handler() {
					this.showRes = false
				}
			},
			currentPageIndex: {
				deep: true,
				handler() {
					this.getPositions(this.selectedData)
				}
			}
		},
		data() {
			return {
				queryPositionConfig: queryPositionConfig,
				currentPageIndex: 1,
				maxPage: 100,
				positionRed: positionRed,
				positionInfos: [],
				markersInfos: [],
				showRes: false,
				fieldNames: [],
				selectedData: queryPositionConfig.queryGdbp[0]
			}
		},
		methods: {
			getPositions(item) {
				console.log(this.map)
				this.selectedData = item
				this.showRes = true;
				let showAttrsAndTitle = item.showAttrsAndTitle;
				let fields = [];
				let names = [];
				for (let i = 0; i < showAttrsAndTitle.length; i++) {
					let filed = showAttrsAndTitle[i].attr;
					fields.push(filed);
					let name = showAttrsAndTitle[i].showName;
					names.push(name)
				}
				this.fieldNames = names;
				let params = {
					gdbp: item.gdbp,
					srsIds: "地理坐标系(西安)_度",
					pageCount: 10,
					page: this.currentPageIndex - 1,
					fields: fields.toString(),
					proj: "地理坐标系(西安)_度",
					rtnLabel: false,
					f: "json",
					structs: JSON.stringify({IncludeAttribute: true, IncludeGeometry: true, IncludeWebGraphic: false}),
					rule: JSON.stringify({
						CompareRectOnly: false,
						EnableDisplayCondition: false,
						MustInside: false,
						Intersect: true
					})
				};
				let url = "http://" + this.queryPositionConfig.ip + ":" + this.queryPositionConfig.port + "/igs/rest/mrfs/layer/query";
				axios.post(url, JSON.stringify(params)).then(function ({data}) {
					let features = data.SFEleArray;
					let markerCoords = [];
					let attrs = [];
					for (let i = 0; i < features.length; i++) {
						attrs.push(features[i].AttValue);
						let dot = features[i].fGeom.PntGeom[0].Dot;
						let coords = {
							coordinates: [dot.x, dot.y],
							attrs: features[i].AttValue
						};
						markerCoords.push(coords)
					}
					this.markersInfos = markerCoords;
					this.positionInfos = attrs
					this.maxPage = Math.ceil(data.TotalCount / 10)
				}.bind(this))
			}
		}
	}
</script>

<style scoped>
	.btn-div {
		color: rgba(0, 0, 0, 0.87);
		white-space: initial
	}

	.list-div {
		height: 500px;
		overflow: auto
	}

	.popup-text {
		color: white
	}
</style>
