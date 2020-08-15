const homedir = require("os").homedir();
const path = homedir + "/vcli-config.json";

const fs = require("fs");
const os = require("os");
let cp = require("child_process");

let getShell = () => {
  let shell = process.env.SHELL || "sh";

  if (os.platform() === "win32" && process.env.SHELL === undefined) {
    shell = "cmd.exe";
  }
  return shell;
};

let errorFn = (message) => {
  console.log(message);
  process.exit();
};

module.exports = {
  starWork: () => {
    try {
      console.log("Starting work: \n");
      let configFile;
      try {
        configFile = fs.readFileSync(path, "utf8");
        if (!configFile) {
          errorFn("No vcli-config file!");
        }
      } catch {
        errorFn("No vcli-config file!");
      }

      let config;
      try {
        config = JSON.parse(configFile);
        if (!config) {
          errorFn("vcli-config format is wrong!");
        }
      } catch {
        errorFn("vcli-config format is wrong!");
      }

      let spawnOptions = {
        detached: true
      };

      for (let index in config.work) {
        switch (index) {
          case "application":
            config.work[index].forEach((option) => {
              if (option.name) {
                console.log("Starting " + option.name);
                if (option.path) {
                  let subprocess = cp.spawn(option.path, spawnOptions);
                  subprocess.on("error", (err) => {
                    console.log("Failed to start " + option.name);
                  });
                } else {
                  console.log("Enter path for " + option.name);
                }
              } else {
                console.log("Incorrect application option");
              }
            });
            break;
          case "executable":
            config.work[index].forEach((option) => {
              if (option.name && option.path && option.drive && option.file) {
                console.log("Starting " + option.name);
                spawnOptions.shell = true;

                process.chdir(option.path);

                let subprocess = cp.spawn(
                  getShell(),
                  [option.drive, option.file],
                  spawnOptions
                );

                subprocess.on("error", (err) => {
                  console.log("Failed to start " + option.name);
                });
              } else {
                console.log("Incorrect executable option");
              }
            });
        }
      }
      console.log("\nWork Started!\n");
    } catch (err) {
      console.log(err);
    }
  }
};
