package co.backbonelabs.backbone.util;

import android.os.Build;
import android.os.Environment;

import com.facebook.react.bridge.WritableMap;

import java.io.BufferedWriter;
import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;

public class DeviceLogger {
    private static boolean isExternalStorageAvailable() {
        String state = Environment.getExternalStorageState();
        return state.equals(Environment.MEDIA_MOUNTED);
    }

    private static String getCurrentLogFileName() {
        // Use periods instead of colons for time because colons are not supported in filenames for iOS and OS X
        // so we'll just use the same format across all platforms
        String today = new SimpleDateFormat("yyyy-MM-dd HH.mm.ss").format(Calendar.getInstance().getTime());
        return "acc-log-" + today + ".csv";
    }

    public static void logAccelerometer(ArrayList<WritableMap> data) {
        // Check if we have access to the external storage beforehand
        if (!isExternalStorageAvailable()) {
            return;
        }

        String fileDir = Environment.getExternalStorageDirectory() + "/Backbone";
        String fileName = DeviceLogger.getCurrentLogFileName();
        String filePath = fileDir + "/" + fileName;

        File dir = new File(fileDir);
        File logFile = new File(filePath);

        if (!dir.exists()) {
            dir.mkdir();
        }

        try {
            if (!logFile.exists()) {
                logFile.createNewFile();
            }

            FileWriter fw = new FileWriter(logFile.getAbsoluteFile());
            BufferedWriter bw = new BufferedWriter(fw);

            bw.append("Date-Time,x,y,z");
            bw.newLine();

            for (int i = 0; i < data.size(); i++) {
                WritableMap row = data.get(i);
                bw.append(String.format("%s,%f,%f,%f", row.getString("dateTime"), row.getDouble("xAxis"), row.getDouble("yAxis"), row.getDouble("zAxis")));
                bw.newLine();
            }
//            String now = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss.SSSS").format(Calendar.getInstance().getTime());
            bw.flush();
            bw.close();
            fw.close();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
