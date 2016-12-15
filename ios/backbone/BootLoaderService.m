//
//  BootLoaderService.m
//  Backbone
//
//  Created by Eko Mirhard on 11/3/16.
//  Copyright © 2016 Backbone Labs, Inc. All rights reserved.
//

#import "BootLoaderService.h"
#import "BluetoothService.h"
#import "RCTUtils.h"
#import "RCTEventDispatcher.h"
#import "OTAFileParser.h"
#import "Utilities.h"

#define COMMAND_PACKET_MIN_SIZE   7
#define MAX_DATA_SIZE             133

@implementation BootLoaderService

+ (BootLoaderService*)getBootLoaderService {
  static BootLoaderService *_bootLoaderService = nil;
  
  static dispatch_once_t bootLoaderServiceInitialized;
  dispatch_once(&bootLoaderServiceInitialized, ^{
    _bootLoaderService = [[self alloc] initService];
  });
  
  return _bootLoaderService;
}

- (id)initService {
  self = [super init];
  
  _bootLoaderState = BOOTLOADER_STATE_OFF;
  _commandArray = [[NSMutableArray alloc] init];
  
  [BluetoothServiceInstance addCharacteristicDelegate:self];
  
  return self;
}

- (id)init {
  return [BootLoaderService getBootLoaderService];
}

- (NSArray<NSString *> *)supportedEvents {
  return @[@"firmwareUploadProgress", @"FirmwareUpdateStatus"];
}

RCT_EXPORT_MODULE();

/**
 Restart the device into the BootLoader service mode by entering the secret code
 @param path This is the absolute path indicating the location of the downloaded firmware file
 */
RCT_EXPORT_METHOD(initiateFirmwareUpdate:(NSString*)path) {
  if ([BluetoothServiceInstance isDeviceReady] && _enterBootLoaderCharacteristic != nil && path != nil) {
//    DLog(@"TestFile %@", path);
//    NSString* documentsPath = NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES)[0];
//    NSString* path2 = [documentsPath stringByAppendingPathComponent:@"Backbone.cyacd"];
//    path = path2;
//    DLog(@"TestFile %@", path2);
    BOOL fileExists = [[NSFileManager defaultManager] fileExistsAtPath:path];
    
    if (!fileExists) {
      DLog(@"Failed to initialize. File not exists! %@", path);
      [self firmwareUpdateStatus:FIRMWARE_UPDATE_STATE_INVALID_FILE];
    }
    else {
      _firmwareFilePath = [path copy];
      
      if (_bootLoaderState == BOOTLOADER_STATE_OFF) {
        // Restart into the BootLoader service before proceeding
        [self enterBootLoaderMode];
      }
      else if (_bootLoaderState == BOOTLOADER_STATE_ON) {
        // Device is already in the BootLoader service, so we proceed with the firmware upload
        [self prepareFirmwareFile];
      }
    }
  }
  else  {
    [self firmwareUpdateStatus:FIRMWARE_UPDATE_STATE_INVALID_SERVICE];
  }
}

- (void)enterBootLoaderMode {
  // The device will be disconnected right after sending this command
  // So we have to update its state in order to let the BluetoothService handle the disconnection properly
  _bootLoaderState = BOOTLOADER_STATE_INITIATED;
  
  const uint8_t bytes[] = {0x11, 0x22, 0x33, 0x44, 0x55, 0x66, 0x77, 0x88};
  NSData *data = [NSData dataWithBytes:bytes length:sizeof(bytes)];
  
  DLog(@"EnterBootLoad");
  hasPendingUpdate = YES;
  
  [BluetoothServiceInstance.currentDevice writeValue:data forCharacteristic:_enterBootLoaderCharacteristic type:CBCharacteristicWriteWithResponse];
}

