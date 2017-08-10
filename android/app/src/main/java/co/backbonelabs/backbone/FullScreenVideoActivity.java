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
import android.widget.Toast;
import android.widget.VideoView;

import com.bugsnag.android.Bugsnag;

import timber.log.Timber;

public class FullScreenVideoActivity extends AppCompatActivity {
    private String videoPath;

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
            progressDialog = ProgressDialog.show(FullScreenVideoActivity.this, "", "Buffering video...", true);
            progressDialog.setCancelable(true); // allow dialog to be dismissed with back button
            progressDialog.setCanceledOnTouchOutside(false); // prevent dialog from being dismissed when touching outside the dialog
            PlayVideo();
        }
        else {
            Toast.makeText(FullScreenVideoActivity.this, "Video not found", Toast.LENGTH_SHORT).show();
        }
    }

    private void PlayVideo() {
        try {
            getWindow().setFormat(PixelFormat.TRANSLUCENT);
            MediaController mediaController = new MediaController(FullScreenVideoActivity.this);
            mediaController.setAnchorView(myVideoView);

            Uri video = Uri.parse(videoPath);
            Timber.d("Video uri: %s", video.toString());
            myVideoView.setMediaController(mediaController);
            myVideoView.setVideoURI(video);
            myVideoView.requestFocus();
            myVideoView.setOnCompletionListener(new MediaPlayer.OnCompletionListener() {
                @Override
                public void onCompletion(MediaPlayer mp) {
                    Timber.d("onCompletion called");
                    if (hasMediaPlayerError) {
                        Timber.e("MediaPlayer error");
                        Timber.d("Dismissing progress dialog");
                        progressDialog.dismiss();
                        Timber.d("Closing %s", TAG);
                        finish();
                    }
                }
            });
            myVideoView.setOnErrorListener(new MediaPlayer.OnErrorListener() {
                @Override
                public boolean onError(MediaPlayer mp, int what, int extra) {
                    Timber.e("onError called %d %d", what, extra);
                    hasMediaPlayerError = true;
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
                    progressDialog.dismiss();
                    myVideoView.start();
                }
            });


        } catch (Exception e) {
            Timber.e("PlayVideo error %s", e.toString());
            progressDialog.dismiss();
            Bugsnag.notify(e);
            Log.e(TAG, "Video play error: " + e.toString());
            finish();
        }

    }
}