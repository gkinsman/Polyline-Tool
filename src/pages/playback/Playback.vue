<template>
  <div class="app-map">
    <div class="columns">
      <b-field class="column is-one-quarter" placeholder="Routes">
        <b-select expanded v-model="routeId" :loading="loadingRoutes">
          <option v-for="option in routes" :key="option">{{option}}</option>
        </b-select>
        <p class="control">
          <button class="button is-info" @click="loadRoute">Load</button>
        </p>
      </b-field>
      <div class="column is-narrow">
        <span v-if="loadedRoute.length" class="tag is-info">Loaded route id {{loadedRouteId}}</span>
      </div>
      <div class="column">
        <div class="field has-addons" v-if="loadedRoute.length">
          <p class="control">
            <a class="button" @click="goWayBack">
              <span class="icon is-small">
                <font-awesome-icon icon="less-than"></font-awesome-icon>
                <font-awesome-icon icon="less-than"></font-awesome-icon>
              </span>
            </a>
          </p>
          <p class="control">
            <a class="button" @click="goBack">
              <span class="icon is-small">
                <font-awesome-icon icon="less-than"></font-awesome-icon>
              </span>
            </a>
          </p>
          <p class="control" v-if="loadedRoute.length">
            <input class="input" :loading="loadingMatch" type="text" :value="description" readonly>
          </p>
          <p class="control">
            <a class="button" @click="goForward">
              <span class="icon is-small">
                <font-awesome-icon icon="greater-than"></font-awesome-icon>
              </span>
            </a>
          </p>
          <p class="control">
            <a class="button" @click="goWayForward">
              <span class="icon is-small">
                <font-awesome-icon icon="greater-than"></font-awesome-icon>
                <font-awesome-icon icon="greater-than"></font-awesome-icon>
              </span>
            </a>
          </p>
        </div>
      </div>

      <div class="column">
        <div class="field" v-if="loadedRoute.length">
          <input class="input" type="number" v-model="radius">
        </div>
      </div>

      <div class="column">
        <div class="field" v-if="loadedRoute.length">
          <input
            class="button is-info"
            type="button"
            @click="processEntireRoute"
            value="Process entire route"
          >
          <progress class="progress" max="100" :value="processPercentage">{{ processPercentage}}%</progress>
        </div>
      </div>
    </div>

    <l-map ref="map" style="height:100%; width:100%;" no-blocking-animations>
      <l-tilelayer :url="tileLayer"></l-tilelayer>
      <l-polyline ref="busTail" v-if="lineTail.length" :lat-lngs="lineTail" :color="'green'"></l-polyline>
      <l-marker
        v-if="entireRouteProcessed.length"
        :lat-lng="entireRouteProcessed[entireRouteProcessed.length-1]"
      ></l-marker>
      <l-polyline
        v-if="entireRouteProcessed.length"
        :lat-lngs="entireRouteProcessed"
        :color="'green'"
      ></l-polyline>
      <l-polyline v-if="rawRouteProcessed.length" :lat-lngs="rawRouteProcessed" :color="'blue'"></l-polyline>
      <l-marker :icon="busIcon" v-if="fixedLocation" :lat-lng="fixedLocation"></l-marker>
      <l-circle-marker v-if="sourceLocation" :radius="radius" :lat-lng="sourceLocation"></l-circle-marker>
    </l-map>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { Component, Lifecycle } from "av-ts";
import RouteService, { ApiLocation } from "@/api/RouteService";
import MatchService, { MatchResult } from "@/api/MatchService";
import polyline from "google-polyline";
import { LMap } from "vue2-leaflet";
import L from "leaflet";
import iterateRoute from "./route-iterator";

@Component
export default class Playback extends Vue {
  $refs!: {
    map: LMap;
  };

  routeService: RouteService;
  matchService: MatchService;

  routeId: string = "";
  loadedRouteId: string = "";
  routes: string[] = [];
  loadedRoute: ApiLocation[] = [];
  loadingRoutes: boolean = true;
  radius: number = 30;

  constructor() {
    super();
    this.routeService = new RouteService();
    this.matchService = new MatchService();
  }

  @Lifecycle
  async mounted() {
    await this.loadRoutes();
  }

