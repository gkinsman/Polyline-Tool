import Vue from "vue";
import App from "./App.vue";
import {
  LMap,
  LTileLayer,
  LPolyline,
  LMarker,
  LCircleMarker,
  LFeatureGroup
} from "vue2-leaflet";
import Buefy from "buefy";
import "buefy/dist/buefy.css";
import "leaflet/dist/leaflet.css";
import router from "./router";

import { library } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { faGreaterThan, faLessThan } from "@fortawesome/free-solid-svg-icons";

import L from "leaflet";
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png")
});

Vue.config.productionTip = false;

library.add(faGreaterThan, faLessThan);
Vue.component("font-awesome-icon", FontAwesomeIcon);

Vue.use(Buefy);
Vue.component("l-map", LMap);
Vue.component("l-tilelayer", LTileLayer);
Vue.component("l-polyline", LPolyline);
Vue.component("l-marker", LMarker);
Vue.component("l-circle-marker", LCircleMarker);
Vue.component("l-feature-group", LFeatureGroup);

new Vue({
  router,
  render: h => h(App)
}).$mount("#app");
