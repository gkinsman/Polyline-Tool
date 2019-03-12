<template>
  <div class="app-map">
    <div class="columns">
      <b-field class="column" label="Source Polyline">
        <b-input type="textarea" v-model="lineInput"></b-input>
      </b-field>
      <b-field label="Go" class="column is-narrow">
        <button @click="updateLines" class="button">View On Map</button>
      </b-field>
    </div>

    <l-map ref="map" style="height:100%; width:100%;">
      <l-tilelayer :url="tileLayer"></l-tilelayer>
      <l-polyline v-for="line in lines" :lat-lngs="line.latlngs" :color="line.color" :key="line.id"></l-polyline>
    </l-map>
  </div>
</template>


<script lang="ts">
import Vue from "vue";
import { LMap, LPolyline, LPolygon, LFeatureGroup } from "vue2-leaflet";
import polyline from "google-polyline";
import "leaflet/dist/leaflet.css";
import { Component, Lifecycle } from "av-ts";
import L from "leaflet";

interface Line {
  latlngs: [number, number][];
  color: string;
  id: number;
}

@Component
export default class CompareManyLines extends Vue {
  $refs!: {
    map: LMap;
  };

  lines: Line[] = [];
  lineInput: string = "";

  get tileLayer() {
    return "http://{s}.tile.osm.org/{z}/{x}/{y}.png";
  }

  currentId = 0;
  updateLines() {
    var split = this.lineInput.split(/\r?\n/);

    this.lines = split
      .map(line => polyline.decode(line))
      .map<Line>(line => ({
        latlngs: line,
        color: "green",
        id: this.currentId++
      }));

    this.setBounds();
  }

  setBounds() {
    if (this.lines.length) {
      var bounds = new L.LatLngBounds(this.lines[0]!.latlngs);
      this.$refs.map.setBounds(bounds);
    }
  }
}
</script>


<style lang="scss" scoped>
.app-map {
  height: 70vh;

  .map {
    height: 80%;
    width: 100%;
  }
}
</style>
