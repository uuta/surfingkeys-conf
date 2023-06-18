import conf from "./conf.js";
import help from "./help.js";
import api from "./api.js";

const { categories } = help;
const {
  mapkey,
  map,
  unmap,
  Clipboard,
  Front,
  removeSearchAlias,
  addSearchAlias,
  Visual,
  Hints,
} = api;

Visual.style("marks", "background: unset; background-color: #37b71d");
Visual.style("cursor", "background: unset; background-color: #37b71d");
Hints.style(
  " \
  font-family: Earth Orbiter, Osaka, Input Sans Condensed, Charcoal, sans-serif; \
  font-size: 13px; \
  font-weight: 400; \
  border: unset; \
  padding: 3px; \
  color: #ffffff; \
  background: unset; \
  background-color: #002B36; \
",
);
Hints.style(
  "\
  font-family: Earth Orbiter, Osaka, Input Sans Condensed, Charcoal, sans-serif; \
  border: solid 1px #37b71d;\
  padding: 1px;\
  color: #fff;\
  background: #37b71d",
  "text",
);

const registerKey = (domain, mapObj, siteleader) => {
  const {
    alias,
    callback,
    leader = domain === "global" ? "" : siteleader,
    category = categories.misc,
    description = "",
    path = "(/.*)?",
  } = mapObj;
  const opts = {};

  const key = `${leader}${alias}`;

  if (domain !== "global") {
    const d = domain.replace(".", "\\.");
    opts.domain = new RegExp(`^http(s)?://(([a-zA-Z0-9-_]+\\.)*)(${d})${path}`);
  }

  const fullDescription = `#${category} ${description}`;

  if (typeof mapObj.map !== "undefined") {
    map(alias, mapObj.map);
  } else {
    mapkey(key, fullDescription, callback, opts);
  }
};

const registerKeys = (maps, aliases, siteleader) => {
  const hydratedAliases = Object.entries(aliases).flatMap(
    ([baseDomain, aliasDomains]) =>
      aliasDomains.flatMap((a) => ({ [a]: maps[baseDomain] })),
  );

  const mapsAndAliases = Object.assign({}, maps, ...hydratedAliases);

  Object.entries(mapsAndAliases).forEach(([domain, domainMaps]) =>
    domainMaps.forEach((mapObj) => registerKey(domain, mapObj, siteleader)),
  );
};

const registerSearchEngines = (searchEngines, searchleader) =>
  Object.values(searchEngines).forEach((s) => {
    const options = {
      favicon_url: s.favicon,
      skipMaps: true,
    };
    addSearchAlias(
      s.alias,
      s.name,
      s.search,
      "",
      s.compl,
      s.callback,
      undefined,
      options,
    );
    mapkey(`${searchleader}${s.alias}`, `#8Search ${s.name}`, () =>
      Front.openOmnibar({ type: "SearchEngine", extra: s.alias }),
    );
    mapkey(
      `c${searchleader}${s.alias}`,
      `#8Search ${s.name} with clipboard contents`,
      () => {
        Clipboard.read((c) => {
          Front.openOmnibar({
            type: "SearchEngine",
            pref: c.data,
            extra: s.alias,
          });
        });
      },
    );
  });

const main = async () => {
  window.surfingKeys = api;
  if (conf.settings) {
    Object.assign(
      settings,
      typeof conf.settings === "function" ? conf.settings() : conf.settings,
    );
  }

  if (conf.logLevels) {
    await chrome.storage.local.set({
      logLevels: conf.logLevels,
    });
  }

  if (conf.keys && conf.keys.unmaps) {
    const { unmaps } = conf.keys;
    if (unmaps.mappings) {
      unmaps.mappings.forEach((m) => unmap(m));
    }
    if (unmaps.searchAliases) {
      Object.entries(unmaps.searchAliases).forEach(([leader, items]) => {
        items.forEach((v) => removeSearchAlias(v, leader));
      });
    }
  }

  if (conf.searchEngines) {
    registerSearchEngines(conf.searchEngines, conf.searchleader ?? "o");
  }

  if (conf.keys && conf.keys.maps) {
    const { keys } = conf;
    const { maps, aliases = {} } = keys;
    registerKeys(maps, aliases, conf.siteleader);
  }

  // Unmap only in the specified domains
  if (conf?.keys?.unmaps?.mappingsDomains) {
    const { mappingsDomains } = conf.keys.unmaps;
    mappingsDomains.forEach((v) => unmap(v.mapping, v.domain));
  }
};

if (typeof window !== "undefined") {
  main();
}
