import Vue from "vue";
import App from "./App.vue";
import { LMap, LTileLayer, LPolyline } from "vue2-leaflet";
import Buefy from "buefy";
import "buefy/dist/buefy.css";

Vue.config.productionTip = false;

Vue.use(Buefy);
Vue.component("l-map", LMap);
Vue.component("l-tilelayer", LTileLayer);
Vue.component("l-polyline", LPolyline);

new Vue({
  render: h => h(App)
}).$mount("#app");
