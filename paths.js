import path from "path"
import { fileURLToPath } from "url"
import os from "os"

const getConfigHome = () => {
  const home = os.homedir()
  const { env, platform } = process

  if (platform === "win32") {
    return env.APPDATA ?? path.join(home, "AppData", "Roaming")
  }

  if (platform === "darwin") {
    return path.join(home, "Library", "Application Support")
  }

  return env.XDG_CONFIG_HOME ?? path.join(home, ".config")
}

const gulpfilePath = fileURLToPath(import.meta.url)

const paths = {
  assets: "assets",
  buildDir: "build/",
  confPrivExample: path.join("src", "conf.priv.example.js"),
  dirname: path.dirname(gulpfilePath),
  favicons: "assets/favicons",
  faviconsManifest: "favicons.json",
  gulpfile: path.basename(gulpfilePath),
  installDir: getConfigHome(),
  srcDir: "src",
  output: "surfingkeys.js",
  pkgJson: "package.json",
  readme: "README.tmpl.md",
  readmeOut: "README.md",
  screenshots: "assets/screenshots",

  sources: {
    api: "api.js",
    actions: "actions.js",
    conf: "conf.js",
    confPriv: "conf.priv.js",
    entrypoint: "index.js",
    keys: "keys.js",
    searchEngines: "search-engines.js",
    util: "util.js",
  },
}

export default paths

export const getPath = (...f) => path.join(paths.dirname, ...f)
export const getSrcPath = (...s) => getPath(paths.srcDir, ...s)
