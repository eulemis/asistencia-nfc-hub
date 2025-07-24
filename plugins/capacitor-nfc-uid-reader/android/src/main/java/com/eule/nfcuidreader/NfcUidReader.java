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

import org.json.JSONException;
import org.json.JSONObject;

import java.util.Arrays;

@CapacitorPlugin(name = "NfcUidReader")
public class NfcUidReader extends Plugin {
    private NfcAdapter nfcAdapter;

    @PluginMethod
    public void startReading(PluginCall call) {
        Activity activity = getActivity();
        nfcAdapter = NfcAdapter.getDefaultAdapter(activity);
        if (nfcAdapter == null) {
            call.reject("NFC no disponible en este dispositivo.");
            return;
        }

        Intent intent = activity.getIntent();
        String action = intent.getAction();
        if (NfcAdapter.ACTION_TAG_DISCOVERED.equals(action) ||
            NfcAdapter.ACTION_TECH_DISCOVERED.equals(action) ||
            NfcAdapter.ACTION_NDEF_DISCOVERED.equals(action)) {

            Tag tag = intent.getParcelableExtra(NfcAdapter.EXTRA_TAG);
            if (tag != null) {
                byte[] uid = tag.getId();
                StringBuilder hexUid = new StringBuilder();
                for (byte b : uid) {
                    hexUid.append(String.format("%02X", b));
                }
                JSObject ret = new JSObject();
                ret.put("uid", hexUid.toString());
                call.resolve(ret);
                return;
            }
        }
        call.reject("No se detectó una etiqueta NFC.");
    }
}