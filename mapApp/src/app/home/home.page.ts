import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { FirebaseService } from '../services/firebase.service';
import { Location } from '../models/location.model';
import 'rxjs-compat/add/operator/map';
import { Observable } from 'rxjs-compat/Observable';
import { Router } from '@angular/router';
import { ActionSheetController } from '@ionic/angular';

declare var google;

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  @ViewChild('map') mapElement: ElementRef;
  public base64Image: string;
  locationsList$: Observable<Location[]>;
  map: any;
  position: any;
  public locationTitle: string;
  currentLoc: Location;
  locationKey: string;
  gmarkers = [];
  icons = [
  'red-circle.png',
  'red-square.png',
  'red-diamond.png',
  'red-stars.png',
  'red-bnk.png',
  'grn-circle.png',
  'grn-square.png',
  'grn-diamond.png',
  'grn-stars.png',
  'grn-bnk.png',
  'blu-circle.png',
  'blu-square.png',
  'blu-diamond.png',
  'blu-stars.png',
  'blu-bnk.png',
  'purple-circle.png',
  'purple-square.png',
  'purple-diamond.png',
  'purple-stars.png',
  'purple-bnk.png',
  'pink-circle.png',
  'pink-square.png',
  'pink-diamond.png',
  'pink-stars.png',
  'pink-bnk.png',
  'ylw-circle.png',
  'ylw-square.png',
  'ylw-diamond.png',
  'ylw-stars.png',
  'ylw-bnk.png',
  'orange-circle.png',
  'orange-square.png',
  'orange-diamond.png',
  'orange-stars.png',
  'orange-bnk.png',
  'wht-circle.png',
  'wht-square.png',
  'wht-diamond.png',
  'wht-stars.png',
  'wht-bnk.png',];

  constructor(private router: Router, private geolocation: Geolocation, public firebaseService: FirebaseService, public actionSheetController: ActionSheetController) {
    this.locationsList$ = this.firebaseService.getLocationsList().snapshotChanges().map(changes => {
      return changes.map(c => ({
        key: c.payload.key, ...c.payload.val()
      }));
    });
  }

  ngOnInit() {
    let mapOptions = {
      zoom: 10,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      mapTypeContol: false,
      streetViewControl: false,
      fullScreenControl: false,
    }
    this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);
    this.firebaseService.getLocationsList().valueChanges().subscribe(res => {
      for (let item of res) {
        this.addMarker(item);
        this.position = new google.maps.LatLng(item.latitude, item.longitude);
        this.map.setCenter(this.position);
      }
    });
  }

  onContextChange(ctxt: string): void {
    this.locationsList$ = this.firebaseService.getLocationsList().snapshotChanges().map(changes => {
      return changes.map(c => ({
        key: c.payload.key, ...c.payload.val()
      }));
    });
  }

  addMarker(location: any, int = 0) {
    let latLng = new google.maps.LatLng(location.latitude, location.longitude);
    let marker = new google.maps.Marker({
      map: this.map,
      animation: google.maps.Animation.DROP,
      position: latLng,
      icon: {
        url: this.iconName(this.icons[int]),
      }
    });
    this.gmarkers.push(marker);

    this.addInfoWindow(marker, location);
  }

  assignLocation(loc: Location) {
    this.firebaseService.setCurrentLocation(loc);
    this.currentLoc = loc;
    this.locationKey = loc.key;
    this.locationTitle = loc.title;
    console.log("Assigned location key: " + this.locationKey);
  }

  addInfoWindow(marker, location) {
    let contentString = '<div class="info-window" id="clickableItem">' +
      '<h3>' + location.title + '</h3>' +
      '<div class="info-content">' +
      '<img src=' + location.picture + ' alt="picture" style="width:30px; height:30px; padding: 20px, 20px, 20px, 20px">' +
      '<p>' + location.content + '</p>' +
      '</div>' +
      '</div>';

    let infoWindow = new google.maps.InfoWindow({
      content: contentString,
      maxWidth: 400,
    })

    google.maps.event.addListener(infoWindow, 'domready', () => {
      var clickableItem = document.getElementById('clickableItem');
      clickableItem.addEventListener('click', () => {
        this.firebaseService.setCurrentLocation(location);
        this.locationTitle = location.title;
        this.router.navigate(['/list', this.locationTitle])
      });
    });
    google.maps.event.addListener(marker, 'click', () => {
      infoWindow.open(this.map, marker);
    });
    google.maps.event.addListener(this.map, 'click', () => {
      infoWindow.close(this.map, marker);
    });
  }

  changeIcon(int) {
    for (var i in this.gmarkers) {
      this.gmarkers[i].visible = false;
      this.gmarkers[i].setMap(null);
    }
    this.gmarkers = [];
    this.firebaseService.getLocationsList().valueChanges().subscribe(res => {
      for (let item of res) {
        this.addMarker(item, int);
        this.position = new google.maps.LatLng(item.latitude, item.longitude);
        this.map.setCenter(this.position);
      }
    });
  }

  iconName(icon:string)
  {
    return "http://maps.google.com/mapfiles/kml/paddle/" + icon;
  }

  async openActionSheet() {
    const actionSheet = await this.actionSheetController.create({
      header: 'Icons',
      buttons: [{
        text: 'Red with Circle (Default)',
        icon: this.iconName(this.icons[0]),
        handler: () => this.changeIcon(0)
      }, {
        text: 'Red with Square',
        icon: this.iconName(this.icons[1]),
        handler: () => this.changeIcon(1)
      }, {
        text: 'Red with Diamond',
        icon: this.iconName(this.icons[2]),
        handler: () => this.changeIcon(2)
      }, {
        text: 'Red with Stars',
        icon: this.iconName(this.icons[3]),
        handler: () => this.changeIcon(3)
      }, {
        text: 'Red Blank',
        icon: this.iconName(this.icons[4]),
        handler: () => this.changeIcon(4)
      }, {
        text: 'Green with Circle',
        icon: this.iconName(this.icons[5]),
        handler: () => this.changeIcon(5)
      }, {
        text: 'Green with Square',
        icon: this.iconName(this.icons[6]),
        handler: () => this.changeIcon(6)
      }, {
        text: 'Green with Diamond',
        icon: this.iconName(this.icons[7]),
        handler: () => this.changeIcon(7)
      }, {
        text: 'Green with Stars',
        icon: this.iconName(this.icons[8]),
        handler: () => this.changeIcon(8)
      }, {
        text: 'Green Blank',
        icon: this.iconName(this.icons[9]),
        handler: () => this.changeIcon(9)
      }, {
        text: 'Blue with Circle',
        icon: this.iconName(this.icons[10]),
        handler: () => this.changeIcon(10)
      }, {
        text: 'Blue with Square',
        icon: this.iconName(this.icons[11]),
        handler: () => this.changeIcon(11)
      }, {
        text: 'Blue with Diamond',
        icon: this.iconName(this.icons[12]),
        handler: () => this.changeIcon(12)
      }, {
        text: 'Blue with Stars',
        icon: this.iconName(this.icons[13]),
        handler: () => this.changeIcon(13)
      }, {
        text: 'Blue Blank',
        icon: this.iconName(this.icons[14]),
        handler: () => this.changeIcon(14)
      }, {
        text: 'Purple with Circle',
        icon: this.iconName(this.icons[15]),
        handler: () => this.changeIcon(15)
      }, {
        text: 'Purple with Square',
        icon: this.iconName(this.icons[16]),
        handler: () => this.changeIcon(16)
      }, {
        text: 'Purple with Diamond',
        icon: this.iconName(this.icons[17]),
        handler: () => this.changeIcon(17)
      }, {
        text: 'Purple with Stars',
        icon: this.iconName(this.icons[18]),
        handler: () => this.changeIcon(18)
      }, {
        text: 'Purple Blank',
        icon: this.iconName(this.icons[19]),
        handler: () => this.changeIcon(19)
      }, {
        text: 'Pink with Circle',
        icon: this.iconName(this.icons[20]),
        handler: () => this.changeIcon(20)
      }, {
        text: 'Pink with Square',
        icon: this.iconName(this.icons[21]),
        handler: () => this.changeIcon(21)
      }, {
        text: 'Pink with Diamond',
        icon: this.iconName(this.icons[22]),
        handler: () => this.changeIcon(22)
      }, {
        text: 'Pink with Stars',
        icon: this.iconName(this.icons[23]),
        handler: () => this.changeIcon(23)
      }, {
        text: 'Pink Blank',
        icon: this.iconName(this.icons[24]),
        handler: () => this.changeIcon(24)
      }, {
        text: 'Yellow with Circle',
        icon: this.iconName(this.icons[25]),
        handler: () => this.changeIcon(25)
      }, {
        text: 'Yellow with Square',
        icon: this.iconName(this.icons[26]),
        handler: () => this.changeIcon(26)
      }, {
        text: 'Yellow with Diamond',
        icon: this.iconName(this.icons[27]),
        handler: () => this.changeIcon(27)
      }, {
        text: 'Yellow with Stars',
        icon: this.iconName(this.icons[28]),
        handler: () => this.changeIcon(28)
      }, {
        text: 'Yellow Blank',
        icon: this.iconName(this.icons[29]),
        handler: () => this.changeIcon(29)
      }, {
        text: 'Orange with Circle',
        icon: this.iconName(this.icons[30]),
        handler: () => this.changeIcon(30)
      }, {
        text: 'Orange with Square',
        icon: this.iconName(this.icons[31]),
        handler: () => this.changeIcon(31)
      }, {
        text: 'Orange with Diamond',
        icon: this.iconName(this.icons[32]),
        handler: () => this.changeIcon(32)
      }, {
        text: 'Orange with Stars',
        icon: this.iconName(this.icons[33]),
        handler: () => this.changeIcon(33)
      }, {
        text: 'Orange Blank',
        icon: this.iconName(this.icons[34]),
        handler: () => this.changeIcon(34)
      }, {
        text: 'White with Circle',
        icon: this.iconName(this.icons[35]),
        handler: () => this.changeIcon(35)
      }, {
        text: 'White with Square',
        icon: this.iconName(this.icons[36]),
        handler: () => this.changeIcon(36)
      }, {
        text: 'White with Diamond',
        icon: this.iconName(this.icons[37]),
        handler: () => this.changeIcon(37)
      }, {
        text: 'White with Stars',
        icon: this.iconName(this.icons[38]),
        handler: () => this.changeIcon(38)
      }, {
        text: 'White Blank',
        icon: this.iconName(this.icons[39]),
        handler: () => this.changeIcon(39)
      },]
    });
    await actionSheet.present();
  }
}