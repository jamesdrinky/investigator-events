import UIKit
import WebKit
import Capacitor

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?
    private var bounceTimer: Timer?

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        window?.backgroundColor = .white

        // Clear WKWebView disk + memory cache on every launch. Without this,
        // iOS aggressively caches index.html which references hashed JS bundle
        // filenames — meaning the app keeps loading OLD JS even after the live
        // site has been deployed many times. The cache hit savings aren't
        // worth the deploy reliability cost.
        let cacheTypes: Set<String> = [
            WKWebsiteDataTypeDiskCache,
            WKWebsiteDataTypeMemoryCache,
            WKWebsiteDataTypeOfflineWebApplicationCache,
        ]
        WKWebsiteDataStore.default().removeData(
            ofTypes: cacheTypes,
            modifiedSince: Date(timeIntervalSince1970: 0),
            completionHandler: {}
        )
        URLCache.shared.removeAllCachedResponses()

        // Keep trying to disable bounce — webview may not be ready immediately
        bounceTimer = Timer.scheduledTimer(withTimeInterval: 0.5, repeats: true) { [weak self] timer in
            if self?.disableBounce() == true {
                timer.invalidate()
                self?.bounceTimer = nil
            }
        }

        return true
    }

    @discardableResult
    private func disableBounce() -> Bool {
        guard let vc = window?.rootViewController else { return false }
        var found = false
        findScrollViews(in: vc.view) { scrollView in
            scrollView.bounces = false
            scrollView.alwaysBounceVertical = false
            scrollView.alwaysBounceHorizontal = false
            scrollView.backgroundColor = .white
            found = true
        }
        return found
    }

    private func findScrollViews(in view: UIView, handler: (UIScrollView) -> Void) {
        if let scrollView = view as? UIScrollView {
            handler(scrollView)
        }
        for subview in view.subviews {
            findScrollViews(in: subview, handler: handler)
        }
    }

    func applicationWillResignActive(_ application: UIApplication) {}
    func applicationDidEnterBackground(_ application: UIApplication) {}
    func applicationWillEnterForeground(_ application: UIApplication) {}
    func applicationDidBecomeActive(_ application: UIApplication) { disableBounce() }
    func applicationWillTerminate(_ application: UIApplication) {}

    func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey: Any] = [:]) -> Bool {
        return ApplicationDelegateProxy.shared.application(app, open: url, options: options)
    }

    func application(_ application: UIApplication, continue userActivity: NSUserActivity, restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void) -> Bool {
        return ApplicationDelegateProxy.shared.application(application, continue: userActivity, restorationHandler: restorationHandler)
    }
}
