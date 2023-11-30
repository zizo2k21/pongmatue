let nombreJoueursPrets = 0;

function listen(io) {
  const espacePong = io.of('/pong');
  espacePong.on('connection', (socket) => {
    let salle = 'salle' + Math.floor(nombreJoueursPrets / 2);

    console.log('Un utilisateur s\'est connecté', socket.id);

    socket.on('ready', () => {
      let salle = 'salle' + Math.floor(nombreJoueursPrets / 2);
      socket.join(salle);

      console.log('Joueur prêt', socket.id, salle);

      nombreJoueursPrets++;

      if (nombreJoueursPrets % 2 === 0) {
        espacePong.in(salle).emit('startGame', socket.id);
      }
    });

    socket.on('paddleMove', (donneesRaquette) => {
      socket.to(salle).emit('paddleMove', donneesRaquette);
    });

    socket.on('ballMove', (donneesBalle) => {
      socket.to(salle).emit('ballMove', donneesBalle);
    });

    socket.on('disconnect', (raison) => {
      console.log(`Le client ${socket.id} s'est déconnecté ${raison}`);
      socket.leave(salle);
    });
  });
}

module.exports = {
  listen,
};
