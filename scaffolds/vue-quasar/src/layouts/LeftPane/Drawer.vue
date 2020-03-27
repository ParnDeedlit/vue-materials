<template>
  <div class="appbuilder-drawer-wrapper">
    <q-drawer
      :value="open"
      :width="464"
      :breakpoint="500"
      dark
      overlay
      bordered
      class="appbuilder-second-drawer"
    >
      <q-scroll-area class="fit">
        <slot />
      </q-scroll-area>
    </q-drawer>
  </div>
</template>

<script>
import Background from '../../assets/image/material.png';

export default {
  name: 'info-drawer',
  props: {
    open: {
      type: Boolean,
      default: false,
    },
    title: {
      type: String,
      default: '标题',
    },
  },
  data() {
    return {
      miniState: true,
      defaultBack: Background,
    };
  },

  methods: {

  },
};
</script>

<style lang="scss">
.appbuilder-drawer-wrapper {
  height: 100% !important;

  .scroll {
    overflow: hidden;
  }

  .appbuilder-second-drawer {
    // background: #202124;
    .q-drawer--left {
      padding-left: 57px;
    }
  }
}
</style>
