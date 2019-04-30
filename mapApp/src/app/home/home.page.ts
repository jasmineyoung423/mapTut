import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { FirebaseService } from '../services/firebase.service';
import { Location } from '../models/location.model';
import 'rxjs-compat/add/operator/map';
import { Observable } from 'rxjs-compat/Observable';
import { Router } from '@angular/router';
import { ActionSheetController, IonSelect } from '@ionic/angular';
import { ModalController } from '@ionic/angular';
import { ModalPage } from '@ionic/core/dist';

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
  mapStyle: any;
  style1: any;
  style2: any;
  style3: any;
  style4: any;
  gmarkers = [];
  chosenIcon: any;
  icons = [
    'red-circle.png',
    'red-square.png',
    'red-diamond.png',
    'red-stars.png',
    'red-blank.png',
    'grn-circle.png',
    'grn-square.png',
    'grn-diamond.png',
    'grn-stars.png',
    'grn-blank.png',
    'blu-circle.png',
    'blu-square.png',
    'blu-diamond.png',
    'blu-stars.png',
    'blu-blank.png',
    'purple-circle.png',
    'purple-square.png',
    'purple-diamond.png',
    'purple-stars.png',
    'purple-blank.png',
    'pink-circle.png',
    'pink-square.png',
    'pink-diamond.png',
    'pink-stars.png',
    'pink-blank.png',
    'ylw-circle.png',
    'ylw-square.png',
    'ylw-diamond.png',
    'ylw-stars.png',
    'ylw-blank.png',
    'orange-circle.png',
    'orange-square.png',
    'orange-diamond.png',
    'orange-stars.png',
    'orange-blank.png',
    'wht-circle.png',
    'wht-square.png',
    'wht-diamond.png',
    'wht-stars.png',
    'wht-blank.png'];

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
      mapTypeControlOptions: {
        mapTypeIds: ['roadmap', 'style1', 'style2', 'style3',
          'style4']
      },
      streetViewControl: false,
      fullScreenControl: false,
    }
    this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);
    this.setStyles();
    this.firebaseService.getLocationsList().valueChanges().subscribe(res => {
      for (let item of res) {
        this.addMarker(item);
        this.position = new google.maps.LatLng(item.latitude, item.longitude);
        this.map.setCenter(this.position);
      }
    });
    this.map.mapTypes.set('style1', this.style1);
    this.map.mapTypes.set('style2', this.style2);
    this.map.mapTypes.set('style3', this.style3);
    this.map.mapTypes.set('style4', this.style4);
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

  iconName(icon: string) {
    return "http://maps.google.com/mapfiles/kml/paddle/" + icon;
  }

  async openActionSheet() {
    const actionSheet = await this.actionSheetController.create({
      header: 'Icons',
      buttons: [{
        text: 'Red with Circle (Default)',
        icon: '<img src=' + this.iconName(this.icons[0]) + '>',
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
      }]
    });
    await actionSheet.present();
  }

  setStyles() {
    this.style1 = new google.maps.StyledMapType([
      {
        elementType: 'geometry',
        stylers: [
          { color: '#f5f5f5' }
        ]
      },
      {
        elementType: 'labels.icon',
        stylers: [
          { visibility: 'off' }
        ]
      },
      {
        elementType: 'labels.text.fill',
        stylers: [
          { color: '#616161' }
        ]
      },
      {
        elementType: 'labels.text.stroke',
        stylers: [
          { color: '#f5f5f5' }
        ]
      }, {
        featureType: 'administrative.land_parcel',
        elementType: 'labels.text.fill',
        stylers: [
          { color: '#bdbdbd' }
        ]
      },
      {
        featureType: 'poi',
        elementType: 'geometry',
        stylers: [
          { color: '#eeeeee' }
        ]
      },
      {
        featureType: 'poi',
        elementType: 'labels.text.fill',
        stylers: [
          { color: '#757575' }
        ]
      },
      {
        featureType: 'poi.park',
        elementType: 'geometry',
        stylers: [
          { color: '#e5e5e5' }
        ]
      },
      {
        featureType: 'poi.park',
        elementType: 'labels.text.fill',
        stylers: [
          { color: '#9e9e9e' }
        ]
      },
      {
        featureType: 'road',
        elementType: 'geometry',
        stylers: [
          { color: '#ffffff' }
        ]
      },
      {
        featureType: 'road.arterial',
        elementType: 'labels.text.fill',
        stylers: [
          { color: '#757575' }
        ]
      },
      {
        featureType: 'road.highway',
        elementType: 'geometry',
        stylers: [
          { color: '#dadada' }
        ]
      },
      {
        featureType: 'road.highway',
        elementType: 'labels.text.fill',
        stylers: [
          { color: '#616161' }
        ]
      },
      {
        featureType: 'road.local',
        elementType: 'labels.text.fill',
        stylers: [
          { color: '#9e9e9e' }
        ]
      },
      {
        featureType: 'transit.line',
        elementType: 'geometry',
        stylers: [
          { color: '#e5e5e5' }
        ]
      },
      {
        featureType: 'transit.station',
        elementType: 'geometry',
        stylers: [
          { color: '#eeeeee' }
        ]
      },
      {
        featureType: 'water',
        elementType: 'geometry',
        stylers: [
          { color: '#c9c9c9' }
        ]
      },
      {
        featureType: 'water',
        elementType: 'labels.text.fill',
        stylers: [
          { color: '#9e9e9e' }
        ]
      }
    ],
      { name: 'Greyscale' });

    this.style2 = new google.maps.StyledMapType(
			[
  {
    featureType: 'landscape',
    elementType: 'geometry',
    stylers: [
      {
        color: '#dfffbf'
      }
    ]
  },
  {
    featureType: 'poi.attraction',
    elementType: 'geometry',
    stylers: [
      {
        color: '#ff5151'
      }
    ]
  },
  {
    featureType: 'poi.attraction',
    elementType: 'labels.text.fill',
    stylers: [
      {
        color: '#ffffff'
      }
    ]
  },
  {
    featureType: 'poi.attraction',
    elementType: 'labels.text.stroke',
    stylers: [
      {
        color: '#808080'
      }
    ]
  },
  {
    featureType: 'poi.business',
    elementType: 'geometry.fill',
    stylers: [
      {
        color: '#c0ff82'
      }
    ]
  },
  {
    featureType: 'poi.medical',
    elementType: 'geometry',
    stylers: [
      {
        color: '#ff80ff'
      }
    ]
  },
  {
    featureType: 'poi.medical',
    elementType: 'geometry.fill',
  stylers: [
      {
        color: '#ff3cff'
      }
    ]
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [
      {
        color: '#00ff00'
      }
    ]
  },
  {
    featureType: 'poi.place_of_worship',
    elementType: 'geometry',
    stylers: [
      {
        color: '#ffffff'
      }
    ]
  },
  {
    featureType: 'poi.school',
    elementType: 'geometry.fill',
    stylers: [
      {
        color: '#ff8000'
      }
    ]
  },
  {
    featureType: 'poi.sports_complex',
    elementType: 'geometry',
    stylers: [
      {
        color: '#1300ff'
      }
    ]
  },
  {
    featureType: 'road.arterial',
    elementType: 'geometry',
    stylers: [
      {
        color: '#ffff00'
      }
    ]
  },
  {
    featureType: 'road.arterial',
    elementType: 'geometry.fill',
    stylers: [
      {
        color: '#fdc502'
      }
    ]
  },
  {
    featureType: 'road.arterial',
    elementType: 'geometry.stroke',
    stylers: [
      {
        color: '#ff8000'
      }
    ]
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.fill',
    stylers: [
      {
        color: '#ffff80'
      }
    ]
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [
      {
        color: '#ff8000'
      }
    ]
  },
  {
    featureType: 'road.local',
    elementType: 'geometry.fill',
    stylers: [
      {
        color: '#ffff00'
      }
    ]
  },
  {
    featureType: 'road.local',
    elementType: 'geometry.stroke',
  stylers: [
      {
        color: '#0080ff'
      }
    ]
  },
  {
    featureType: 'transit.line',
    elementType: 'geometry.fill',
    stylers: [
      {
        color: '#ffffff'
      }
    ]
  },
  {
    featureType: 'transit.line',
    elementType: 'geometry.stroke',
    stylers: [
      {
        color: '#ffffff'
      }
    ]
  },
  {
    featureType: 'transit.station.airport',
    elementType: 'geometry.fill',
    stylers: [
      {
        color: '#8080ff'
      }
    ]
  },
  {
    featureType: 'transit.station.airport',
    elementType: 'geometry.stroke',
    stylers: [
      {
        color: '#ffff00'
      }
    ]
  },
  {
    featureType: 'transit.station.airport',
    elementType: 'labels.text',
    stylers: [
      {
        color: '#ffffff'
      }
    ]
  },
  {
    featureType: 'transit.station.airport',
    elementType: 'labels.text.stroke',
    stylers: [
      {
        color: '#400040'
      }
    ]
  },
  {
    featureType: 'transit.station.rail',
    elementType: 'geometry.fill',
    stylers: [
      {
        color: '#ff0000'
      }
    ]
  },
  {
    featureType: 'transit.station.rail',
    elementType: 'geometry.stroke',
    stylers: [
      {
        color: '#ff0000'
      }
    ]
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [
      {
        color: '#00ffff'
      }
    ]
  }
]
      { name: 'Neon' });

    this.style3 = new google.maps.StyledMapType([
      {
        elementType: 'geometry',
        stylers: [
          { color: '#fffee0' }
        ]
      },
      {
        elementType: 'labels.text.fill',
        stylers: [
          { color: '#ffeac9' }
        ]
      },
      {
        elementType: 'labels.text.stroke',
        stylers: [
          { color: '#ffffff' }
        ]
      },
      {
        featureType: 'administrative.locality',
        elementType: 'labels.text.fill',
        stylers: [
          { color: '#ffcfaa' }
        ]
      },
      {
        featureType: 'poi',
        elementType: 'labels.text.fill',
        stylers: [
          { color: '#ffcfaa' }
        ]
      },
      {
        featureType: 'poi.park',
        elementType: 'geometry',
        stylers: [
          { color: '#e7f9d6' }
        ]
      },
      {
        featureType: 'poi.park',
        elementType: 'labels.text.fill',
        stylers: [
          { color: '#e7f9d6' }
        ]
      },
      {
        featureType: 'road',
        elementType: 'geometry',
        stylers: [
          { color: '#ffeaea' }
        ]
      },
      {
        featureType: 'road',
        elementType: 'geometry.stroke',
        stylers: [
          { color: '#ffdbdb' }
        ]
      },
      {
        featureType: 'road',
        elementType: 'labels.text.fill',
        stylers: [
          { color: '#ffeaea' }
        ]
      },
      {
        featureType: 'road.highway',
        elementType: 'geometry',
        stylers: [
          { color: '#f7f2ff' }
        ]
      },
      {
        featureType: 'road.highway',
        elementType: 'geometry.stroke',
        stylers: [
          { color: '#eee2ff' }
        ]
      },
      {
        featureType: 'road.highway',
        elementType: 'labels.text.fill',
        stylers: [
          { color: '#f7f2ff' }
        ]
      },
      {
        featureType: 'transit',
        elementType: 'geometry',
        stylers: [
          { color: '#ffdbbf' }
        ]
      },
      {
        featureType: 'transit.station',
        elementType: 'labels.text.fill',
        stylers: [
          { color: '#ffdbbf' }
        ]
      },
      {
        featureType: 'water',
        elementType: 'geometry',
        stylers: [
          { color: '#e2edff' }
        ]
      },
      {
        featureType: 'water',
        elementType: 'labels.text.fill',
        stylers: [
          { color: '#e2edff' }
        ]
      }],
      { name: 'Pastel' });

    this.style4 = new google.maps.StyledMapType([
      {
        elementType: 'geometry',
        stylers: [
          { color: '#1d2c4d' }
        ]
      },
      {
        elementType: 'labels.text.fill',
        stylers: [
          { color: '#8ec3b9' }
        ]
      },
      {
        elementType: 'labels.text.stroke',
        stylers: [
          { color: '#1a3646' }
        ]
      },
      {
        featureType: 'administrative.country',
        elementType: 'geometry.stroke',
        stylers: [
          { color: '#4b6878' }
        ]
      },
      {
        featureType: 'administrative.land_parcel',
        elementType: 'labels.text.fill',
        stylers: [
          { color: '#64779e' }
        ]
      },
      {
        featureType: 'administrative.province',
        elementType: 'geometry.stroke',
        stylers: [
          { color: '#4b6878' }
        ]
      },
      {
        featureType: 'landscape.man_made',
        elementType: 'geometry.stroke',
        stylers: [
          { color: '#334e87' }
        ]
      },
      {
        featureType: 'landscape.natural',
        elementType: 'geometry',
        stylers: [
          { color: '#023e58' }
        ]
      },
      {
        featureType: 'poi',
        elementType: 'geometry',
        stylers: [
          { color: '#283d6a' }
        ]
      },
      {
        featureType: 'poi',
        elementType: 'labels.text.fill',
        stylers: [
          { color: '#6f9ba5' }
        ]
      },
      {
        featureType: 'poi',
        elementType: 'labels.text.stroke',
        stylers: [
          { color: '#1d2c4d' }
        ]
      },
      {
        featureType: 'poi.park',
        elementType: 'geometry.fill',
        stylers: [
          { color: '#023e58' }
        ]
      },
      {
        featureType: 'poi.park',
        elementType: 'labels.text.fill',
        stylers: [
          { color: '#3C7680' }
        ]
      },
      {
        featureType: 'road',
        elementType: 'geometry',
        stylers: [
          { color: '#304a7d' }
        ]
      },
      {
        featureType: 'road',
        elementType: 'labels.text.fill',
        stylers: [
          { color: '#98a5be' }
        ]
      },
      {
        featureType: 'road',
        elementType: 'labels.text.stroke',
        stylers: [
          { color: '#1d2c4d' }
        ]
      },
      {
        featureType: 'road.highway',
        elementType: 'geometry',
        stylers: [
          { color: '#2c6675' }
        ]
      },
      {
        featureType: 'road.highway',
        elementType: 'geometry.stroke',
        stylers: [
          { color: '#255763' }
        ]
      },
      {
        featureType: 'road.highway',
        elementType: 'labels.text.fill',
        stylers: [
          { color: '#b0d5ce' }
        ]
      },
      {
        featureType: 'road.highway',
        elementType: 'labels.text.stroke',
        stylers: [
          { color: '#023e58' }
        ]
      },
      {
        featureType: 'transit',
        elementType: 'labels.text.fill',
        stylers: [
          { color: '#98a5be' }
        ]
      },
      {
        featureType: 'transit',
        elementType: 'labels.text.stroke',
        stylers: [
          { color: '#1d2c4d' }
        ]
      },
      {
        featureType: 'transit.line',
        elementType: 'geometry.fill',
        stylers: [
          { color: '#283d6a' }
        ]
      },
      {
        featureType: 'transit.station',
        elementType: 'geometry',
        stylers: [
          { color: '#3a4762' }
        ]
      },
      {
        featureType: 'water',
        elementType: 'geometry',
        stylers: [
          { color: '#0e1626' }
        ]
      },
      {
        featureType: 'water',
        elementType: 'labels.text.fill',
        stylers: [
          { color: '#4e6d70' }
        ]
      }],
      { name: 'Dark' });
  }
}
