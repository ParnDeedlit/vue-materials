<template>
  <q-layout view="hHh Lpr lFf">
    <q-header>
      <q-toolbar class="bg-black text-white">
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="closeDrawers()"
        />

        <q-toolbar-title>
          AppBuilder
        </q-toolbar-title>

        <div>测试版本</div>
      </q-toolbar>
    </q-header>

    <left-toolbar
      :open="toolbarOpen"
      :propdrawers="drawers"
      @changeDrawer="changeDrawer"
    >
      <template v-slot:drawer="{drawer}">
        <base-drawer
          :title="drawer.name"
          :open="drawer.open"
        ></base-drawer>
      </template>

    </left-toolbar>

    <q-page-container>
      <router-view />
    </q-page-container>

  </q-layout>
</template>

<script>
import LeftToolbar from './LeftPane/LeftToolbar';
import BaseDrawer from './LeftPane/Drawer';

export default {
  name: 'MainLayout',

  components: {
    LeftToolbar,
    BaseDrawer,
  },

  data() {
    return {
      toolbarOpen: true,
      drawers: [
        { name: '主页', open: true, icon: 'home' },
        { name: '图层', open: false, icon: 'layers' },
      ],
    };
  },

  methods: {
    closeDrawers() {
      this.toolbarOpen = !this.toolbarOpen;
      this.drawers = this.drawers.map((d) => {
        d.open = false;
        return d;
      });
    },
    changeDrawer(name) {
      this.drawers = this.drawers.map((d) => {
        d.open = d.name === name ? !d.open : false;
        return d;
      });
    },
  },
};
</script>
