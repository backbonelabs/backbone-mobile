package co.backbonelabs.backbone;

import android.app.PendingIntent;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.os.Environment;
import android.os.Messenger;
import android.util.Log;

import com.android.vending.expansion.zipfile.APKExpansionSupport;
import com.android.vending.expansion.zipfile.ZipResourceFile;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;
import com.google.android.vending.expansion.downloader.DownloadProgressInfo;
import com.google.android.vending.expansion.downloader.DownloaderClientMarshaller;
import com.google.android.vending.expansion.downloader.DownloaderServiceMarshaller;
import com.google.android.vending.expansion.downloader.Helpers;
import com.google.android.vending.expansion.downloader.IDownloaderClient;
import com.google.android.vending.expansion.downloader.IDownloaderService;
import com.google.android.vending.expansion.downloader.IStub;
import com.google.android.vending.expansion.downloader.impl.DownloadNotification;

import java.io.File;
import java.io.IOException;

import co.backbonelabs.backbone.util.Constants;
import co.backbonelabs.backbone.util.EventEmitter;
import co.backbonelabs.backbone.util.Utilities;
import timber.log.Timber;

public class ExpansionService extends ReactContextBaseJavaModule implements IDownloaderClient, ExpansionDownloaderInfo {
    private static ReactApplicationContext reactContext;

    private XAPKFile mainXAPK = null;
    private XAPKFile patchXAPK = null;
    protected static ExpansionDownloaderInfo DLinfo = null;

    private IDownloaderService mRemoteService;
    private IStub mDownloaderClientStub;
    private int currentState = Constants.EXPANSION_LOADER_STATES.CHECKING;

    /**
     * Public constructor
     * @param reactContext
     */
    public ExpansionService(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;

        // Setup for downloading expansions
        setInfo(this);
        ExpansionDownloaderService.setPublicKey(getLVLKey());
        ExpansionDownloaderService.setSALT(getSALT());

        // Check and load-up any downloaded expansions
        if ( this.mainXAPK == null ) this.mainXAPK = expansionFilePath(true);
        if ( this.patchXAPK == null ) this.patchXAPK = expansionFilePath(false);
    }

    @Override
    public String getName() {
        return "ExpansionService";
    }

    /**
     * Associate the download Activity with an implementation of ExpansionDownloaderInfo providing
     * information by the client app required for this activity.
     * @param i DownloaderInfo implementation
     */
    static public void setInfo(ExpansionDownloaderInfo i){
        DLinfo = i;
    };

    /**
     * Check the main APK Expansion files and determine if the files are present and match the required size.
     * @return XAPKFile with its filepath set to proper path if it is present. it is set null if missing ( may be not needed ).
     */
    protected XAPKFile expansionFilePath(boolean main) {
        try {
            if ( DLinfo == null ) {
                throw new NullPointerException(" ERROR : DLinfo is not set ! ");
            }
            else {
                XAPKFile xf = main? DLinfo.getMainXAPK() : DLinfo.getPatchXAPK();
                if (xf != null) {
                    String expFileName = Helpers.getExpansionAPKFileName(reactContext, true, xf.mFileVersion);
                    String expFilePath = Helpers.generateSaveFileName(reactContext, expFileName);
                    Timber.d("XApk File Name %s", expFileName);
                    if ((xf.mCheckEnabled && Helpers.doesFileExist(reactContext, expFileName, xf.mFileSize, false))
                            || (!xf.mCheckEnabled && new File(expFilePath).exists())) {
                        Timber.d("XApk Found %s", expFilePath);
                        xf.setFilePath(expFilePath);
                    }
                    else {
                        Log.e("XApk Error", "Missing " + (main?"Main":"Patch") + " XAPK at : " + expFilePath );
                        if (xf.mCheckEnabled) {
                            Log.e("XApk Error", "Expected Size = " + xf.mFileSize);
                        }
                    }
                }
                return xf;
            }
        } catch (NullPointerException e) {
            Log.e("XApk Error", "NullPointerException");
            e.printStackTrace();
        }
        return null;
    }

    public static int getVersionCode() {
        // Temporarily set to 226 for testing as this is the alpha version when the current expansion file was uploaded.
        // When we started updating only the APK, and no new expansion needed, the version should be kept
        // to the version where the expansion was uploaded against
        return 226;
    }

    @Override
    public XAPKFile getMainXAPK() {
        return new XAPKFile(
                getVersionCode(), // the version of the APK that the file was uploaded against
                83191912L, //BuildConfig.OBB_SIZE, // the length of the file in bytes, ignored for now
                false // ignores the size check and the zip CRC checks.
        );
    }

    public XAPKFile getPatchXAPK() {
        return null; // unused for now
    }

