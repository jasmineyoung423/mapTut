import { Component, OnInit } from '@angular/core';
import { FirebaseService } from '../../services/firebase.service';

@Component({
  selector: 'app-icons',
  templateUrl: './icons.page.html',
  styleUrls: ['./icons.page.scss'],
})
export class IconsPage implements OnInit {
public icon: string;

  constructor(public firebaseService: FirebaseService) { }

  ngOnInit()
  {
  }

  iconSet(chosen:string)
  {
    this.firebaseService.setIcon(chosen);
    console.log(this.firebaseService.getIcon());  /*the one true jasmine, is the best person. who is also a person that might be the good person i also have to say a true demon learns to tuck there tail*/
  }

}