- (void)prepareFirmwareFile {
  DLog(@"Bootloader is ready, proceed with preparing the firmware file");
  [self firmwareUpdateStatus:FIRMWARE_UPDATE_STATE_BEGIN];
  
  // Once again check if the firmware file exist locally to prevent missing file
  // while transitioning from Backbone to BootLoader service
  BOOL fileExists = [[NSFileManager defaultManager] fileExistsAtPath:_firmwareFilePath];
  
  if (fileExists) {
    DLog(@"File exists %@", _firmwareFilePath);
    [OTAFileParser parseFirmwareFileWithName:_firmwareFilePath onFinish:^(NSMutableDictionary *header, NSArray *rowData,NSArray *rowIdArray, NSError * error) {
      if (header && rowData && rowIdArray && !error) {
        DLog(@"Valid Firmware");
        _fileHeaderDictionary = header;
        _firmWareRowDataArray = rowData;
        currentIndex = 0;
        hasPendingUpdate = NO;
        [_commandArray removeAllObjects];
        
        [BluetoothServiceInstance.currentDevice setNotifyValue:YES forCharacteristic:_bootLoaderCharacteristic];
        
        if ([[_fileHeaderDictionary objectForKey:CHECKSUM_TYPE] integerValue]) {
          _checkSumType = CRC_16;
        }
        else {
          _checkSumType = CHECK_SUM;
        }
        
        NSData *data = [self createCommandPacketWithCommand:COMMAND_ENTER_BOOTLOADER dataLength:0 data:nil];
        [self writeValueToCharacteristicWithData:data bootLoaderCommandCode:COMMAND_ENTER_BOOTLOADER];
      }
      else if (error) {
        DLog(@"Invalid File");
        [self firmwareUpdateStatus:FIRMWARE_UPDATE_STATE_INVALID_FILE];
      }
    }];
  }
  else {
    DLog(@"Not exist");
    [self firmwareUpdateStatus:FIRMWARE_UPDATE_STATE_INVALID_FILE];
  }
}

- (void)writeValueToCharacteristicWithData:(NSData*)data bootLoaderCommandCode:(unsigned short)commandCode {
  if (data != nil && _bootLoaderCharacteristic != nil) {
    if (commandCode) {
      [_commandArray addObject:@(commandCode)];
    }
    
    DLog(@"Write Command %x %@", commandCode, BluetoothServiceInstance.currentDevice);
    [BluetoothServiceInstance.currentDevice writeValue:data forCharacteristic:_bootLoaderCharacteristic type:CBCharacteristicWriteWithResponse];
  }
}

- (void)getBootLoaderDataFromCharacteristic:(CBCharacteristic*)characteristic {
  uint8_t *dataPointer = (uint8_t*)[characteristic.value bytes];
  
  // Move to the position of data field
  dataPointer += 4;
  
  // Get silicon Id
  NSMutableString *siliconIDString = [NSMutableString stringWithCapacity:8];
  
  for (int i = 3; i >= 0; i--) {
    [siliconIDString appendFormat:@"%02x", (unsigned int)dataPointer[i]];
  }
  
  _siliconIDString = siliconIDString;
  
  // Get silicon Rev
  NSMutableString *siliconRevString = [NSMutableString stringWithCapacity:2];
  [siliconRevString appendFormat:@"%02x", (unsigned int)dataPointer[4]];
  
  _siliconRevString = siliconRevString;
}

- (void) getFlashDataFromCharacteristic:(CBCharacteristic*)charatceristic {
  uint8_t *dataPointer = (uint8_t *)[charatceristic.value bytes];
  
  dataPointer += 4;
  
  uint16_t firstRowNumber = CFSwapInt16LittleToHost(*(uint16_t*)dataPointer);
  
  dataPointer += 2;
  
  uint16_t lastRowNumber = CFSwapInt16LittleToHost(*(uint16_t*)dataPointer);
  
  _startRowNumber = firstRowNumber;
  _endRowNumber = lastRowNumber;
}

- (void)getRowCheckSumFromCharacteristic:(CBCharacteristic *)characteristic {
  uint8_t *dataPointer = (uint8_t*)[characteristic.value bytes];
  
  _checkSum = dataPointer[4];
}

- (void)checkApplicationCheckSumFromCharacteristic:(CBCharacteristic*)characteristic {
  uint8_t *dataPointer = (uint8_t*)[characteristic.value bytes];
  
  int applicationChecksum = dataPointer[4];
  
  if (applicationChecksum > 0) {
    _isApplicationValid = YES;
  }
  else {
    _isApplicationValid = NO;
  }
}

