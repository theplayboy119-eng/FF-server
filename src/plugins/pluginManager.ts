// src/plugins/pluginManager.ts
import fs from "fs";
import path from "path";

type Descriptor = any;

export class PluginManager {
  plugins: Map<string, any> = new Map();
  clientDescriptors: Map<string, Descriptor> = new Map();

  constructor() {
    // load plugins from plugins/ folder
    this.loadAll();
  }

  loadAll() {
    const dir = path.join(__dirname, "../plugins");
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir).filter((f) => f.endsWith(".js") || f.endsWith(".ts"));
    for (const f of files) {
      this.loadPlugin(path.join(dir, f));
    }
  }

  loadPlugin(fullpath: string) {
    try {
      delete require.cache[require.resolve(fullpath)];
      const mod = require(fullpath);
      const name = path.basename(fullpath, path.extname(fullpath));
      this.plugins.set(name, mod);
      if (mod && typeof mod.init === "function") mod.init();
      console.log(`plugin loaded: ${name}`);
    } catch (err) {
      console.error(`failed to load plugin ${fullpath}`, err);
    }
  }

  reloadAll() {
    for (const key of Array.from(this.plugins.keys())) {
      const p = this.plugins.get(key);
      if (p && typeof p.shutdown === "function") p.shutdown();
    }
    this.plugins.clear();
    this.loadAll();
  }

  emit(hook: string, payload: any) {
    for (const p of this.plugins.values()) {
      try {
        if (typeof p[hook] === "function") p[hook](payload);
      } catch (err) {
        console.error("plugin hook error", err);
      }
    }
  }

  registerClientDescriptor(clientId: string, descriptor: Descriptor) {
    this.clientDescriptors.set(clientId, descriptor);
    // optionally route to plugins
    this.emit("onClientDescriptor", { clientId, descriptor });
  }
}
