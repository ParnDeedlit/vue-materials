import {OneMapDocument} from '../../json/document'
import axios from "axios"

export default {
	name: "getLayersInfos",
	inject: ['mapbox'],
	data() {
		return {
			document: OneMapDocument,
			layerNames: []
		}
	},
	methods: {
		getQueryLayers() {
			let queryLayers = [];
			let childrens = this.document.layers[0].children;
			for (let i = 0; i < childrens.length; i++) {
				if (childrens[i].children && childrens[i].children.length > 0) {
					let childs = childrens[i].children;
					for (let j = 0; j < childs.length; j++) {
						if (childs[j].subtype === "IgsDocLayer" || childs[j].subtype === "IgsVectorLayer") {
							queryLayers.push(childs[j])
						}
					}
				}
			}
			return queryLayers
		},
		getDocLayers(docParam) {
			let self = this
			let domain = docParam.url.split("/igs/rest/mrms")[0]
			let url = domain + "/igs/rest/mrcs/docs/" + docParam.name + "/0/layers?f=json";
			const promise = new Promise(resolve => {
				axios.get(url).then(function ({data}) {
					if (!data || data.length < 1) {
						resolve(null)
					} else {
						let layersInfo = []
						for (let i = 0; i < data.length; i++) {
							let obj = {
								layerType: "IgsDocLayer",
								layerName: data[i].Name,
								baseUrl: domain + "/igs/rest/mrfs/docs/" + docParam.name + "/0/" + i + "/query"
							};
							layersInfo.push(obj)
							self.layerNames.push(data[i].Name)
						}
						resolve(layersInfo)
					}
				})
			})
			return promise.then((res) => {
				return res
			})
		},
		async getLayers() {
			let queryLayers = this.getQueryLayers();
			let layersInfo = [];
			this.layerNames = []
			for (let i = 0; i < queryLayers.length; i++) {
				if (queryLayers[i].subtype === "IgsDocLayer") {
					let docLayers = await this.getDocLayers(queryLayers[i]);
					layersInfo = [...layersInfo, ...docLayers]
				} else if (queryLayers[i].subtype === "IgsVectorLayer") {
					let domain = queryLayers[i].url.split("/igs/rest/mrms")[0];
					let obj = {
						layerType: "IgsVectorLayer",
						layerName: queryLayers[i].name,
						baseUrl: domain + +"/igs/rest/mrfs/layer/query"
					};
					layersInfo.push(obj);
					this.layerNames.push(queryLayers[i].name)
				}
			}
			return layersInfo
		}

	}
}
