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
    var icon = [
      'red-circle.png',
      'grn-circle.png',
      'blu-circle.png',
      'purple-circle.png',
      'pink-circle.png',
      'ylw-circle.png',
      'orange-circle.png',
      'wht-circle.png',
    ];
    
    let marker = new google.maps.Marker({
      map: this.map,
      animation: google.maps.Animation.DROP,
      position: latLng,
      icon: {
        url: "http://maps.google.com/mapfiles/kml/paddle/" + icon[int]
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

  async openActionSheet() {
    const actionSheet = await this.actionSheetController.create({
      header: 'Icons',
      buttons: [{
        text: 'Red with Circle',
        handler: () => this.changeIcon(0)
      }, {
        text: 'Green with Circle',
        handler: () => this.changeIcon(1)
      }, {
        text: 'Blue with Circle',
        handler: () => this.changeIcon(2)
      }, {
        text: 'Purple with Circle',
        handler: () => this.changeIcon(3)
      }, {
        text: 'Pink with Circle',
        handler: () => this.changeIcon(4)
      }, {
        text: 'Yellow with Circle',
        handler: () => this.changeIcon(5)
      }, {
        text: 'Orange with Circle',
        handler: () => this.changeIcon(6)
      }, {
        text: 'White with Circle',
        handler: () => this.changeIcon(7)
      },]
    });
    await actionSheet.present();
  }
}