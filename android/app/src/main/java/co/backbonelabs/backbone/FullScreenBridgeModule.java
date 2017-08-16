package co.backbonelabs.backbone;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;

import co.backbonelabs.backbone.util.Constants;
import co.backbonelabs.backbone.util.EventEmitter;
import timber.log.Timber;

public class FullScreenBridgeModule extends ReactContextBaseJavaModule{
    private ReactApplicationContext reactContext;

    public FullScreenBridgeModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
    }

    @Override
    public String getName() {
        return "FullScreenBridgeModule";
    }
    @ReactMethod
    public void showFullscreen(String videoUri, int elapsedTime, boolean isLoop) {
        IntentFilter filter = new IntentFilter();
        filter.addAction(Constants.ACTION_VIDEO_PLAYER_LOADED);
        filter.addAction(Constants.ACTION_VIDEO_PLAYBACK_ENDED);
        filter.addAction(Constants.ACTION_VIDEO_PLAYBACK_ERROR);
        filter.addAction(Constants.ACTION_VIDEO_PLAYBACK_PROGRESS);
        getCurrentActivity().registerReceiver(videoEventBroadcastReceiver, filter);

        Context context = getReactApplicationContext();
        Intent intent = new Intent(context, FullScreenVideoActivity.class); // mContext got from your overriden constructor
        intent.putExtra("VIDEO_URL",videoUri);
        intent.putExtra("ELAPSED_TIME", elapsedTime);
        intent.putExtra("IS_LOOP", isLoop);
        getCurrentActivity().startActivity(intent);
    }

    private final BroadcastReceiver videoEventBroadcastReceiver = new BroadcastReceiver() {
        @Override
        public void onReceive(Context context, Intent intent) {
            final String action = intent.getAction();

            if (action.equals(Constants.ACTION_VIDEO_PLAYER_LOADED)) {
                Timber.d("Video Player Loaded");
                WritableMap wm = Arguments.createMap();
                EventEmitter.send(reactContext, "VideoLoaded", wm);
            }
            else if (action.equals(Constants.ACTION_VIDEO_PLAYBACK_ENDED)) {
                Timber.d("Video Playback Finished");
                WritableMap wm = Arguments.createMap();
                EventEmitter.send(reactContext, "VideoEnded", wm);
            }
            else if (action.equals(Constants.ACTION_VIDEO_PLAYBACK_ERROR)) {
                String errorInfo = intent.getStringExtra(Constants.EXTRA_VIDEO_ERROR_INFO);
                Timber.d("Video Playback Error %s", errorInfo);

                WritableMap wm = Arguments.createMap();
                wm.putString("errorInfo", errorInfo);
                EventEmitter.send(reactContext, "VideoError", wm);
            }
            else if (action.equals(Constants.ACTION_VIDEO_PLAYBACK_PROGRESS)) {
                int elapsedTime = intent.getIntExtra(Constants.EXTRA_VIDEO_PLAYBACK_PROGRESS, 0);
                Timber.d("Fullscreen Elapsed Time %d", elapsedTime);

                WritableMap wm = Arguments.createMap();
                wm.putInt("elapsedTime", elapsedTime);
                EventEmitter.send(reactContext, "VideoProgress", wm);
            }
        }
    };
}