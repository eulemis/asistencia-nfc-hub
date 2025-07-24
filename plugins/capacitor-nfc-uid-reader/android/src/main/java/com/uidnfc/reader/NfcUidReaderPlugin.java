package com.uidnfc.reader;

import android.nfc.NfcAdapter;
import android.nfc.Tag;
import android.nfc.tech.NfcA;
import android.util.Log;

import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.JSObject;

@CapacitorPlugin(name = "NfcUidReader")
public class NfcUidReaderPlugin extends Plugin {

    private NfcAdapter nfcAdapter;

    @PluginMethod
    public void startReading(PluginCall call) {
        JSObject ret = new JSObject();
        ret.put("uid", "FAKE-UID-12345678");
        call.resolve(ret);
    }

    @PluginMethod
    public void stopReading(PluginCall call) {
        call.resolve();
    }
}
