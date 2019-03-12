import Vue from "vue";
import App from "./App.vue";
import {
  LMap,
  LTileLayer,
  LPolyline,
  LMarker,
  LCircleMarker
} from "vue2-leaflet";
import Buefy from "buefy";
import "buefy/dist/buefy.css";
import router from "./router";

import { library } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { faGreaterThan, faLessThan } from "@fortawesome/free-solid-svg-icons";

Vue.config.productionTip = false;

library.add(faGreaterThan, faLessThan);
Vue.component("font-awesome-icon", FontAwesomeIcon);

Vue.use(Buefy);
Vue.component("l-map", LMap);
Vue.component("l-tilelayer", LTileLayer);
Vue.component("l-polyline", LPolyline);
Vue.component("l-marker", LMarker);
Vue.component("l-circle-marker", LCircleMarker);

new Vue({
  router,
  render: h => h(App)
}).$mount("#app");