- (NSData*)createCommandPacketWithCommand:(uint8_t)commandCode dataLength:(unsigned short)dataLength data:(NSDictionary*)packetDataDictionary {
  DLog(@"CreateCommandCode %x", commandCode);
  NSData *data = [NSData new];
  
  uint8_t startByte = COMMAND_START_BYTE;
  uint8_t endbyte = COMMAND_END_BYTE;
  int bitPosition = 0;
  
  unsigned char *commandPacket =  (unsigned char *)malloc((COMMAND_PACKET_MIN_SIZE + dataLength) * sizeof(unsigned char));
  
  commandPacket[bitPosition++] = startByte;
  commandPacket[bitPosition++] = commandCode;
  commandPacket[bitPosition++] = dataLength;
  commandPacket[bitPosition++] = dataLength >> 8;
  
  // Handle command code for GET_FLASH_SIZE command
  if (commandCode == COMMAND_GET_FLASH_SIZE) {
    uint8_t flashArrayID = [[packetDataDictionary objectForKey:FLASH_ARRAY_ID] integerValue];
    commandPacket[bitPosition++] = flashArrayID;
  }
  
  // Handle command code for PROGRAM_ROW command
  if (commandCode == COMMAND_PROGRAM_ROW || commandCode == COMMAND_VERIFY_ROW) {
    uint8_t flashArrayID = [[packetDataDictionary objectForKey:FLASH_ARRAY_ID] integerValue];
    unsigned short flashRowNumber = [[packetDataDictionary objectForKey:FLASH_ROW_NUMBER] integerValue];
    commandPacket[bitPosition++] = flashArrayID;
    commandPacket[bitPosition++] = flashRowNumber;
    commandPacket[bitPosition++] = flashRowNumber >> 8;
  }
  
  // Add the data to send to the command packet
  if (commandCode == COMMAND_SEND_DATA || commandCode == COMMAND_PROGRAM_ROW) {
    NSArray *dataArray = [packetDataDictionary objectForKey:ROW_DATA];
    
    for (int i =0; i<dataArray.count; i++) {
      NSString *value = dataArray[i];
      
      unsigned int outVal;
      NSScanner* scanner = [NSScanner scannerWithString:value];
      [scanner scanHexInt:&outVal];
      
      unsigned short valueToWrite = (unsigned short)outVal;
      commandPacket[bitPosition++] = valueToWrite;
    }
  }
  
  unsigned short checkSum  = [self calculateChacksumWithCommandPacket:commandPacket withSize:(bitPosition) type:_checkSumType];
  
  commandPacket[bitPosition++] = checkSum;
  commandPacket[bitPosition++] = checkSum >> 8;
  commandPacket[bitPosition++] = endbyte;
  
  data = [NSData dataWithBytes:commandPacket length:(bitPosition)];
  
  free(commandPacket);
  
  return data;
}

- (unsigned short)calculateChacksumWithCommandPacket:(unsigned char[])array withSize:(int)packetSize type:(NSString*)type
{
  if ([type isEqualToString:CHECK_SUM]) {
    // Sum checksum
    unsigned short sum = 0;
    
    for (int i = 0; i < packetSize; i++) {
      sum = sum + array[i];
    }
    
    return ~sum + 1;
  }
  else {
    // CRC 16
    unsigned short sum = 0xffff;
    
    unsigned short tmp;
    int i;
    
    if (packetSize == 0) return (~sum);
    
    do {
      for (i = 0, tmp = 0x00ff & *array++; i < 8; i++, tmp >>= 1) {
        if ((sum & 0x0001) ^ (tmp & 0x0001))
          sum = (sum >> 1) ^ 0x8408;
        else
          sum >>= 1;
      }
    } while (--packetSize);
    
    sum = ~sum;
    tmp = sum;
    sum = (sum << 8) | (tmp >> 8 & 0xFF);
    
    return sum;
  }
}

