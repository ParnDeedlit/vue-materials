<template>
  <div class="appbuilder-left-wrapper">
    <li
      v-for="drawer in drawers"
      v-bind:key="drawer.name"
    >
      <slot
        name="drawer"
        v-bind:drawer="drawer"
      >
        {{drawer.name}}
      </slot>
    </li>
    <div class="appbuilder-first-drawer">
      <q-drawer
        :value="open"
        :mini=" miniState"
        :width="64"
        :breakpoint="500"
        elevated
        dark
      >
        <q-scroll-area class="fit">
          <q-list padding>
            <q-item
              v-ripple
              clickable
              class="first-drawer-item"
              v-for="drawer in drawers"
              v-bind:key="drawer.name"
              :active="drawer.open"
              @click="changeDrawer(drawer.name)"
            >
              <q-item-section avatar>
                <q-icon :name="drawer.icon" />
              </q-item-section>
            </q-item>
          </q-list>
        </q-scroll-area>
      </q-drawer>
    </div>
  </div>
</template>

<script>
export default {
  name: 'left-toolbar',
  props: {
    open: {
      type: Boolean,
      default: false,
    },
    propdrawers: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      miniState: true,
      drawers: this.propdrawers,
    };
  },

  methods: {
    drawerClick(name) {
      this.$emit('changeDrawer', name);
    },
    changeDrawer(name) {
      this.$emit('changeDrawer', name);
    },
  },
};
</script>

<style lang="scss">
.appbuilder-left-wrapper {
  height: 100% !important;
  li {
    height: 0px;
  }

  .scroll {
    overflow: hidden;
  }

  .appbuilder-first-drawer {
    .q-drawer--left {
      padding: 12px 8px !important;
      background: #303235;
      z-index: 10000;
    }

    .q-item {
      padding: 8px 6px;
    }

    .first-drawer-item {
      margin-bottom: 12px;
    }
  }

  .appbuilder-second-drawer {
  }
}
</style>
