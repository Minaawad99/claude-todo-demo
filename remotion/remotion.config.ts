import { Config } from "@remotion/cli/config";

// Use the Chromium that is already installed in this environment instead of downloading one. The full Chromium (not the
// headless shell) is needed for 3D: it gives WebGL through ANGLE + SwiftShader ("swangle").
Config.setBrowserExecutable(process.env.REMOTION_CHROME || "/opt/pw-browsers/chromium-1243/chrome-linux64/chrome");
Config.setChromeMode("chrome-for-testing");
Config.setChromiumOpenGlRenderer("swangle");
Config.setVideoImageFormat("jpeg");
