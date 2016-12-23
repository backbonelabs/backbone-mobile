package co.backbonelabs.backbone;

import android.bluetooth.BluetoothGatt;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.os.Handler;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;

import java.io.File;
import java.util.ArrayList;

import co.backbonelabs.backbone.util.Constants;
import co.backbonelabs.backbone.util.EventEmitter;
import co.backbonelabs.backbone.util.OTAFileParser;
import co.backbonelabs.backbone.util.OTAFlashRowModel;
import co.backbonelabs.backbone.util.Utilities;
import timber.log.Timber;

import static co.backbonelabs.backbone.util.Constants.BOOTLOADER_COMMANDS.*;
import static co.backbonelabs.backbone.util.Constants.BOOTLOADER_GENERAL_CONSTANTS.*;
import static co.backbonelabs.backbone.util.Constants.BOOTLOADER_BYTE_TYPES.*;
import static co.backbonelabs.backbone.util.Constants.BOOTLOADER_ERROR_CONSTANTS.*;

public class BootLoaderService extends ReactContextBaseJavaModule implements OTAFileParser.FileReadStatusUpdater {
    private static BootLoaderService instance = null;
    private ReactApplicationContext reactContext;

    private int bootLoaderState;
    private boolean hasPendingUpdate;
    private String firmwareFilePath;
    private int fileWritingProgress;

    private int rowNumber;
    private int rowStartPos;
    private int fileTotalLines;

    private String currentSiliconID;
    private String currentSiliconRev;
    private String checkSumType;
    private ArrayList<OTAFlashRowModel> flashRowList;
    private int currentArrayID;
    private boolean fileReadHandlerFlag = true;

    private int currentCommandCode;
    private int startRow;
    private int endRow;

    public static BootLoaderService getInstance() {
        return instance;
    }

    public static BootLoaderService getInstance(ReactApplicationContext reactContext) {
        if (instance == null) {
            instance = new BootLoaderService(reactContext);
        }
        return instance;
    }

    private BootLoaderService(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;

        bootLoaderState = Constants.BOOTLOADER_STATES.OFF;

        IntentFilter filter = new IntentFilter();
        filter.addAction(Constants.ACTION_CHARACTERISTIC_FOUND);
        filter.addAction(Constants.ACTION_CHARACTERISTIC_UPDATE);
        filter.addAction(Constants.ACTION_CHARACTERISTIC_WRITE);
        reactContext.registerReceiver(bleBroadcastReceiver, filter);
    }

    @Override
    public String getName() {
        return "BootLoaderService";
    }

    @ReactMethod
    public void initiateFirmwareUpdate(final String path) {
        BluetoothService bluetoothService = BluetoothService.getInstance();

        if (bluetoothService.isDeviceReady() && path != null) {
//            path = "/sdcard/Android/data/co.backbonelabs.backbone/BackBone.cyacd";
            boolean fileExists = new File(path).exists();

            if (!fileExists) {
                Timber.d("File not exists! %s", path);
                firmwareUpdateStatus(Constants.FIRMWARE_UPDATE_STATES.INVALID_FILE);
            }
            else {
                firmwareFilePath = path;

                firmwareUpdateStatus(Constants.FIRMWARE_UPDATE_STATES.BEGIN);

                Timber.d("File exists %d", bootLoaderState);

                if (bootLoaderState == Constants.BOOTLOADER_STATES.OFF) {
                    if (bluetoothService.hasCharacteristic(Constants.CHARACTERISTIC_UUIDS.ENTER_BOOTLOADER_CHARACTERISTIC)) {
                        enterBootLoaderMode();
                    }
                    else {
                        firmwareUpdateStatus(Constants.FIRMWARE_UPDATE_STATES.INVALID_SERVICE);
                    }
                }
                else if (bootLoaderState == Constants.BOOTLOADER_STATES.ON) {
                    if (bluetoothService.hasCharacteristic(Constants.CHARACTERISTIC_UUIDS.BOOTLOADER_CHARACTERISTIC)) {
                        prepareFirmwareFile();
                    }
                    else {
                        firmwareUpdateStatus(Constants.FIRMWARE_UPDATE_STATES.INVALID_SERVICE);
                    }
                }
            }
        }
        else {
            firmwareUpdateStatus(Constants.FIRMWARE_UPDATE_STATES.INVALID_SERVICE);
        }
    }

