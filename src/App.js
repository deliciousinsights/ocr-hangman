// Le cœur de l’application
// ========================

import React, { Component } from 'react'

import './App.css'

// Liste des caractères de l’alphabet, utilisée pour afficher la
// liste des boutons notamment.
const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

// Liste de phrases possibles à deviner.  On reste en 100%
// majuscules sans signes diacritiques pour faciliter la
// correspondance de frappe.
const PHRASES = `
AVEC REACT LA VIE EST BELLE
DOMMAGE ELIANE
IL EST SYMPA CE PETIT EXO
J’ADORE REACT !
LA VIE L’UNIVERS ET LE RESTE
OPENCLASSROOMS EST MON AMI
`
  .trim()
  .split('\n')

// Le composant principal de l’application
// ---------------------------------------
class App extends Component {
  // Mise en place de l’état initial dans `this.state`, via un
  // initialiseur de champ d’instance (ES2018).
  state = this.generateInitialState()

  // Construit un état initial de partie.  Utilisé pour initialiser
  // `this.state` à la construction, mais aussi par la méthode métier
  // `reset()`.
  generateInitialState() {
    // 1. Choisir une phrase au hasard
    const phrase = PHRASES[Math.floor(Math.random() * PHRASES.length)]
    // 2. En début de partie, aucune lettre n’a été tentée.  On utilise
    // un `Set` (ES2015) plutôt qu’un tableau car `Set#has()` est en
    // général plus performant que `Array#includes(…)` (ES2016).
    const usedLetters = new Set()
    // 3. On calcule le texte de l’affichage principal.
    const display = computeDisplay(phrase, usedLetters)

    // Par ailleurs, en début de partie, on n’a par définition pas
    // encore gagné…
    return { phrase, display, usedLetters, won: false }
  }

  // Traitement d’un choix de lettre (activation d’un bouton
  // de lettre, par exemple).
  handleLetter(letter) {
    let { phrase, display, usedLetters } = this.state
    // Si la lettre a déjà été tentée, ce `add()` sera sans effet
    // (c’est le principe d’un `Set`).
    usedLetters.add(letter)
    // Recalcul de l’affichage principal
    display = computeDisplay(phrase, usedLetters)
    // S’il ne reste aucun caractère souligné (_underscore_) dans
    // l’affichage, c’est qu’on a gagné !
    const won = !display.includes('_')
    // Mise à jour de l’état local du composant, qui va déclencher
    // un re-render.
    this.setState({ display, usedLetters, won })
  }

  render() {
    const { display, usedLetters, won } = this.state
    return (
      <div className={`hangman ${(won && 'won') || ''}`}>
        {/* Un composant à part pour juste ce paragraphe serait superflu… */}
        <p className="display">{display}</p>
        {/* En revanche, ce tableau de lettres serait probablement un composant
            séparé dans une appli plus aboutie.  Ici, dans l’intérêt de la
            rapidité de l’activité à réaliser, on est restés sur un seul
            composant : `<App/>`. */}
        <p className="letters">
          {won ? (
            // Ce bouton est (1) un composant natif, donc sans optimisation
            // de re-rendu particulière, et (2) rendu une seule fois lorsqu’on
            // a gagné la partie : le `reset()` va le virer.  Aucune véritable
            // raison donc de sortir la fonction fléchée comme une méthode
            // métier _bound_.
            <button className="replay" onClick={() => this.reset()}>
              Rejouer
            </button>
          ) : (
            ALPHABET.map((letter) => (
              <button
                disabled={usedLetters.has(letter)}
                key={letter}
                // Chaque bouton va être re-rendered quand on choisit une
                // lettre, mais dans la mesure où il faut de toutes façons
                // appeler la méthode avec la lettre en argument, on doit
                // utiliser une fonction fléchée ici ; comme on appelle
                // `handleLetter` en mode « sujet-verbe-complément », son
                // `this` interne est garanti à l’exécution : c’est le
                // `this` utilisé ici pour l’appel.
                onClick={() => this.handleLetter(letter)}
              >
                {letter}
              </button>
            ))
          )}
        </p>
      </div>
    )
  }

  // Réinitialisation du plateau pour une nouvelle partie.
  reset() {
    this.setState(this.generateInitialState())
  }
}

export default App

// Fonctions d’assistance
// ----------------------

// Produit une représentation textuelle de l’état de la partie,
// chaque lettre non découverte étant représentée par un _underscore_.
// (CSS assurera de l’espacement entre les lettres pour mieux
// visualiser le tout).
function computeDisplay(phrase, usedLetters) {
  return phrase.replace(
    /\w/g,
    (letter) => (usedLetters.has(letter) ? letter : '_')
  )
}
