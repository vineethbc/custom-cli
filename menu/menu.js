const inquirer = require("inquirer");
const _ = require("lodash");

const menuOptions = {
  work: "Start work environment",
  git: "Create a new Github repo",
  exit: "Exit from VCLI"
};

module.exports = {
  menuOptions,
  askMenuOptions: () => {
    const questions = [
      {
        type: "list",
        name: "menu",
        message: "What do you wish to do :",
        choices: _.values(menuOptions)
      }
    ];
    return inquirer.prompt(questions);
  }
};
