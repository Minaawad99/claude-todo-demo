import { Config } from "@remotion/cli/config";

// Use the Chromium that is already installed in this environment instead of downloading one.
Config.setBrowserExecutable(process.env.REMOTION_CHROME || "/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell");
Config.setVideoImageFormat("jpeg");
