// baseUrl: "http://localhost/SPE-WP/END/WP-Support-oCooking-PascalLimSirius/",

var app = {

  elements : [],
  baseUrl: "http://localhost:8888/OCLOCK/Sirius/Spe-WordPress/WP-Support-oCooking-LorisOclock/",
  jsonUrl: "wp-json/wp/v2/",
  jwtUrl: "wp-json/jwt-auth/v1/",
  current_recipe_id: null,
  //token: null,

  init: function() {
    //console.log( app.baseUrl + app.jsonUrl );

    // Je cible mes boutons
    app.elements.$btn_list_recipe = document.getElementById('btn_list_recipe');
    app.elements.$btn_add_recipe = document.getElementById('btn_add_recipe');
    app.elements.$btn_del_recipe = document.getElementById('btn_del_recipe');

    // Je cible ma liste de recettes
    app.elements.$list_items = document.getElementById('list_items');

    // Je cible ma div qui contient une recette (detail)
    app.elements.$apicontent = document.getElementsByClassName('apicontent__text')[0];
    //console.log(app.elements.$apicontent);

    // J'écoute des évènements

    // chargement des recettes sans se connecter
    //app.elements.$btn_list_recipe.addEventListener('click', app.handleLoadRecipes);
    
    // chargement des recettes (brouillons) avec connexion
    app.elements.$btn_list_recipe.addEventListener('click', app.getDraftRecipes);

    // Ajout d'une recette
    app.elements.$btn_add_recipe.addEventListener('click', app.handleCreateRecipe);
    
    // Suppression d'une recette
    app.elements.$btn_del_recipe.addEventListener('click', app.handleDeleteRecipe);

    app.elements.$list_items.addEventListener('click', function(event) {
      //console.log(event.target.matches('.fa-eye'));
      // si je clique sur l'icone "oeil"
      if (event.target && event.target.matches('.fa-eye')){
        app.handleLoadOneRecipe(event);
      }
      // sinon si je clique sur l'icone "info"
      else if (event.target && event.target.matches('.fa-info-circle')){
        app.handleDisplayRecipeInfo(event);
      }
    });

    // Désormais, au lancement de l'appli, on vérifie si l'utilisateur a un token en session
    app.checkToken();

  },
  handleLoadRecipes: function(event) {

    // Coupe tout autre évènement
    event.preventDefault();
    //console.log('tu as cliqué sur le bouton pour afficher les recettes');

    // Réalisation de ma requête AJAX via Axios
    // https://github.com/axios/axios
    // axios

    //   // construction de la requête
    //   .get(app.baseUrl + app.jsonUrl + "recipe")

      // Je souhaite désormais afficher également les recettes en brouillon (Draft)
      axios({
        method: 'get',
        url: app.baseUrl + app.jsonUrl + 'recipe',
        headers: {'Authorization': 'Bearer ' + sessionStorage.getItem('token')},
        params: {
          status: 'draft,publish',
          per_page: 100
        }
      })

      // en cas de succès
      .then(function(response) {
        // response = reponse de la requête
        //console.log(response);

        var recipe;

        // on vide le ol pour afficher une nouvelle liste
        app.elements.$list_items.innerHTML = '';

        // pour chaque recette dans response.data
        for (index in response.data) {

          recipe = response.data[index];
          
          // on affiche la recette
          //console.log(recipe);
          app.addRecipeItem(recipe);
        }
        
      })

      // en cas d'echec
      .catch(function(error) {
        console.log(error);
      })

      // dans tous les cas (succès ou erreur)
      .finally(function() {
        console.log("J'ai terminé !");
      });

  },
  addRecipeItem: function(recipe) {

    // je stock mon <template> correspondant à un item de liste (recette)
    var template = document.getElementById('list_item_tpl');

    //console.dir(template);

    // je créé un clone de cet item (vierge)
    var clone = document.importNode(template.content, true);

    // je l'alimente avec du contenu...
    clone.querySelector('.list_items_text').textContent = recipe.title.rendered;

    // ...mais aussi avec des data (via dataset)
    clone.querySelector('li').dataset.recipeId = recipe.id;
    clone.querySelector('li').dataset.recipeDate = recipe.modified;

    // je l'affiche au niveau de $list_items
    app.elements.$list_items.appendChild(clone);

  },
  handleLoadOneRecipe: function(event) {

    // J'empêche le comportement par défaut
    event.preventDefault();

    //console.log(event.target);
    //var $recipe = event.target

    //Je veux récupérer l'id de ma recette donc :

    // 1 - Je cible mon li (soit l'élement parent)
    var $recipe = event.target.closest('li');

    // 2 - Je vais récupérer mon id dans ce li
    //var recipe_id = $recipe.dataset.recipeId;
    app.current_recipe_id = $recipe.dataset.recipeId;

    //console.log(recipe_id);
    

    // axios

    //   // construction de la requête
    //   .get(app.baseUrl + app.jsonUrl + "recipe/" + recipe_id)

      axios({
        method: 'get',
        url: app.baseUrl + app.jsonUrl + 'recipe/' + app.current_recipe_id,
        headers: {'Authorization': 'Bearer' + sessionStorage.getItem('token')}
      })

      // en cas de succès
      .then(function(response) {

        //console.log(response);

        app.addRecipeDetail(response.data);
        
      })

      // en cas d'echec
      .catch(function(error) {
        console.log(error);
      })

      // dans tous les cas (succès ou erreur)
      .finally(function() {
        console.log("J'ai terminé !");
      });

  },
  addRecipeDetail: function(recipe) {

    //console.log(recipe);

    // TODO : Afficher le détail d'une recette
    // depuis la balise <template> #recipe_tpl
    // vers la <div> .apicontent__text

    // on cible la balise template (#recipe_tpl)
    var template = document.getElementById('recipe_tpl');

    // on cible la balise template pour les ingredients (.ingredient_tpl)
    var template_tag = document.querySelector('.ingredient_tpl');

    //console.log(template_tag);

    // on créé un clone du template
    var clone = document.importNode(template.content, true);

    // on alimente notre clone avec du contenu
    clone.querySelector('.content_title').textContent = recipe.title.rendered;
    clone.querySelector('.content_text').innerHTML = recipe.content.rendered;
    clone.querySelector('.content_author').textContent += ' ' + recipe.author.name;
    clone.querySelector('.recipe_time').innerHTML += ' ' + recipe.meta.preparation + ' min.';
    clone.querySelector('.recipe_baking').innerHTML += ' ' + recipe.meta.temps_de_cuisson + ' min.';
    clone.querySelector('.recipe_cost').innerHTML += ' ' + recipe.meta.prix + '€/pers.';
    clone.querySelector('img').src = recipe.thumbnail.url;
    
    // on alimente notre clone avec des ingrédients

    // pour chaque ingrédient
    for (var index in recipe.ingredients){

      var clone_tag = document.importNode(template_tag.content, true);

      clone_tag.querySelector('span').textContent = recipe.ingredient[index].name;

      clone.querySelector('.recipe_ingredient').appendChild(clone_tag);

    }
    // on vide la div pour afficher une nouvelle recette
    app.elements.$apicontent.innerHTML = '';

    // on remonte le scroll
    app.elements.$apicontent.scrollTop = 1;

    // on place notre clone dans la div (.apicontent__text)
    app.elements.$apicontent.appendChild(clone);
  },
  handleDisplayRecipeInfo: function(event){

    //console.log(event);

    event.preventDefault();

    var $recipe = event.target.closest('li');
    var date = new Date($recipe.dataset.recipeDate);

    alert('Recette mise à jour le ' + date.toLocaleString('fr-FR'));
  },
  handleCreateRecipe: function(event) {

    event.preventDefault();

    // Mon utilisateur saisi les infos sur la recette
    var recipe_title = prompt('Titre de la recette');
    var recipe_content = prompt('Détails de la recette');

    //On ajoute la recette dans WP via l'API
    axios({
      method: 'post',
      url: app.baseUrl + app.jsonUrl + 'recipe',
      headers: {'Authorization': 'Bearer' + sessionStorage.getItem('token')},
      data : {
        title: recipe_title,
        content: recipe_content
      }
    })
    //En cas de succès
    .then(function(response){
      console.log(response);
      alert('Votre recette a bien été ajouté');
      return true;
    })
    //En cas d'échec
    .catch(function(error){
      console.log(error);
      alert('Impossible de créer la recette !')
    })
    .finally(function(){
      // Je recharge ma liste de recettes
      return app.handleLoadRecipes();
    });
  },
  askForAuth: function() {
    var username = prompt('Veuillez saisir votre login');
    var password = prompt('Veuillez saisir votre mot de passe');
    // on vérifie les identifiants
    app.checkAuth(username,password);
  },
  checkAuth: function(username, password) {
    axios

    // pour récupérer mon token (POST)

    // construction de la requête
    .post(app.baseUrl + app.jwtUrl + 'token', {
      username: username,
      password: password
    })

    // en cas de succès
    .then(function(response) {
      //app.token = response.data.token;
      console.log(app.token);
      // https://developer.mozilla.org/fr/docs/Web/API/Window/sessionStorage
      // Je sock le token en sessionStorage
      sessionStorage.setItem('token', response.data.token);
    })

    // en cas d'echec
    .catch(function(error) {
      console.log('Impossible de se connecter');
      console.log(error);
    });
  },

  checkToken: function() {
    // Si pas de token en sessionStorage, on demande les identifiants
    if (!sessionStorage.getItem('token')) {
      return app.askForAuth();
    }

    // Je vérifie la validité de mon token
    axios({
      method: 'post',
      url: app.baseUrl + app.jwtUrl + 'token/validate',
      headers: {'Authorization': 'Bearer ' + sessionStorage.getItem('token')}
    })

    // Si le token n'est pas valide, je demande les identifiants à l'utilisateur
    .catch(function(error){
      return app.askForAuth();
    });

  },

  getDraftRecipes: function(){
    axios({
      method: 'get',
      url: app.baseUrl + app.jsonUrl + 'recipe',
      headers: {'Authorization': 'Bearer ' + sessionStorage.getItem('token')},
      params: {
        status: 'draft'
      }
    })

    // en cas de succès
    .then(function(response) {
      // response = reponse de la requête
      //console.log(response);

      var recipe;

      // on vide le ol pour afficher une nouvelle liste
      app.elements.$list_items.innerHTML = '';

      // pour chaque recette dans response.data
      for (index in response.data) {

        recipe = response.data[index];
        
        // on affiche la recette
        //console.log(recipe);
        app.addRecipeItem(recipe);
      }
      
    })

    // en cas d'echec
    .catch(function(error) {
      console.log(error);
    })

    // dans tous les cas (succès ou erreur)
    .finally(function() {
      console.log("J'ai terminé !");
    });
  },
  handleDeleteRecipe: function(event) {
    event.preventDefault();

    // Je souhaite supprimer un article via l'API => Axios

    axios({
      method: 'delete',
      url: app.baseUrl + app.jsonUrl + 'recipe/' + app.current_recipe_id,
      headers: {'Authorization': 'Bearer' + sessionStorage.getItem('token')}
    })

    // En cas de succès
    .then(function(response) {
      alert(
        "La recette " +
          response.data.title.rendered +
          " a bien été supprimée. Celle ci est dispo dans la corbeille."
      );
    })

    .catch(function(error){
      alert('Impossible de supprimer la recette !!')
    })
    .finally(function(){
      // Je recharge ma liste de recettes
      return app.handleLoadRecipes(event);
    });
  }
};

document.addEventListener("DOMContentLoaded", app.init);
