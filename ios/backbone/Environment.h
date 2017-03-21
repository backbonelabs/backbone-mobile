#import <React/RCTBridgeModule.h>

@interface Environment : NSObject <RCTBridgeModule>
- (NSDictionary *)constantsToExport;
@end
