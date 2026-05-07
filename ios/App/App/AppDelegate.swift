import UIKit
import Capacitor

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        window?.backgroundColor = .white
        return true
    }

    func applicationDidBecomeActive(_ application: UIApplication) {
        // Disable bounce on the webview scroll view — runs after webview is fully loaded
        disableWebViewBounce()
    }

    private func disableWebViewBounce() {
        guard let vc = window?.rootViewController else { return }
        // Walk the view hierarchy to find the WKWebView's scroll view
        disableBounceRecursive(view: vc.view)
    }

    private func disableBounceRecursive(view: UIView) {
        if let scrollView = view as? UIScrollView {
            scrollView.bounces = false
            scrollView.alwaysBounceVertical = false
            scrollView.alwaysBounceHorizontal = false
            scrollView.backgroundColor = .white
        }
        view.backgroundColor = .white
        for subview in view.subviews {
            disableBounceRecursive(view: subview)
        }
    }

    func applicationWillResignActive(_ application: UIApplication) {}
    func applicationDidEnterBackground(_ application: UIApplication) {}
    func applicationWillEnterForeground(_ application: UIApplication) {}
    func applicationWillTerminate(_ application: UIApplication) {}

    func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey: Any] = [:]) -> Bool {
        return ApplicationDelegateProxy.shared.application(app, open: url, options: options)
    }

    func application(_ application: UIApplication, continue userActivity: NSUserActivity, restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void) -> Bool {
        return ApplicationDelegateProxy.shared.application(application, continue: userActivity, restorationHandler: restorationHandler)
    }
}
