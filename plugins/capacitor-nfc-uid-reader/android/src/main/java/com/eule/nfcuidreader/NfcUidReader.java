package com.eule.nfcuidreader;

import android.app.Activity;
import android.content.Intent;
import android.nfc.NfcAdapter;
import android.nfc.Tag;
import android.os.Bundle;


import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.Plugin;
import com.getcapacitor.JSObject;

import org.json.JSONException;
import org.json.JSONObject;

import java.util.Arrays;

@CapacitorPlugin(name = "NfcUidReader")
public class NfcUidReader extends Plugin implements NfcAdapter.ReaderCallback {
    private NfcAdapter nfcAdapter;
    private PluginCall savedCall;

    @PluginMethod
    public void startReading(PluginCall call) {
        Activity activity = getActivity();
        nfcAdapter = NfcAdapter.getDefaultAdapter(activity);
        if (nfcAdapter == null) {
            call.reject("NFC no disponible en este dispositivo.");
            return;
        }

        savedCall = call;
        // Configurar el modo de lectura en foreground
        Bundle options = new Bundle();
        nfcAdapter.enableReaderMode(activity, this,
                NfcAdapter.FLAG_READER_NFC_A | NfcAdapter.FLAG_READER_NFC_B | NfcAdapter.FLAG_READER_NFC_F | NfcAdapter.FLAG_READER_NFC_V | NfcAdapter.FLAG_READER_NFC_BARCODE | NfcAdapter.FLAG_READER_SKIP_NDEF_CHECK,
                options);
    }

    @Override
    public void onTagDiscovered(Tag tag) {
        if (savedCall == null) return;
        byte[] uid = tag.getId();
        StringBuilder hexUid = new StringBuilder();
        for (byte b : uid) {
            hexUid.append(String.format("%02X", b));
        }
        JSObject ret = new JSObject();
        ret.put("uid", hexUid.toString());
        savedCall.resolve(ret);
        savedCall = null;

        // Desactivar el modo de lectura después de leer un tag
        Activity activity = getActivity();
        if (nfcAdapter != null && activity != null) {
            activity.runOnUiThread(() -> nfcAdapter.disableReaderMode(activity));
        }
    }

    @Override
    protected void handleOnDestroy() {
        super.handleOnDestroy();
        Activity activity = getActivity();
        if (nfcAdapter != null && activity != null) {
            nfcAdapter.disableReaderMode(activity);
        }
    }
}