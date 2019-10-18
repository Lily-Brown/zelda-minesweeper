# TacPoint Take-Home

## Synopsis

This is the repository for the TacPoint Take-Home Assignment to create a fully functioning Minesweeper.

### Requirements

The necessary components:
- Allow the user to set the size (# of rows and columns) before the game starts
- Allow the user to set a difficulty level (e.g. easy = 5% of the cells are bombs, medium = 25%, and hard = 50%)
- Include a README that explains all the features that you implemented as well as any instructions to get your application running.

Extra Credit
------------
- Implement a backend feature and create a leader board based on time.


## Prererequisites

Install nodemon:

```npm install -g nodemon```

## Installation

1 - Fork and clone this repository.

2 - CD into the project directory: ```> cd zelda-minesweeper```

3 - Install Node Packages: ```> npm install```

4 - Start your server: ```> nodemon```

5 - View your application at: [http://localhost:3000](http://localhost:3000/).


## UI Screenshot

MineSweeper

<img src='http://i.imgur.com/cmtdmGe.jpg' width=700px>

MineSweeper In Play

<img src='http://i.imgur.com/EQcF5nL.png' width=500px>

MineSweeper Win State

<img src='http://i.imgur.com/jKQfykR.png' width=500px>

MineSweeper Mobile

<img src='http://i.imgur.com/Y16j4bj.png' width=250px>

## Features

- User Can Specify Size and Difficulty to create Custom Game Boards
- Time Played recorded, saved on win and added to list of High Scores

## Future Work

- Have High Score Data Persist
- Implement Cleaner UI
- Refactor Code: Clean Up, More Reuse, Implement Better Front End Framework(?)
- Better Responsiveness for various Desktop Views
- Different Themes for Difficulty Levels (Easy - Meadow, Intermediate - Dungeon, Hard - Boss Fight)
