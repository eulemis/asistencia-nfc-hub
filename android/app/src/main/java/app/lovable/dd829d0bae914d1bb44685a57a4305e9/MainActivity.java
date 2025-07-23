package app.lovable.dd829d0bae914d1bb44685a57a4305e9;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;
import com.centrojuvenil.nfc.NfcPlugin;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        registerPlugin(NfcPlugin.class);
    }
}
