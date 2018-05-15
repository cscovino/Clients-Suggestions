var app = {
  	model:{
      completadas: {},
      pendientes: {}
    },

    firebaseConfig: {
		apiKey: "AIzaSyD0eHPjMUA5c9E0q84w8U3y768819d_pok",
		authDomain: "sugerencias-clientes.firebaseapp.com",
		databaseURL: "https://sugerencias-clientes.firebaseio.com",
		projectId: "sugerencias-clientes",
		storageBucket: "sugerencias-clientes.appspot.com",
		messagingSenderId: "799767829646"
    },

    setPends: function(snap){
      app.model.pendientes = snap;
      app.refreshChart(Object.keys(app.model.pendientes).length,Object.keys(app.model.completadas).length);
      app.refreshPends();
    },

  	setComps: function(snap){
  		app.model.completadas = snap;
  		app.refreshChart(Object.keys(app.model.pendientes).length,Object.keys(app.model.completadas).length);
  		app.refreshComps();
  	},

  	getTodayDate: function(){
  		var today = new Date();
		var dd = today.getDate();
		var mm = today.getMonth()+1; //January is 0!
		var yyyy = today.getFullYear();
		if(dd<10) {
		    dd = '0'+dd
		} 
		if(mm<10) {
		    mm = '0'+mm
		} 
		return today = mm + '/' + dd + '/' + yyyy;
  	},

  	sendSuggestion: function(){
  		document.getElementById('detalles').style.display = 'none';
  		var sugg = document.getElementById('suggestion').value;
  		var utc = app.getTodayDate();
  		firebase.database().ref('pendientes').push({suggestion:sugg,percent:0,date:utc});
      app.closeSugg();
  	},

  	refreshComps: function(){
  		var suggs = $('#comps');
      var aux = 0;
		  suggs.html('');
		  var codigo = '<ul class="fa-ul">';
  		for(var key in app.model.completadas){
        if (app.model.completadas[key] != "") {
          codigo += '<li><i class="fa-li fa fa-check-square-o"></i>'+app.model.completadas[key].suggestion+'</li>';
          aux = 1;
        }
  		}
  		codigo += '</ul>';
      if (aux === 1) {
        suggs.append(codigo);
      }
  		app.closeEdit();
  	},

  	refreshPends: function(){
  		var suggs = $('#pends');
		  suggs.html('');
		  var codigo = '<ul>';
		  var aux = 0;
  		for(var key in app.model.pendientes){
  			if (app.model.pendientes[key] != "") {
  				codigo += '<li>'+app.model.pendientes[key].suggestion+'</li>';
	  			codigo += '<div class="progress" style="width:60%;margin-bottom:5px;"><div class="progress-bar progress-bar-danger" role="progressbar" aria-valuenow="70" aria-valuemin="0" aria-valuemax="100"';
	  			codigo += 'style="width:'+app.model.pendientes[key].percent+'%;background-color:#295063;" id=bar'+key+'></div></div>'; 
	  			codigo += "<input id='slider"+key+"' style='width:60%;display:none;' class='sliders' type='text' data-slider-min='0' data-slider-max='100' data-slider-step='1' data-slider-value='45'/>";
  				codigo += "<p>Recibida el: "+app.model.pendientes[key].date+"</p>";
  				aux = 1;
  			}
  		}
  		codigo += '</ul>';
  		if (aux === 1) {
  			suggs.append(codigo);
  		}
  		app.closeEdit();
  	},

  	editPend: function(){
      document.getElementById('añadir').style.pointerEvents = 'none';
  		document.getElementById('status').style.display = 'block';
  		document.getElementById('editar').style.pointerEvents = 'none';
  		var sliders = document.getElementsByClassName('sliders');
  		var progressBar = document.getElementsByClassName('progress-bar');
  		var progress = document.getElementsByClassName('progress');
  		var i = 0;
  		for(var key in app.model.pendientes){
  			if (app.model.pendientes[key] != "") {
	  			sliders[i].style.display = 'block';
	  			progress[i].style.display = 'none';
	  			$("#"+sliders[i].id+"").slider();
	  			$("#"+sliders[i].id+"").slider('setValue', document.getElementById('bar'+key).style.width.split('%')[0]);
  				i += 1;
  			}
  		}
  	},

  	closeEdit: function(){
      document.getElementById('añadir').style.pointerEvents = 'auto';
  		document.getElementById('status').style.display = 'none';
  		document.getElementById('editar').style.pointerEvents = 'auto';
  		var sliders = document.getElementsByClassName('sliders');
  		var progress = document.getElementsByClassName('progress');
  		for(var i=0; i<sliders.length; i++){
  			$("#"+sliders[i].id+"").slider('destroy');
  			sliders[i].style.display = 'none';
  			progress[i].style.display = 'block';
  		}
  	},

    newSugg: function(){
      document.getElementById('añadir').style.pointerEvents = 'none';
      document.getElementById('editar').style.pointerEvents = 'none';
      document.getElementById('detalles').style.display = 'block';
    },

    closeSugg: function(){
      document.getElementById('añadir').style.pointerEvents = 'auto';
      document.getElementById('editar').style.pointerEvents = 'auto';
      document.getElementById('detalles').style.display = 'none';
      document.getElementById('suggestion').value = '';
    },

  	saveStat: function(){
  		for(var key in app.model.pendientes){
        debugger;
  			if (app.model.pendientes[key] != ""){
  				var newPercent = document.getElementById('slider'+key).defaultValue;
	  			if (newPercent == 100) {
	  				if (app.model.pendientes[key] != "") {
	  					firebase.database().ref('completadas').push(app.model.pendientes[key]);
	  				}
	  				if (Object.keys(app.model.pendientes).length === 1) {
	  					firebase.database().ref('pendientes').push('');
	  				}
	  				delete app.model.pendientes[key];
	  			}
	  			else{
	  				app.model.pendientes[key].percent = newPercent;
		  			document.getElementById('bar'+key).style.width = newPercent+'%';
	  			}
  			}	
  		}
  		firebase.database().ref('pendientes').set(app.model.pendientes);
  		app.closeEdit();
  		app.refreshPends();
  		app.refreshComps();
  	},

  	refreshChart: function(pend,comp){
  		var ctx = $("#pieChart").get(0).getContext("2d");
  		pend -= 1;
      comp -= 1;
  		var data = {
  		    datasets: [{
  		        data: [pend, comp],
  		        backgroundColor: ['#295063','#00a5ba'] //00a5ba,08678e
  		    }],
  		    // These labels appear in the legend and in the tooltips when hovering different arcs
  		    labels: [
  		        'Pendientes',
  		        'Completadas'
  		    ]
  		};
  		var options = {
  			responsive: true,
        legend: {
          position: 'left',
          /*labels: {
            boxWidth: '15'
          }*/
        }
  		};

  		var myDoughnutChart = new Chart(ctx, {
  		    type: 'doughnut',
  		    data: data,
  		    options: options
  		});
  	},

    showOpts: function(){
      document.getElementById('options').style.display = 'block';
      document.getElementById('log').src = 'img/sign.png';
      $('#log').attr('data-target','#myModal11');
    },

    login: function(){
      var mail = document.getElementById('email').value;
      var pass = document.getElementById('password').value;
      firebase.auth().signInWithEmailAndPassword(mail,pass).catch(function(error){
        console.log(error.code);
        console.log(error.message);
      });
      app.clean();
    },

    clean: function(){
      document.getElementById('email').value = '';
      document.getElementById('password').value = '';
    },

    logout: function(){
      firebase.auth().signOut().then(function() {
        // Sign-out successful.
      document.getElementById('options').style.display = 'none';
      document.getElementById('log').src = 'img/settings.png';
      $('#log').attr('data-target','#myModal10');
      }).catch(function(error) {
        // An error happened.
      });
    },
};

firebase.initializeApp(app.firebaseConfig);
firebase.database().ref('pendientes').on('value', function(snap){
  if (snap.val() !== null) {
    app.setPends(snap.val());
  }
});
firebase.database().ref('completadas').on('value', function(snap){
	if (snap.val() !== null) {
		app.setComps(snap.val());
	}
});

firebase.auth().signOut().then(function() {
  // Sign-out successful.
}).catch(function(error) {
  // An error happened.
});

firebase.auth().onAuthStateChanged(function(user){
  if (user) {
    app.showOpts();
  }
  else{
    console.log('User sign out');
  }
});