    public int getBootLoaderState() {
        return bootLoaderState;
    }

    private void firmwareUploadSuccess() {
        // Delete the firmware file after a successful update
        // NOTE: Keep it commented for development purposes to preserve the file for multiple tests
//        if (new File(firmwareFilePath).delete()) {
//            Timber.d("Firmware file deleted");
//        }

        bootLoaderState = Constants.BOOTLOADER_STATES.UPDATED;
    }

    private void firmwareUploadFailed() {
        firmwareUpdateStatus(Constants.FIRMWARE_UPDATE_STATES.END_ERROR);
    }

    private void firmwareUploadProgress() {
        Timber.d("Firmware Upload Progress: %d", fileWritingProgress);
        WritableMap wm = Arguments.createMap();
        wm.putInt("percentage", fileWritingProgress);
        EventEmitter.send(reactContext, "FirmwareUploadProgress", wm);
    }

    private void firmwareUpdateStatus(int status) {
        Timber.d("Firmware Update State: %d", status);
        WritableMap wm = Arguments.createMap();
        wm.putInt("status", status);
        EventEmitter.send(reactContext, "FirmwareUpdateStatus", wm);
    }

    public void firmwareUpdated() {
        bootLoaderState = Constants.BOOTLOADER_STATES.OFF;

        firmwareUpdateStatus(Constants.FIRMWARE_UPDATE_STATES.END_SUCCESS);
    }

    private void enterBootLoaderMode() {
        BluetoothService bluetoothService = BluetoothService.getInstance();

        bootLoaderState = Constants.BOOTLOADER_STATES.INITIATED;
        hasPendingUpdate = true;

        byte[] commandBytes = new byte[]{0x11, 0x22, 0x33, 0x44, 0x55, 0x66, 0x77, (byte)0x88};

        bluetoothService.writeToCharacteristic(Constants.CHARACTERISTIC_UUIDS.ENTER_BOOTLOADER_CHARACTERISTIC, commandBytes);
    }

