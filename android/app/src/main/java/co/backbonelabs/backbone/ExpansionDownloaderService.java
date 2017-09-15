package co.backbonelabs.backbone;

import com.google.android.vending.expansion.downloader.impl.DownloaderService;

public class ExpansionDownloaderService extends DownloaderService {
    public static String BASE64_PUBLIC_KEY;
    public static byte[] SALT;

    public static void setPublicKey(String BASE64_PUBLIC_KEY) {
        ExpansionDownloaderService.BASE64_PUBLIC_KEY = BASE64_PUBLIC_KEY;
    }

    @Override
    public String getPublicKey() {
        return BASE64_PUBLIC_KEY;
    }

    public static void setSALT(byte[] SALT) {
        ExpansionDownloaderService.SALT = SALT;
    }

    @Override
    public byte[] getSALT() {
        return SALT;
    }

    @Override
    public String getAlarmReceiverClassName() {
        return ExpansionDownloaderReceiver.class.getName();
    }
}
