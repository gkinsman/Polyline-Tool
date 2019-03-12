<template>
  <nav class="navbar is-dark is-fixed-top" role="navigation">
    <div class="navbar-brand">
      <div class="navbar-item title is-size-4 has-text-light">Polyline Tool</div>
    </div>
    <div class="navbar-menu">
      <div class="navbar-start">
        <router-link class="navbar-item" to="/">Compare</router-link>
        <router-link class="navbar-item" to="/compare-many">Compare Many</router-link>
        <router-link class="navbar-item" to="/playback">Playback</router-link>
      </div>
    </div>
  </nav>
</template>

<script lang="ts">
import Vue from "vue";
import { Component } from "av-ts";
@Component
export default class Nav extends Vue {}
</script>

<style lang="scss" scoped>
.title {
  padding-left: 10px;
  display: flex;
  align-items: center;
}
</style>
