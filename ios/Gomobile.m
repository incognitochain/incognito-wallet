#import "Gomobile.h"
#import <UIKit/UIKit.h>

@implementation Gomobile

RCT_EXPORT_MODULE(PrivacyGo);

//exports a method deriveSerialNumber to javascript
RCT_EXPORT_METHOD(deriveSerialNumber:(NSString *)data callback:(RCTResponseSenderBlock)callback){
  @try{
    NSString *rs = GomobileDeriveSerialNumber(data,nil);
    callback(@[[NSNull null], rs]);
  }
  @catch(NSException *exception){
    callback(@[exception.reason, [NSNull null]]);
  }
}

//exports a method randomScalars to javascript
RCT_EXPORT_METHOD(randomScalars:(NSString *)data callback:(RCTResponseSenderBlock)callback){
  @try{
    NSString *rs = GomobileRandomScalars(data,nil);
    callback(@[[NSNull null], rs]);
  }
  @catch(NSException *exception){
    callback(@[exception.reason, [NSNull null]]);
  }
}

//exports a method initPrivacyTx to javascript
RCT_EXPORT_METHOD(initPrivacyTx:(NSString *)data time:(NSInteger)time callback:(RCTResponseSenderBlock)callback){
  @try{
    NSString *rs = GomobileInitPrivacyTx(data, time, nil);
    callback(@[[NSNull null], rs]);
  }
  @catch(NSException *exception){
    callback(@[exception.reason, [NSNull null]]);
  }
}


//exports a method initPrivacyTokenTx to javascript
RCT_EXPORT_METHOD(initPrivacyTokenTx:(NSString *)data time:(NSInteger)time callback:(RCTResponseSenderBlock)callback){
  @try{
    NSString *rs = GomobileInitPrivacyTokenTx(data,time, nil);
    callback(@[[NSNull null], rs]);
  }
  @catch(NSException *exception){
    callback(@[exception.reason, [NSNull null]]);
  }
}

//exports a method initBurningRequestTx to javascript
RCT_EXPORT_METHOD(initBurningRequestTx:(NSString *)data time:(NSInteger)time callback:(RCTResponseSenderBlock)callback){
  @try{
    NSString *rs = GomobileInitBurningRequestTx(data,time, nil);
    callback(@[[NSNull null], rs]);
  }
  @catch(NSException *exception){
    callback(@[exception.reason, [NSNull null]]);
  }
}

//exports a method initBurningRequestTx to javascript
RCT_EXPORT_METHOD(initWithdrawRewardTx:(NSString *)data time:(NSInteger)time callback:(RCTResponseSenderBlock)callback){
  @try{
    NSString *rs = GomobileInitWithdrawRewardTx(data,time, nil);
    callback(@[[NSNull null], rs]);
  }
  @catch(NSException *exception){
    callback(@[exception.reason, [NSNull null]]);
  }
}

//exports a method staking to javascript
RCT_EXPORT_METHOD(staking:(NSString *)data time:(NSInteger)time callback:(RCTResponseSenderBlock)callback){
  @try{
    NSString *rs = GomobileStaking(data,time, nil);
    callback(@[[NSNull null], rs]);
  }
  @catch(NSException *exception){
    callback(@[exception.reason, [NSNull null]]);
  }
}

//exports a method generateBLSKeyPairFromSeed to javascript
RCT_EXPORT_METHOD(generateBLSKeyPairFromSeed:(NSString *)data callback:(RCTResponseSenderBlock)callback){
  @try{
    NSString *rs = GomobileGenerateBLSKeyPairFromSeed(data);
    callback(@[[NSNull null], rs]);
  }
  @catch(NSException *exception){
    callback(@[exception.reason, [NSNull null]]);
  }
}

//exports a method initPRVContributionTx to javascript
RCT_EXPORT_METHOD(initPRVContributionTx:(NSString *)data time:(NSInteger)time callback:(RCTResponseSenderBlock)callback){
  @try{
    NSString *rs = GomobileInitPRVContributionTx(data,time, nil);
    callback(@[[NSNull null], rs]);
  }
  @catch(NSException *exception){
    callback(@[exception.reason, [NSNull null]]);
  }
}

//exports a method initPTokenContributionTx to javascript
RCT_EXPORT_METHOD(initPTokenContributionTx:(NSString *)data time:(NSInteger)time callback:(RCTResponseSenderBlock)callback){
  @try{
    NSString *rs = GomobileInitPTokenContributionTx(data,time, nil);
    callback(@[[NSNull null], rs]);
  }
  @catch(NSException *exception){
    callback(@[exception.reason, [NSNull null]]);
  }
}

