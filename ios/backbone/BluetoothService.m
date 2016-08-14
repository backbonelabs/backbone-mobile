#import "BluetoothService.h"

@implementation BluetoothService

static int _centralState;

- (id)init {
  static dispatch_once_t once;
  dispatch_once(&once, ^{
    self.centralManager = [[CBCentralManager alloc] initWithDelegate:self queue:nil options:nil];
  });
  return self;
}

RCT_EXPORT_MODULE();

RCT_EXPORT_METHOD(getCentralState :(RCTResponseSenderBlock)callback) {
  callback(@[[NSNumber numberWithInt:_centralState]]);
}

- (void)centralManagerDidUpdateState:(CBCentralManager *)central {
  _centralState = [central state];
  NSLog(@"Central state: %i", _centralState);
}

@end
