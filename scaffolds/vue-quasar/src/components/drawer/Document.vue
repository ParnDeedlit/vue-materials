<template>
  <div class="appbuilder-document">
    <q-input
      ref="filter"
      borderless
      color="grey-9"
      v-model="filter"
      label="搜索图层"
      class="appbuilder-document-search"
    >
      <template v-slot:append>
        <q-icon
          v-if="filter !== ''"
          name="clear"
          class="cursor-pointer"
          @click="resetFilter"
        />
      </template>
    </q-input>
    <div  class="appbuilder-document-tree justify-center">
    <q-card class="card">
      <q-card-section horizontal>
        <q-img
          class="col-md-3 logo"
          :src="svgs.custom"
        />

        <q-card-section>
          <div class="text-overline">地图文档</div>
          <div class="text-h7 q-mt-sm q-mb-xs">选择您自己的外观和风格</div>
          <div class="text-h6 q-mt-sm q-mb-xs">交互式操作</div>
        </q-card-section>
      </q-card-section>

      <q-separator />
    </q-card>
    <q-tree
      dark
      selectable
      :color="color"
      tick-strategy="leaf"
      selected-color="primary"
      :nodes="layers"
      node-key="id"
      label-key="title"
      :filter="filter"
      :ticked="ticked"
      @update:ticked="handTicked"
    >
      <template v-slot:default-header="item">
        <div class="drawer-document-item">
          <q-icon
            :color="color"
            :size="iconSize"
            :name="layerIcon(item)"
            style="color:#263238;font-size: 1.15em"
          ></q-icon>
          <q-icon
            v-if="!isGroup(item)"
            :size="iconSize"
            style="color:#46bd87;font-size: 1.15em"
            :color="color"
            :name="icons.copy"
            @click="()=>handleCopy(item)"
          ></q-icon>
          <q-icon
            v-if="!isGroup(item)"
            :size="iconSize"
            style="color:#FF7043;font-size: 1.15em"
            :color="color"
            :name="icons.close"
            @click="()=>handleDelete(item)"
          ></q-icon>
          <span
            :key="item.node.id"
            class="document-tree-span-small"
          >
            {{item.node.title}}
          </span>
        </div>
      </template>
    </q-tree>
    </div>
  </div>
</template>

<script>
import {
  mdiEye,
  mdiClose,
  mdiContentCopy,
  mdiLayersTripleOutline,
  mdiGroup,
  mdiArrangeSendBackward,
  mdiVectorCircle,
  mdiVectorLine,
  mdiVectorPolygon,
  mdiFormatText,
} from '@quasar/extras/mdi-v5';

import {
  IDocument,
  Layer,
  VectorTile,
} from '@mapgis/webclient-store';

import componentMixin from '../map/mixins/componentMixin';

import CustomImage from '../../assets/template/svg/custom-active.svg';

const {
  LayerType,
  GroupLayer,
} = Layer;

const {
  VectorTileType,
} = VectorTile;