//exports a method initPRVTradeTx to javascript
RCT_EXPORT_METHOD(initPRVTradeTx:(NSString *)data time:(NSInteger)time callback:(RCTResponseSenderBlock)callback){
  @try{
    NSString *rs = GomobileInitPRVTradeTx(data,time, nil);
    callback(@[[NSNull null], rs]);
  }
  @catch(NSException *exception){
    callback(@[exception.reason, [NSNull null]]);
  }
}

RCT_EXPORT_METHOD(initPTokenTradeTx:(NSString *)data time:(NSInteger)time callback:(RCTResponseSenderBlock)callback){
  @try{
    NSString *rs = GomobileInitPTokenTradeTx(data,time, nil);
    callback(@[[NSNull null], rs]);
  }
  @catch(NSException *exception){
    callback(@[exception.reason, [NSNull null]]);
  }
}

//exports a method hybridDecryptionASM to javascript
RCT_EXPORT_METHOD(hybridDecryptionASM:(NSString *)data callback:(RCTResponseSenderBlock)callback){
  @try{
    NSString *rs = GomobileHybridDecryptionASM(data,nil);
    callback(@[[NSNull null], rs]);
  }
  @catch(NSException *exception){
    callback(@[exception.reason, [NSNull null]]);
  }
}

//exports a method hybridEncryptionASM to javascript
RCT_EXPORT_METHOD(hybridEncryptionASM:(NSString *)data callback:(RCTResponseSenderBlock)callback){
  @try{
    NSString *rs = GomobileHybridEncryptionASM(data,nil);
    callback(@[[NSNull null], rs]);
  }
  @catch(NSException *exception){
    callback(@[exception.reason, [NSNull null]]);
  }
}

//exports a method stopAutoStaking to javascript
RCT_EXPORT_METHOD(stopAutoStaking:(NSString *)data time:(NSInteger)time callback:(RCTResponseSenderBlock)callback){
  @try{
    NSString *rs = GomobileStopAutoStaking(data, time, nil);
    callback(@[[NSNull null], rs]);
  }
  @catch(NSException *exception){
    callback(@[exception.reason, [NSNull null]]);
  }
}

//exports a method withdrawDexTx to javascript
RCT_EXPORT_METHOD(withdrawDexTx:(NSString *)data time:(NSInteger)time callback:(RCTResponseSenderBlock)callback){
  @try{
    NSString *rs = GomobileWithdrawDexTx(data, time, nil);
    callback(@[[NSNull null], rs]);
  }
  @catch(NSException *exception){
    callback(@[exception.reason, [NSNull null]]);
  }
}

//exports a method generateIncognitoContractAddress to javascript
RCT_EXPORT_METHOD(generateIncognitoContractAddress:(NSString *)data callback:(RCTResponseSenderBlock)callback){
  @try{
    NSString *rs = GomobileGenerateContractAddress(data, nil);
    callback(@[[NSNull null], rs]);
  }
  @catch(NSException *exception){
    callback(@[exception.reason, [NSNull null]]);
  }
}

//exports a method sign0x to javascript
RCT_EXPORT_METHOD(sign0x:(NSString *)data callback:(RCTResponseSenderBlock)callback){
  @try{
    NSString *rs = GomobileSign0x(data, nil);
    callback(@[[NSNull null], rs]);
  }
  @catch(NSException *exception){
    callback(@[exception.reason, [NSNull null]]);
  }
}

//exports a method signKyber to javascript
RCT_EXPORT_METHOD(signKyber:(NSString *)data callback:(RCTResponseSenderBlock)callback){
  @try{
    NSString *rs = GomobileSignKyber(data, nil);
    callback(@[[NSNull null], rs]);
  }
  @catch(NSException *exception){
    callback(@[exception.reason, [NSNull null]]);
  }
}

//exports a method signKyber to javascript
RCT_EXPORT_METHOD(withdrawSmartContractBalance:(NSString *)data callback:(RCTResponseSenderBlock)callback){
  @try{
    NSString *rs = GomobileWithdrawSmartContractBalance(data, nil);
    callback(@[[NSNull null], rs]);
  }
  @catch(NSException *exception){
    callback(@[exception.reason, [NSNull null]]);
  }
}

//exports a method scalarMultBase to javascript
RCT_EXPORT_BLOCKING_SYNCHRONOUS_METHOD(
  scalarMultBase:(NSString *)data
) {
  NSString *rs = GomobileScalarMultBase(data,nil);
  return rs;
}

//exports a method scalarMultBase to javascript
RCT_EXPORT_BLOCKING_SYNCHRONOUS_METHOD(
  generateKeyFromSeed:(NSString *)data
) {
  NSString *rs = GomobileGenerateKeyFromSeed(data,nil);
  return rs;
}

@end
