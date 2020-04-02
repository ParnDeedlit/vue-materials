<template>
  <canvas
    id='tellurion'
    ref='tellurion'
    :width="width"
    :height='height'
  />
</template>

<script>
import * as d3 from 'd3';
import versor from 'versor';
import land50 from './land50.json';
import land110 from './land110.json';
import graticule from './graticule.json';

// const projections = ['geoOrthographic', 'geoAzimuthalEqualArea', 'geoMercator'];
let TellurionSelf;
export default {
  name: 'Tellurion',
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
  },
  data() {
    return {
      projectionName: 'geoOrthographic',
      canvas: undefined,
      width: 100,
      height: 100,
      v0: 0,
      q0: 0,
      r0: 0,
      a0: 0,
      tl: 0,
    };
  },
  watch: {
    center(val) {
      if (val.lat === undefined || val.lng === undefined) return;
      this.zoomToCenter([-val.lng, -val.lat]);
    },
  },
  created() {
    TellurionSelf = this;
    this.projection = d3[this.projectionName]().precision(0.1);
    this.sphere = ({ type: 'Sphere' });
    this.height = this.getHeight();
  },
  mounted() {
    this.init();
  },
  methods: {
    init() {
      this.chart = this.initChart();
    },
    initChart() {
      const self = this;
      const dom = self.$refs.tellurion;
      // const context = dom.context2d(self.width, self.height);
      const context = dom.getContext('2d');
      self.context = context;
      const path = d3.geoPath(self.projection, self.context);
      self.path = path;

      return d3.select(self.context.canvas)
        .call(self.zoom(self.projection)
          .on('zoom.render', () => self.render(land110, graticule, self.bounds))
          .on('end.render', () => self.render(land50, graticule, self.bounds)))
        .call(() => self.render(land50, graticule, self.bounds))
        .node();
    },
    getCanva() {
      const dom = this.$refs.tellurion;
      const context = dom.getContext('2d');
      if (context) {
        this.canvas = context.canvas;
        return context.canvas;
      }
      return undefined;
    },
    getHeight() {
      const [[x0, y0], [x1, y1]] = d3.geoPath(
        this.projection.fitWidth(this.width, this.sphere),
      ).bounds(this.sphere);
      const dy = Math.ceil(y1 - y0);
      const l = Math.min(Math.ceil(x1 - x0), dy);
      this.projection.scale(this.projection.scale() * ((l - 1) / l)).precision(0.2);
      return dy;
    },
    render(land, lnglat, bounds) {
      const self = TellurionSelf;
      self.context.clearRect(0, 0, self.width, self.height);

      self.context.beginPath();
      self.path(self.sphere);
      self.context.fillStyle = '#fff';
      self.context.fill();

      self.context.beginPath();
      self.path(land);
      self.context.fillStyle = '#000';
      self.context.fill();

      self.context.beginPath();
      self.path(self.sphere);
      self.context.stroke();

      self.context.beginPath();
      self.path(lnglat);
      self.context.lineWidth = 0.5;
      self.context.strokeStyle = '#aaa';
      self.context.stroke();

      self.context.beginPath();
      self.path(bounds);
      self.context.lineWidth = 1.5;
      self.context.strokeStyle = '#f00';
      self.context.stroke();
      self.context.beginPath();
      self.path(bounds);
      self.context.fillStyle = '#44000088';
      self.context.fill();
    },
    zoomToCenter(centers) {
      TellurionSelf.projection.rotate(centers);
      d3.select(this.canvas)
        .call(() => this.render(land50, graticule, this.bounds));
    },
    point(that) {
      const t = d3.touches(that);

      if (t.length !== TellurionSelf.tl) {
        TellurionSelf.tl = t.length;
        if (TellurionSelf.tl > 1) {
          TellurionSelf.a0 = Math.atan2(t[1][1] - t[0][1], t[1][0] - t[0][0]);
        }
        TellurionSelf.zoomstarted.call(that);
      }

      return TellurionSelf.tl > 1
        ? [
          d3.mean(t, (p) => p[0]),
          d3.mean(t, (p) => p[1]),
          Math.atan2(t[1][1] - t[0][1], t[1][0] - t[0][0]),
        ]
        : d3.mouse(that);
    },
    zoomstarted(self, p1, canvas) {
      if (!canvas && !self && !p1) return;
      const canva = canvas.length > 0 ? canvas[0] : undefined;
      TellurionSelf.v0 = versor.cartesian(
        TellurionSelf.projection.invert(TellurionSelf.point(canva)),
      );
      TellurionSelf.q0 = versor((TellurionSelf.r0 = TellurionSelf.projection.rotate()));
    },
    zoomed(self, p1, canvas) {
      if (!canvas && !self && !p1) return;
      const canva = canvas.length > 0 ? canvas[0] : undefined;
      TellurionSelf.projection.scale(d3.event.transform.k);
      const pt = TellurionSelf.point(canva);
      const { r0 } = TellurionSelf;
      const v1 = versor.cartesian(TellurionSelf.projection.rotate(r0).invert(pt));
      const delta = versor.delta(TellurionSelf.v0, v1);
      let q1 = versor.multiply(TellurionSelf.q0, delta);

      // For multitouch, compose with a rotation around the axis.
      if (pt[2]) {
        const d = (pt[2] - TellurionSelf.a0) / 2;
        const s = -Math.sin(d);
        const c = Math.sign(Math.cos(d));
        q1 = versor.multiply([Math.sqrt(1 - s * s), 0, 0, c * s], q1);
      }

      TellurionSelf.projection.rotate(versor.rotation(q1));
      console.log('projection', TellurionSelf.projection.invert, TellurionSelf.projection.invert(0, 0));

      // In vicinity of the antipode (unstable) of q0, restart.
      if (delta[0] < 0.7) TellurionSelf.zoomstarted.call(canva);
    },
    zoom(projection, scale) {
      const scaleExtent = [0.8, 8];
      /* eslint no-underscore-dangle: ["error", { "allow": ["_scale"] }] */
      if (projection._scale === undefined) {
        projection._scale = projection.scale();
      }
      scale = projection._scale;

      const zoom = d3.zoom()
        .scaleExtent(scaleExtent.map((x) => x * scale))
        .on('start', (e, p1, p2, p3, p4) => TellurionSelf.zoomstarted(e, p1, p2, p3, p4))
        .on('zoom', (e, p1, p2, p3, p4) => TellurionSelf.zoomed(e, p1, p2, p3, p4));

      return Object.assign((selection) => selection
        .property('__zoom', d3.zoomIdentity.scale(TellurionSelf.projection.scale()))
        .call(zoom), {
        on(type, ...options) {
          return options.length
            ? (zoom.on(type, ...options), this)
            : zoom.on(type);
        },
      });
    },
  },
};
</script>