    private final BroadcastReceiver bleBroadcastReceiver = new BroadcastReceiver() {
        @Override
        public void onReceive(Context context, Intent intent) {
            BluetoothService bluetoothService = BluetoothService.getInstance();
            final String action = intent.getAction();
            Timber.d("Receive Broadcast %s", action);

            if (action.equals(Constants.ACTION_CHARACTERISTIC_FOUND)) {
                String uuid = intent.getStringExtra(Constants.EXTRA_BYTE_UUID_VALUE);

                if (uuid.equals(Constants.CHARACTERISTIC_UUIDS.BOOTLOADER_CHARACTERISTIC.toString())) {
//                    if (!bluetoothService.getBondedState()) {
//                        bluetoothService.pairDevice();
//                    }

                    bootLoaderState = Constants.BOOTLOADER_STATES.ON;

                    if (hasPendingUpdate) {
                        prepareFirmwareFile();
                    }
                    else {
                        firmwareUpdateStatus(Constants.FIRMWARE_UPDATE_STATES.PENDING);
                    }

                    bluetoothService.toggleCharacteristicNotification(Constants.CHARACTERISTIC_UUIDS.BOOTLOADER_CHARACTERISTIC, true);
                }
            }
            else if (action.equals(Constants.ACTION_CHARACTERISTIC_UPDATE)) {
                byte[] responseArray = intent.getByteArrayExtra(Constants.EXTRA_BYTE_VALUE);
                String uuid = intent.getStringExtra(Constants.EXTRA_BYTE_UUID_VALUE);

                if (uuid.equals(Constants.CHARACTERISTIC_UUIDS.BOOTLOADER_CHARACTERISTIC.toString())) {
                    Timber.d("Bootloader Value Update");
                    String hexValue = Utilities.ByteArraytoHex(responseArray);

                    Timber.d("hexValue %s", hexValue);
                    switch (currentCommandCode) {
                        case Constants.BOOTLOADER_COMMANDS.ENTER_BOOTLOADER: {
                            String result = hexValue.trim().replace(" ", "");
                            String response = result.substring(RESPONSE_START, RESPONSE_END);

                            int responseBytes = Integer.parseInt(response, RADIX);
                            switch (responseBytes) {
                                case CASE_SUCCESS:
                                    String siliconID = result.substring(SILICON_ID_START, SILICON_ID_END);
                                    String siliconRev = result.substring(SILICON_REV_START, SILICON_REV_END);

                                    if (siliconID.equalsIgnoreCase(currentSiliconID) && siliconRev.equalsIgnoreCase(currentSiliconRev)) {
                                        OTAFlashRowModel modelData = flashRowList.get(0);
                                        byte[] data = new byte[1];
                                        data[0] = (byte) modelData.mArrayId;
                                        currentArrayID = Byte.valueOf(data[0]);

                                        /**
                                         * Writing the next command
                                         * Changing the shared preference value
                                         */
                                        int dataLength = data.length;
                                        OTAGetFlashSizeCmd(data, checkSumType, dataLength);

                                        currentCommandCode = GET_FLASH_SIZE;
                                    }
                                    break;
                                default:
                                    break;
                            }
                        }
                        break;
                        case GET_FLASH_SIZE: {
                            String result = hexValue.trim().replace(" ", "");
                            String response = result.substring(RESPONSE_START, RESPONSE_END);

                            int responseBytes = Integer.parseInt(response, RADIX);
                            switch (responseBytes) {
                                case CASE_SUCCESS:
                                    startRow = Utilities.swap(Integer.parseInt(result.substring(START_ROW_START, START_ROW_END), RADIX));
                                    endRow = Utilities.swap(Integer.parseInt(result.substring(END_ROW_START, END_ROW_END), RADIX));

                                    writeProgrammableData(rowNumber);
                                    break;
                                default:
                                    break;
                            }
                        }
                        break;
                        case SEND_DATA: {
                            String result = hexValue.trim().replace(" ", "");
                            String response = result.substring(RESPONSE_START, RESPONSE_END);
                            String status = result.substring(STATUS_START, STATUS_END);
                            int responseBytes = Integer.parseInt(response, RADIX);
                            switch (responseBytes) {
                                case CASE_SUCCESS:
                                    if (status.equalsIgnoreCase("00")) {
                                        writeProgrammableData(rowNumber);
                                    }
                                    break;
                                default:

                                    break;
                            }
                        }
                        break;
                        case PROGRAM_ROW: {
                            String result = hexValue.trim().replace(" ", "");
                            String response = result.substring(RESPONSE_START, RESPONSE_END);
                            String status = result.substring(STATUS_START, STATUS_END);
                            int responseBytes = Integer.parseInt(response, RADIX);
                            switch (responseBytes) {
                                case CASE_SUCCESS:
                                    if (status.equalsIgnoreCase("00")) {
                                        /**
                                         * Program Row Status Verified
                                         * Sending Next command
                                         */
                                        OTAFlashRowModel modelData = flashRowList.get(rowNumber);
                                        long rowMSB = Long.parseLong(modelData.mRowNo.substring(0, 2), 16);
                                        long rowLSB = Long.parseLong(modelData.mRowNo.substring(2, 4), 16);

                                        /**
                                         * Writing the next command
                                         * Changing the shared preference value
                                         */
                                        OTAVerifyRowCmd(rowMSB, rowLSB, modelData, checkSumType);
                                        currentCommandCode = VERIFY_ROW;
                                    }
                                    break;
                                default:
                                    break;
                            }
                        }
                        break;
                        case VERIFY_ROW: {
                            String result = hexValue.trim().replace(" ", "");
                            String response = result.substring(RESPONSE_START, RESPONSE_END);
                            String checksum = result.substring(DATA_START, DATA_END);
                            int responseBytes = Integer.parseInt(response, RADIX);
                            switch (responseBytes) {
                                case CASE_SUCCESS:
                                    if (response.equalsIgnoreCase("00")) {
                                        /**
                                         * Program Row Status Verified
                                         * Sending Next command
                                         */
                                        OTAFlashRowModel modelData = flashRowList.get(rowNumber);
                                        long rowMSB = Long.parseLong(modelData.mRowNo.substring(0, 2), 16);
                                        long rowLSB = Long.parseLong(modelData.mRowNo.substring(2, 4), 16);

                                        byte[] checkSumVerify = new byte[6];
                                        checkSumVerify[0] = (byte) modelData.mRowCheckSum;
                                        checkSumVerify[1] = (byte) modelData.mArrayId;
                                        checkSumVerify[2] = (byte) rowMSB;
                                        checkSumVerify[3] = (byte) rowLSB;
                                        checkSumVerify[4] = (byte) (modelData.mDataLength);
                                        checkSumVerify[5] = (byte) ((modelData.mDataLength) >> 8);
                                        String fileCheckSumCalculated = Integer.toHexString(Utilities.calculateCheckSumVerifyRow(6, checkSumVerify));
                                        int fileCheckSumCalculatedLength = fileCheckSumCalculated.length();
                                        String fileCheckSumByte = null;

                                        if (fileCheckSumCalculatedLength >= 2) {
                                            fileCheckSumByte = fileCheckSumCalculated.substring((fileCheckSumCalculatedLength - 2),
                                                    fileCheckSumCalculatedLength);
                                        } else {
                                            fileCheckSumByte = "0" + fileCheckSumCalculated;
                                        }

                                        if (fileCheckSumByte.equalsIgnoreCase(checksum)) {
                                            rowNumber = rowNumber + 1;

                                            // Update upload progress
                                            fileWritingProgress = (int)((rowNumber * 1.0 / fileTotalLines) * 100);
                                            firmwareUploadProgress();

                                            if (rowNumber < flashRowList.size()) {
                                                writeProgrammableData(rowNumber);
                                            }

                                            if (rowNumber == flashRowList.size()) {
                                                /**
                                                 * Writing the next command
                                                 * Changing the shared preference value
                                                 */
                                                currentCommandCode = VERIFY_CHECK_SUM;
                                                OTAVerifyCheckSumCmd(checkSumType);
                                            }
                                        } else {

                                        }
                                    }
                                    break;
                                default:
                                    break;
                            }
                        }
                        break;
                        case VERIFY_CHECK_SUM: {
                            String result = hexValue.trim().replace(" ", "");
                            String response = result.substring(RESPONSE_START, RESPONSE_END);
                            String checkSumStatus = result.substring(CHECKSUM_START, CHECKSUM_END);
                            int responseBytes = Integer.parseInt(response, RADIX);
                            switch (responseBytes) {
                                case CASE_SUCCESS:
                                    if (checkSumStatus.equalsIgnoreCase("01")) {
                                        /**
                                         * Verify Status Verified
                                         * Sending Exit bootloader command
                                         */
                                        OTAExitBootloaderCmd(checkSumType);
                                        currentCommandCode = EXIT_BOOTLOADER;
                                    }
                                    break;
                                default:
                                    break;
                            }
                        }
                        break;
                        case EXIT_BOOTLOADER: {
                            Timber.d("Firmware Upgrade Success");
//                        BluetoothService.getInstance().unpairDevice();
                            BluetoothService.getInstance().disconnect();
                        }
                        default:
                            break;
                    }
                }
            }
            else if (action.equals(Constants.ACTION_CHARACTERISTIC_WRITE)) {
                String uuid = intent.getStringExtra(Constants.EXTRA_BYTE_UUID_VALUE);
                int status = intent.getIntExtra(Constants.EXTRA_BYTE_STATUS_VALUE, BluetoothGatt.GATT_FAILURE);

                if (uuid.equals(Constants.CHARACTERISTIC_UUIDS.BOOTLOADER_CHARACTERISTIC.toString())) {
                    if (status == BluetoothGatt.GATT_SUCCESS) {
                        if (currentCommandCode == EXIT_BOOTLOADER) {
                            Timber.d("Firmware updated!");
                            // Report full 100% upload completion
                            fileWritingProgress = 100;
                            firmwareUploadProgress();
                            
                            firmwareUploadSuccess();
                        }
                    }
                    else {
                        firmwareUploadFailed();
                    }
                }
            }
        }
    };

