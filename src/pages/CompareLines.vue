<template>
  <div class="app-map">
    <div class="columns">
      <b-field class="column" label="Source Polyline">
        <b-input v-model="fromLineString"></b-input>
      </b-field>
      <b-field class="column" label="Fixed Polyline">
        <b-input v-model="toLineString"></b-input>
      </b-field>
      <b-field label="Go" class="column is-narrow">
        <button @click="updateLines" class="button">View On Map</button>
      </b-field>
    </div>

    <l-map ref="map" style="height:100%; width:100%;">
      <l-tilelayer :url="tileLayer"></l-tilelayer>
      <l-polyline v-for="line in lines" :key="line.idx" :lat-lngs="line.latlngs" :color="'green'"></l-polyline>
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
}

@Component
export default class CompareLines extends Vue {
  $refs!: {
    map: LMap;
    fromLine: LPolyline;
    toLine: LPolyline;
  };

  get tileLayer() {
    return "http://{s}.tile.osm.org/{z}/{x}/{y}.png";
  }

  fromLineString: string = "";
  toLineString: string = "";

  loadFromQueryString() {
    var params = new URLSearchParams(window.location.search);
    this.fromLineString = params.get("from") || "";
    this.toLineString = params.get("to") || "";

    this.updateLines();
  }

  updateUrl() {
    var params = new URLSearchParams(window.location.search);
    params.set("from", this.fromLineString);
    params.set("to", this.toLineString);
    window.history.replaceState(
      {},
      "",
      `${window.location.pathname}?${params}`
    );
  }

  lines: { latlngs: [number, number][]; idx: number }[] = [];
  updateLines() {
    if (!this.fromLineString || !this.toLineString)
      throw Error("Must provide both source and fixed line stings");

    let fromLine: [number, number][] = polyline.decode(this.fromLineString);
    let toLine: [number, number][] = polyline.decode(this.toLineString);

    this.lines = fromLine
      .map((fromPoint: [number, number], idx: number) => {
        var toPoint = toLine[idx - 1];
        return { latlngs: [fromPoint, toPoint], idx: idx };
      })
      .filter(l => !!l.latlngs[0] && !!l.latlngs[1]);

    var bounds = L.latLngBounds(this.lines.map(l => L.latLng(l.latlngs[0])));
    this.$refs.map.setBounds(bounds);
    //this.setBounds();
    this.updateUrl();
  }

  setBounds() {
    if (this.fromLine && this.toLine) {
      var bounds = new L.LatLngBounds(this.fromLine!.latlngs);
      this.$refs.map.setBounds(bounds);
    }
  }

  @Lifecycle
  mounted() {
    this.loadFromQueryString();
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
