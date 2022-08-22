const page = document.location.href;

//Récupération des produits de l'api
if (page.match("cart")) {
fetch("http://localhost:3000/api/products")
  .then((res) => res.json())
  .then((objetProduits) => {
      console.log(objetProduits);
      // appel de la fonction affichagePanier
      affichagePanier(objetProduits);
  })
  .catch((err) => {
      document.querySelector("#cartAndFormContainer").innerHTML = "<h1>erreur 404</h1>";
      console.log("erreur 404, sur ressource api: " + err);
  });
} else {
  console.log("sur page confirmation");
}

//Fonction détermine les conditions d'affichage des produits du panier
function affichagePanier(index) {
  //récupère le panier
  let panier = JSON.parse(localStorage.getItem("panierStocké"));
  //si il y a un panier avec une taille differante de 0
   if (panier && panier.length != 0) {
    for (let choix of panier) {
      console.log(choix);
      for (let g = 0, h = index.length; g < h; g++) {
        if (choix._id === index[g]._id) {
          choix.name = index[g].name;
          choix.prix = index[g].price;
          choix.image = index[g].imageUrl;
          choix.description = index[g].description;
          choix.alt = index[g].altTxt;
        }
      }
    }
    affiche(panier);
  } else {
    //si il n'y a pas de panier on créait un H1 informatif et quantité appropriées
    document.querySelector("#totalQuantity").innerHTML = "0";
    document.querySelector("#totalPrice").innerHTML = "0";
    document.querySelector("h1").innerHTML =
      "Vous n'avez pas d'article dans votre panier";
  }
  modifQuantité();
  suppression();
}

//Fonction d'affichage d'un panier (tableau)
function affiche(indexé) {
  //déclare et on pointe la zone d'affichage
  let zonePanier = document.querySelector("#cart__items");
  zonePanier.innerHTML += indexé.map((choix) => 
  `<article class="cart__item" data-id="${choix._id}" data-couleur="${choix.couleur}" data-quantité="${choix.quantité}" data-prix="${choix.prix}"> 
    <div class="cart__item__img">
      <img src="${choix.image}" alt="${choix.alt}">
    </div>
    <div class="cart__item__content">
      <div class="cart__item__content__titlePrice">
        <h2>${choix.name}</h2>
        <span>couleur : ${choix.couleur}</span>
        <p data-prix="${choix.prix}">${choix.prix} €</p>
      </div>
      <div class="cart__item__content__settings">
        <div class="cart__item__content__settings__quantity">
          <p>Qté : </p>
          <input type="number" class="itemQuantity" name="itemQuantity" min="1" max="100" value="${choix.quantité}">
        </div>
        <div class="cart__item__content__settings__delete">
          <p class="deleteItem" data-id="${choix._id}" data-couleur="${choix.couleur}">Supprimer</p>
        </div>
      </div>
    </div>
  </article>`
    ).join("");
  totalProduit();
}

//Fonction modifQuantité on modifie dynamiquement les quantités du panier
function modifQuantité() {
  const cart = document.querySelectorAll(".cart__item");
   cart.forEach((cart) => {console.log("item panier en dataset: " + " " + cart.dataset.id + " " + cart.dataset.couleur + " " + cart.dataset.quantité); });
  cart.forEach((cart) => {
    cart.addEventListener("change", (eq) => {
      let panier = JSON.parse(localStorage.getItem("panierStocké"));
      //boucle pour modifier la quantité du produit du panier grace à la nouvelle valeur
      for (article of panier)
        if (
          article._id === cart.dataset.id &&
          cart.dataset.couleur === article.couleur
        ) {
          article.quantité = eq.target.value;
          localStorage.panierStocké = JSON.stringify(panier);
          //met à jour le dataset quantité
          cart.dataset.quantité = eq.target.value;
          totalProduit();
        }
    });
  });
}

//Fonction supression on supprime un article dynamiquement du panier et donc de l'affichage
function suppression() {
  const cartdelete = document.querySelectorAll(".cart__item .deleteItem");
  //pour chaque élément cartdelete
  cartdelete.forEach((cartdelete) => {
    //voie s'il y a un clic dans l'article concerné
    cartdelete.addEventListener("click", () => {
      //appel de la ressource du local storage
      let panier = JSON.parse(localStorage.getItem("panierStocké"));
      for (let d = 0, c = panier.length; d < c; d++)
        if (
          panier[d]._id === cartdelete.dataset.id &&
          panier[d].couleur === cartdelete.dataset.couleur
        ) {
          //déclaration de variable utile pour la suppression
          const num = [d];
          //création d'un tableau miroir
          let nouveauPanier = JSON.parse(localStorage.getItem("panierStocké"));
          //suppression de 1 élément à l'indice num
          nouveauPanier.splice(num, 1);
          //affichage informatif
          if (nouveauPanier && nouveauPanier.length == 0) {
            //si il n'y a pas de panier on créait un H1 informatif et quantité appropriées
            document.querySelector("#totalQuantity").innerHTML = "0";
            document.querySelector("#totalPrice").innerHTML = "0";
            document.querySelector("h1").innerHTML =
              "Vous n'avez pas d'article dans votre panier";
          }
          //renvoit le nouveau panier converti dans le local storage et on joue la fonction
          localStorage.panierStocké = JSON.stringify(nouveauPanier);
          totalProduit();
          return location.reload();
        }
    });
  });
}

//Fonction ajout nombre total produit et coût total
function totalProduit() {
  //déclaration variable en tant que nombre
  let totalArticle = 0;
  //déclaration variable en tant que nombre
  let totalPrix = 0;
  //pointe l'élément
  const cart = document.querySelectorAll(".cart__item");
  //pour chaque élément cart
  cart.forEach((cart) => {
    //récupère les quantités des produits
    totalArticle += JSON.parse(cart.dataset.quantité);
    //créais un opérateur pour le total produit
    totalPrix += cart.dataset.quantité * cart.dataset.prix;
  });
  //pointe l'endroit d'affichage nombre d'article
  document.getElementById("totalQuantity").textContent = totalArticle;
  //pointe l'endroit d'affichage du prix total
  document.getElementById("totalPrice").textContent = totalPrix;
}