export default {
  name: 'MapgisDocumentQuasar',
  components: {
  },
  mixins: [componentMixin],
  props: {
    document: {
      type: Object,
    },
    handleDocument: {
      type: Function,
    },
  },
  mounted() {
    if (!this.document) return;
    this.innerdoc = this.document;
    this.parseTicked();
    const doc = IDocument.clone(this.innerdoc);
    if (this.innerdoc && this.innerdoc.layers) {
      this.layers = doc.layers;
    } else {
      this.layers = [];
    }
  },
  created() { },
  data() {
    return {
      fabPos: [50, 10],
      draggingFab: false,
      icons: {
        eye: mdiEye,
        close: mdiClose,
        copy: mdiContentCopy,
        layer: mdiLayersTripleOutline,
        group: mdiGroup,
        back: mdiArrangeSendBackward,
        point: mdiVectorCircle,
        line: mdiVectorLine,
        fill: mdiVectorPolygon,
        text: mdiFormatText,
      },
      svgs: {
        custom: CustomImage,
      },
      innerdoc: {},
      filter: '',
      ticked: [],
      layers: [],
      search: null,
      iconSize: 'xs',
      caseSensitive: false,
      currentLayer: {},
    };
  },
  watch: {
    document(doc) {
      if (doc && doc.layers) {
        this.innerdoc = doc;
        this.parseTicked();
      }
    },
  },
  computed: {
  },
  methods: {
    /**
     * @description UI 相关的绑定,几乎是冗余代码，可以不看
     */
    parseTicked() {
      if (!this.innerdoc) return;
      const doc = IDocument.deepclone(this.innerdoc);
      const ticks = doc.getCheckedLayers();
      this.ticked = ticks;
    },
    resetFilter() {
      this.filter = '';
      this.$refs.filter.focus();
    },
    isGroup(item) {
      return item.node.type === LayerType.GroupLayer;
    },
    layerIcon(item) {
      const group = this.isGroup(item);
      const { icons } = this;
      const { subtype } = item.node;
      if (group) {
        item.icon = icons.group;
      }
      if (item.node.type === LayerType.VectorTile) {
        if (subtype === VectorTileType.BackGround) {
          item.icon = icons.back;
        } else if (subtype === VectorTileType.Circle) {
          item.icon = icons.point;
        } else if (subtype === VectorTileType.Line) {
          item.icon = icons.line;
        } else if (subtype === VectorTileType.Fill) {
          item.icon = icons.fill;
        } else if (subtype === VectorTileType.Symbol) {
          item.icon = icons.text;
        }
      }
      return item.icon;
    },
    isVisible(item) {
      let visible = true;
      if (item.node.layout && item.node.layout.visible === false) {
        visible = false;
      }
      return visible;
    },
    handTicked(ticks) {
      const doc = IDocument.clone(this.innerdoc);
      doc.checkVisibleLayers(ticks);
      this.ticked = ticks;
      if (this.handleDocument) { this.handleDocument(doc); }
    },
    /**
     * @description 地图事件代码，必须仔细研究
     */
    handleMenuOpen(node) {
      const doc = IDocument.clone(this.innerdoc);
      const layer = doc.getLayerById(node.key);
      this.currentLayer = layer;
    },
    handleCopy(item) {
      const doc = IDocument.clone(this.innerdoc);
      const data = doc.getLayerById(item.node.key);
      this.handleMenuAction('copy', { layer: data });
    },
    handleDelete(item) {
      const doc = IDocument.clone(this.innerdoc);
      const data = doc.getLayerById(item.node.key);
      this.handleMenuAction('delete', { layer: data });
    },
    handleMenuAction(command, data) {
      const doc = IDocument.clone(this.innerdoc);
      const { layer } = data;
      const { id } = layer;

      if (command === 'addlayer') {
        // doc.copyLayer(id);
      } else if (command === 'addgroup') {
        const group = new GroupLayer();
        doc.addLayerInGroup(group, id);
      } else if (command === 'copy') {
        doc.copyLayer(id);
      } else if (command === 'delete') {
        doc.deleteLayer(id);
      } else if (command === 'rename') {
        doc.changeLayerProp(id, 'title', data.name);
      } else if (command === 'moveup') {
        doc.changeLayerPosition(id, -1);
      } else if (command === 'movedown') {
        doc.changeLayerPosition(id, 1);
      } else if (command === 'show') {
        doc.changeLayerVisible(id, true);
      } else if (command === 'hide') {
        doc.changeLayerVisible(id, false);
      }

      this.layers = doc.layers;
      this.innerdoc = doc;
      if (this.handleDocument) { this.handleDocument(doc); }
    },
  },
};
</script>

<style lang='scss'>
.mapbox-page-container {
  .q-btn.disabled {
    opacity: 0.95 !important;
  }
  .disabled,
  .disabled *,
  [disabled],
  [disabled] * {
    outline: 0 !important;
    cursor: pointer !important;
  }
}

.mapbox-document-transport {
  background: transparent !important;
}

.appbuilder-document {
  // background: #ffffff !important;
  height: 100%;
  .document-tree-span-big{
    font-size: 16px;
  }
  .document-tree-span-small{
    font-size: 16px;
  }
  .drawer-document-item {
    // border-top: 1px solid #5f6368;
    align-items: center;
    // height: 56px;
    width: 100%;
  }
}

.appbuilder-document-search {
  padding: 2px 24px!important;
  background: #ffffff !important;
}

.appbuilder-document-tree {
  // background: #eceff1 !important;
  margin: 24px;
  background: #394457; // #202124;
  border: 1px solid #8ab4f8;
  border-radius: 12px;
  .card {
    background: #8ab4f8;
  }
  .logo {
    margin: 24px;
  }
}
</style>
