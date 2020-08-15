const CLI = require("clui");
const fs = require("fs");
const simpleGit = require("simple-git");
const Spinner = CLI.Spinner;
const touch = require("touch");
const _ = require("lodash");
const chalk = require("chalk");

const inquirer = require("./inquirer");
const gh = require("./github");

let makeDirectory = (dirName) => {
  var fs = require("fs");
  var dir = "./" + dirName;

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
    process.chdir(dir);
  } else {
    console.log("Directory already exists!");
    process.exit();
  }
};

module.exports = {
  createRemoteRepo: async () => {
    const github = gh.getInstance();
    const answers = await inquirer.askRepoDetails();

    let status = new Spinner("Creating local directory...");
    status.start();
    try {
      makeDirectory(answers.name);
    } catch (err) {
      console.log(err);
      process.exit();
    } finally {
      status.stop();
    }

    const data = {
      name: answers.name,
      description: answers.description,
      private: answers.visibility === "private"
    };

    status = new Spinner("Creating remote repository...");
    status.start();

    try {
      const response = await github.repos.createForAuthenticatedUser(data);
      return response.data.ssh_url;
    } catch (err) {
      if (err.errors && err.errors.length) {
        console.log(err.errors[0].message);
        process.exit();
      }
    } finally {
      status.stop();
    }
  },
  createGitignore: async () => {
    const filelist = _.without(fs.readdirSync("."), ".git", ".gitignore");

    if (filelist.length) {
      const answers = await inquirer.askIgnoreFiles(filelist);

      if (answers.ignore.length) {
        fs.writeFileSync(".gitignore", answers.ignore.join("\n"));
      } else {
        touch(".gitignore");
      }
    } else {
      touch(".gitignore");
    }
  },
  setupRepo: async (url) => {
    const git = simpleGit();
    const status = new Spinner(
      "Initializing local repository and pushing to remote..."
    );
    status.start();

    try {
      //console.log("Git repo directory: " + process.cwd());
      await git.init();
      await git.add(".gitignore");
      await git.add("./*");
      await git.commit("Initial commit");
      await git.addRemote("origin", url);
      await git.push("origin", "master");
    } catch (err) {
      console.log(err);
    } finally {
      status.stop();
    }
  }
};
