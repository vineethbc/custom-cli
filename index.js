#!/usr/bin/env node

const chalk = require("chalk");
const clear = require("clear");
const figlet = require("figlet");
const files = require("./git/files");
const github = require("./git/github");
const repo = require("./git/repo");
const menu = require("./menu/menu");
const work = require("./work/work");

clear();

console.log(
  chalk.yellow(figlet.textSync("VCLI", { horizontalLayout: "full" }))
);

if (files.directoryExists(".git")) {
  console.log(chalk.red("Already a Git repository!"));
  process.exit();
}

const getGithubToken = async () => {
  // Fetch token from config store
  let token = github.getStoredGithubToken();
  if (token) {
    return token;
  }

  // No token found, use credentials to access GitHub account
  token = await github.getPersonalAccesToken();

  return token;
};

const runMenu = async () => {
  try {
    const answers = await menu.askMenuOptions();
    switch (answers.menu) {
      case menu.menuOptions.git:
        runGit();
        break;
      case menu.menuOptions.work:
        work.starWork();
        break;
      case menu.menuOptions.exit:
      default:
        process.exit();
    }
    runMenu();
  } catch (err) {
    console.log(err);
  }
};

const runGit = async () => {
  try {
    // Retrieve & Set Authentication Token
    const token = await getGithubToken();
    github.githubAuth(token);

    // Create remote repository
    const url = await repo.createRemoteRepo();

    // Create .gitignore file
    await repo.createGitignore();

    // Set up local repository and push to remote
    await repo.setupRepo(url);

    console.log(chalk.green("All done!"));
  } catch (err) {
    if (err) {
      switch (err.status) {
        case 401:
          console.log(
            chalk.red(
              "Couldn't log you in. Please provide correct credentials/token."
            )
          );
          break;
        case 422:
          console.log(
            chalk.red(
              "There is already a remote repository or token with the same name"
            )
          );
          break;
        default:
          console.log(chalk.red(err));
      }
    }
  }
};

runMenu();
