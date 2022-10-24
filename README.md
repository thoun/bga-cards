# What is this project ? 
This project is an adaptation for BoardGameArena of game King of Tokyo edited by Iello.
You can play here : https://boardgamearena.com

# How to install the auto-build stack

## Install builders
Intall node/npm then `npm i` on the root folder to get builders.

## Auto build JS and CSS files
In VS Code, add extension https://marketplace.visualstudio.com/items?itemName=emeraldwalk.RunOnSave and then add to config.json extension part :
```json
        "commands": [
            {
                "match": ".*\\.ts$",
                "isAsync": true,
                "cmd": "npm run build:ts"
            },
            {
                "match": ".*\\.scss$",
                "isAsync": true,
                "cmd": "npm run build:scss"
            }
        ]
    }
```
If you use it for another game, replace `kingoftokyo` mentions on package.json `build:scss` script and on tsconfig.json `files` property.

## Auto-upload builded files
Also add one auto-FTP upload extension (for example https://marketplace.visualstudio.com/items?itemName=lukasz-wronski.ftp-sync) and configure it. The extension will detected modified files in the workspace, including builded ones, and upload them to remote server.

## Hint
Make sure ftp-sync.json and node_modules are in .gitignore

# How to start PHP unit test
go on tests dir and start execute file, for example `php ./kingoftokyo.game.test-dice-sort.php`

# TODO
add animation for smashes even if no smash dice (poison quills)
slide energy cubes from battery monster

TODO check psychic probe with Background Dweller allowing to reroll a 3 that's not PB die => /bug?id=51953
TODODE add new images
TODODE handle cards cost differences
TODODE handle cards color/style differences
TODODE handle it has a child text difference

log no energy/heart/points won

## PU Evolutions to play a timing :
before resolving :
 - 33 mecha blast (meka dragon)
 - 92 grande marée (kraken)
after resolving
 - 34 analyse impitoyable (meka dragon) (or everytime ?)
 electric carrot
when tokyo monster is damaged by this player
 - 29 jouer avec sa nourriture (Cyber Kitty)
during move phase (after leaving, before entering) :
 - 30 propulseur félin (Cyber Kitty)
 - 57 ruée du grand singe (The King)
after move phase active player turn :
 - 59 gare au gorille (The King)
 - 66 panda guerilla (Pandakai)
 - 90 vague dévastatrice (Kraken)
at the end of active player turn :
 - 44 vague de froid (space penguin) (or everytime ?)
 - 45 pris dans la glace (space penguin) (or everytime ?)
 - 46 blizzard (space penguin) (or everytime in player's turn ?)
 - 51 convertisseur d'énergie (alienoid) (or everytime ?)
 - 81 coup de génie (cyber bunny) (or everytime ?)
 - 91 adorateurs cultistes (Kraken) (or everytime ?)
