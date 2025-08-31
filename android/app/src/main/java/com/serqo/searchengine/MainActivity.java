package com.serqo.searchengine;

import android.os.Bundle;
import android.webkit.WebSettings;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.Plugin;

import java.util.ArrayList;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // Enhanced privacy settings for mobile
        WebSettings webSettings = this.bridge.getWebView().getSettings();
        webSettings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        webSettings.setAllowFileAccess(false);
        webSettings.setAllowContentAccess(false);
        webSettings.setGeolocationEnabled(false);
        webSettings.setDatabaseEnabled(false);
        webSettings.setDomStorageEnabled(true); // Needed for app functionality
        webSettings.setAppCacheEnabled(false);
        
        // Block third-party cookies
        android.webkit.CookieManager.getInstance().setAcceptThirdPartyCookies(this.bridge.getWebView(), false);
    }
}
