<template>
  <nav class="navbar" role="navigation">
    <div class="navbar-brand">
      <div class="navbar-item title is-size-4 has-text-light">Polyline Tool</div>
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
.navbar {
  background-color: hsl(0, 0%, 21%);
}

.title {
  padding-left: 10px;
  display: flex;
  align-items: center;
}
</style>