    private void prepareFirmwareFile() {
        rowNumber = 0;
        rowStartPos = 0;

        try {
            if (new File(firmwareFilePath).exists()) {
                Timber.d("File Exists");
                final OTAFileParser parser;
                parser = new OTAFileParser(firmwareFilePath);
                parser.setFileReadStatusUpdater(this);

                String[] headerData = parser.analyseFileHeader();
                currentSiliconID = headerData[0];
                currentSiliconRev = headerData[1];
                checkSumType = headerData[2];

                /**
                 * Reads the file content with 1 second delay
                 */
                new Handler().postDelayed(new Runnable() {
                    @Override
                    public void run() {
                        if (fileReadHandlerFlag) {
                            try {
                                //Getting the total lines to write
                                fileTotalLines = parser.getTotalLines();
                                //Getting the data lines
                                flashRowList = parser.readDataLines();
                            } catch (IndexOutOfBoundsException e) {
                                firmwareUpdateStatus(Constants.FIRMWARE_UPDATE_STATES.INVALID_FILE);
                            } catch (NullPointerException e) {
                                firmwareUpdateStatus(Constants.FIRMWARE_UPDATE_STATES.INVALID_FILE);
                            }
                        }
                    }
                }, 1000);
            }
            else {
                Timber.d("File Not Exist");
                firmwareUpdateStatus(Constants.FIRMWARE_UPDATE_STATES.INVALID_FILE);
            }
        } catch (IndexOutOfBoundsException e) {
            firmwareUpdateStatus(Constants.FIRMWARE_UPDATE_STATES.INVALID_FILE);
        } catch (NullPointerException e) {
            firmwareUpdateStatus(Constants.FIRMWARE_UPDATE_STATES.INVALID_FILE);
        }
    }

