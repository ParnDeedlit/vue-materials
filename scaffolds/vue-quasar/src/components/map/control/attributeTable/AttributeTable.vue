<template xmlns:v-slot="http://www.w3.org/1999/XSL/Transform">
  <q-page-container class="result-table-page">
    <div class="attributetable-btn">
      <q-btn
        color="title"
        label="属性表"
        @click="showAttrTable"
      ></q-btn>
    </div>
    <div class="bg-title attributetable-move"></div>
    <q-page
      class="q-pa-md attributetable-page"
      v-show="showTable"
    >
      <q-tabs
        v-model="selectedTab"
        dense
        class="text-grey"
        align="left"
        narrow-indicator
      >
        <q-tab
          v-for="item in tabNames"
          :key="'tab-'+item"
          :name="item"
          :label="item"
        />
      </q-tabs>

      <q-tab-panels
        v-model="selectedTab"
        animated
      >
        <q-tab-panel
          v-for="item in tabNames"
          :key="'tab-panel-'+item"
          :name="item"
        >
          <q-table
            :data="data"
            :columns="columns"
            :pagination="tablePagination"
            style="height: 250px"
            @row-click="toggleRowClick"
            @row-dblclick="toggleRowDBClick"
          >
            <template v-slot:bottom>
              <q-pagination
                v-model="currentPageIndex"
                :max="maxPage"
                :input="true"
                style="float: right"
              />
            </template>
          </q-table>

        </q-tab-panel>
      </q-tab-panels>
    </q-page>
  </q-page-container>
</template>

<script>
export default {
  name: 'AttributeTable',
  inject: ['map'],
  props: {
    tabNames: {
      type: Array,
      default () {
        return []
      }
    },
    tableData: {
      type: Object,
      default () {
        return {
          header: null,
          data: null
        }
      }
    },
    maxPage: {
      type: Number,
      default: 1
    }
  },
  watch: {
    tabNames: {
      deep: true,
      handler () {
        if (this.tabNames && this.tabNames.length > 0) {
          this.selectedTab = this.tabNames[0]
        }
      }
    },
    selectedTab: {
      deep: true,
      handler () {
        this.$emit('selectedTab', this.selectedTab)
      }
    },
    currentPageIndex: {
      deep: true,
      handler () {
        this.$emit('currentPageIndex', this.currentPageIndex)
      }
    },
    tableData: {
      deep: true,
      handler () {
        this.formatTableData()
      }
    }
  },
  data () {
    return {
      selectedTab: '',
      showTable: false,

      currentPageIndex: 1,
      columns: [],
      data: [],
      tablePagination: {
        rowsPerPage: 10
      }
    }
  },
  methods: {
    showAttrTable () {
      this.showTable = !this.showTable
    },
    formatTableData () {
      if (!this.tableData.header) {
        return
      }
      const columns = []
      for (let i = 0; i < this.tableData.header.length; i++) {
        const obj = {
          name: this.tableData.header[i],
          align: 'center',
          label: this.tableData.header[i],
          field: this.tableData.header[i],
          sortable: true
        }
        columns.push(obj)
      }
      this.columns = columns
      this.data = this.tableData.data
    },
    toggleRowClick (evt, row) {
      if (this.map.getSource('highlightFeature')) {
        this.map.getSource('highlightFeature').setData({
          type: 'FeatureCollection',
          features: [{
            type: 'Feature',
            properties: { ...this.tableData.data },
            geometry: {
              type: 'Polygon',
              coordinates: [row.coordinates]
            }
          }]
        })
      } else {
        this.map.addSource('highlightFeature', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: [{
              type: 'Feature',
              properties: { ...this.tableData.data },
              geometry: {
                type: 'Polygon',
                coordinates: [row.coordinates]
              }
            }]
          }
        })
      }
    },
    toggleRowDBClick (evt, row) {
      this.map.fitBounds(row.bounds)
    }
  }
}
</script>

<style>
.result-table-page {
  width: 100%;
  right: 0px;
  max-height: 400px;
  position: fixed;
  overflow: visible;
  bottom: 0px;
}

.attributetable-move {
  width: 100%;
  height: 7px;
  top: 0px;
}

.attributetable-btn {
  width: 100%;
  height: 30px;
  top: 0px;
  background-color: transparent;
  text-align: center;
}

.attributetable-page {
  background: rgba(255, 255, 255, 0.9);
  height: 360px;
}

.q-table__middle {
  max-height: 200px;
}

tr th {
  position: sticky;
  z-index: 2;
  background: #fff;
}

thead tr:last-child th {
  top: 48px;
  z-index: 3;
  background-color: #eeeeee;
}

thead tr:first-child th {
  top: 0;
  z-index: 1;
}

tr:first-child th:first-child {
  z-index: 3;
}

td:first-child {
  z-index: 1;
}

td:first-child,
th:first-child {
  position: sticky;
  left: 0;
}
</style>
