<template>
  <q-page-sticky
    position="top-right"
    :offset="fabPos"
    v-touch-pan.prevent.mouse="move"
  >
    <q-card>
      <q-img
        src=""
        class="bg-title text-title"
        style="height: 80px; width: 100%;"
      >
        <div class="text-h5 q-mt-sm q-mb-xs mapbox-document-transport">地图文档</div>
      </q-img>

      <q-card-section>
        <q-input
          ref="filter"
          filled
          v-model="filter"
          label="搜索图层"
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

        <q-tree
          selectable
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
            <q-icon
              v-if="!isGroup(item)"
              :size="iconSize"
              style="color:#46bd87;font-size: 1.15em"
              :name="icons.copy"
              @click="()=>handleCopy(item)"
            ></q-icon>
            <!-- <q-icon
            v-if="!isGroup(item)&&isVisible(item)"
            :size="iconSize"
            :name="icons.eye"
            style="color:#263238;font-size: 1.15em"
          ></q-icon> -->
            <q-icon
              v-if="!isGroup(item)"
              :size="iconSize"
              style="color:#FF7043;font-size: 1.15em"
              :name="icons.close"
              @click="()=>handleDelete(item)"
            ></q-icon>
            <span
              v-if="isGroup(item)"
              :key="item.id"
            >{{item.node.title}}</span>
            <span
              v-else
              :key="item.node.id"
              v-contextmenu:ContextMenuLayer
            >
              {{item.node.title}}
            </span>
          </template>
          <!-- <template v-slot:default-body="item">
        </template> -->
        </q-tree>

        <contextmenu
          ref="ContextMenuLayer"
          @contextmenu="handleMenuOpen"
        >
          <content-menu-layer
            :layer="currentLayer"
            @layerMenu="handleMenuAction"
          />
        </contextmenu>
        <!-- <contextmenu
        ref="ContextMenuGroup"
        @contextmenu="handleMenuOpen"
      >
        <content-menu-group
          :layer="currentLayer"
          @layerMenu="handleMenuAction"
        />
      </contextmenu> -->
      </q-card-section>
    </q-card>
  </q-page-sticky>
</template>

<script>
import { mdiEye, mdiClose, mdiContentCopy, mdiLayersTripleOutline } from '@quasar/extras/mdi-v4'

import { IDocument, Layer } from "@mapgis/webclient-store";
const { LayerType, GroupLayer } = Layer;
import { directive, Contextmenu } from "v-contextmenu";
import ContentMenuLayer from "./Content/ContentLayer";
// import ContentMenuGroup from "./Content/ContentGroup";

export default {
  name: "MapgisDocumentQuasar",
  components: {
    ContentMenuLayer,
    // ContentMenuGroup,
    Contextmenu
  },
  directives: {
    contextmenu: directive
  },
  /*   inject: {
      document: {
        type: Object
      }
    }, */
  props: {
    document: {
      type: Object
    },
    handleDocument: {
      type: Function
    }
  },
  mounted () {
    if (!this.document) return;
    this.innerdoc = this.document
    this.parseTicked()
    let doc = IDocument.clone(this.innerdoc)
    if (this.innerdoc && this.innerdoc.layers) {
      this.layers = doc.layers
      // this.actives = doc.getCheckedLayers(this.innerdoc);
    } else {
      this.layers = [];
    }
  },
  created () { },
  data () {
    return {
      fabPos: [50, 10],
      draggingFab: false,
      icons: {
        eye: mdiEye,
        close: mdiClose,
        copy: mdiContentCopy,
        layer: mdiLayersTripleOutline
      },
      innerdoc: {},
      filter: '',
      ticked: [],
      layers: [],
      search: null,
      iconSize: 'xs',
      caseSensitive: false,
      currentLayer: {}
    };
  },
  watch: {
    document (doc) {
      console.log('inner document', doc)
      if (doc && doc.layers) {
        this.innerdoc = doc;
        this.parseTicked();
      }
    }
    /* ticked (ticks) {
      this.props.dispatch(toggleLayersVisible(checkedKeys, document));
    } */
  },
  computed: {

  },
  methods: {
    /**
     * @description UI 相关的绑定,几乎是冗余代码，可以不看
     */
    parseTicked () {
      if (!this.innerdoc) return;
      let doc = IDocument.deepclone(this.innerdoc)
      let ticks = doc.getCheckedLayers()
      this.ticked = ticks;
    },
    resetFilter () {
      this.filter = ''
      this.$refs.filter.focus()
    },
    isGroup (item) {
      return item.node.type === LayerType.GroupLayer
    },
    isVisible (item) {
      let visible = true
      if (item.node.layout && item.node.layout.visible == false) {
        visible = false
      }
      return visible;
    },
    move (ev) {
      this.fabPos = [
        this.fabPos[0] - ev.delta.x,
        this.fabPos[1] + ev.delta.y
      ]
    },
    layerPage (offset) {
      return { maxHeight: offset ? `calc(100vh - ${offset}px)` : '100vh' }
    },
    handTicked (ticks) {
      let doc = IDocument.clone(this.innerdoc)
      doc.checkVisibleLayers(ticks)
      this.ticked = ticks
      this.handleDocument && this.handleDocument(doc)
    },
    /**
     * @description 地图事件代码，必须仔细研究
     */
    handleMenuOpen (node) {
      let doc = IDocument.clone(this.innerdoc)
      const layer = doc.getLayerById(node.key)
      this.currentLayer = layer
    },
    handleCopy (item) {
      let doc = IDocument.clone(this.innerdoc)
      let layer = doc.getLayerById(item.node.key)
      this.handleMenuAction('copy', { layer: layer })
    },
    handleDelete (item) {
      let doc = IDocument.clone(this.innerdoc)
      let layer = doc.getLayerById(item.node.key)
      this.handleMenuAction('delete', { layer: layer })
    },
    handleMenuAction (command, data) {
      let doc = IDocument.clone(this.innerdoc)
      let { layer } = data;
      let { id } = layer;

      if (command === "addlayer") {
        // doc.copyLayer(id);
      } else if (command === "addgroup") {
        let group = new GroupLayer();
        doc.addLayerInGroup(group, id);
      } else if (command === "copy") {
        doc.copyLayer(id);
      } else if (command === "delete") {
        doc.deleteLayer(id);
      } else if (command === "rename") {
        doc.changeLayerProp(id, "title", data.name);
      } else if (command === "moveup") {
        doc.changeLayerPosition(id, -1);
      } else if (command === "movedown") {
        doc.changeLayerPosition(id, 1);
      } else if (command === "show") {
        doc.changeLayerVisible(id, true);
      } else if (command === "hide") {
        doc.changeLayerVisible(id, false);
      }

      this.layers = doc.layers;
      this.innerdoc = doc;
      console.log(command, data, doc)
      this.handleDocument && this.handleDocument(doc);
    }
  }
};
</script>

<style lang="scss">
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
</style>
