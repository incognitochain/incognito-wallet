package com.incognito.wallet;

import android.util.Log;

import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

import gomobile.Gomobile;

/**
 * Created by hatajoe on 2018/02/15.
 */

public class GomobileModule extends ReactContextBaseJavaModule {
    private static final String TAG = "GomobileModule";

    public GomobileModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return "PrivacyGo";
    }

    public static void setPrivateField(Class clazz, Object inst, String field, Object value) throws Exception {
        java.lang.reflect.Field f = clazz.getDeclaredField(field);
        f.setAccessible(true);
        f.set(inst, value);
        f.setAccessible(false);
    }

    @ReactMethod
    public void createTransaction(String data, Integer myTime, Callback successCallback) {
        try {
            Log.d(TAG, "createTransaction: begin");
            successCallback.invoke(null, Gomobile.createTransaction(data, myTime));
        } catch (Exception e) {
            Log.d(TAG, "maketx: error");
            successCallback.invoke(e.getMessage(), null);
        }
    }

    @ReactMethod
    public void createConvertTx(String data, Integer myTime, Callback successCallback) {
        try {
            Log.d(TAG, "createConvertTx: begin");
            successCallback.invoke(null, Gomobile.createConvertTx(data, myTime));
        } catch (Exception e) {
            Log.d(TAG, "maketx convert: error");
            successCallback.invoke(e.getMessage(), null);
        }
    }

    @ReactMethod
    public void newKeySetFromPrivate(String data, Callback successCallback) {
        try {
            Log.d(TAG, "newKeySetFromPrivate: begin");
            successCallback.invoke(null, Gomobile.newKeySetFromPrivate(data));
        } catch (Exception e) {
            Log.d(TAG, "newKeySetFromPrivate: error");
            successCallback.invoke(e.getMessage(), null);
        }
    }

    @ReactMethod
    public void decryptCoin(String data, Callback successCallback) {
        try {
            Log.d(TAG, "decryptCoin: begin");
            successCallback.invoke(null, Gomobile.decryptCoin(data));
        } catch (Exception e) {
            Log.d(TAG, "decryptCoin: error");
            successCallback.invoke(e.getMessage(), null);
        }
    }

    @ReactMethod
    public void createCoin(String data, Callback successCallback) {
        try {
            Log.d(TAG, "createCoin: begin");
            successCallback.invoke(null, Gomobile.createCoin(data));
        } catch (Exception e) {
            Log.d(TAG, "createCoin: error");
            successCallback.invoke(e.getMessage(), null);
        }
    }

    @ReactMethod
    public void generateBLSKeyPairFromSeed(String data, Callback successCallback) {
        try {
            Log.d(TAG, "generateBLSKeyPairFromSeed: begin");
            successCallback.invoke(null, Gomobile.generateBLSKeyPairFromSeed(data));
        } catch (Exception e) {
            Log.d(TAG, "generateBLSKeyPairFromSeed: error");
            successCallback.invoke(e.getMessage(), null);
        }
    }

    @ReactMethod
    public void generateKeyFromSeed(String data, Callback successCallback) {
        try {
            Log.d(TAG, "generateKeyFromSeed: begin");
            successCallback.invoke(null, Gomobile.generateKeyFromSeed(data));
        } catch (Exception e) {
            Log.d(TAG, "generateKeyFromSeed: error");
            successCallback.invoke(e.getMessage(), null);
        }
    }

    @ReactMethod
    public void hybridEncrypt(String data, Callback successCallback) {
        try {
            Log.d(TAG, "hybridEncrypt: begin");
            successCallback.invoke(null, Gomobile.hybridEncrypt(data));
        } catch (Exception e) {
            Log.d(TAG, "hybridEncrypt: error");
            successCallback.invoke(e.getMessage(), null);
        }
    }

    @ReactMethod
    public void hybridDecrypt(String data, Callback successCallback) {
        try {
            Log.d(TAG, "hybridDecrypt: begin");
            successCallback.invoke(null, Gomobile.hybridDecrypt(data));
        } catch (Exception e) {
            Log.d(TAG, "hybridDecrypt: error");
            successCallback.invoke(e.getMessage(), null);
        }
    }

    @ReactMethod
    public void scalarMultBase(String data, Callback successCallback) {
        try {
            Log.d(TAG, "scalarMultBase: begin");
            successCallback.invoke(null, Gomobile.scalarMultBase(data));
        } catch (Exception e) {
            Log.d(TAG, "scalarMultBase: error");
            successCallback.invoke(e.getMessage(), null);
        }
    }

    @ReactMethod
    public void randomScalars(String data, Callback successCallback) {
        try {
            Log.d(TAG, "randomScalars: begin");
            successCallback.invoke(null, Gomobile.randomScalars(data));
        } catch (Exception e) {
            Log.d(TAG, "randomScalars: error");
            successCallback.invoke(e.getMessage(), null);
        }
    }

    @ReactMethod
    public void getSignPublicKey(String data, Callback successCallback) {
        try {
            Log.d(TAG, "getSignPublicKey: begin");
            successCallback.invoke(null, Gomobile.getSignPublicKey(data));
        } catch (Exception e) {
            Log.d(TAG, "getSignPublicKey: error");
            successCallback.invoke(e.getMessage(), null);
        }
    }

    @ReactMethod
    public void signPoolWithdraw(String data, Callback successCallback) {
        try {
            Log.d(TAG, "signPoolWithdraw: begin");
            successCallback.invoke(null, Gomobile.signPoolWithdraw(data));
        } catch (Exception e) {
            Log.d(TAG, "signPoolWithdraw: error");
            successCallback.invoke(e.getMessage(), null);
        }
    }

    @ReactMethod
    public void verifySign(String data, Callback successCallback) {
        try {
            Log.d(TAG, "verifySign: begin");
            successCallback.invoke(null, Gomobile.verifySign(data));
        } catch (Exception e) {
            Log.d(TAG, "verifySign: error");
            successCallback.invoke(e.getMessage(), null);
        }
    }

    @ReactMethod
    public void estimateTxSize(String data, Callback successCallback) {
        try {
            Log.d(TAG, "estimateTxSize: begin");
            successCallback.invoke(null, Gomobile.estimateTxSize(data));
        } catch (Exception e) {
            Log.d(TAG, "estimateTxSize: error");
            successCallback.invoke(e.getMessage(), null);
        }
    }

    @ReactMethod
    public void generateBTCMultisigAddress(String data, Callback successCallback) {
        try {
            Log.d(TAG, "generateBTCMultisigAddress: begin");
            successCallback.invoke(null, Gomobile.generateBTCMultisigAddress(data));
        } catch (Exception e) {
            Log.d(TAG, "generateBTCMultisigAddress: error");
            successCallback.invoke(e.getMessage(), null);
        }
    }

}
