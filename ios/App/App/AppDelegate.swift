import UIKit
import Capacitor

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        // Set window background to white so status bar area isn't black
        window?.backgroundColor = .white

        // Make the webview scroll view extend under the status bar
        if let vc = window?.rootViewController as? CAPBridgeViewController {
            vc.view.backgroundColor = .white
            // Find the WKWebView and set its background
            for subview in vc.view.subviews {
                subview.backgroundColor = .white
                if let scrollView = subview as? UIScrollView {
                    scrollView.backgroundColor = .white
                    // Disable rubber-band bounce at bottom
                    scrollView.bounces = false
                    scrollView.alwaysBounceVertical = false
                }
            }
        }

        return true
    }

    func applicationWillResignActive(_ application: UIApplication) {
    }

    func applicationDidEnterBackground(_ application: UIApplication) {
    }

    func applicationWillEnterForeground(_ application: UIApplication) {
    }

    func applicationDidBecomeActive(_ application: UIApplication) {
    }

    func applicationWillTerminate(_ application: UIApplication) {
    }

    func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey: Any] = [:]) -> Bool {
        return ApplicationDelegateProxy.shared.application(app, open: url, options: options)
    }

    func application(_ application: UIApplication, continue userActivity: NSUserActivity, restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void) -> Bool {
        return ApplicationDelegateProxy.shared.application(application, continue: userActivity, restorationHandler: restorationHandler)
    }

}
