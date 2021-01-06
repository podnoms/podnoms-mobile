package com.podnoms.mobile;

import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.text.TextUtils;

import com.facebook.react.ReactActivity;
import com.facebook.react.ReactActivityDelegate;

public class MainActivity extends ReactActivity {

    @Override
    protected void onCreate(final Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        Intent intent = getIntent();
        String action = intent.getAction();
        String type = intent.getType();

        // Match the intent specified in AndroidManifest.xml
        if (Intent.ACTION_SEND.equals(action) && "text/plain".equals(type)) {
            Bundle bundle = new Bundle();
            String shareUrl = intent.getStringExtra(Intent.EXTRA_TEXT);
            if (!TextUtils.isEmpty(shareUrl)) {
                bundle.putString("shareUrl", shareUrl);
            }
//            reactRootView.setAppProperties(bundle);
        }
    }

    @Override
    protected String getMainComponentName() {
        return "PodNomsMobile";
    }

    @Override
    protected ReactActivityDelegate createReactActivityDelegate() {
        return new ReactActivityDelegate(this, getMainComponentName()) {
            @Override
            protected Bundle getLaunchOptions() {
                Intent intent = MainActivity.this.getIntent();
                Bundle bundle = new Bundle();
                String shareUrl = intent.getStringExtra(Intent.EXTRA_TEXT);
                if (!TextUtils.isEmpty(shareUrl)) {
                    bundle.putString("shareUrl", shareUrl);
                }
                return bundle;
            }
        };
    }
}
