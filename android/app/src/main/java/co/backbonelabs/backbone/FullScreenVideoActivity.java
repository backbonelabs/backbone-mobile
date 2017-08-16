package co.backbonelabs.backbone;

import android.app.ProgressDialog;
import android.content.Intent;
import android.content.pm.ActivityInfo;
import android.graphics.PixelFormat;
import android.media.MediaPlayer;
import android.net.Uri;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.util.Log;
import android.widget.MediaController;
import android.widget.VideoView;

import com.bugsnag.android.Bugsnag;

import java.util.Timer;
import java.util.TimerTask;

import co.backbonelabs.backbone.util.Constants;
import timber.log.Timber;

public class FullScreenVideoActivity extends AppCompatActivity {
    private String videoPath;
    private int elapsedTime;
    private boolean isLoop;
    private int currentTime;
    private Timer timer;

    private static ProgressDialog progressDialog;
    VideoView myVideoView;

    private final String TAG = FullScreenVideoActivity.this.getClass().getSimpleName();
    private boolean hasMediaPlayerError = false;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_SENSOR);
        setContentView(R.layout.player_fullscreen);
        Intent i = getIntent();
        if(i != null){
            myVideoView = (VideoView) findViewById(R.id.videoView);
            videoPath = i.getStringExtra("VIDEO_URL");
            elapsedTime = i.getIntExtra("ELAPSED_TIME", 0) * 1000; // Convert to milliseconds
            isLoop = i.getBooleanExtra("IS_LOOP", false);
            progressDialog = ProgressDialog.show(FullScreenVideoActivity.this, "", "Buffering video...", true);
            progressDialog.setCancelable(true); // allow dialog to be dismissed with back button
            progressDialog.setCanceledOnTouchOutside(false); // prevent dialog from being dismissed when touching outside the dialog
            PlayVideo();
        }
        else {
            Intent intent = new Intent(Constants.ACTION_VIDEO_PLAYBACK_ERROR);
            Bundle mBundle = new Bundle();
            mBundle.putString(Constants.EXTRA_VIDEO_ERROR_INFO, "Video not found");
            intent.putExtras(mBundle);
            MainActivity.currentActivity.sendBroadcast(intent);
        }
    }

    @Override
    protected void onStop() {
        Timber.d("Last elapsed time %d", currentTime);
        if (timer != null) {
            timer.cancel();
        }

        // Attempt to sync the elapsed time in fullscreen video to the RN player
        Intent intent = new Intent(Constants.ACTION_VIDEO_PLAYBACK_PROGRESS);
        Bundle mBundle = new Bundle();
        mBundle.putInt(Constants.EXTRA_VIDEO_PLAYBACK_PROGRESS, currentTime / 1000); // Convert back to seconds
        intent.putExtras(mBundle);
        MainActivity.currentActivity.sendBroadcast(intent);

        super.onStop();
    }

    private void PlayVideo() {
        try {
            getWindow().setFormat(PixelFormat.TRANSLUCENT);
            MediaController mediaController = new MediaController(FullScreenVideoActivity.this);
            mediaController.setAnchorView(myVideoView);

            Uri video = Uri.parse(videoPath);
            Timber.d("Video uri: %s", video.toString());
            Timber.d("Elapsed time: %d", elapsedTime);
            myVideoView.setMediaController(mediaController);
            myVideoView.setVideoURI(video);
            myVideoView.requestFocus();
            myVideoView.seekTo(elapsedTime);
            myVideoView.setOnCompletionListener(new MediaPlayer.OnCompletionListener() {
                @Override
                public void onCompletion(MediaPlayer mp) {
                    Timber.d("onCompletion called");

                    if (timer != null) {
                        timer.cancel();
                    }

                    if (hasMediaPlayerError) {
                        Timber.e("MediaPlayer error");
                        Timber.d("Dismissing progress dialog");
                        progressDialog.dismiss();
                        finish();
                        Timber.d("Closing %s", TAG);
                    }
                    else if (isLoop) {
                        // Loop the video
                        myVideoView.start();
                    }
                    else {
                        // Exit fullscreen after playback completion
                        Intent intent = new Intent(Constants.ACTION_VIDEO_PLAYBACK_ENDED);
                        MainActivity.currentActivity.sendBroadcast(intent);
                        finish();
                    }
                }
            });
            myVideoView.setOnErrorListener(new MediaPlayer.OnErrorListener() {
                @Override
                public boolean onError(MediaPlayer mp, int what, int extra) {
                    Timber.e("onError called %d %d", what, extra);
                    hasMediaPlayerError = true;

                    if (timer != null) {
                        timer.cancel();
                    }

                    Intent intent = new Intent(Constants.ACTION_VIDEO_PLAYBACK_ERROR);
                    Bundle mBundle = new Bundle();
                    String errorInfo = String.format("Error Code: %d [Extra: %d]", what, extra);
                    mBundle.putString(Constants.EXTRA_VIDEO_ERROR_INFO, errorInfo);
                    intent.putExtras(mBundle);
                    MainActivity.currentActivity.sendBroadcast(intent);

                    Bugsnag.notify(
                            new Exception(String.format("MediaController error. what = %d, extra = %d", what, extra))
                    );
                    // return false so the default error dialog is shown indicating video can't be played
                    return false;
                }
            });
            myVideoView.setOnPreparedListener(new MediaPlayer.OnPreparedListener() {
                @Override
                public void onPrepared(MediaPlayer mp) {
                    Timber.d("Video prepared, now starting video");
                    Intent intent = new Intent(Constants.ACTION_VIDEO_PLAYER_LOADED);
                    MainActivity.currentActivity.sendBroadcast(intent);

                    progressDialog.dismiss();
                    myVideoView.start();

                    if (timer == null) {
                        timer = new Timer();
                    }
                    else {
                        timer.cancel();
                    }

                    TimerTask task = new TimerTask() {
                        @Override
                        public void run() {
                            // Update current elapsed time to be passed back to RN upon exiting fullscreen
                            // in order to sync with the elapsed time in the RN player
                            if (myVideoView.isPlaying()) {
                                currentTime = myVideoView.getCurrentPosition();
                            }
                        }
                    };
                    timer.schedule(task, 0, 250);
                }
            });


        } catch (Exception e) {
            Timber.e("PlayVideo error %s", e.toString());

            Intent intent = new Intent(Constants.ACTION_VIDEO_PLAYBACK_ERROR);
            Bundle mBundle = new Bundle();
            mBundle.putString(Constants.EXTRA_VIDEO_ERROR_INFO, e.toString());
            intent.putExtras(mBundle);
            MainActivity.currentActivity.sendBroadcast(intent);

            progressDialog.dismiss();
            Bugsnag.notify(e);
            Log.e(TAG, "Video play error: " + e.toString());
            finish();
        }

    }
}