    @Override
    public void onFileReadProgressUpdate(int fileLine) {
        if (fileTotalLines > 0 && fileLine > 0) {

        }

        // File parsed, ready to upload the firmware file
        if (fileTotalLines == fileLine) {
            Timber.d("File read complete");
            currentCommandCode = ENTER_BOOTLOADER;
            OTAEnterBootLoaderCmd(checkSumType);
        }
    }

    private void writeProgrammableData(int rowPosition) {
        int startPosition = rowStartPos;
        OTAFlashRowModel modelData = flashRowList.get(rowPosition);
        int mRowNo = Utilities.swap(Integer.parseInt(modelData.mRowNo.substring(0, 4), 16));

        if (modelData.mArrayId != currentArrayID) {
            /**
             * Writing the get flash command again to get the new row numbers
             * Changing the shared preference value
             */
            currentArrayID = modelData.mArrayId;
            byte[] data = new byte[1];
            data[0] = (byte) modelData.mArrayId;
            int dataLength = data.length;

            OTAGetFlashSizeCmd(data, checkSumType, dataLength);
            currentCommandCode = GET_FLASH_SIZE;
        } else {
            /**
             * Verify weather the program row number is within the acceptable range
             */
            if (mRowNo >= startRow && mRowNo <= endRow) {
                int verifyDataLength = modelData.mDataLength - startPosition;
                if (checkProgramRowCommandToSend(verifyDataLength)) {
                    long rowMSB = Long.parseLong(modelData.mRowNo.substring(0, 2), 16);
                    long rowLSB = Long.parseLong(modelData.mRowNo.substring(2, 4), 16);
                    int dataLength = modelData.mDataLength - startPosition;
                    byte[] dataToSend = new byte[dataLength];
                    for (int pos = 0; pos < dataLength; pos++) {
                        if (startPosition < modelData.mData.length) {
                            byte data = modelData.mData[startPosition];
                            dataToSend[pos] = data;
                            startPosition++;
                        } else {
                            break;
                        }
                    }
                    OTAProgramRowCmd(rowMSB, rowLSB, modelData.mArrayId, dataToSend, checkSumType);

                    currentCommandCode = PROGRAM_ROW;
                    rowStartPos = 0;
                } else {
                    int dataLength = MAX_DATA_SIZE;
                    byte[] dataToSend = new byte[dataLength];
                    for (int pos = 0; pos < dataLength; pos++) {
                        if (startPosition < modelData.mData.length) {
                            byte data = modelData.mData[startPosition];
                            dataToSend[pos] = data;
                            startPosition++;
                        } else {
                            break;
                        }
                    }
                    OTAProgramRowSendDataCmd(dataToSend, checkSumType);
                    currentCommandCode = SEND_DATA;
                    rowStartPos = startPosition;
                }
            } else {
                // Error
            }
        }
    }

