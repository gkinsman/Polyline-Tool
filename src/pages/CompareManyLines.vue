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
      <l-feature-group v-for="pointCloud in points" :key="pointCloud.id">
        <l-marker
          v-for="point in pointCloud.latlngs"
          :lat-lng="point"
          :key="`${point[0]}|${point[1]}`"
        ></l-marker>
      </l-feature-group>
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

type PointOrLine = "Point" | "Line";

interface Mappable {
  latlngs: [number, number][];
  color: string;
  id: number;
  type: PointOrLine;
}

interface StyleInfo {
  color: string;
  type: PointOrLine;
}

@Component
export default class CompareManyLines extends Vue {
  $refs!: {
    map: LMap;
  };

  lines: Mappable[] = [];
  points: Mappable[] = [];

  lineInput: string = "";

  get tileLayer() {
    return "https://tile.thunderforest.com/neighbourhood/{z}/{x}/{y}.png?apikey=9cbad82c6c9247579920818469285267";
  }

  // (blue) makes the line blue
  // [P] makes it a point cloud, [L] makes it a line
  extractStyleCommand(line: string): [StyleInfo, string] {
    if (line.startsWith("(") && line.indexOf(")") < 10) {
      var color = line.substring(1, line.indexOf(")"));
      return [
        {
          color: color,
          type: "Line"
        },
        line.substring(line.indexOf(")") + 1)
      ];
    }
    if (line.startsWith("[") && line.indexOf("]") == 2) {
      return [
        {
          color: "blue",
          type: line.substring(1, 2) == "P" ? "Point" : "Line"
        },
        line.substring(3)
      ];
    }

    // defaults
    return [
      {
        color: "green",
        type: "Line"
      },
      line
    ];
  }

  currentId = 0;
  updateLines() {
    var split = this.lineInput.split(/\r?\n/);

    const parsed = split
      .map<[StyleInfo, string]>(line => {
        let extract = this.extractStyleCommand(line);
        return [extract[0], extract[1]];
      })
      .map<[StyleInfo, [number, number][]]>(line => [line[0], decode(line[1])])
      .map<Mappable>(line => ({
        latlngs: line[1],
        color: line[0].color,
        id: this.currentId++,
        type: line[0].type
      }));

    this.lines = parsed.filter(p => p.type == "Line");
    this.points = parsed.filter(p => p.type == "Point");

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
