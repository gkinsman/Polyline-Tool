<template>
  <div class="app-map">
    <div class="columns">
      <b-field class="column" label="Source Polyline">
        <b-input v-model="fromLineString"></b-input>
      </b-field>
      <b-field class="column" label="Fixed Polyline">
        <b-input v-model="toLineString"></b-input>
      </b-field>
      <b-field class="column">
        <div class="control">
          <button @click="updateLines" class="button">View On Map</button>
        </div>
      </b-field>
    </div>
    <l-map ref="map" style="height:100%; width:100%;">
      <l-tilelayer :url="tileLayer"></l-tilelayer>
      <l-polyline
        ref="fromLine"
        v-if="fromLine"
        :lat-lngs="fromLine.latlngs"
        :color="fromLine.color"
      ></l-polyline>
      <l-polyline ref="toLine" v-if="toLine" :lat-lngs="toLine.latlngs" :color="toLine.color"></l-polyline>
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
export default class Map extends Vue {
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

  fromLine: Line | null = null;
  toLine: Line | null = null;

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

  updateLines() {
    if (this.fromLineString)
      this.fromLine = {
        latlngs: polyline.decode(this.fromLineString),
        color: "red"
      };
    if (this.toLineString)
      this.toLine = {
        latlngs: polyline.decode(this.toLineString),
        color: "green"
      };

    this.setBounds();
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
  .map {
    height: 80%;
    width: 100%;
  }
}
</style>
