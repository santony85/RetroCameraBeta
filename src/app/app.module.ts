import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { RouteReuseStrategy } from "@angular/router";

import { IonicModule, IonicRouteStrategy } from "@ionic/angular";
import { SplashScreen } from "@ionic-native/splash-screen/ngx";
import { StatusBar } from "@ionic-native/status-bar/ngx";

import { AppComponent } from "./app.component";
import { AppRoutingModule } from "./app-routing.module";
import { Geolocation } from "@ionic-native/geolocation/ngx";
import { WifiWizard2 } from "@ionic-native/wifi-wizard-2/ngx";
import { NetworkInterface } from "@ionic-native/network-interface/ngx";
import { Insomnia } from "@ionic-native/insomnia/ngx";
import { HttpClientModule } from "@angular/common/http";
import { WebServer } from "@ionic-native/web-server/ngx";
import { Network } from "@ionic-native/network/ngx";

import {
  DeviceOrientation,
  DeviceOrientationCompassHeading,
} from "@ionic-native/device-orientation/ngx";

@NgModule({
  declarations: [AppComponent],
  entryComponents: [],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    HttpClientModule,
  ],
  providers: [
    Geolocation,
    DeviceOrientation,
    WifiWizard2,
    NetworkInterface,
    Insomnia,
    WebServer,
    Network,
    StatusBar,
    SplashScreen,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
