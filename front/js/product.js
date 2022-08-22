//Récupération de l'id du produit
const params = new URLSearchParams(document.location.search);
const id = params.get("_id");
console.log(id); 

// Récupération des produits de l'api
fetch("http://localhost:3000/api/products")
  .then((res) => res.json())
  .then((objetProduits) => {
    lesProduits(objetProduits);
  });

let articleClient = {};
articleClient._id = id;

//Affichage du produit de l'api
function lesProduits(produit) {
  let imageAlt = document.querySelector("article div.item__img");
  let titre = document.querySelector("#title");
  let prix = document.querySelector("#price");
  let description = document.querySelector("#description");
  let couleurOption = document.querySelector("#colors");

  for (let choix of produit) {
    if (id === choix._id) {
      //ajout des éléments
      imageAlt.innerHTML = `<img src="${choix.imageUrl}" alt="${choix.altTxt}">`;
      titre.textContent = `${choix.name}`;
      prix.textContent = `${choix.price}`;
      description.textContent = `${choix.description}`;
      //changer les couleurs pour chaque produit
      for (let couleur of choix.colors) {
        couleurOption.innerHTML += `<option value="${couleur}">${couleur}</option>`;
      }
    }
  }
  console.log("affichage effectué");
}

//Activation des choix de couleur
let choixCouleur = document.querySelector("#colors");
choixCouleur.addEventListener("input", (ec) => {
  let couleurProduit;
  couleurProduit = ec.target.value;
  articleClient.couleur = couleurProduit;
  //ça reset la couleur et le texte du bouton si il y a une action sur les inputs dans le cas d'une autre commande du même produit
  document.querySelector("#addToCart").style.color = "white";
  document.querySelector("#addToCart").textContent = "Ajouter au panier";
  console.log(couleurProduit);
});

//activation des quantités
let choixQuantité = document.querySelector('input[id="quantity"]');
let quantitéProduit;
choixQuantité.addEventListener("input", (eq) => {
  quantitéProduit = eq.target.value;
  articleClient.quantité = quantitéProduit;
  //ça reset la couleur et le texte du bouton si il y a une action sur les inputs dans le cas d'une autre commande du même produit
  document.querySelector("#addToCart").style.color = "white";
  document.querySelector("#addToCart").textContent = "Ajouter au panier";
  console.log(quantitéProduit);
});

//activation du bouton ajouter au panier
let choixProduit = document.querySelector("#addToCart");
choixProduit.addEventListener("click", () => {
  //conditions de validation du bouton ajouter au panier
  if (
    articleClient.quantité < 1 ||
    articleClient.quantité > 100 ||
    articleClient.quantité === undefined ||
    articleClient.couleur === "" ||
    articleClient.couleur === undefined
  ) {
    alert("Veuillez renseigner une couleur, et/ou une quantité entre 1 et 100");
  } else {
    Panier();
    console.log("clic effectué");
    document.querySelector("#addToCart").style.color = "rgb(0, 205, 0)";
    document.querySelector("#addToCart").textContent = "Produit ajouté !";
  }
});

//destiné à initialiser le panier
let choixProduitClient = [];
//récupère du local storage appelé panierStocké et qu'on convertira en JSon
let produitsEnregistrés = [];
//choix d'article/couleur non effectué donc non présent dans le panierStocké
let produitsTemporaires = [];
//concaténation des produitsEnregistrés et de produitsTemporaires
let produitsAPousser = [];

//fonction ajoutPremierProduit qui ajoute le premier article
function ajoutPremierProduit() {
  console.log(produitsEnregistrés);
  //si produitsEnregistrés est null c'est qu'il n'a pas été créé
  if (produitsEnregistrés === null) {
    //pousse le produit choisit dans choixProduitClient
    choixProduitClient.push(articleClient);
    console.log(articleClient);
    //envoit choixProduitClient dans le local storage 'panierStocké' de manière JSON stringifié
    return (localStorage.panierStocké = JSON.stringify(choixProduitClient));
  }
}

//fonction ajoutAutreProduit qui ajoute l'article dans le tableau non vierge et fait un tri
function ajoutAutreProduit() {
  //initialise produitsAPousser pour recevoir les nouvelles données
  produitsAPousser = [];
  produitsTemporaires.push(articleClient);
  //combine produitsTemporaires dans produitsEnregistrés, ça s'appele produitsAPousser
  produitsAPousser = [...produitsEnregistrés, ...produitsTemporaires];
  //fonction pour trier et classer les id puis les couleurs
  produitsAPousser.sort(function triage(a, b) {
    if (a._id < b._id) return -1;
    if (a._id > b._id) return 1;
    if (a._id = b._id){
      if (a.couleur < b.couleur) return -1;
      if (a.couleur > b.couleur) return 1;
    }
    return 0;
  });
  //initialise produitsTemporaires maintenant qu'il a été utilisé
  produitsTemporaires = [];
  //envoit produitsAPousser dans le local storage sous le nom de 'panierStocké' de manière JSON stringifié
  return (localStorage.panierStocké = JSON.stringify(produitsAPousser));
}

//fonction Panier qui ajuste la quantité si le produit est déja dans le tableau, sinon le rajoute si un tableau existe déjà ou créait le tableau avec un premier article choisi
function Panier() {
  //variable qui sera ce qu'on récupère du local storage appelé panierStocké et qu'on a convertit en JSon
  produitsEnregistrés = JSON.parse(localStorage.getItem("panierStocké"));
  if (produitsEnregistrés) {
    for (let choix of produitsEnregistrés) {
      //comparateur d'égalité des articles actuellement choisis et ceux déja choisis
      if (choix._id === id && choix.couleur === articleClient.couleur) {
        alert("RAPPEL: Vous aviez déja choisit cet article.");
        //modifie la quantité d'un produit existant dans le panier du localstorage
        let additionQuantité = parseInt(choix.quantité) + parseInt(quantitéProduit);
        //convertit en JSON le résultat dans la zone voulue
        choix.quantité = JSON.stringify(additionQuantité);
        //renvoit un nouveau panierStocké dans le localStorage
        return (localStorage.panierStocké = JSON.stringify(produitsEnregistrés));
      }
    }
    //appel fonction ajoutAutreProduit si la boucle au dessus ne retourne rien donc n'a pas d'égalité
    return ajoutAutreProduit();
  }
  //appel fonction ajoutPremierProduit si produitsEnregistrés n'existe pas
  return ajoutPremierProduit();
}