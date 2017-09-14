package co.backbonelabs.backbone;

public interface ExpansionDownloaderInfo {
    /**
     * Here is where you place the data that the validator will use to determine
     * if the file was delivered correctly. This is encoded in the source code
     * so the application can easily determine whether the file has been
     * properly delivered without having to talk to the server. If the
     * application is using LVL for licensing, it may make sense to eliminate
     * these checks and to just rely on the server.
     */
    XAPKFile getMainXAPK();
    XAPKFile getPatchXAPK();
}
