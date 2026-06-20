import { registerRootComponent } from "expo";
import App from "./App";

// Explicit root registration — version-robust across Expo SDKs.
registerRootComponent(App);
