/**
 * @fileoverview File to parse configurations.
 * @author Horton Cheng <horton0712@gmail.com>
 */

// Dependencies.
const path = require("path");
const fs = require("fs");

/**
 * @typedef {Object} ParsedArgs
 * @prop {Array<string>} _
 * @prop {Object.<string, string>} keyedValues
 */
/**
 * @typedef {Object<string, string>} ParsedEnvFile
 */
/**
 * @typedef {"map"|"object"} EnvOutAsFormat
 */

/**
 * Parses process arguments.
 * @param {Array<string>} args The process arguments.
 * @returns {ParsedArgs}
 */
function parseArgs(args) {
  const parsedArgs = {
    _: [],
    keyedValues: {}
  };
  args
    .filter(arg => {
      // Filter the arguments passed to the program.
      // All arguments that want to be parsed must start
      // with a flag ("-" or "--").
      const doesArgStartWithFlag = arg.startsWith("-") || arg.startsWith("--");
      return doesArgStartWithFlag;
    })
    .forEach(arg => {
      // Remove the flags, and split the argument by an equal sign.
      const splitArg = arg.replace(/-+/, "").split("=", 2);
      // Sort the arguments into keyed values and "boolean" values.
      if (splitArg.length < 2) {
        if (!splitArg[0]) { return; }
        parsedArgs._.push(splitArg[0]);
      } else {
        parsedArgs.keyedValues[splitArg[0]] = splitArg[1];
      }
    });
  return parsedArgs;
}
// TODO: Make the `parseEnvFile` function only return Objects.
/**
 * Parses a ``.env`` file.
 * @param {string} filePath The path to the ``.env`` file. May be absolute
 * or relative.
 * @param {boolean} [useSync] Whether to use synchronous ``fs`` methods.
 * @param {EnvOutAsFormat} [outAs] The format to return the environment
 * variables.
 * @returns {ParsedEnvFile|Promise<ParsedEnvFile>}
 */
function parseEnvFile(filePath, useSync, outAs) {
  const realFilePath = path.isAbsolute(filePath) ?
    filePath :
    path.resolve(filePath);
  let result = null;

  // Determine the end result's format.
  switch (outAs) {
  case "map":
    result = new Map();
    break;
  case "object":
    result = {};
    break;
  default:
    result = {};
    break;
  }

  /**
   * Private method to parse the .env file.
   * @param {string} file The file to parse.
   * @returns {Map<string, string>|Object<string, string>}
   * @private
   */
  function parse(file) {
    file
      .split(/\r\n|\r|\n/)
      .filter(line => !!line)
      .filter(line => !line.startsWith("#"))
      .forEach(line => {
        const pieces = line.split("=", 2);
        // FIXME: Add ANOTHER `.trim()` call to trim whitespace before
        // we replace outer qoutes.
        pieces[1] = (pieces[1] ? pieces[1] : "")
          .replace(/^["'`](.+)["'`]$/, "$1")
          .trim();
        if (result instanceof Map) {
          result.set(pieces[0], pieces[1]);
        } else {
          result[pieces[0]] = pieces[1];
        }
      });
    return result;
  }

  if (useSync) {
    // eslint-disable-next-line no-sync
    const file = fs.readFileSync(realFilePath, { encoding: "utf-8" });

    result = parse(file);
    return result;
  }
  return new Promise((resolve, reject) => {
    const readS = fs.createReadStream(realFilePath);
    const chunks = [];

    readS.on("data", chunk => {
      chunks.push(chunk);
    });
    readS.on("error", err => {
      reject(new Error(
        `Failed to parse .env file! Error is:\n${err}`
      ));
    });
    readS.on("end", () => {
      // Concatenate the array of bytes made into a single
      // string, parse it, and resolve the promise.
      const file = Buffer.concat(chunks).toString("utf-8");
      result = parse(file);
      resolve(result);
    });
  });
}

// Parse the arguments and environment variables.
let parsedArgs = null;
let envVariables = null;
try {
  parsedArgs = parseArgs(process.argv);
  envVariables = parseEnvFile(
    path.join(parsedArgs.keyedValues.confFile || __dirname, "./config.env"),
    true, "object"
  );
} catch (err) {
  // TODO: Give more information about the error was thrown.
  throw new Error("Failed to load configurations.");
}

// Declare the actual environment variables that will be exported.
const envVars = {
  logOpts: {
    /**
     * @type {boolean}
     */
    noLog:
      parsedArgs._.includes("nolog") || parsedArgs._.includes("noLog") ||
      !envVariables.NO_LOG,
    /**
     * @type {string}
     */
    logTo:
      parsedArgs.keyedValues.logTo ||
      (envVariables.LOG_TO.startsWith("~") ?
        path.join(
          require("os").homedir(),
          envVariables.LOG_TO.substring(2)
        ) :
        envVariables.LOG_TO
      ) ||
      "/var/log/colonialwars/"
  },
  httpsConfig: {
    /**
     * @type {boolean}
     */
    isHttps:
      parsedArgs.keyedValues.isHttps === "true" ||
      envVariables.IS_HTTPS === "true",
    /**
     * @type {string}
     */
    httpsConfigPath:
      parsedArgs.httpsConfigPath ||
      envVariables.HTTPS_CONFIG_PATH ||
      "/etc/letsencrypt/live/"
  },
  serverConfig: {
    /**
     * @type {string}
     */
    host:
      process.env.HOST ||
      envVariables.HOST ||
      parsedArgs.keyedValues.host,
    /**
     * @type {number}
     */
    port:
      parseInt(
        process.env.PORT ||
        envVariables.PORT ||
        parsedArgs.keyedValues.port,
        10
      )
    // TODO: Add another property for this web application's
    // name. It will be used for signing JWTs.
  },
  // TODO: Add a `securityOpts` object for security configurations.
  // TODO: Add a `secrets` object for storing server secrets.
  /**
   * @type {string}
   */
  environment:
    process.env.NODE_ENV ||
    envVariables.NODE_ENV ||
    parsedArgs.keyedValues.nodeEnv ||
    "development"
};
/**
 * Module exports.
 */
module.exports = exports = envVars;
