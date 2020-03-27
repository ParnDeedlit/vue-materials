import {Crs} from "@mapgis/webclient-store"

/**
 * 获取多边形重心
 * @param lnglats
 * @returns {number[]}
 */
export function getCenterOfGravityPoint(lnglats) {
	let area = 0.0// 多边形面积
	let Gx = 0.0
	let Gy = 0.0// 重心的x、y
	for (let i = 1; i <= lnglats.length; i++) {
		const iLat = lnglats[i % lnglats.length][1]
		const iLng = lnglats[i % lnglats.length][0]
		const nextLat = lnglats[i - 1][1]
		const nextLng = lnglats[i - 1][0]
		const temp = (iLat * nextLng - iLng * nextLat) / 2.0
		area += temp
		Gy += temp * (iLat + nextLat) / 3.0
		Gx += temp * (iLng + nextLng) / 3.0
	}
	return [Gx / area, Gy / area]
}

/**
 * 4326坐标转3857坐标
 * @param lonlat
 */
export function lngLatToMercatorCoord(lonlat) {
	let source = "EPSG:4326"
	let destination = "+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext  +no_defs"
	return Crs.ProjectTool.proj4Transform(source, destination, lonlat)
}

/**
 * 38574326坐标转4326坐标
 * @param point
 */
export function mercatorCoordToLngLat(point) {
	let source = "EPSG:3857"
	let destination = "+proj=longlat +datum=WGS84 +no_defs"
	return Crs.ProjectTool.proj4Transform(source, destination, point)
}
