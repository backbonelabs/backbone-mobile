#import "RCTBridgeModule.h"

@interface ActivityModule : NSObject
@property (nonatomic, strong) RCTBridge *bridge;
@property NSString *name;
@property NSString *sensor;
@property NSString *notificationName;
- (void)startListening;
- (void)stopListening;
- (void)notify:(NSNotification *)notification;
@end
