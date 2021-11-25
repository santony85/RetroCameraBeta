import { Component } from "@angular/core";
import { Platform } from "@ionic/angular";
import { SplashScreen } from "@ionic-native/splash-screen/ngx";
import { StatusBar } from "@ionic-native/status-bar/ngx";
import { WifiWizard2 } from "@ionic-native/wifi-wizard-2/ngx";
import { NetworkInterface } from "@ionic-native/network-interface/ngx";
import { Router } from "@angular/router";

@Component({
  selector: "app-root",
  templateUrl: "app.component.html",
  styleUrls: ["app.component.scss"],
})
export class AppComponent {
  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private wifiwizard: WifiWizard2,
    private networkInterface: NetworkInterface,
    private router: Router
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
      let env = this;
      this.wifiwizard
        .getConnectedSSID()
        .then((ssid) => {
          console.log(ssid);
          //if ios
          if (this.platform.is("ios")) {
            console.log("running on iOS device!");
            this.wifiwizard.iOSDisconnectNetwork(ssid).then((err) => {
              console.log("stoped ", err);
              env.router.navigate(["/home"]);
            });
          }
          //if android
          else if (this.platform.is("android")) {
            console.log("running on Android device!");
            this.wifiwizard.disconnect(ssid).then((err) => {
              console.log("stoped ", err);
              env.router.navigate(["/home"]);
            });
          }
        })
        .catch((err) => {
          env.router.navigate(["/home"]);
        });
    });
  }
}