- (void)peripheral:(CBPeripheral *)peripheral didDiscoverCharacteristicsForService:(CBService *)service error:(NSError *)error {
  DLog(@"Did Discover Characteristic with error: %@", error);
  
  if ([service.UUID isEqual:BACKBONE_SERVICE_UUID]) {
    if (error == nil) {
      for (CBCharacteristic *characteristic in service.characteristics) {
        if ([characteristic.UUID isEqual:ENTER_BOOTLOADER_CHARACTERISTIC_UUID]) {
          _enterBootLoaderCharacteristic = characteristic;
          _bootLoaderState = BOOTLOADER_STATE_OFF;
        }
      }
    }
  }
  else if ([service.UUID isEqual:BOOTLOADER_SERVICE_UUID]) {
    if (error == nil) {
      for (CBCharacteristic *characteristic in service.characteristics) {
        if ([characteristic.UUID isEqual:BOOTLOADER_CHARACTERISTIC_UUID]) {
          _bootLoaderCharacteristic = characteristic;
          _bootLoaderState = BOOTLOADER_STATE_ON;
          
          if (hasPendingUpdate) {
            [self prepareFirmwareFile];
          }
          else {
            // Device started in bootloader mode from the beginning, possibly due to errors on the previous firmware upload
            // Inform React to retry failed firmware upload
            [self firmwareUpdateStatus:FIRMWARE_UPDATE_STATE_PENDING];
          }
        }
      }
      
      if (_bootLoaderState != BOOTLOADER_STATE_ON) {
        [self firmwareUpdateStatus:FIRMWARE_UPDATE_STATE_INVALID_SERVICE];
      }
    }
    else {
      [self firmwareUpdateStatus:FIRMWARE_UPDATE_STATE_INVALID_SERVICE];
    }
  }
}

- (void)peripheral:(CBPeripheral *)peripheral didWriteValueForCharacteristic:(CBCharacteristic *)characteristic error:(NSError *)error {
  DLog(@"Did Write with error: %@", error);
  
  if ([characteristic.UUID isEqual:BOOTLOADER_CHARACTERISTIC_UUID]) {
    if (error == nil) {
      if ([[_commandArray objectAtIndex:0] isEqual:@(COMMAND_EXIT_BOOTLOADER)]) {
        DLog(@"Firmware Uploaded!");
        [self firmwareUploadSuccess];
      }
    }
    else {
      [self firmwareUploadFailed];
    }
  }
}

