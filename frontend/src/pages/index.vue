<template>
  <v-container>
    <v-card>
      <v-tabs
        v-model="tab"
        bg-color="primary"
      >
        <v-tab
          v-for="(item, key) in swTable"
          :key="key"
          :value="key"
        >
          {{ item.title }}
        </v-tab>
      </v-tabs>
      <v-card-text>
        <v-tabs-window v-model="tab">
          <v-tabs-window-item
            v-for="(item, key) in swTable"
            :key="key"
            :value="key"
          >
            <SWAPITable :api-url="item.url" />
          </v-tabs-window-item>
        </v-tabs-window>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script lang="ts">
import SWAPITable from "@/components/SWAPITable.vue";

export default {
  components: { SWAPITable },
  data: () => ({
    tab: null,
    swTable: {
      people: {
        title: "People",
        url: "/api/people",
      },
      planets: {
        title: "Planets",
        url: "/api/planets",
      },
    },
  }),
};
</script>
