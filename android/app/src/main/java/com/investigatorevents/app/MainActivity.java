package com.investigatorevents.app;

import android.graphics.Color;
import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.view.ViewGroup;
import android.view.WindowManager;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import android.webkit.RenderProcessGoneDetail;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebView;

import com.getcapacitor.Bridge;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.BridgeWebViewClient;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;

/**
 * The app loads the live site (see capacitor.config.ts server.url) with no
 * bundled web build, so any load failure — a dropped signal, a redirect
 * hiccup, a server cold-start — would otherwise dump the user on the raw
 * Android "Webpage not available" page with no way to recover.
 *
 * This subclass replaces that with a branded offline screen that reconnects
 * automatically once the network returns, and keeps the app alive if the
 * WebView's render process is killed under memory pressure.
 */
public class MainActivity extends BridgeActivity {

    private static final String SITE = "https://www.investigatorevents.com/";

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Draw into the display cutout (camera notch) instead of leaving a
        // dead letterbox strip under it, on every Android version — not just
        // the ones the system forces edge-to-edge on.
        WindowCompat.setDecorFitsSystemWindows(getWindow(), false);
        getWindow().setStatusBarColor(Color.TRANSPARENT);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
            WindowManager.LayoutParams lp = getWindow().getAttributes();
            lp.layoutInDisplayCutoutMode =
                    WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES;
            getWindow().setAttributes(lp);
        }

        final Bridge bridge = this.getBridge();
        final WebView webView = bridge.getWebView();

        // Top-edge passthrough. Capacitor only lets the page extend under the
        // status bar / notch when the device WebView is Chromium 140+ (where
        // env(safe-area-inset-top) reports the cutout — crbug 40699457);
        // older WebViews get the WebView padded down instead, which shows as
        // a dead strip under the notch. Replace that listener: never pad the
        // top, measure the inset natively, and hand it to the page as
        // --native-safe-top (globals.css folds it into --safe-top via max(),
        // so devices where env() works are unaffected). Bottom/side padding
        // and keyboard handling keep Capacitor's stock behaviour.
        final View webParent = (View) webView.getParent();
        final float density = getResources().getDisplayMetrics().density;
        ViewCompat.setOnApplyWindowInsetsListener(webParent, (v, insets) -> {
            Insets sys = insets.getInsets(
                    WindowInsetsCompat.Type.systemBars() | WindowInsetsCompat.Type.displayCutout());
            Insets ime = insets.getInsets(WindowInsetsCompat.Type.ime());
            boolean keyboardVisible = insets.isVisible(WindowInsetsCompat.Type.ime());
            v.setPadding(sys.left, 0, sys.right, keyboardVisible ? ime.bottom : sys.bottom);
            int topCss = Math.round(sys.top / density);
            webView.evaluateJavascript(
                    "document.documentElement.style.setProperty('--native-safe-top','" + topCss + "px')",
                    null);
            return new WindowInsetsCompat.Builder(insets)
                    .setInsets(
                            WindowInsetsCompat.Type.systemBars() | WindowInsetsCompat.Type.displayCutout(),
                            Insets.of(0, sys.top, 0, 0))
                    .build();
        });
        webParent.post(webParent::requestApplyInsets);

        webView.setWebViewClient(new BridgeWebViewClient(bridge) {
            @Override
            public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
                // Let Capacitor's listeners run, then take over for main-frame
                // failures (a failed sub-resource shouldn't blank the app).
                super.onReceivedError(view, request, error);
                if (request != null && request.isForMainFrame()) {
                    showOffline(view);
                }
            }

            @Override
            public void onReceivedHttpError(WebView view, WebResourceRequest request, WebResourceResponse errorResponse) {
                super.onReceivedHttpError(view, request, errorResponse);
                // 5xx from the server on the main document => same dead-end.
                if (request != null && request.isForMainFrame() && errorResponse != null
                        && errorResponse.getStatusCode() >= 500) {
                    showOffline(view);
                }
            }

            @Override
            public boolean onRenderProcessGone(WebView view, RenderProcessGoneDetail detail) {
                // The renderer was killed (usually the OS reclaiming memory on a
                // low-RAM device). Returning true stops Android from killing the
                // whole app; we rebuild the activity to get a fresh WebView
                // instead of crashing to the launcher / "won't reopen".
                try {
                    if (view != null) {
                        ViewGroup parent = (ViewGroup) view.getParent();
                        if (parent != null) parent.removeView(view);
                        view.destroy();
                    }
                } catch (Exception ignored) {
                }
                recreate();
                return true;
            }
        });
    }

    /** Load the branded offline page. Base URL = the site so the page's
     *  reconnect probe is same-origin and its "back online" redirect works. */
    private void showOffline(WebView view) {
        String html = readAsset("offline.html");
        if (html == null) return; // fall back to whatever the WebView shows
        view.loadDataWithBaseURL(SITE, html, "text/html", "UTF-8", SITE);
    }

    private String readAsset(String name) {
        try (InputStream is = getAssets().open(name);
             BufferedReader reader = new BufferedReader(new InputStreamReader(is, StandardCharsets.UTF_8))) {
            StringBuilder sb = new StringBuilder();
            String line;
            while ((line = reader.readLine()) != null) {
                sb.append(line).append('\n');
            }
            return sb.toString();
        } catch (Exception e) {
            return null;
        }
    }
}
