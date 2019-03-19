<template>
  <div>
    <div class="columns">
      <b-field class="column is-one-fifth" label="Load from local storage">
        <b-select expanded @input="routeChosen">
          <option v-for="option in routes" :key="option">{{option}}</option>
        </b-select>
      </b-field>
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

    <div class="columns app-map">
      <l-map ref="map" class="column">
        <l-tilelayer :url="tileLayer"></l-tilelayer>
        <l-polyline v-for="line in lines" :key="line.idx" :lat-lngs="line.latlngs" :color="'green'"></l-polyline>
      </l-map>

      <div class="column is-one-fifth content is-small">
        <div class="stats" v-if="stats">
          <h1>Stats</h1>
          <div>Mean: {{stats.mean}}m</div>
          <div>Min: {{stats.min}}m</div>
          <div>Max: {{stats.max}}m</div>
          <div>Std. Deviation: {{stats.stdDev }}m</div>
          <div>90th Percentile: {{stats.ninetiethPercentile}}m</div>
        </div>
      </div>
    </div>
  </div>
</template>


<script lang="ts">
import Vue from "vue";
import { LMap, LPolyline, LPolygon, LFeatureGroup } from "vue2-leaflet";
import "leaflet/dist/leaflet.css";
import { Component, Lifecycle } from "av-ts";
import L from "leaflet";
import haversine from "haversine";
import math from "mathjs";
import { decode } from "@/utils";

interface Line {
  latlngs: [number, number][];
  color: string;
}

interface Stats {
  mean: number;
  min: number;
  max: number;
  stdDev: number;
  ninetiethPercentile: number;
}

@Component
export default class CompareLines extends Vue {
  $refs!: {
    map: LMap;
    fromLine: LPolyline;
    toLine: LPolyline;
  };

  get tileLayer() {
    return "https://tile.thunderforest.com/neighbourhood/{z}/{x}/{y}.png?apikey=9cbad82c6c9247579920818469285267";
  }

  fromLineString: string = "";
  toLineString: string = "";

  @Lifecycle
  mounted() {
    this.loadFromLocalStorage();
  }

  routes: string[] = [];
  loadFromLocalStorage() {
    var keys = Object.keys(localStorage);
    var routeKeys = keys.filter(k => k.startsWith("route-"));
    var rawRouteKeys = keys.filter(k => k.startsWith("raw-route-"));
    this.routes = routeKeys;
  }

  routeChosen(value: string) {
    var route = localStorage.getItem(value);
    var raw = localStorage.getItem(`raw-${value}`);
    this.fromLineString = raw!;
    this.toLineString = route!;
  }

  lines: { latlngs: [number, number][]; idx: number; distance: number }[] = [];
  updateLines() {
    if (!this.fromLineString || !this.toLineString) return;

    let fromLine: [number, number][] = decode(this.fromLineString);
    let toLine: [number, number][] = decode(this.toLineString);

    this.lines = fromLine
      .map((fromPoint: [number, number], idx: number) => {
        var toPoint = toLine[idx];
        var distance = haversine(fromPoint, toPoint, {
          format: "[lat,lon]",
          unit: "meter"
        });
        return { latlngs: [fromPoint, toPoint], idx: idx, distance };
      })
      .filter(l => l.distance < 50)
      .filter(l => !!l.latlngs[0] && !!l.latlngs[1]);

    var bounds = L.latLngBounds(this.lines.map(l => L.latLng(l.latlngs[0])));
    this.$refs.map.setBounds(bounds);

    this.calculateStats();
  }

  stats: Stats | null = null;
  calculateStats() {
    var distances = this.lines.map(l => l.distance);

    let mean = math.mean(distances);
    let min = math.min(distances);
    let max = math.max(distances);
    let stdDev = math.std(distances);
    let ninetiethPercentile = math.quantileSeq(distances, 0.9) as number;

    this.stats = {
      mean: math.round(mean, 1) as number,
      min: math.round(min, 1) as number,
      max: math.round(max, 1) as number,
      stdDev: math.round(stdDev, 1) as number,
      ninetiethPercentile: math.round(ninetiethPercentile) as number
    };
  }
}
</script>


<style lang="scss" scoped>
.app-map {
  height: 70vh;

  .map {
    height: 100%;
    width: 70%;
  }
}
</style>