    private boolean checkProgramRowCommandToSend(int totalSize) {
        if (totalSize <= MAX_DATA_SIZE) {
            return true;
        } else {
            return false;
        }
    }

    /**
     * OTA Bootloader enter command method
     *
     * @param checkSumType
     */
    public void OTAEnterBootLoaderCmd(String checkSumType) {
        int startCommand = 0x01;
        int dataLength0 = 0x00;
        int dataLength1 = 0x00;

        byte[] commandBytes = new byte[BYTE_ARRAY_SIZE];
        commandBytes[BYTE_START_CMD] = (byte) startCommand;
        commandBytes[BYTE_CMD_TYPE] = (byte) ENTER_BOOTLOADER;
        commandBytes[BYTE_CMD_DATA_SIZE] = (byte) dataLength0;
        commandBytes[BYTE_CMD_DATA_SIZE_SHIFT] = (byte) dataLength1;
        String checkSum = Integer.toHexString(Utilities.calculateCheckSum2(Integer.parseInt(checkSumType, 16), 4, commandBytes));
        long checksum = Long.parseLong(checkSum, RADIX);
        commandBytes[BYTE_CHECKSUM] = (byte) checksum;
        commandBytes[BYTE_CHECKSUM_SHIFT] = (byte) (checksum >> ADDITIVE_OP);
        commandBytes[BYTE_PACKET_END] = (byte) PACKET_END;

        String characteristicValue = Utilities.ByteArraytoHex(commandBytes);
        Timber.d("OTAEnterBootLoaderCmd %s", characteristicValue);
        BluetoothService.getInstance().writeToCharacteristic(Constants.CHARACTERISTIC_UUIDS.BOOTLOADER_CHARACTERISTIC, commandBytes);
    }

    /**
     * OTA Bootloader Get Flash Size Command
     */
    public void OTAGetFlashSizeCmd(byte[] data, String checkSumType, int dataLength) {
        byte[] commandBytes = new byte[BASE_CMD_SIZE + dataLength];
        int startCommand = 0x01;
        commandBytes[BYTE_START_CMD] = (byte) startCommand;
        commandBytes[BYTE_CMD_TYPE] = (byte) GET_FLASH_SIZE;
        commandBytes[BYTE_CMD_DATA_SIZE] = (byte) dataLength;
        commandBytes[BYTE_CMD_DATA_SIZE_SHIFT] = (byte) (dataLength >> ADDITIVE_OP);
        int dataByteLocationStart = 4;
        int datByteLocationEnd;
        for (int count = 0; count < dataLength; count++) {
            commandBytes[dataByteLocationStart] = data[count];
            dataByteLocationStart++;
        }
        datByteLocationEnd = dataByteLocationStart;
        String checkSum = Integer.toHexString(Utilities.calculateCheckSum2(Integer.parseInt(checkSumType, RADIX), commandBytes.length, commandBytes));
        long checksum = Long.parseLong(checkSum, RADIX);
        commandBytes[datByteLocationEnd] = (byte) checksum;
        commandBytes[datByteLocationEnd + 1] = (byte) (checksum >> ADDITIVE_OP);
        commandBytes[datByteLocationEnd + 2] = (byte) PACKET_END;
        Timber.d("OTAGetFlashSizeCmd");
        BluetoothService.getInstance().writeToCharacteristic(Constants.CHARACTERISTIC_UUIDS.BOOTLOADER_CHARACTERISTIC, commandBytes);
    }