  async loadRoutes() {
    this.routes = await this.routeService.loadRoutes();
    this.loadingRoutes = false;
  }

  async loadRoute() {
    this.loadedRouteId = this.routeId;
    this.loadedRoute = await this.routeService.loadRoute(this.loadedRouteId);
    this.entireRouteProcessed = [];
    this.rawRouteProcessed = [];
    this.processPercentage = 0;

    this.loadMatch();
  }

  entireRouteProcessed: [number, number][] = [];
  rawRouteProcessed: any = [];
  processPercentage: number = 0;
  async processEntireRoute() {
    var existing = localStorage.getItem(`route-${this.loadedRouteId}`);
    if (existing) {
      this.entireRouteProcessed = polyline.decode(existing);
      this.rawRouteProcessed = this.loadedRoute.map(r => [
        r.latitude,
        r.longitude
      ]);
      this.processPercentage = 100;
      return;
    }

    var iterator = iterateRoute(this.loadedRoute);
    for await (const item of iterator) {
      this.entireRouteProcessed.push(item.matchedPoint);
      this.processPercentage = item.progress;
      let rawPoint = this.loadedRoute[item.index];
      this.rawRouteProcessed.push([rawPoint.latitude, rawPoint.longitude]);
    }

    localStorage.setItem(
      `route-${this.loadedRouteId}`,
      polyline.encode(this.entireRouteProcessed)
    );
    localStorage.setItem(
      `raw-route-${this.loadedRouteId}`,
      polyline.encode(this.rawRouteProcessed)
    );
  }

  get description() {
    return `(${this.currentInputPointIndex} of ${
      this.loadedRoute.length
    }), c-value: ${this.matchConfidence}`;
  }

  goBack() {
    this.currentInputPointIndex--;
    this.loadMatch();
  }

  goForward() {
    this.currentInputPointIndex++;
    this.loadMatch();
  }

  goWayBack() {
    this.currentInputPointIndex -= 10;
    this.loadMatch();
  }

  goWayForward() {
    this.currentInputPointIndex += 10;
    this.loadMatch();
  }

  tailLength = 7;
  currentInputPointIndex = 1;

  fixedLocation: [number, number] | null = null;
  sourceLocation: [number, number] = [0, 0];
  lineTail: any = [];
  matchConfidence: number | string | null = null;

  loadingMatch: boolean = false;

  async loadMatch() {
    this.loadingMatch = true;

    let match: MatchResult;
    let tail = this.loadedRoute.slice(
      Math.max(0, this.currentInputPointIndex - this.tailLength),
      this.currentInputPointIndex + 1
    );
    try {
      match = await this.matchService.loadMatch(tail, this.radius);
    } catch {
      this.matchConfidence = "No Match";
      return;
    }
    var srcPoint = this.loadedRoute[this.currentInputPointIndex];
    this.sourceLocation = [srcPoint.latitude, srcPoint.longitude];

    var decodedFixedLine: [number, number][] = polyline.decode(match.polyline);
    this.fixedLocation = decodedFixedLine[decodedFixedLine.length - 1];
    this.lineTail = tail.map(t => [t.latitude, t.longitude]);
    this.matchConfidence = match.confidence;

    this.loadingMatch = false;
    this.setBounds();
  }

  get busIcon() {
    return L.icon({
      iconUrl: require("@/assets/bus-solid.svg"),
      iconSize: [20, 20]
    });
  }

  get microchipIcon() {
    return L.icon({
      iconUrl: require("@/assets/microchip-solid.svg"),
      iconSize: [20, 20]
    });
  }

  setBounds() {
    if (this.lineTail) {
      var bounds = new L.LatLngBounds(
        this.lineTail.concat([this.sourceLocation])
      );
      this.$refs.map.setBounds(bounds);
    }
  }

  get tileLayer() {
    return "https://tile.thunderforest.com/neighbourhood/{z}/{x}/{y}.png?apikey=9cbad82c6c9247579920818469285267";
  }
}
</script>

<style lang="scss" scoped>
.app-map {
  height: 80vh;

  .map {
    height: 90%;
    width: 100%;
  }
}
</style>
