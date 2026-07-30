package com.investigatorevents.app;

import android.os.Bundle;
import android.view.ViewGroup;
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

        final Bridge bridge = this.getBridge();
        final WebView webView = bridge.getWebView();

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