    /**
     * OTA Bootloader Program Row Send Command
     */
    public void OTAProgramRowSendDataCmd(byte[] data,
                                         String checksumType) {
        int totalSize = BASE_CMD_SIZE +
                data.length;
        int checksum;
        int i;
        byte[] commandBytes = new byte[totalSize];
        int startCommand = 0x01;

        commandBytes[BYTE_START_CMD] = (byte) startCommand;
        commandBytes[BYTE_CMD_TYPE] = (byte) SEND_DATA;
        commandBytes[BYTE_CMD_DATA_SIZE] = (byte) (data.length);
        commandBytes[BYTE_CMD_DATA_SIZE_SHIFT] = (byte) ((int) ((data.length) >> ADDITIVE_OP));
        for (i = 0; i < data.length; i++)
            commandBytes[i + 4] = data[i];
        checksum = Utilities.calculateCheckSum2(Integer.parseInt(checksumType, RADIX),
                data.length + 4, commandBytes);
        commandBytes[totalSize - 3] = (byte) checksum;
        commandBytes[totalSize - 2] = (byte) (checksum >> ADDITIVE_OP);
        commandBytes[totalSize - 1] = (byte) PACKET_END;
        Timber.d("OTAProgramRowSendDataCmd");
        BluetoothService.getInstance().writeToCharacteristic(Constants.CHARACTERISTIC_UUIDS.BOOTLOADER_CHARACTERISTIC, commandBytes);
    }


    /*
    *
    * OTA Bootloader Program row Command
    * */
    public void OTAProgramRowCmd(long rowMSB, long rowLSB, int arrayID, byte[] data,
                                 String checkSumType) {

        int COMMAND_DATA_SIZE = 3;
        int totalSize = BASE_CMD_SIZE + COMMAND_DATA_SIZE +
                data.length;
        int checksum;
        int i;
        byte[] commandBytes = new byte[totalSize];
        int startCommand = 0x01;

        commandBytes[BYTE_START_CMD] = (byte) startCommand;
        commandBytes[BYTE_CMD_TYPE] = (byte) PROGRAM_ROW;
        commandBytes[BYTE_CMD_DATA_SIZE] = (byte) (data.length + COMMAND_DATA_SIZE);
        commandBytes[BYTE_CMD_DATA_SIZE_SHIFT] = (byte) ((int) ((data.length + COMMAND_DATA_SIZE) >> ADDITIVE_OP));
        commandBytes[BYTE_ARRAY_ID] = (byte) arrayID;
        commandBytes[BYTE_ROW] = (byte) rowMSB;
        commandBytes[6] = (byte) rowLSB;
        for (i = 0; i < data.length; i++)
            commandBytes[i + 7] = data[i];
        checksum = Utilities.calculateCheckSum2(Integer.parseInt(checkSumType, RADIX),
                data.length + 7, commandBytes);
        commandBytes[totalSize - 3] = (byte) checksum;
        commandBytes[totalSize - 2] = (byte) (checksum >> ADDITIVE_OP);
        commandBytes[totalSize - 1] = (byte) PACKET_END;
        Timber.d("OTAProgramRowCmd");
        BluetoothService.getInstance().writeToCharacteristic(Constants.CHARACTERISTIC_UUIDS.BOOTLOADER_CHARACTERISTIC, commandBytes);
    }

