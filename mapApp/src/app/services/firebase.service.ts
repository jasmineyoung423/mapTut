import { Injectable } from '@angular/core';
import * as firebase from 'firebase/app';
import { AngularFireDatabase } from 'angularfire2/database';
import { AngularFireStorage } from 'angularfire2/storage';
import { Location } from '../models/location.model';
import { Compliments } from '../models/compliments.model';
import 'firebase/storage';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  private locationListRef = this.db.list<Location>('locationData');
  private recentListRef = this.db.list<Location>('recentData');
  public currentLocation: Location;
  public chosenIcon: string = "http://maps.google.com/mapfiles/kml/paddle/red-circle.png";
  public complimentsDataRef = this.db.list<Compliments>('complimentsData');

  constructor(private db: AngularFireDatabase, private storage: AngularFireStorage) { }

  setCurrentLocation(location: Location){
    this.currentLocation = location;
  }

  getCurrentLocation(){
    return this.currentLocation;
  }

  getLocationsList(){
	return this.locationListRef;
  }

  addLocation(location: Location){
    return this.locationListRef.push(location);
  }

  editLocation(location: Location){
    return this.locationListRef.update(location.key, location);
  }

  deleteLocation(location: Location){
    return this.locationListRef.remove(location.key);
  }

  getCompliments(compliments: Compliments){
	  return this.complimentsDataRef;
  }

  updateCompliments(compliments: Compliments){
	  return this.complimentsDataRef.update(compliments.key, compliments);
  }
}
