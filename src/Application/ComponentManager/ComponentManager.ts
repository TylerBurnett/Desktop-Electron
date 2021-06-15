import { BrowserWindow } from 'electron';
import { join } from 'path';
import {
  existsSync,
  readdirSync,
  statSync,
  readFileSync,
  writeFileSync,
} from 'fs';
import { validate } from 'uuid';
import { debugSettings, productionSettings } from './WindowSettings';
// eslint-disable-next-line import/no-cycle
import ManagerMessenger from './ManagerMessenger';
import { ComponentRecievers } from '../Common/Recievers';
import { IApplicationSettings, Defaults } from './IApplicationSettings';
import { IComponentSettings } from '../Component/IComponentSettings';

/**
 * Component manager class
 * this class is purposed for use in the application which maintains and runs the custom components.
 */
export default class ComponentManager {
  settings: IApplicationSettings;

  messenger: ManagerMessenger;

  activeComponents: BrowserWindow[];

  // MAGIC STATIC SINGLETON STUFF.
  static instance: ComponentManager;

  get components() {
    return this.findComponents();
  }

  constructor() {
    // Attach the parent messenger to the manager
    this.messenger = new ManagerMessenger();

    if (existsSync('./local/settings.json')) {
      this.settings = this.loadSettings();
    } else {
      this.settings = Defaults;
      this.saveSettings();
    }

    // Finally, load the components.
    this.activeComponents = [];
    this.loadComponents();

    // Now set the static instance to this.
    ComponentManager.instance = this;
  }

  /**
   * Loads the collective of located components
   */
  public loadComponents() {
    this.components.forEach((component: IComponentSettings) => {
      this.loadComponent(component);
    });
  }

  /**
   * Loads an individual component based on the provided settings
   * @param component The component settings
   * @param system Is this a system component? Affect pathing
   */
  public loadComponent(component: IComponentSettings): void {
    if (
      this.settings.componentNodeAccess ||
      this.settings.componentNodeAccess ||
      component.nodeDependency === false
    ) {
      /*
      // Determine the template object for the window settings
      let windowSettings;
      if (this.settings.editMode) {
        windowSettings = editSettings;
      } else {
        */
      const windowSettings = component.production
        ? productionSettings
        : debugSettings;

      // Slap the dynamic values in
      const window = new BrowserWindow({
        ...windowSettings,
        width: component.windowSize.x,
        height: component.windowSize.y,
        x: component.windowLocation.x,
        y: component.windowLocation.y,

        webPreferences: {
          ...windowSettings.webPreferences,
          nodeIntegration: component.nodeDependency,
        },
      });

      // Build the display path based on external or system components.
      const displayPath = `file://${__dirname}/Components/${component.componentPath}/${component.displayFile}`;

      // Load its display file
      window.loadURL(displayPath);

      // Wait until its ready before sending it the settings.
      window.webContents.on('dom-ready', () => {
        window.webContents.send(ComponentRecievers.Config, component);
      });

      // Add it to the list of initialised components.
      this.activeComponents.push(window);
    } else {
      // eslint-disable-next-line no-console
      console.error(
        'Component has node depedencies but lacks node access, to fix this change Component Node Access in settings'
      );
    }
  }

  /**
   * Loads an individual component based on the provided settings
   * @param component The component settings
   * @param system Is this a system component? Affect pathing
   */
  // eslint-disable-next-line class-methods-use-this
  public loadInterface(): void {
    // Slap the dynamic values in
    const window = new BrowserWindow({
      ...debugSettings,
      width: 1920,
      height: 1080,
      x: 0,
      y: 0,

      webPreferences: {
        ...debugSettings.webPreferences,
        nodeIntegration: true,
        webSecurity: false,
      },
    });

    // Build the display path based on external or system components.
    const displayPath = `file://${__dirname}/../../index.html`;

    // Load its display file
    window.loadURL(displayPath);

    // Wait until its ready before sending it the settings.
    /*
        window.webContents.on('dom-ready', () => {
          window.webContents.send(ComponentRecievers.Config, component);
        });
        */
  }

  /**
   * Loads the application settings
   */
  // eslint-disable-next-line class-methods-use-this
  private loadSettings(): IApplicationSettings {
    const contents = readFileSync('local/settings.json');
    return <IApplicationSettings>JSON.parse(contents.toString());
  }

  /**
   * Saves the application settings
   */
  private saveSettings(): boolean {
    if (existsSync('local/settings.json')) {
      writeFileSync('local/settings.json', JSON.stringify(this.settings));
    }

    return false;
  }

  /**
   * Finds all the components in the /Components directory
   */
  // eslint-disable-next-line class-methods-use-this
  private findComponents(): IComponentSettings[] {
    // This code works, but lacks error checking. Add some logs that provide context to why a component couldnt load.
    const directories = readdirSync(`${__dirname}/Components`).filter((f) =>
      statSync(join(`${__dirname}/Components`, f)).isDirectory()
    );
    const components: IComponentSettings[] = [];

    const baseDir = join(__dirname, '/Components');

    // eslint-disable-next-line no-restricted-syntax
    for (const directory of directories) {
      const path = `${baseDir}/${directory}/config.json`;

      if (existsSync(path)) {
        const contents = JSON.parse(readFileSync(path).toString());

        // Config validation
        if (validate(contents.uuid)) {
          components.push(<IComponentSettings>contents);
        } else {
          console.error(
            `Invalid UUID in config @${directory}, please ensure you use UUID v4,v5.`
          );
        }
      } else {
        console.error(
          `Could not find component config @${directory}, please check the location of this file.`
        );
      }
    }

    return components;
  }

  /**
   * Public access point for Updating the settings, from tray or from messenger.
   *
   * @param json The JSON holding the settings.
   * @param update Are we updating the settings, or replacing with new JSON.
   */
  public updateSettings(json: string, update = false) {
    const parsed: IApplicationSettings = JSON.parse(json);
    const temp: any = this.settings;
    if (update) {
      // eslint-disable-next-line no-restricted-syntax
      for (const [key, value] of Object.entries(<IApplicationSettings>parsed)) {
        temp[key] = value;
      }

      this.settings = <IApplicationSettings>temp;
    } else {
      this.settings = <IApplicationSettings>JSON.parse(json);
    }

    this.saveSettings();
    this.reload();
  }

  private reload() {
    this.activeComponents.forEach((element) => element.close());
    this.activeComponents = [];
    this.loadComponents();
  }

  // Singleton MAGIC POWER!
  public static getManager(): ComponentManager {
    return ComponentManager.instance;
  }

  public getSettings(): IApplicationSettings {
    return this.settings;
  }
}