    /*
   *
   * OTA Bootloader Verify row Command
   * */
    public void OTAVerifyRowCmd(long rowMSB, long rowLSB, OTAFlashRowModel model,
                                String checkSumType) {
        int COMMAND_DATA_SIZE = 3;
        int COMMAND_SIZE = BASE_CMD_SIZE + COMMAND_DATA_SIZE;
        int checksum;
        byte[] commandBytes = new byte[COMMAND_SIZE];
        int startCommand = 0x01;

        commandBytes[BYTE_START_CMD] = (byte) startCommand;
        commandBytes[BYTE_CMD_TYPE] = (byte) VERIFY_ROW;
        commandBytes[BYTE_CMD_DATA_SIZE] = (byte) (COMMAND_DATA_SIZE);
        commandBytes[BYTE_CMD_DATA_SIZE_SHIFT] = (byte) (COMMAND_DATA_SIZE >> ADDITIVE_OP);
        commandBytes[BYTE_ARRAY_ID] = (byte) model.mArrayId;
        commandBytes[BYTE_ROW] = (byte) rowMSB;
        commandBytes[BYTE_ROW_SHIFT] = (byte) rowLSB;
        checksum = Utilities.calculateCheckSum2(Integer.parseInt(checkSumType, RADIX),
                COMMAND_SIZE - 3, commandBytes);
        commandBytes[BYTE_CHECKSUM_VER_ROW] = (byte) checksum;
        commandBytes[BYTE_CHECKSUM_VER_ROW_SHIFT] = (byte) (checksum >> ADDITIVE_OP);
        commandBytes[BYTE_PACKET_END_VER_ROW] = (byte) PACKET_END;
        Timber.d("OTAVerifyRowCmd");
        BluetoothService.getInstance().writeToCharacteristic(Constants.CHARACTERISTIC_UUIDS.BOOTLOADER_CHARACTERISTIC, commandBytes);
    }

    /*
   *
   * OTA Verify CheckSum Command
   * */
    public void OTAVerifyCheckSumCmd(String checkSumType) {

        int checksum;
        byte[] commandBytes = new byte[BASE_CMD_SIZE];
        int startCommand = 0x01;

        commandBytes[BYTE_START_CMD] = (byte) startCommand;
        commandBytes[BYTE_CMD_TYPE] = (byte) VERIFY_CHECK_SUM;
        commandBytes[BYTE_CMD_DATA_SIZE] = (byte) (0);
        commandBytes[BYTE_CMD_DATA_SIZE_SHIFT] = (byte) (0);
        checksum = Utilities.calculateCheckSum2(Integer.parseInt(checkSumType, RADIX),
                BASE_CMD_SIZE - 3, commandBytes);
        commandBytes[BYTE_CHECKSUM] = (byte) checksum;
        commandBytes[BYTE_CHECKSUM_SHIFT] = (byte) (checksum >> ADDITIVE_OP);
        commandBytes[BYTE_PACKET_END] = (byte) PACKET_END;
        Timber.d("OTAVerifyCheckSumCmd");
        BluetoothService.getInstance().writeToCharacteristic(Constants.CHARACTERISTIC_UUIDS.BOOTLOADER_CHARACTERISTIC, commandBytes);
    }

    /*
     *
     * Exit BootloaderCommand
     *
     * */
    public void OTAExitBootloaderCmd(String checkSumType) {

        int COMMAND_DATA_SIZE = 0x00;
        int COMMAND_SIZE = BASE_CMD_SIZE + COMMAND_DATA_SIZE;
        int checksum;
        byte[] commandBytes = new byte[BASE_CMD_SIZE];
        int startCommand = 0x01;

        commandBytes[BYTE_START_CMD] = (byte) startCommand;
        commandBytes[BYTE_CMD_TYPE] = (byte) EXIT_BOOTLOADER;
        commandBytes[BYTE_CMD_DATA_SIZE] = (byte) (COMMAND_DATA_SIZE);
        commandBytes[BYTE_CMD_DATA_SIZE_SHIFT] = (byte) (COMMAND_DATA_SIZE >> ADDITIVE_OP);
        checksum = Utilities.calculateCheckSum2(Integer.parseInt(checkSumType, RADIX),
                COMMAND_SIZE - 3, commandBytes);
        commandBytes[BYTE_CHECKSUM] = (byte) checksum;
        commandBytes[BYTE_CHECKSUM_SHIFT] = (byte) (checksum >> ADDITIVE_OP);
        commandBytes[BYTE_PACKET_END] = (byte) PACKET_END;
        Timber.d("OTAExitBootloaderCmd");
        BluetoothService.getInstance().writeToCharacteristic(Constants.CHARACTERISTIC_UUIDS.BOOTLOADER_CHARACTERISTIC, commandBytes);
    }
}