    public String getLVLKey() {
        // return our public LVL key
        return "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAl6K9a2f0F73FDZtRiKd11SJEsF8idxkqDy3AJ8Yin6GqIk2/YBDYHm3UimnUIzu1lGerOQp0qY34e2/T4dD6kM1oKH+X2TW+9ouz1phTFxvJ9EPcoEpz4rnmJpgoWrIucn4hCtu7vQiW86yEwnmE26zVHerNzt6vWUpUO30etRGlvtfGhyqT4UkUFgG7i8WKloh41eTtzBfBs7qbhx1VjvCU1AJlsJDlAGTVg8g0WHGdovvkPFIhOVHXsAOhyaI8ZJBWX9m6ncg6M6s5aeuiJYvqb2ox0LYX6K6XUegGqcXNb55SARa3KkiZripmCyxyoeOMl03nz89lgo78PfrJgQIDAQAB";
    }

    public byte[] getSALT() {
        // return default SALT
        return new byte[] { 1, 42, -12, -1, 54, 98, -100, -12, 43, 2, -8, -4, 9, 5, -106, -42, -33, 45, -1, 84 };
    }

    /**
     * Check if the expansion files exist and perform appropriate actions
     */
    @ReactMethod
    public void getExpansionFileState(Callback callback) {
        currentState = Constants.EXPANSION_LOADER_STATES.CHECKING;

        boolean expansionState;
        File gifPath = new File(Environment.getExternalStorageDirectory() + "/" + Constants.DATA_PATH + "/" +
                reactContext.getPackageName() + "/" + Constants.GIF_PATH + "/");
        File thumbnailPath = new File(Environment.getExternalStorageDirectory() + "/" + Constants.DATA_PATH + "/" +
                reactContext.getPackageName() + "/" + Constants.THUMBNAIL_PATH + "/");
        int gifCount = 0;
        int thumbCount = 0;

        if (gifPath.exists()) {
            for (File file : gifPath.listFiles()) {
                if (file.isFile() && file.getName().endsWith(".gif")) {
                    gifCount++;
                }
            }
        }

        if (thumbnailPath.exists()) {
            for (File file : thumbnailPath.listFiles()) {
                if (file.isFile() && file.getName().endsWith(".jpg")) {
                    thumbCount++;
                }
            }
        }

        // Check if all the gifs are available by checking the total file count.
        // In the future, we might need to do a more secure validation on this.
        if (gifCount != Constants.GIF_FILE_COUNT || thumbCount != Constants.THUMBNAIL_FILE_COUNT) {
            // One or more files are missing, proceed to unzip the expansion, or download a new one if needed
            Timber.d("Expansion Error. One or more files are missing. Found %d GIFs and %d JPGs, expected %d GIFs and %d JPGs", gifCount, thumbCount, Constants.GIF_FILE_COUNT, Constants.THUMBNAIL_FILE_COUNT);
            expansionState = false;
        }
        else {
            Timber.d("All files found. Got %d files", gifCount + thumbCount);
            expansionState = true;
        }

        WritableMap response = Arguments.createMap();
        response.putBoolean("state", expansionState);
        callback.invoke(response);
    }

