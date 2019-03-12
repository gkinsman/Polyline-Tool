<template>
  <div id="app">
    <Nav></Nav>
    <section class="section">
      <div class="container">
        <router-view></router-view>
      </div>
    </section>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { Component, Lifecycle } from "av-ts";
import { LMap } from "vue2-leaflet";
import Nav from "@/components/Nav.vue";

@Component({
  components: {
    Nav
  }
})
export default class App extends Vue {}
</script>
