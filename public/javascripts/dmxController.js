
// Fonction pour créer les données DMX avec des paramètres spécifiés
function creerDonneesDMX(r, g, b, univers) {
    const enTete = Buffer.from("Art-Net\0");
    const codeOperation = Buffer.from([0x00, 0x50]); // OpOutput / OpDmx
    const versionProtocole = Buffer.from([0x00, 0x0e]);
    const sequence = Buffer.from([0x00]); // ou incrémenter pour chaque paquet
    const physique = Buffer.from([0x00]);
    const universBuffer = Buffer.from([0x00, univers]); // Sous-réseau et univers
    const longueur = Buffer.from([0x00, 0x03]); // Longueur des données DMX
  
    return Buffer.concat([
      enTete,
      codeOperation,
      versionProtocole,
      sequence,
      physique,
      universBuffer,
      longueur,
      Buffer.from([r, g, b]),
    ]);

}
  
 //exporter la fonction
  module.exports = creerDonneesDMX;