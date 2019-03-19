<template>
  <div class="app-map">
    <div class="columns">
      <b-field class="column" label="Point polyline">
        <b-input type="textarea" v-model="lineInput"></b-input>
      </b-field>
      <b-field label="Go" class="column is-narrow">
        <button @click="updateLines" class="button">View On Map</button>
      </b-field>
    </div>

    <l-map ref="map" style="height:100%; width:100%;">
      <l-tilelayer :url="tileLayer"></l-tilelayer>
      <l-marker
        v-for="point in points"
        :lat-lng="point.latlng"
        :color="point.color"
        :key="point.id"
      ></l-marker>
    </l-map>
  </div>
</template>


<script lang="ts">
import Vue from "vue";
import { LMap, LPolyline, LPolygon, LFeatureGroup } from "vue2-leaflet";
import "leaflet/dist/leaflet.css";
import { Component, Lifecycle } from "av-ts";
import L from "leaflet";
import { decode } from "@/utils";

interface Point {
  latlng: [number, number];
  id: number;
}

@Component
export default class ViewPoints extends Vue {
  $refs!: {
    map: LMap;
  };

  points: Point[] = [];
  lineInput: string = "";

  get tileLayer() {
    return "https://tile.thunderforest.com/neighbourhood/{z}/{x}/{y}.png?apikey=9cbad82c6c9247579920818469285267";
  }

  currentId = 0;
  updateLines() {
    let points: [number, number][] = decode(this.lineInput);

    this.points = points.map<Point>(point => ({
      latlng: [point[0], point[1]],
      color: "green",
      id: this.currentId++
    }));

    this.setBounds();
  }

  setBounds() {
    if (this.points.length) {
      var bounds = new L.LatLngBounds(this.points.map(p => p.latlng));
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
