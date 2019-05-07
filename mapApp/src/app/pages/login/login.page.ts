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
    this.firebaseService.getComplimentsList().valueChanges().subscribe(res => {
      for (let item of res) {
        this.compliments = item;
      }
    });
  }

  updateCompliments(compliments: Compliments){
    console.log(compliments);
    
    this.firebaseService.addCompliment(compliments);
  }

  loadMapPage()
  {
    this.router.navigate(['../home']);
  }

}
