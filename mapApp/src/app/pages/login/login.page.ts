import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Compliments } from '../../models/compliments.model';
import { FirebaseService } from '../../services/firebase.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

	compliments: Compliments = {
      best: '',
      today: '',
      week: '',
      received: '',
    };

  constructor(private router: Router, public firebaseService: FirebaseService) {
	  
  }

  ngOnInit()
  {
    this.compliments = this.firebaseService.complimentsData;
  }

  updateCompliments(compliments: Compliments){
    this.firebaseService.updateCompliments(compliments);
  }

  loadMapPage()
  {
    this.router.navigate(['../home']);
  }

}
