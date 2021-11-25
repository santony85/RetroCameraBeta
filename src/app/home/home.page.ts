import { Component } from "@angular/core";
import * as mapboxgl from "mapbox-gl";
import { environment } from "src/environments/environment";
import { Geolocation } from "@ionic-native/geolocation/ngx";
import { DomSanitizer } from "@angular/platform-browser";
import { WifiWizard2 } from "@ionic-native/wifi-wizard-2/ngx";
import { NetworkInterface } from "@ionic-native/network-interface/ngx";
import { Insomnia } from "@ionic-native/insomnia/ngx";
import { HttpClient } from "@angular/common/http";
import { WebServer } from "@ionic-native/web-server/ngx";
import { Network } from "@ionic-native/network/ngx";
import { Platform } from "@ionic/angular";

import {
  DeviceOrientation,
  DeviceOrientationCompassHeading,
} from "@ionic-native/device-orientation/ngx";

@Component({
  selector: "app-home",
  templateUrl: "home.page.html",
  styleUrls: ["home.page.scss"],
})
export class HomePage {
  private mapbox: mapboxgl.Map;

  vitesse = 0.0;
  iscll = 0;
  isclr = 0;
  islig = 0;
  scalem = 0;
  scalev = 1;
  zmap = 900;
  zvid = 890;
  mypos: any;
  urljpg = "http://192.168.4.201/mjpeg/1";
  vidscr: any = "";
  isvidload = 0;
  constructor(
    private wifiwizard: WifiWizard2,
    private geolocation: Geolocation,
    private networkInterface: NetworkInterface,
    private deviceOrientation: DeviceOrientation,
    private sanitize: DomSanitizer,
    private insomnia: Insomnia,
    private http: HttpClient,
    private webServer: WebServer,
    private platform: Platform,
    private network: Network
  ) {
    mapboxgl.accessToken = environment.mapbox.accessToken;

    console.log("started");
    this.insomnia.keepAwake().then(
      () => console.log("success"),
      () => console.log("error")
    );
    this.platform.pause.subscribe(async () => {
      this.wifiwizard.iOSDisconnectNetwork("RetroAP8266").then((err) => {
        console.log("stoped ", err);
      });
    });
    this.platform.resume.subscribe(async () => {
      this.wificonnect();
    });
  }
  hidecli() {
    let env = this;
    setTimeout(function () {
      env.iscll = 0;
      env.isclr = 0;
    }, 7000);
  }

  openURL() {
    return this.sanitize.bypassSecurityTrustResourceUrl(this.urljpg);
  }

  ionViewDidEnter() {
    this.geolocation
      .getCurrentPosition()
      .then((resp: any) => {
        this.mypos = resp;
        this.initMap();
      })
      .catch((error) => {
        console.log("Error getting location", error);
      });
  }

  initMap() {
    let env = this;

    this.mapbox = new mapboxgl.Map({
      container: "mapbox",
      style: "mapbox://styles/mapbox/streets-v10",
      zoom: 18,
      pitch: 45,
      center: [2.343756, 48.8653533],
    });

    var geolocate = new mapboxgl.GeolocateControl({
      fitBoundsOptions: {
        maxZoom: 18,
      },
      positionOptions: {
        enableHighAccuracy: true,
        timeout: 300,
      },
      trackUserLocation: true,
      showAccuracyCircle: false,
      showUserHeading: true,
      interactive: false,
    });

    this.mapbox.addControl(geolocate);
    this.mapbox.on("load", (event) => {
      geolocate.trigger();
      this.mapbox.addLayer({
        id: "3d-buildings",
        source: "composite",
        "source-layer": "building",
        filter: ["==", "extrude", "true"],
        type: "fill-extrusion",
        minzoom: 15,
        paint: {
          "fill-extrusion-color": "#aaa",
          "fill-extrusion-height": {
            type: "identity",
            property: "height",
          },
          "fill-extrusion-base": {
            type: "identity",
            property: "min_height",
          },
          "fill-extrusion-opacity": 0.6,
        },
      });
      let ctrl = document.getElementsByClassName("mapboxgl-control-container");
      var all = ctrl.item(0) as HTMLElement;
      all.style.visibility = "hidden";
      //connect to wifi
      this.wificonnect();
    });

    var map = this.mapbox;

    geolocate.on("geolocate", function (e) {
      console.log(e.coords);
      map.setCenter([e.coords.longitude, e.coords.latitude]);
      map.setZoom(18);
      if (e.coords.speed) {
        if (e.coords.speed > 0) env.vitesse = e.coords.speed.toFixed(0);
        else env.vitesse = 0;
      }
    });

    setInterval(function () {
      env.deviceOrientation
        .getCurrentHeading()
        .then((data: DeviceOrientationCompassHeading) => {
          let b = data.trueHeading;
          let bc = (b - 90) % 360;
          env.mapbox.setBearing(bc);
        });
    }, 300);
  }

  startwebserver() {
    let env = this;
    this.webServer.onRequest().subscribe((data) => {
      console.log(data.path);
      if (data.path == "/l") this.iscll = 1;
      if (data.path == "/r") this.isclr = 1;
      if (data.path == "/m") this.islig = 1;
      if (data.path == "/n") this.islig = 0;
      this.hidecli();
      this.webServer
        .sendResponse(data.requestId, {
          status: 200,
          body: "ok",
          headers: {
            "Content-Type": "text/html",
          },
        })
        .then((datax) => {
          console.log("end wbs");
        })
        .catch((dt) => {
          console.log(dt);
        });
    });
    this.webServer.stop();
    this.webServer
      .start(99)
      .then((ok: any) => {
        console.log("webserver ok");
      })
      .catch((error: any) => {
        console.log("webserver error");
        console.error(error);
      });
  }

  setIpToServer() {
    let env = this;
    console.log("Set ip to server");
    this.networkInterface.getWiFiIPAddress().then((address) => {
      console.log(address.ip);
      this.http
        .get("http://192.168.4.1/ipc?ip=" + address.ip)
        .subscribe((vl) => {
          console.log("fin init");
        });
    });
  }

  wificonnect() {
    let env = this;
    this.network.onConnect().subscribe(() => {
      console.log("network connected!");
      setTimeout(() => {
        if (this.network.type === "wifi") {
          console.log("we got a wifi connection, woohoo!");
          this.setIpToServer();
        }
      }, 5000);
    });
    //if ios
    if (this.platform.is("ios")) {
      this.wifiwizard
        .iOSConnectNetwork("RetroAP8266", "Santony85")
        .then((con) => {
          console.log("wifi ok");
          console.log(con);
          setTimeout(() => {
            env.startwebserver();
          }, 5000);
        });
    }
    //if android
    else if (this.platform.is("android")) {
      this.wifiwizard
        .connect("RetroAP8266", true, "Santony85", "WPA")
        .then((con) => {
          console.log("wifi ok");
          console.log(con);
          setTimeout(() => {
            env.startwebserver();
          }, 5000);
        });
    }
    //else
  }

  setmap() {
    this.scalem = 1;
    this.scalev = 0;
    this.zvid = 900;
    this.zmap = 890;
  }

  setvid() {
    this.scalem = 0;
    this.scalev = 1;
    this.zvid = 890;
    this.zmap = 900;
  }
}
