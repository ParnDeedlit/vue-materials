<template>
  <div class="q-pa-md appbuilder-drawer-style">
    <q-card
      class="drawer-style-card"
      flat
      bordered
      v-for="style in styles"
      :key="style.title"
    >
      <q-card-section horizontal>
        <q-card-section class="q-pt-xs">
          <div class="text-overline">预览</div>
          <div class="text-h5 q-mt-sm q-mb-xs">{{style.title}}</div>
          <div class="text-caption text-grey">{{style.subtitle}}</div>
        </q-card-section>

        <q-card-section class="col-8 flex flex-center">
          <q-img
            class="rounded-borders"
            :src="style.image"
          />
        </q-card-section>
      </q-card-section>

      <q-separator />

      <q-card-actions>
        <q-btn
          flat
          round
          icon="event"
        />
        <q-btn flat>{{style.tag}}</q-btn>
        <q-btn
          flat
          color="primary"
          @click="()=>handleClick(style)"
        >应用</q-btn>
      </q-card-actions>
    </q-card>
  </div>
</template>

<script>
import StyleDark from '../../assets/template/style/dark.json';
import StyleLight from '../../assets/template/style/light.json';
import StyleStreet from '../../assets/template/style/street.json';
import ImgDark from '../../assets/template/style/dark.png';
import ImgLight from '../../assets/template/style/light.png';
import ImgStreet from '../../assets/template/style/street.png';

export default {
  props: {
    document: {
      type: Object,
    },
    handleDocument: {
      type: Function,
    },
  },
  data() {
    return {
      link: 'inbox',
      styles: [
        {
          title: '黑夜',
          subtitle: '黑夜风格的样式，用于大数据地图显示',
          tag: '8:00PM',
          image: ImgDark,
        },
        {
          title: '光明',
          subtitle: '浅色风格的样式，用于作为底图托侧地物',
          tag: '8:00AM',
          image: ImgLight,
        },
        {
          title: '街道',
          subtitle: '街道风格的样式，用于常规的数据应用',
          tag: '12:00AM',
          image: ImgStreet,
        },
      ],
    };
  },
  methods: {
    handleClick(style) {
      let doc;
      if (style.title === '黑夜') {
        doc = StyleDark;
      } else if (style.title === '光明') {
        doc = StyleLight;
      } else if (style.title === '街道') {
        doc = StyleStreet;
      }
      if (this.handleDocument) {
        this.handleDocument(doc);
      }
    },
  },
};
</script>

<style lang="scss">
.appbuilder-drawer-style {
  // overflow-y: scroll;
  height: 100%;
  color: #303235;
  background: grey;

  .drawer-style-card {
    margin-bottom: 24px;
  }
}
</style>
