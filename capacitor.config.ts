import  { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.zeengi',
  appName: 'Zeengi',
  webDir: 'www',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      // Show splash screen immediately when app launches
      launchShowDuration: 0,
      launchAutoHide: true,
      // Match your splash artwork background to avoid a white flash
      backgroundColor: "#000000ff",
      androidSplashResourceName: "splash",
      showSpinner: false,
      androidSpinnerStyle: "large",
      iosSpinnerStyle: "small",
      spinnerColor: "#999999",
      androidScaleType: 'CENTER_CROP'
    }
  }
}
export default config;


