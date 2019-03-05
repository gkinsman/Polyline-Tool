<template>
  <div id="app">
    <Nav></Nav>
    <section class="section">
      <div class="container">
        <div class="columns is-desktop">
          <Map class="column the-map"></Map>
        </div>
      </div>
    </section>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { Component, Lifecycle } from "av-ts";
import { LMap, LPolyline } from "vue2-leaflet";
import Map from "@/components/Map.vue";
import Nav from "@/components/Nav.vue";
import polyline from "google-polyline";

@Component({
  components: {
    Nav,
    Map
  }
})
export default class App extends Vue {}
</script>

<style lang="scss">
.column.the-map {
  height: 80vh;
}
</style>
