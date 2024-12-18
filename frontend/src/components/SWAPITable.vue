<template>
  <div
    v-if="errorMessage"
  >
    <v-alert
      type="error"
      :text="errorMessage"
    />
  </div>
  <div
    v-else
  >
    <v-text-field
      v-model="search"
      label="Search items"
      @input="debouncedFetch"
    />
    <v-data-table-server
      v-model:items-per-page="itemsPerPage"
      :headers="headers"
      :items="items"
      :items-length="totalItems"
      :loading="loading"
      item-value="name"
      :items-per-page-options="itemsPerPageOptions"
      @update:options="optionsUpdated"
      @update:sort-by="sortByUpdated"
    >
      <template
        #item.created="{ item }"
      >
        <span>{{ $filters.shortDateTime(item.created) }}</span>
      </template>
    </v-data-table-server>
  </div>
</template>

<script lang="ts">
import axios from '@/plugins/axios-config'
import { debounce } from 'lodash'

export default {
  props: {
    apiUrl: {
      type: String,
      required: true,
    }
  },
  data: () => ({
    items: [],
    headers: [
      { title: "Name", value: "name", align: "left", sortable: true },
      { title: "Created", value: "created", align: "left", sortable: true },
    ],
    itemsPerPage: 15,
    totalItems: 0,
    loading: false,
    search: "",
    page: 1,
    sortBy: "name",
    order: "desc",
    itemsPerPageOptions: [
      {value: 15, title: '15'},
    ],
    debouncedFetch: () => {},
    searchDelayMs: 500,
    errorMessage: '',
  }),
  watch: {
    search(newValue) {
      this.debouncedFetch()
    }
  },
  mounted() {
    if (!this.$isServer) {
      this.fetchData()
    }
  },
  created() {
    this.debouncedFetch = debounce(this.fetchData, this.searchDelayMs)
  },
  methods: {
    async pageUpdate (value: number) {
      this.page = value
    },
    optionsUpdated(options: { page: number; itemsPerPage: number }) {
      this.page = options.page
      this.itemsPerPage = options.itemsPerPage
      this.fetchData()
    },
    async fetchData() {
      this.loading = true
      try {
        const result = await axios.get(this.apiUrl,
        {
          params: {
            search: this.search,
            page: this.page,
            sortBy: this.sortBy,
            order: this.order,
          }
        })
        if (result) {
          this.items = result.data.results
          this.totalItems = result.data.count
        }
      } catch (error: any) {
        if (error.response) {
          console.error("Error status:", error.response.status)
          console.error("Error data:", error.response.data)
          console.error("Headers:", error.response.headers)
          this.errorMessage = error.response.data
        } else {
          console.error(error)
          const errorName = error?.name ? error.name : 'Error: '
          const errorMessage = typeof error.response?.data === 'string'
          ? error.response.data
          : 'An unexpected error occurred';
          this.errorMessage = `${errorName}: ${errorMessage}`
        }
      } finally {
        this.loading = false
      }
    },
    async sortByUpdated(value: { key: string; order: string }[]) {
      if (value.length > 0) {
        const valueSelected = value[0];
        this.sortBy = valueSelected.key;
        this.order = valueSelected.order;
        this.fetchData();
      }
    },
  },
}
</script>
