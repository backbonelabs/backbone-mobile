//
//  BootLoaderService.h
//  Backbone
//
//  Created by Eko Mirhard on 11/3/16.
//  Copyright © 2016 Backbone Labs, Inc. All rights reserved.
//

#import <CoreBluetooth/CoreBluetooth.h>
#import "RCTEventEmitter.h"
#import "RCTBridgeModule.h"

@interface BootLoaderService : RCTEventEmitter <RCTBridgeModule, CBPeripheralDelegate> {
  NSMutableArray *_commandArray;
  NSString *_firmwareFilePath;
  
  NSArray *_firmwareFilesArray, *_firmWareRowDataArray;
  NSMutableArray *_currentRowDataArray;
  
  NSDictionary *_fileHeaderDictionary;
  int currentRowNumber, currentIndex;
  NSString *_currentArrayID;
  int fileWritingProgress;
  
  BOOL hasPendingUpdate;
}

@property (nonatomic) int bootLoaderState;
@property (nonatomic) NSString *checkSumType;

@property (nonatomic, strong) NSString *siliconIDString;
@property (nonatomic, strong) NSString *siliconRevString;
@property (nonatomic) BOOL isWriteRowDataSuccess;
@property (nonatomic) BOOL isWritePacketDataSuccess;
@property (nonatomic) int startRowNumber;
@property (nonatomic) int endRowNumber;
@property (nonatomic) uint8_t checkSum;
@property (nonatomic) BOOL isApplicationValid;

+ (BootLoaderService *)getBootLoaderService;

- (id)initService;
- (void)firmwareUpdated;
- (BOOL)isUpdatingFirmware;

@end
