<template>
  <q-layout view="hHh Lpr lFf"
    :style="{height: '100%', 'min-height': '600px', background:'transparent'}">
    <q-header>
      <q-toolbar class="text-white appbuilder-header">
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
    <q-page-container :style="{'padding-top': '0px', 'margin-top': '28px'}">
      <base-map
      :propsDocument="document"
      :propsStyle="style"
      :changePropsDocument="changePropsDocument" />
    </q-page-container>
      <left-toolbar
      :open="toolbarOpen"
      :propdrawers="drawers"
      @changeDrawer="changeDrawer"
    >
      <template v-slot:drawer="{drawer}">
        <base-drawer
          :title="drawer.name"
          :open="drawer.open"
        >
          <component :is="drawer.component"
            :color="color"
            :document="document"
            :handleDocument="changePropsDocument"
          />
        </base-drawer>
      </template>

    </left-toolbar>
  </q-layout>
</template>

<script>
// import axios from 'axios';

import LeftToolbar from './LeftPane/LeftToolbar';
import BaseDrawer from './LeftPane/Drawer';
import BaseMap from '../components/map/OmMap';

import DrawerDocument from '../components/drawer/Document';
import DrawStyle from '../components/drawer/Style';

import DefaultDocument from '../assets/template/document.json';
import DefaultStyle from '../assets/template/emptystyle.json';

export default {
  name: 'MainLayout',

  components: {
    LeftToolbar,
    BaseDrawer,
    BaseMap,
    DrawerDocument,
    DrawStyle,
  },

  data() {
    return {
      toolbarOpen: true,
      drawers: [
        {
          name: '主页',
          open: false,
          icon: 'home',
        },
        {
          name: '图层',
          open: false,
          icon: 'layers',
          component: 'DrawerDocument',
          props: {
            document: this.document,
          },
        },
        {
          name: '样式',
          open: false,
          icon: 'style',
          component: 'DrawStyle',
          props: {
            document: this.document,
          },
        },
      ],
      document: DefaultDocument,
      style: DefaultStyle,
      color: 'blue-11',
    };
  },

  created() {
    /* const doc = axios.get('./assets/template/document.json');
    const style = axios.get('./assets/template/emptystyle.json');
    Promise.all([doc, style])
      .then((res) => {
        console.log('axios', res);
      }); */
  },

  methods: {
    closeDrawers() {
      this.toolbarOpen = !this.toolbarOpen;
      this.drawers = this.drawers.map((d) => { d.open = false; return d; });
    },
    changeDrawer(name) {
      this.drawers = this.drawers.map((d) => {
        d.open = d.name === name ? !d.open : false;
        return d;
      });
    },
    changePropsDocument(doc) {
      console.log('changePropsDocument', doc);
      this.document = doc;
    },
  },
};
</script>

<style lang="scss">
.appbuilder-header {
  background: #2a2b2e;
}
</style>