- (void)peripheral:(CBPeripheral *)peripheral didUpdateValueForCharacteristic:(CBCharacteristic *)characteristic error:(NSError *)error {
  DLog(@"Did Update with error: %@", error);
  if ([characteristic.UUID isEqual:BOOTLOADER_CHARACTERISTIC_UUID]) {
    if (error == nil) {
      uint8_t *dataPointer = (uint8_t*) [characteristic.value bytes];
      NSString *errorCode = [NSString stringWithFormat:@"0x%2x", dataPointer[1]];
      errorCode = [errorCode stringByReplacingOccurrencesOfString:@" " withString:@"0"];
      DLog(@"Error code: %@", errorCode);
      // Checking the error code from the response
      if ([errorCode isEqualToString:BOOTLOADER_CODE_SUCCESS]) {
        if ([[_commandArray objectAtIndex:0] isEqual:@(COMMAND_ENTER_BOOTLOADER)]) {
          [self getBootLoaderDataFromCharacteristic:characteristic];
          
          // Compare silicon id and silicon rev string
          if ([[[_fileHeaderDictionary objectForKey:SILICON_ID] lowercaseString] isEqualToString:self.siliconIDString] && [[_fileHeaderDictionary objectForKey:SILICON_REV] isEqualToString:self.siliconRevString]) {
            /* Write the GET_FLASH_SIZE command */
            NSDictionary *rowDataDict = [_firmWareRowDataArray objectAtIndex:currentIndex];
            NSDictionary *dataDict = [NSDictionary dictionaryWithObject:[rowDataDict objectForKey:ARRAY_ID] forKey:FLASH_ARRAY_ID];
            NSData *data = [self createCommandPacketWithCommand:COMMAND_GET_FLASH_SIZE dataLength:1 data:dataDict];
            
            // Initilaize the arrayID
            _currentArrayID = [rowDataDict objectForKey:ARRAY_ID];
            [self writeValueToCharacteristicWithData:data bootLoaderCommandCode:COMMAND_GET_FLASH_SIZE];
          }
          else {
            [self firmwareUploadFailed];
          }
        }
        else if ([[_commandArray objectAtIndex:0] isEqual:@(COMMAND_GET_FLASH_SIZE)]) {
          [self getFlashDataFromCharacteristic:characteristic];
          [self writeFirmWareFileDataAtIndex:currentIndex];
        }
        else if ([[_commandArray objectAtIndex:0] isEqual:@(COMMAND_SEND_DATA)]) {
          _isWritePacketDataSuccess = YES;
          [self writeCurrentRowDataArrayAtIndex:currentIndex];
        }
        else if ([[_commandArray objectAtIndex:0] isEqual:@(COMMAND_PROGRAM_ROW)]) {
          _isWriteRowDataSuccess = YES;
          
          // Check the row check sum
          /* Write the VERIFY_ROW command */
          NSDictionary *rowDataDict = [_firmWareRowDataArray objectAtIndex:currentIndex];
          NSDictionary *dataDict = [NSDictionary dictionaryWithObjectsAndKeys:[rowDataDict objectForKey:ARRAY_ID], FLASH_ARRAY_ID,
                                    @(currentRowNumber), FLASH_ROW_NUMBER,
                                    nil];
          
          NSData *verifyRowData = [self createCommandPacketWithCommand:COMMAND_VERIFY_ROW dataLength:3 data:dataDict];
          [self writeValueToCharacteristicWithData:verifyRowData bootLoaderCommandCode:COMMAND_VERIFY_ROW];
        }
        else if ([[_commandArray objectAtIndex:0] isEqual:@(COMMAND_VERIFY_ROW)]) {
          [self getRowCheckSumFromCharacteristic:characteristic];
          
          /* Compare the checksum received from the device and that from the file row  */
          NSDictionary *rowDataDict = [_firmWareRowDataArray objectAtIndex:currentIndex];
          
          uint8_t rowCheckSum = [Utilities getIntegerFromHexString:[rowDataDict objectForKey:CHECKSUM_OTA]];
          uint8_t arrayID = [Utilities getIntegerFromHexString:[rowDataDict objectForKey:ARRAY_ID]];
          
          unsigned short rowNumber = [Utilities getIntegerFromHexString:[rowDataDict objectForKey:ROW_NUMBER]];
          unsigned short dataLength = [Utilities getIntegerFromHexString:[rowDataDict objectForKey:DATA_LENGTH]];
          
          uint8_t sum = rowCheckSum + arrayID + rowNumber + (rowNumber >> 8) + dataLength + (dataLength >> 8);
          
          if (sum == self.checkSum) {
            currentIndex ++;
            
            /* UI update with the file writing progress */
            float percentage = ((float)currentIndex / _firmWareRowDataArray.count) * 100;
            fileWritingProgress = (int)floor(percentage);
            
            DLog(@"Update Percentage : %.0f%%", percentage);
            [self firmwareUploadProgress];
            
            // Writing the next line from file
            if (currentIndex < _firmWareRowDataArray.count) {
              [self writeFirmWareFileDataAtIndex:currentIndex];
            }
            else {
              /* Write VERIFY_CHECKSUM command */
              NSData *data = [self createCommandPacketWithCommand:COMMAND_VERIFY_CHECKSUM dataLength:0 data:nil];
              [self writeValueToCharacteristicWithData:data bootLoaderCommandCode:COMMAND_VERIFY_CHECKSUM];
            }
          }
          else {
            [self firmwareUploadFailed];
          }
        }
        else if([[_commandArray objectAtIndex:0] isEqual:@(COMMAND_VERIFY_CHECKSUM)]) {
          [self checkApplicationCheckSumFromCharacteristic:characteristic];
          
          if (self.isApplicationValid) {
            /* Write EXIT_BOOTLOADER command */
            
            NSData *exitBootloaderCommandData = [self createCommandPacketWithCommand:COMMAND_EXIT_BOOTLOADER dataLength:0 data:nil];
            [self writeValueToCharacteristicWithData:exitBootloaderCommandData bootLoaderCommandCode:COMMAND_EXIT_BOOTLOADER];
          }
          else {
            [self firmwareUploadFailed];
          }
        }
      }
      else {
        if ([[_commandArray objectAtIndex:0] isEqual:@(COMMAND_PROGRAM_ROW)]) {
          _isWriteRowDataSuccess = NO;
        }
        else if ([[_commandArray objectAtIndex:0] isEqual:@(COMMAND_SEND_DATA)]) {
          _isWritePacketDataSuccess = NO;
        }
        
        [self firmwareUploadFailed];
      }
      
      [_commandArray removeObjectAtIndex:0];
    }
    else {
      [self firmwareUploadFailed];
    }
  }
}

/*!
 *  @method writeFirmWareFileDataAtIndex:
 *
 *  @discussion Method to write the firmware file data to the device
 *
 */

