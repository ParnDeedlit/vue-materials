export default {
  props: {
    position: {
      type: String,
      default: 'top-left',
    },
    offset: {
      type: Array,
      default: [10, 10],
    },
  },
  data() {
    return {
      currentOffset: this.offset,
    };
  },
  methods: {
    move(ev) {
      if (this.position === 'top-left') {
        this.currentOffset = [
          this.currentOffset[0] + ev.delta.x,
          this.currentOffset[1] + ev.delta.y,
        ];
      } else if (this.position === 'top-right') {
        this.currentOffset = [
          this.currentOffset[0] - ev.delta.x,
          this.currentOffset[1] + ev.delta.y,
        ];
      } else if (this.position === 'bottom-left') {
        this.currentOffset = [
          this.currentOffset[0] + ev.delta.x,
          this.currentOffset[1] - ev.delta.y,
        ];
      } else {
        this.currentOffset = [
          this.currentOffset[0] - ev.delta.x,
          this.currentOffset[1] - ev.delta.y,
        ];
      }
    },
    $_move(ev) {
      if (this.position === 'top-left') {
        this.currentOffset = [
          this.currentOffset[0] + ev.delta.x,
          this.currentOffset[1] + ev.delta.y,
        ];
      } else if (this.position === 'top-right') {
        this.currentOffset = [
          this.currentOffset[0] - ev.delta.x,
          this.currentOffset[1] + ev.delta.y,
        ];
      } else if (this.position === 'bottom-left') {
        this.currentOffset = [
          this.currentOffset[0] + ev.delta.x,
          this.currentOffset[1] - ev.delta.y,
        ];
      } else {
        this.currentOffset = [
          this.currentOffset[0] - ev.delta.x,
          this.currentOffset[1] - ev.delta.y,
        ];
      }
    },
  },
};