    /**
     * Start reloading the expansion files, including re-downloading them when required
     */
    @ReactMethod
    public void loadExpansionFile() {
        if ((mainXAPK != null && mainXAPK.getFilePath().isEmpty())){
            // Check if WiFi is enabled before proceeding when the expansion is over 100MB,
            // but for now we just check if the internet connection is active as it's < 100MB.
            if (Utilities.checkInternetConnection(reactContext)) {
                // Original expansion file is missing, proceed to re-downloading
                Timber.d("Downloading the expansion");
                currentState = Constants.EXPANSION_LOADER_STATES.DOWNLOADING;
                WritableMap wm = Arguments.createMap();
                wm.putInt("state", currentState);
                EventEmitter.send(reactContext, "ExpansionLoaderState", wm);

                Intent notificationIntent = new Intent(getCurrentActivity(), MainActivity.class);
                notificationIntent.setAction(Intent.ACTION_MAIN);
                notificationIntent.addCategory(Intent.CATEGORY_LAUNCHER);
                notificationIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);

                // Create a pending intent for the intent to launch the app
                PendingIntent launchApp = PendingIntent.getActivity(getCurrentActivity(), 0, notificationIntent, 0);

                try {
                    DownloaderClientMarshaller.startDownloadServiceIfRequired(getCurrentActivity(), launchApp, ExpansionDownloaderService.class);
                } catch (PackageManager.NameNotFoundException e) {
                    e.printStackTrace();
                }

                // Start the actual downloader client
                mDownloaderClientStub = DownloaderClientMarshaller.CreateStub(this, ExpansionDownloaderService.class);
                mDownloaderClientStub.connect(reactContext);
            }
            else {
                // Not connected to the Internet, prevent users from downloading.
                Timber.d("Not Connected to the Internet");
                currentState = Constants.EXPANSION_LOADER_STATES.ERROR;
                WritableMap wm = Arguments.createMap();
                wm.putInt("state", currentState);
                wm.putString("message", "Please make sure you are connected to the internet and try again.");
                EventEmitter.send(reactContext, "ExpansionLoaderState", wm);
            }
        }
        else {
            // Expansion file found, proceed to unzipping
            Timber.d("Unzipping the expansion");
            downloadCompleted();
        }
    }

    /**
     * Critical implementation detail. In onServiceConnected we create the
     * remote service and marshaller. This is how we pass the client information
     * back to the service so the client can be properly notified of changes. We
     * must do this every time we reconnect to the service.
     */
    @Override
    public void onServiceConnected(Messenger m) {
        mRemoteService = DownloaderServiceMarshaller.CreateProxy(m);
        mRemoteService.onClientUpdated(mDownloaderClientStub.getMessenger());
    }

    /**
     * Listen to any changes to the downloader client
     */
    @Override
    public void onDownloadStateChanged(int newState) {
        switch (newState) {
            case IDownloaderClient.STATE_IDLE:
                break;
            case IDownloaderClient.STATE_CONNECTING:
            case IDownloaderClient.STATE_FETCHING_URL:
                break;
            case IDownloaderClient.STATE_DOWNLOADING:
                break;
            case IDownloaderClient.STATE_FAILED_CANCELED:
            case IDownloaderClient.STATE_FAILED:
            case IDownloaderClient.STATE_FAILED_FETCHING_URL:
            case IDownloaderClient.STATE_FAILED_UNLICENSED:
                downloadFailed();
                break;
            case IDownloaderClient.STATE_PAUSED_NEED_CELLULAR_PERMISSION:
            case IDownloaderClient.STATE_PAUSED_WIFI_DISABLED_NEED_CELLULAR_PERMISSION:
                break;
            case IDownloaderClient.STATE_PAUSED_BY_REQUEST:
                break;
            case IDownloaderClient.STATE_PAUSED_ROAMING:
            case IDownloaderClient.STATE_PAUSED_SDCARD_UNAVAILABLE:
                break;
            case IDownloaderClient.STATE_COMPLETED:
                downloadCompleted();
                return;
        }
    }

    /**
     * Sets the state of the various controls based on the progressinfo object
     * sent from the downloader service.
     */
    @Override
    public void onDownloadProgress(DownloadProgressInfo progress) {
        int percentage = (int)(progress.mOverallProgress * 100 / progress.mOverallTotal);
        Timber.d("Expansion Progress %d", percentage);
        WritableMap wm = Arguments.createMap();
        wm.putInt("percentage", percentage);
        EventEmitter.send(reactContext, "ExpansionDownloadProgress", wm);
    }

    private void downloadFailed() {
        // Expansion download has failed, notify RN
        currentState = Constants.EXPANSION_LOADER_STATES.ERROR;
        WritableMap wm = Arguments.createMap();
        wm.putInt("state", currentState);
        wm.putString("message", "Unexpected error occurred. Make sure you are connected to the internet and try again.");
        EventEmitter.send(reactContext, "ExpansionLoaderState", wm);
    }

    private void downloadCompleted() {
        // Clear the downloader notification after completed
        NotificationService.clearNotification(DownloadNotification.NOTIFICATION_ID);

        // Expansion download has completed, proceed to unzipping
        unzipExpansion();
    }

    private void unzipExpansion() {
        // Prevent invalid states from proceeding
        if (currentState != Constants.EXPANSION_LOADER_STATES.CHECKING && currentState != Constants.EXPANSION_LOADER_STATES.DOWNLOADING) {
            return;
        }

        currentState = Constants.EXPANSION_LOADER_STATES.UNZIPPING;
        WritableMap unzippingState = Arguments.createMap();
        unzippingState.putInt("state", currentState);
        EventEmitter.send(reactContext, "ExpansionLoaderState", unzippingState);

        ZipResourceFile expansionFile;

        try {
            expansionFile = APKExpansionSupport.getAPKExpansionZipFile(reactContext, getVersionCode(), 0);

            ZipResourceFile.ZipEntryRO[] zip = expansionFile.getAllEntries();

            File file = new File(Environment.getExternalStorageDirectory() + "/" + Constants.DATA_PATH + "/" +
                    reactContext.getPackageName() + "/" + Constants.DOWNLOAD_PATH + "/");

            if (!file.exists()) {
                file.mkdirs();
            }

            ZipHelper zipHelper = new ZipHelper();
            zipHelper.unzip(zip[0].mZipFileName, file);

            if (file.exists()) {
                Timber.d("Unzipping completed at: %s", file.getAbsolutePath());
                currentState = Constants.EXPANSION_LOADER_STATES.COMPLETED;
                WritableMap completedState = Arguments.createMap();
                completedState.putInt("state", currentState);
                EventEmitter.send(reactContext, "ExpansionLoaderState", completedState);
            }
        } catch (IOException e) {
            Log.e("Xpansion", "Unzipping error");
            e.printStackTrace();
        }
    }
}