- (void)writeFirmWareFileDataAtIndex:(int)index {
  NSDictionary *rowDataDict = [_firmWareRowDataArray objectAtIndex:index];
  
  // Check for change in arrayID
  if (![[rowDataDict objectForKey:ARRAY_ID] isEqual:_currentArrayID]) {
    // GET_FLASH_SIZE command is passed to get the new start and end row numbers
    NSDictionary *rowDataDictionary = [_firmWareRowDataArray objectAtIndex:index];
    NSDictionary *dict = [NSDictionary dictionaryWithObject:[rowDataDictionary objectForKey:ARRAY_ID] forKey:FLASH_ARRAY_ID];
    NSData *data = [self createCommandPacketWithCommand:COMMAND_GET_FLASH_SIZE dataLength:1 data:dict];
    [self writeValueToCharacteristicWithData:data bootLoaderCommandCode:COMMAND_GET_FLASH_SIZE];
    
    _currentArrayID = [rowDataDictionary objectForKey:ARRAY_ID];
    return;
  }
  
  // Check whether the row number falls in the range obtained from the device
  currentRowNumber = [Utilities getIntegerFromHexString:[rowDataDict objectForKey:ROW_NUMBER]];
  
  if (currentRowNumber >= self.startRowNumber && currentRowNumber <= self.endRowNumber) {
    /* Write data using PROGRAM_ROW command */
    _currentRowDataArray = [[rowDataDict objectForKey:DATA_ARRAY] mutableCopy];
    [self writeCurrentRowDataArrayAtIndex:index];
  }
  else {
    [self firmwareUploadFailed];
  }
}

/*!
 *  @method writeCurrentRowDataArrayAtIndex:
 *
 *  @discussion Method to write the data in a row
 *
 */
- (void)writeCurrentRowDataArrayAtIndex:(int)index {
  NSDictionary *rowDataDict = [_firmWareRowDataArray objectAtIndex:index];
  
  if (_currentRowDataArray.count > MAX_DATA_SIZE) {
    NSDictionary *dataDict = [NSDictionary dictionaryWithObjectsAndKeys:[_currentRowDataArray subarrayWithRange:NSMakeRange(0, MAX_DATA_SIZE)], ROW_DATA, nil];
    NSData *data = [self createCommandPacketWithCommand:COMMAND_SEND_DATA dataLength:MAX_DATA_SIZE data:dataDict];
    [self writeValueToCharacteristicWithData:data bootLoaderCommandCode:COMMAND_SEND_DATA];
    
    [_currentRowDataArray removeObjectsInRange:NSMakeRange(0, MAX_DATA_SIZE)];
  }
  else {
    NSDictionary *lastPacketDict = [NSDictionary dictionaryWithObjectsAndKeys:[rowDataDict objectForKey:ARRAY_ID], FLASH_ARRAY_ID,
                                    @(currentRowNumber), FLASH_ROW_NUMBER,
                                    _currentRowDataArray, ROW_DATA, nil];
    
    NSData *lastChunkData = [self createCommandPacketWithCommand:COMMAND_PROGRAM_ROW dataLength:_currentRowDataArray.count + 3 data:lastPacketDict];
    [self writeValueToCharacteristicWithData:lastChunkData bootLoaderCommandCode:COMMAND_PROGRAM_ROW];
  }
}

- (void)firmwareUploadSuccess {
  // Delete the firmware file after a successful update
  // NOTE: Keep it commented for development purposes to preserve the file for multiple tests
//  NSFileManager *fileManager = [NSFileManager defaultManager];
//  NSError *error;
//  bool success = [fileManager removeItemAtPath:_firmwareFilePath error:&error];
//  DLog(@"success delete %d %@", success, error);
  
  _bootLoaderState = BOOTLOADER_STATE_UPDATED;
}

- (void)firmwareUploadFailed {
  // Do any other cleanups here if needed
  [self firmwareUpdateStatus:FIRMWARE_UPDATE_STATE_END_ERROR];
}

- (void)firmwareUpdated {
  _bootLoaderState = BOOTLOADER_STATE_OFF;
  
  [self firmwareUpdateStatus:FIRMWARE_UPDATE_STATE_END_SUCCESS];
}

- (void)firmwareUploadProgress {
  DLog(@"Firmware Upload Progress %d", fileWritingProgress);
  [self sendEventWithName:@"FirmwareUploadProgress" body:@{@"percentage" : @(fileWritingProgress)}];
}

- (void)firmwareUpdateStatus:(int)status {
  DLog(@"Firmware Update State %d", status);
  [self sendEventWithName:@"FirmwareUpdateStatus" body:@{@"status" : @(status)}];
}

@end
