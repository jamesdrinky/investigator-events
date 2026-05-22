import UIKit
import WebKit
import Capacitor

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?
    private var bounceTimer: Timer?

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        window?.backgroundColor = .white

        // Only clear WebView cache when the app build version actually changes
        // (fresh install or App Store update). Wiping on EVERY launch made the
        // app re-download all JS bundles + images + fonts every time it was
        // opened — biggest single cause of "everything takes ages to load".
        //
        // Now: cache persists between launches. Vercel's HTTP cache headers
        // handle freshness — HTML is no-cache (always revalidated), but
        // hash-named JS/CSS bundles + images cache forever (new deploy = new
        // hash = browser fetches just the changed file). When the user updates
        // the app itself, we wipe once to be safe.
        let currentBuild = Bundle.main.infoDictionary?["CFBundleVersion"] as? String ?? ""
        let lastSeenBuild = UserDefaults.standard.string(forKey: "IECachedBuildVersion") ?? ""

        if currentBuild != lastSeenBuild {
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
            UserDefaults.standard.set(currentBuild, forKey: "IECachedBuildVersion")
        }

        // Keep trying to disable bounce — webview may not be ready immediately
        bounceTimer = Timer.scheduledTimer(withTimeInterval: 0.5, repeats: true) { [weak self] timer in
            if self?.disableBounce() == true {
                timer.invalidate()
                self?.bounceTimer = nil
            }
        }

        return true
    }

    // Required for the Capacitor PushNotifications plugin to receive the APNs
    // device token. iOS calls this method after PushNotifications.register()
    // succeeds — the plugin listens on NotificationCenter for these names and
    // forwards the token to the JS 'registration' event listener.
    func application(_ application: UIApplication, didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data) {
        NotificationCenter.default.post(
            name: .capacitorDidRegisterForRemoteNotifications,
            object: deviceToken
        )
    }

    func application(_ application: UIApplication, didFailToRegisterForRemoteNotificationsWithError error: Error) {
        NotificationCenter.default.post(
            name: .capacitorDidFailToRegisterForRemoteNotifications,
            object: error
        )
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
