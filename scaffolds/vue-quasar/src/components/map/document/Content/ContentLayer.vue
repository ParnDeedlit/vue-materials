<template>
  <div class="wrapper-content-layer">
    <!--     <contextmenu-item disabled>
      <v-btn-toggle borderless>
        <v-btn small value="up" @click="handleUp">
          <span class="hidden-sm-and-down">上移</span>
          <v-icon right>mdi-upload</v-icon>
        </v-btn>

        <v-btn small value="down" @click="handleDown">
          <span class="hidden-sm-and-down">下移</span>
          <v-icon right>mdi-download</v-icon>
        </v-btn>
        <v-btn small value="copy" @click="handleCopy">
          <span class="hidden-sm-and-down">复制</span>
          <v-icon right>mdi-content-copy</v-icon>
        </v-btn>
      </v-btn-toggle>
    </contextmenu-item> -->
    <contextmenu-item disabled>
      <q-btn-group borderless>
        <q-btn
          outline
          label="删除"
          @click="handleDelete"
        >
          <q-icon :name="icons.delete"></q-icon>
        </q-btn>
        <q-btn
          outline
          label="显示"
          @click="handleShow"
        >
          <q-icon
            right
            :name="icons.eye"
          ></q-icon>
        </q-btn>
        <q-btn
          outline
          label="隐藏"
          @click="handleHide"
        >
          <q-icon
            right
            :name="icons.eyeoff"
          ></q-icon>
        </q-btn>
      </q-btn-group>
    </contextmenu-item>

    <contextmenu-item divider></contextmenu-item>
    <contextmenu-item :disabled="true">
      <q-input
        standout
        v-model="layerName"
        label="重命名"
      >
        <template v-slot:prepend>
          <q-icon :name="icons.rename" />
        </template>
      </q-input>
    </contextmenu-item>
  </div>
</template>
<script>
import { mdiDeleteCircle, mdiEye, mdiEyeOff, mdiLayersOutline } from '@quasar/extras/mdi-v4'
import "v-contextmenu/dist/index.css";
import {
  ContextmenuItem
  /* ContextmenuSubmenu,
  ContextmenuGroup */
} from "v-contextmenu";
export default {
  name: "ContentMenuLayer",
  props: {
    layer: {
      type: Object
    }
  },
  components: {
    ContextmenuItem
  },
  data () {
    return {
      icons: {
        delete: mdiDeleteCircle,
        eye: mdiEye,
        eyeoff: mdiEyeOff,
        rename: mdiLayersOutline
      },
      layerName: this.layer.title || this.layer.name
    };
  },
  watch: {
    layer (value) {
      this.layerName = value.title || value.name;
    },
    layerName (value) {
      this.$emit("layerMenu", "rename", { layer: this.layer, name: value });
    }
  },
  methods: {
    handleUp () {
      this.$emit("layerMenu", "moveup", { layer: this.layer });
    },
    handleDown () {
      this.$emit("layerMenu", "movedown", { layer: this.layer });
    },
    handleDelete () {
      this.$emit("layerMenu", "delete", { layer: this.layer });
    },
    handleCopy () {
      this.$emit("layerMenu", "copy", { layer: this.layer });
    },
    handleShow () {
      this.$emit("layerMenu", "show", { layer: this.layer });
    },
    handleHide () {
      this.$emit("layerMenu", "hide", { layer: this.layer });
    }
  }
};
</script>

<style lang="scss">
.wrapper-content-layer {
  .icon {
    width: 1.25em;
    height: 1.25em;
    margin-right: 4px;
    vertical-align: -0.25em;
    overflow: hidden;
    color: transparent;
  }
}
</style>
