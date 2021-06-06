import { ipcMain, ipcRenderer, BrowserWindow } from "electron";
import { ComponentManager } from "../ComponentManager/ComponentManager";
import { IComponentSettings } from "../Component/IComponentSettings";

/**
 * This class is both the listener and sender of events to Components
 * This class should be used in the Component Manager only
 */
export class ManagerMessenger {
  constructor() {
    // Create a reciever for errors
    ipcMain.on(ManagerRecievers.Error, (event, args) => {
      console.log("ERROR in:  " + <string>args[0] + ", " + <string>args[1]);
    });

    // Create a reciever for warnings
    ipcMain.on(ManagerRecievers.Warning, (event, args) => {
      console.log("WARNING in:  " + <string>args[0] + ", " + <string>args[1]);
    });

    // Create a reciever for logging
    ipcMain.on(ManagerRecievers.Log, (event, args) => {
      console.log(<string>args[0] + ": " + <string>args[1]);
    });

    // Create a reciever for getting appConfig from the appSettingsComponent.
    ipcMain.on(ManagerRecievers.AppConfig, (event, args) => {
      let manager = ComponentManager.getManager();
      manager.updateSettings(args[1]);
    });

    /*
    // Create a reciever for getting updated component settings from interface.
    ipcMain.on(ManagerRecievers.SetComponent, (event, args) => {
      let manager = ComponentManager.getManager();
      manager.updateSettings(args[1]);
    });
    */

    // Create a reciever for responding the components settings to interface.
    ipcMain.on(ManagerRecievers.GetComponents, (event, args) => {
      let manager = ComponentManager.getManager();
      manager.updateSettings(args[1]);

      event.returnValue(manager.components);
    });
  }

  public sendMessage(
    window: BrowserWindow,
    reciever: ComponentRecievers,
    args: any
  ) {
    window.webContents.send(reciever, [args]);
  }
}

export class InterfaceMessenger {
  constructor() {}

  /**
   * This function should be wrapped by a ComponentBase Function to ensure correct component name passing.
   * @param header The enum header that specifies the intent of the message
   * @param sender The caller component name.
   * @param args The relevant information associated with the channel message.
   */
  public sendMessage(header: ManagerRecievers, args: any) {
    ipcRenderer.send(header, [args]);
  }
}

/**
 * This enumerator is used for specifying the intent of a message to a component
 * This should be used in the case of: ComponentManager --> Component Messaging.
 * Note: A component will only react to these headers.
 */
export enum ComponentRecievers {
  Config = "Config",
}

/**
 * This enumerator is used for specifying the intent of a message to the Component Manager
 * This should be used in the case of: Component --> ComponentManager Messaging.
 * Note: The component manager will only react to these headers.
 */
export enum ManagerRecievers {
  Error = "Error",
  Warning = "Warning",
  Log = "Log",
  AppConfig = "AppConfig",

  // These are only used by the interface
  GetComponents = "GetComponents",
  GetComponent = "GetComponent",
  SetComponent = "SetComponent",
}
