import Vue from "vue";
import Router from "vue-router";
import CompareLines from "@/pages/CompareLines.vue";
import Playback from "@/pages/playback/Playback.vue";
import CompareManyLines from "@/pages/CompareManyLines.vue";
import ViewPoints from "@/pages/ViewPoints.vue";

Vue.use(Router);

export default new Router({
  mode: "history",
  base: process.env.BASE_URL,
  routes: [
    {
      path: "/",
      name: "compare",
      component: CompareLines
    },
    {
      path: "/view-points",
      name: "view-points",
      component: ViewPoints
    },
    {
      path: "/compare-many",
      name: "compare-many",
      component: CompareManyLines
    },
    {
      path: "/playback",
      name: "playback",
      component: Playback
    }
  ]
});
