
// Canvas et Contexte
const canvas = document.createElement('canvas');
const context = canvas.getContext('2d');
const socket = io('/pong');
let isArbitre = false;
let indiceRaquette = 0;

let largeur = 500;
let hauteur = 700;

// Raquettes
let hauteurRaquette = 10;
let largeurRaquette = 100;
let decalageRaquette = 25;
let positionRaquette = [225, 225];
let trajectoireX = [0, 0];
let joueurBouge = false;

// Balle
let positionBalleX = 250;
let positionBalleY = 200;
let rayonBalle = 5;
let directionBalle = 1;

// Vitesse
let vitesseY = 2;
let vitesseX = 0;

// Scores pour les deux joueurs
let scores = [0, 0];

// Création du Canvas
function creerCanvas() {
  canvas.id = 'canvas';
  canvas.width = largeur;
  canvas.height = hauteur;
  document.body.appendChild(canvas);
  renduCanvas();
}

// Attente de l'adversaire
function renduIntro() {
  // Fond du Canvas
  context.fillStyle = 'black';
  context.fillRect(0, 0, largeur, hauteur);

  // Texte d'introduction
  context.fillStyle = 'white';
  context.font = "25px Courier New";
  context.fillText("En attente d'un adversaire", 20, (canvas.height / 2) - 30);
}

// Rendu de tous les éléments sur le Canvas
function renduCanvas() {
  // Fond du Canvas
  context.fillStyle = 'black';
  context.fillRect(0, 0, largeur, hauteur);

  // Couleur de la Raquette
  context.fillStyle = 'white';

  // Raquette du bas
  context.fillRect(positionRaquette[0], hauteur - 20, largeurRaquette, hauteurRaquette);

  // Raquette du haut
  context.fillRect(positionRaquette[1], 10, largeurRaquette, hauteurRaquette);

  // Ligne centrale en pointillés
  context.beginPath();
  context.setLineDash([4]);
  context.moveTo(0, 350);
  context.lineTo(500, 350);
  context.strokeStyle = 'grey';
  context.stroke();

  // Balle
  context.beginPath();
  context.arc(positionBalleX, positionBalleY, rayonBalle, 2 * Math.PI, false);
  context.fillStyle = 'white';
  context.fill();

  // Scores
  context.font = "32px Courier New";
  context.fillText(scores[0], 20, (canvas.height / 2) + 50);
  context.fillText(scores[1], 20, (canvas.height / 2) - 30);
}

// Réinitialisation de la Balle au centre
function reinitialiserBalle() {
  positionBalleX = largeur / 2;
  positionBalleY = hauteur / 2;
  vitesseY = 2;

  // Émettre un événement socket pour réinitialiser la balle
  socket.emit('ballMove', {
    positionBalleX,
    positionBalleY,
    scores,
  });
}

// Ajustement du mouvement de la Balle
function deplacerBalle() {
  // Vitesse Verticale
  positionBalleY += vitesseY * directionBalle;
  // Vitesse Horizontale
  if (joueurBouge) {
    positionBalleX += vitesseX;
  }
  // Déplacement de la balle en temps réel via socket
  socket.emit('ballMove', {
    positionBalleX,
    positionBalleY,
    scores,
  });
}

// Détermination de ce sur quoi la Balle rebondit, marquer des points, réinitialiser la Balle
function limitesBalle() {
  // Rebondir sur le mur gauche
  if (positionBalleX < 0 && vitesseX < 0) {
    vitesseX = -vitesseX;
  }
  // Rebondir sur le mur droit
  if (positionBalleX > largeur && vitesseX > 0) {
    vitesseX = -vitesseX;
  }
  // Rebondir sur la raquette du joueur (en bas)
  if (positionBalleY > hauteur - decalageRaquette) {
    if (positionBalleX >= positionRaquette[0] && positionBalleX <= positionRaquette[0] + largeurRaquette) {
      // Ajouter de la vitesse lors de l'impact
      if (joueurBouge) {
        vitesseY += 0.5;
        // Vitesse maximale
        if (vitesseY > 4) {
          vitesseY = 4;
        }
      }
      directionBalle = -directionBalle;
      trajectoireX[0] = positionBalleX - (positionRaquette[0] + decalageRaquette);
      vitesseX = trajectoireX[0] * 0.2;
    } else {
      // Réinitialiser la Balle, ajouter au score de l'ordinateur
      reinitialiserBalle();
      scores[1]++;
      socket.emit
    }
  }
  // Rebondir sur la raquette de l'ordinateur (en haut)
  if (positionBalleY < decalageRaquette) {
    if (positionBalleX >= positionRaquette[1] && positionBalleX <= positionRaquette[1] + largeurRaquette) {
      // Ajouter de la vitesse lors de l'impact
      if (joueurBouge) {
        vitesseY += 0.5;
        // Vitesse maximale
        if (vitesseY > 4) {
          vitesseY = 4;
        }
      }
      directionBalle = -directionBalle;
      trajectoireX[1] = positionBalleX - (positionRaquette[1] + decalageRaquette);
      vitesseX = trajectoireX[1] * 0.2;
    } else {
      reinitialiserBalle();
      scores[0]++;
    }
  }
}

// Appelé à chaque image
function animer() {
  if (isArbitre) {
    deplacerBalle();
    limitesBalle();
  }
  renduCanvas();
  window.requestAnimationFrame(animer);
}

// Chargement du jeu, réinitialisation de tout
function chargerJeu() {
  creerCanvas();
  renduIntro();
  socket.emit('ready');
}

function demarrerJeu() {
  indiceRaquette = isArbitre ? 0 : 1;
  window.requestAnimationFrame(animer);
  canvas.addEventListener('mousemove', (e) => {
    joueurBouge = true;
    positionRaquette[indiceRaquette] = e.offsetX;
    if (positionRaquette[indiceRaquette] < 0) {
      positionRaquette[indiceRaquette] = 0;
    }
    if (positionRaquette[indiceRaquette] > (largeur - largeurRaquette)) {
      positionRaquette[indiceRaquette] = largeur - largeurRaquette;
    }
    socket.emit('paddleMove', {
      xPosition: positionRaquette[indiceRaquette]
    });
    // Cacher le curseur
    canvas.style.cursor = 'none';
  });
}

// Au chargement
chargerJeu();

socket.on('connect', () => {
  console.log('Connecté en tant que...', socket.id);
});

socket.on('startGame', (idArbitre) => {
  console.log('L\'arbitre est', idArbitre);

  isArbitre = socket.id === idArbitre;
  demarrerJeu();
});

socket.on('paddleMove', (donneesRaquette) => {
  // Inverser 1 en 0 et 0 en 1 pour les raquetes pour voir quel utilisateur doit bouger
  const indiceRaquetteAdversaire = 1 - indiceRaquette;
  positionRaquette[indiceRaquetteAdversaire] = donneesRaquette.xPosition;
});

socket.on('ballMove', (donneesBalle) => {
  ({ positionBalleX, positionBalleY, scores } = donneesBalle);
});
