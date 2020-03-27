export default {
  props: {
    color: {
      type: String,
      default: 'grey-8',
    },
    theme: {
      type: String,
      default: 'dark',
    },
    className: {
      type: String,
      default: 'bg-black text-white',
    },
    cssStyle: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {};
  },
  methods: {},
};
