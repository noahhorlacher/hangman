const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
let solutions, solution, gameover, guesses

// UI elements
const UI = {
    WORD: document.querySelector('word'),
    KEYBOARD: document.querySelector('keyboard'),
    DISPLAY: document.querySelector('display'),
    STATE: document.querySelector('state')
}

const MAX_GUESSES = 11

// messages for the player
const STATES = {
    idle: '%i mistakes left.',
    won: 'You won with %i mistakes!',
    lost: 'You lost! The word was %s.'
}

// reset game
function reset() {
    // reset variables
    gameover = false
    guesses = 0

    // reset keyboard blocking class
    UI.KEYBOARD.className = ''

    // reset display
    UI.DISPLAY.style.backgroundImage = `url('svg/0.svg')`

    // reset message
    UI.STATE.textContent = STATES.idle.replace('%i', MAX_GUESSES - guesses)

    // get new solution
    solution = solutions[Math.floor(Math.random() * solutions.length)].toUpperCase()

    // remove characters in display
    UI.WORD.querySelectorAll('char').forEach(char => char.remove())

    // inject chars
    for (let char of solution.split('')) {
        const ELEMENT = document.createElement('char')
        ELEMENT.textContent = '_'
        ELEMENT.setAttribute('value', char)
        UI.WORD.append(ELEMENT)
    }

    // reset keyboard
    UI.KEYBOARD.querySelectorAll('char').forEach(char => char.setAttribute('checked', false))
}

// setup game
async function setup() {
    // get word list
    solutions = await fetch('solutions.json')
    solutions = await solutions.json()

    // inject keyboard
    for (let char of ALPHABET) {
        const ELEMENT = document.createElement('char')
        ELEMENT.textContent = char

        // on click, make guess
        ELEMENT.addEventListener('click', e => {
            // ignore if gameover or char already guessed
            if (gameover || ELEMENT.getAttribute('checked') === 'true') return

            // set checked
            ELEMENT.setAttribute('checked', true)

            // if character not guessed yet
            if (solution.split('').includes(char)) {
                // correct guess

                // mark chars in word
                UI.WORD.querySelectorAll(`char[value='${char}']`).forEach(el => el.textContent = char)

                // check if won
                const CURRENT_GUESS = [...UI.WORD.querySelectorAll('char')].map(c => c.textContent).join('')

                if (CURRENT_GUESS === solution) {
                    // game won
                    gameover = true

                    // block keyboard
                    UI.KEYBOARD.classList.add('gameover')

                    // show winning message
                    UI.STATE.textContent = STATES.won.replace('%i', guesses)
                }
            } else {
                // incorrect guess, progress hangman
                UI.DISPLAY.style.backgroundImage = `url('svg/${++guesses}.svg')`

                if (guesses >= MAX_GUESSES) {
                    // game lost
                    gameover = true

                    // block keyboard
                    UI.KEYBOARD.classList.add('gameover')

                    // show losing message
                    UI.STATE.textContent = STATES.lost.replace('%s', solution)
                } else {
                    // update message
                    UI.STATE.textContent = STATES.idle.replace('%i', MAX_GUESSES - guesses)
                }
            }
        })

        UI.KEYBOARD.append(ELEMENT)
    }

    // start
    reset()
}

setup()

document.querySelector('btn').addEventListener('click', reset)