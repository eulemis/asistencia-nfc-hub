package com.centrojuvenil.nfc;

import android.app.Activity;
import android.content.Intent;
import android.nfc.NfcAdapter;
import android.nfc.Tag;
import android.nfc.tech.MifareClassic;
import android.nfc.tech.MifareUltralight;
import android.nfc.tech.NfcA;
import android.nfc.tech.NfcB;
import android.nfc.tech.NfcF;
import android.nfc.tech.NfcV;
import android.nfc.tech.IsoDep;
import android.nfc.tech.Ndef;
import android.nfc.tech.NdefFormatable;
import android.util.Log;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.io.IOException;
import java.util.Arrays;

@CapacitorPlugin(name = "NfcPlugin")
public class NfcPlugin extends Plugin {
    private static final String TAG = "NfcPlugin";
    private NfcAdapter nfcAdapter;
    private boolean isScanning = false;

    @Override
    public void load() {
        super.load();
        nfcAdapter = NfcAdapter.getDefaultAdapter(getContext());
        Log.d(TAG, "NfcPlugin loaded");
    }

    @PluginMethod
    public void isEnabled(PluginCall call) {
        boolean enabled = nfcAdapter != null && nfcAdapter.isEnabled();
        JSObject result = new JSObject();
        result.put("enabled", enabled);
        call.resolve(result);
    }

    @PluginMethod
    public void startScan(PluginCall call) {
        if (nfcAdapter == null) {
            call.reject("NFC no está disponible en este dispositivo");
            return;
        }

        if (!nfcAdapter.isEnabled()) {
            call.reject("NFC no está habilitado");
            return;
        }

        isScanning = true;
        JSObject result = new JSObject();
        result.put("success", true);
        result.put("message", "Escaneo NFC iniciado. Acerca una tarjeta NFC al dispositivo.");
        call.resolve(result);

        // Notificar que el escaneo está activo
        notifyListeners("scanStarted", result);
    }

    @PluginMethod
    public void stopScan(PluginCall call) {
        isScanning = false;
        JSObject result = new JSObject();
        result.put("success", true);
        result.put("message", "Escaneo NFC detenido");
        call.resolve(result);

        // Notificar que el escaneo se detuvo
        notifyListeners("scanStopped", result);
    }

    // Este método se llama automáticamente cuando se detecta un tag NFC
    @Override
    public void handleOnNewIntent(Intent intent) {
        super.handleOnNewIntent(intent);
        
        if (!isScanning) {
            return;
        }

        String action = intent.getAction();
        if (NfcAdapter.ACTION_TAG_DISCOVERED.equals(action) ||
            NfcAdapter.ACTION_TECH_DISCOVERED.equals(action) ||
            NfcAdapter.ACTION_NDEF_DISCOVERED.equals(action)) {

            Tag tag = intent.getParcelableExtra(NfcAdapter.EXTRA_TAG);
            if (tag != null) {
                processNfcTag(tag);
            }
        }
    }

    private void processNfcTag(Tag tag) {
        try {
            // Obtener el UID físico
            byte[] id = tag.getId();
            String uid = bytesToHex(id);
            
            Log.d(TAG, "Tag NFC detectado - UID: " + uid);
            Log.d(TAG, "Tag NFC detectado - ID bytes: " + Arrays.toString(id));

            // Crear objeto de respuesta
            JSObject tagData = new JSObject();
            tagData.put("uid", uid);
            tagData.put("idBytes", id);
            tagData.put("techList", tag.getTechList());
            tagData.put("tagId", uid); // Alias para compatibilidad
            tagData.put("serialNumber", uid); // Alias para compatibilidad

            // Información adicional del tag
            JSObject tagInfo = new JSObject();
            tagInfo.put("id", uid);
            tagInfo.put("techTypes", tag.getTechList());
            tagInfo.put("type", getTagType(tag));
            tagData.put("nfcTag", tagInfo);

            // Notificar a JavaScript
            notifyListeners("nfcTagScanned", tagData);
            
            Log.d(TAG, "Tag NFC procesado exitosamente: " + tagData.toString());

        } catch (Exception e) {
            Log.e(TAG, "Error procesando tag NFC", e);
            JSObject error = new JSObject();
            error.put("error", "Error procesando tag NFC: " + e.getMessage());
            notifyListeners("nfcError", error);
        }
    }

    private String getTagType(Tag tag) {
        String[] techList = tag.getTechList();
        if (techList.length > 0) {
            String tech = techList[0];
            if (tech.contains("MifareClassic")) return "MifareClassic";
            if (tech.contains("MifareUltralight")) return "MifareUltralight";
            if (tech.contains("NfcA")) return "NfcA";
            if (tech.contains("NfcB")) return "NfcB";
            if (tech.contains("NfcF")) return "NfcF";
            if (tech.contains("NfcV")) return "NfcV";
            if (tech.contains("IsoDep")) return "IsoDep";
            if (tech.contains("Ndef")) return "Ndef";
            if (tech.contains("NdefFormatable")) return "NdefFormatable";
        }
        return "Unknown";
    }

    private String bytesToHex(byte[] bytes) {
        StringBuilder sb = new StringBuilder();
        for (byte b : bytes) {
            sb.append(String.format("%02X", b));
        }
        return sb.toString();
    }

    // Método para convertir bytes a formato con dos puntos (ej: C4:DE:C4:2D)
    private String bytesToHexWithColons(byte[] bytes) {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < bytes.length; i++) {
            if (i > 0) sb.append(":");
            sb.append(String.format("%02X", bytes[i]));
        }
        return sb.toString();
    }
} 