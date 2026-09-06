package com.mswt.app;

import android.app.Activity;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.provider.DocumentsContract;
import androidx.activity.result.ActivityResult;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.ActivityCallback;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;

@CapacitorPlugin(name = "FileSave")
public class FileSavePlugin extends Plugin {
    @PluginMethod
    public void saveTextFile(PluginCall call) {
        String fileName = call.getString("fileName", "export.txt");
        String data = call.getString("data");
        String mimeType = call.getString("mimeType", "text/plain");

        if (data == null) {
            call.reject("Data is required");
            return;
        }

        Intent intent = new Intent(Intent.ACTION_CREATE_DOCUMENT);
        intent.addCategory(Intent.CATEGORY_OPENABLE);
        intent.setType(mimeType);
        intent.putExtra(Intent.EXTRA_TITLE, fileName);

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            Uri downloads = Uri.parse("content://com.android.externalstorage.documents/document/primary%3ADownload");
            intent.putExtra(DocumentsContract.EXTRA_INITIAL_URI, downloads);
        }

        startActivityForResult(call, intent, "onSaveDocument");
    }

    @ActivityCallback
    private void onSaveDocument(PluginCall call, ActivityResult result) {
        if (call == null) {
            return;
        }

        if (result.getResultCode() != Activity.RESULT_OK || result.getData() == null) {
            call.reject("Save canceled");
            return;
        }

        Uri uri = result.getData().getData();
        if (uri == null) {
            call.reject("Save canceled");
            return;
        }

        String data = call.getString("data");
        if (data == null) {
            call.reject("Data is required");
            return;
        }

        try (OutputStream outputStream = getContext().getContentResolver().openOutputStream(uri)) {
            if (outputStream == null) {
                call.reject("Failed to open output stream");
                return;
            }
            outputStream.write(data.getBytes(StandardCharsets.UTF_8));
            outputStream.flush();
            call.resolve();
        } catch (Exception error) {
            call.reject(error.getLocalizedMessage());
        }
    }
}
